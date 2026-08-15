import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { onAuthSessionInvalidated } from "@/lib/auth/session-events";
import { resolveAppError } from "@/lib/errors/resolve-app-error";
import { apiDateToMillis } from "@/lib/format/date";
import {
  enqueueOutbox,
  isNetworkFailure,
  purgeAllNotificationStorage,
  purgeOtherNotificationUsers,
  readNotificationCache,
  readNotificationOutbox,
  writeNotificationCache,
  writeNotificationOutbox,
  type NotificationOutboxEntry,
} from "@/lib/notifications/storage";
import {
  startNotificationHub,
  type NotificationHubState,
} from "@/lib/realtime/notification-hub";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState, type AppStateStatus } from "react-native";

const PAGE_SIZE = 10;
const LIST_TTL_MS = 60_000;

export type LoadState = "idle" | "loading" | "refreshing" | "ready" | "error";

type NotificationsContextValue = {
  items: Notification[];
  unreadCount: number;
  listState: LoadState;
  listError: string | null;
  hasNext: boolean;
  unreadOnly: boolean;
  isStale: boolean;
  hubState: NotificationHubState;
  setUnreadOnly: (value: boolean) => void;
  refresh: (options?: { force?: boolean }) => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

function isFresh(fetchedAt: number | null, ttlMs: number): boolean {
  if (fetchedAt == null) return false;
  return Date.now() - fetchedAt < ttlMs;
}

function sortByCreatedAtDesc(items: Notification[]): Notification[] {
  return [...items].sort((a, b) => {
    const aMs = apiDateToMillis(a.createdAt) ?? 0;
    const bMs = apiDateToMillis(b.createdAt) ?? 0;
    return bMs - aMs;
  });
}

function mergeById(
  existing: Notification[],
  incoming: Notification[],
): Notification[] {
  const map = new Map<string, Notification>();
  for (const item of existing) map.set(item.id, item);
  for (const item of incoming) map.set(item.id, item);
  return sortByCreatedAtDesc([...map.values()]);
}

function nowReadAt(): string {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function applyPendingReads(
  items: Notification[],
  outbox: NotificationOutboxEntry[],
): Notification[] {
  if (outbox.some((entry) => entry.kind === "readAll")) {
    const stamp = nowReadAt();
    return items.map((item) =>
      item.readAt ? item : { ...item, readAt: stamp },
    );
  }

  const pendingIds = new Set(
    outbox
      .filter((entry): entry is { kind: "read"; id: string } => entry.kind === "read")
      .map((entry) => entry.id),
  );
  if (pendingIds.size === 0) return items;

  const stamp = nowReadAt();
  return items.map((item) =>
    pendingIds.has(item.id) && !item.readAt
      ? { ...item, readAt: stamp }
      : item,
  );
}

function countUnread(items: Notification[]): number {
  return items.reduce((sum, item) => (item.readAt ? sum : sum + 1), 0);
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const userId = user?.id ?? null;

  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [listState, setListState] = useState<LoadState>("idle");
  const [listError, setListError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [unreadOnly, setUnreadOnlyState] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [hubState, setHubState] = useState<NotificationHubState>("idle");
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);

  const itemsRef = useRef(items);
  const unreadCountRef = useRef(unreadCount);
  const fetchedAtRef = useRef(fetchedAt);
  const unreadOnlyRef = useRef(unreadOnly);
  const outboxRef = useRef<NotificationOutboxEntry[]>([]);
  const pageRef = useRef(page);
  const hasNextRef = useRef(hasNext);
  const refreshInFlight = useRef<Promise<void> | null>(null);
  const loadMoreInFlight = useRef<Promise<void> | null>(null);
  const flushInFlight = useRef<Promise<void> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const stopHubRef = useRef<(() => void) | null>(null);
  const refreshRef = useRef<
    ((options?: { force?: boolean }) => Promise<void>) | null
  >(null);
  const flushOutboxRef = useRef<(() => Promise<void>) | null>(null);
  const prependFromHubRef = useRef<((notification: Notification) => void) | null>(
    null,
  );

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);
  useEffect(() => {
    fetchedAtRef.current = fetchedAt;
  }, [fetchedAt]);
  useEffect(() => {
    unreadOnlyRef.current = unreadOnly;
  }, [unreadOnly]);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  useEffect(() => {
    hasNextRef.current = hasNext;
  }, [hasNext]);

  const persistCache = useCallback(
    async (nextItems: Notification[], nextUnread: number) => {
      if (!userId) return;
      await writeNotificationCache(userId, {
        items: nextItems,
        unreadCount: nextUnread,
        fetchedAt: Date.now(),
      });
    },
    [userId],
  );

  const persistOutbox = useCallback(
    async (entries: NotificationOutboxEntry[]) => {
      outboxRef.current = entries;
      if (!userId) return;
      await writeNotificationOutbox(userId, entries);
    },
    [userId],
  );

  const flushOutbox = useCallback(async () => {
    if (!userId) return;
    if (flushInFlight.current) {
      await flushInFlight.current;
      return;
    }

    const run = (async () => {
      let queue = [...outboxRef.current];
      while (queue.length > 0) {
        const entry = queue[0];
        try {
          if (entry.kind === "readAll") {
            await markAllNotificationsRead();
          } else {
            await markNotificationRead({ id: entry.id });
          }
          queue = queue.slice(1);
          await persistOutbox(queue);
          setIsStale(false);
        } catch (error) {
          if (isNetworkFailure(error)) {
            setIsStale(true);
            return;
          }
          // Drop permanently failed entries (e.g. already read / 404).
          queue = queue.slice(1);
          await persistOutbox(queue);
        }
      }
    })().finally(() => {
      flushInFlight.current = null;
    });

    flushInFlight.current = run;
    await run;
  }, [persistOutbox, userId]);

  const refresh = useCallback(
    async (options?: { force?: boolean }) => {
      if (!userId) return;
      const force = options?.force === true;

      if (
        !force &&
        itemsRef.current.length > 0 &&
        isFresh(fetchedAtRef.current, LIST_TTL_MS)
      ) {
        return;
      }

      if (refreshInFlight.current) {
        await refreshInFlight.current;
        return;
      }

      const hasCache = itemsRef.current.length > 0;
      setListState(hasCache ? "refreshing" : "loading");
      setListError(null);

      const request = (async () => {
        try {
          const [listValue, countValue] = await Promise.all([
            getNotifications({
              page: 1,
              pageSize: PAGE_SIZE,
              unreadOnly: unreadOnlyRef.current || undefined,
            }),
            getUnreadNotificationCount(),
          ]);

          const pageData = listValue.data;
          const remoteItems = pageData?.items ?? [];
          const merged = applyPendingReads(remoteItems, outboxRef.current);
          const remoteUnread = countValue.data?.count ?? countUnread(merged);
          const nextUnread =
            outboxRef.current.length > 0
              ? countUnread(merged)
              : Math.max(0, remoteUnread);

          setItems(merged);
          setUnreadCount(nextUnread);
          setPage(1);
          setHasNext(pageData?.hasNext === true);
          setFetchedAt(Date.now());
          setListState("ready");
          setListError(null);
          setIsStale(false);
          await persistCache(merged, nextUnread);
          await flushOutbox();
        } catch (error) {
          const reason = resolveAppError(error).reason;
          setListError(reason);
          if (isNetworkFailure(error)) {
            setIsStale(true);
            setListState(hasCache ? "ready" : "error");
          } else {
            setListState(hasCache ? "ready" : "error");
          }
        } finally {
          refreshInFlight.current = null;
        }
      })();

      refreshInFlight.current = request;
      await request;
    },
    [flushOutbox, persistCache, userId],
  );

  const loadMore = useCallback(async () => {
    if (!userId) return;
    if (!hasNextRef.current) return;
    if (loadMoreInFlight.current || refreshInFlight.current) return;

    const nextPage = pageRef.current + 1;
    const request = (async () => {
      try {
        const value = await getNotifications({
          page: nextPage,
          pageSize: PAGE_SIZE,
          unreadOnly: unreadOnlyRef.current || undefined,
        });
        const pageData = value.data;
        const incoming = applyPendingReads(
          pageData?.items ?? [],
          outboxRef.current,
        );
        const merged = mergeById(itemsRef.current, incoming);
        setItems(merged);
        setPage(nextPage);
        setHasNext(pageData?.hasNext === true);
        await persistCache(merged, unreadCountRef.current);
      } catch (error) {
        if (isNetworkFailure(error)) {
          setIsStale(true);
        }
      } finally {
        loadMoreInFlight.current = null;
      }
    })();

    loadMoreInFlight.current = request;
    await request;
  }, [persistCache, userId]);

  const markRead = useCallback(
    async (id: string) => {
      if (!userId) return;
      const current = itemsRef.current.find((item) => item.id === id);
      if (!current || current.readAt) return;

      const stamp = nowReadAt();
      let nextItems = itemsRef.current.map((item) =>
        item.id === id ? { ...item, readAt: stamp } : item,
      );
      if (unreadOnlyRef.current) {
        nextItems = nextItems.filter((item) => !item.readAt);
      }
      const nextUnread = Math.max(0, unreadCountRef.current - 1);
      setItems(nextItems);
      setUnreadCount(nextUnread);
      await persistCache(nextItems, nextUnread);

      const nextOutbox = enqueueOutbox(outboxRef.current, {
        kind: "read",
        id,
      });
      await persistOutbox(nextOutbox);
      await flushOutbox();
    },
    [flushOutbox, persistCache, persistOutbox, userId],
  );

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    if (unreadCountRef.current === 0) return;

    const stamp = nowReadAt();
    const nextItems = itemsRef.current.map((item) =>
      item.readAt ? item : { ...item, readAt: stamp },
    );
    setItems(nextItems);
    setUnreadCount(0);
    await persistCache(nextItems, 0);

    const nextOutbox = enqueueOutbox(outboxRef.current, { kind: "readAll" });
    await persistOutbox(nextOutbox);
    await flushOutbox();
  }, [flushOutbox, persistCache, persistOutbox, userId]);

  const setUnreadOnly = useCallback(
    (value: boolean) => {
      setUnreadOnlyState(value);
      unreadOnlyRef.current = value;
      void refresh({ force: true });
    },
    [refresh],
  );

  const prependFromHub = useCallback(
    (notification: Notification) => {
      const existing = itemsRef.current.find(
        (item) => item.id === notification.id,
      );
      if (existing) return;

      const nextItems = sortByCreatedAtDesc([
        notification,
        ...itemsRef.current,
      ]);
      const nextUnread = notification.readAt
        ? unreadCountRef.current
        : unreadCountRef.current + 1;
      setItems(nextItems);
      setUnreadCount(nextUnread);
      void persistCache(nextItems, nextUnread);
    },
    [persistCache],
  );

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);
  useEffect(() => {
    flushOutboxRef.current = flushOutbox;
  }, [flushOutbox]);
  useEffect(() => {
    prependFromHubRef.current = prependFromHub;
  }, [prependFromHub]);

  // Hydrate + connect when authenticated parent is ready.
  useEffect(() => {
    if (status !== "authenticated" || !userId) {
      stopHubRef.current?.();
      stopHubRef.current = null;
      setItems([]);
      setUnreadCount(0);
      setListState("idle");
      setListError(null);
      setIsStale(false);
      setHubState("idle");
      setPage(1);
      setHasNext(false);
      setFetchedAt(null);
      outboxRef.current = [];
      return;
    }

    let cancelled = false;

    const boot = async () => {
      await purgeOtherNotificationUsers(userId);
      const [cache, outbox] = await Promise.all([
        readNotificationCache(userId),
        readNotificationOutbox(userId),
      ]);
      if (cancelled) return;

      outboxRef.current = outbox;
      if (cache) {
        const hydrated = applyPendingReads(cache.items, outbox);
        setItems(hydrated);
        setUnreadCount(
          outbox.length > 0 ? countUnread(hydrated) : cache.unreadCount,
        );
        setFetchedAt(cache.fetchedAt);
        setListState("ready");
        setIsStale(true);
      }

      await refreshRef.current?.({ force: true });
      if (cancelled) return;

      stopHubRef.current?.();
      stopHubRef.current = startNotificationHub({
        onNotification: (notification) => {
          prependFromHubRef.current?.(notification);
        },
        onStateChange: setHubState,
      });
    };

    void boot();

    return () => {
      cancelled = true;
      stopHubRef.current?.();
      stopHubRef.current = null;
    };
  }, [status, userId]);

  // Foreground: refresh + flush + ensure hub.
  useEffect(() => {
    if (status !== "authenticated" || !userId) return;

    const subscription = AppState.addEventListener("change", (next) => {
      const previous = appStateRef.current;
      appStateRef.current = next;

      if (
        (previous === "background" || previous === "inactive") &&
        next === "active"
      ) {
        void refreshRef.current?.({ force: true });
        void flushOutboxRef.current?.();
        if (!stopHubRef.current) {
          stopHubRef.current = startNotificationHub({
            onNotification: (notification) => {
              prependFromHubRef.current?.(notification);
            },
            onStateChange: setHubState,
          });
        }
      }
    });

    return () => subscription.remove();
  }, [status, userId]);

  // Logout / session invalidate: wipe local notification storage.
  useEffect(() => {
    return onAuthSessionInvalidated(() => {
      stopHubRef.current?.();
      stopHubRef.current = null;
      outboxRef.current = [];
      void purgeAllNotificationStorage();
    });
  }, []);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      items,
      unreadCount,
      listState,
      listError,
      hasNext,
      unreadOnly,
      isStale,
      hubState,
      setUnreadOnly,
      refresh,
      loadMore,
      markRead,
      markAllRead,
    }),
    [
      items,
      unreadCount,
      listState,
      listError,
      hasNext,
      unreadOnly,
      isStale,
      hubState,
      setUnreadOnly,
      refresh,
      loadMore,
      markRead,
      markAllRead,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within NotificationsProvider",
    );
  }
  return ctx;
}

/** Safe for tab bar / headers that may render outside the provider tree. */
export function useOptionalNotifications(): NotificationsContextValue | null {
  return useContext(NotificationsContext);
}

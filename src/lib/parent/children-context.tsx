import {
  getChildProgression,
  getParentLinks,
  type ParentChildProgression,
  type ParentLink,
} from "@/lib/api";
import { resolveAppError } from "@/lib/errors/resolve-app-error";
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

const LINKS_TTL_MS = 60_000;
const PROGRESSION_TTL_MS = 60_000;
const PREFETCH_VERIFIED_LIMIT = 3;

export type LoadState = "idle" | "loading" | "refreshing" | "ready" | "error";

export type ProgressionEntry = {
  data: ParentChildProgression | null;
  state: LoadState;
  error: string | null;
  fetchedAt: number | null;
};

type ChildrenContextValue = {
  links: ParentLink[];
  linksState: LoadState;
  linksError: string | null;
  progressions: Record<string, ProgressionEntry>;
  refreshLinks: (options?: { force?: boolean }) => Promise<void>;
  refreshProgression: (
    studentId: string,
    options?: { force?: boolean },
  ) => Promise<ParentChildProgression | null>;
  getProgression: (studentId: string) => ProgressionEntry;
  markChildSeen: (studentId: string) => void;
  newMilestoneCount: (studentId: string) => number;
  progressSummaryFor: (studentId: string) => ParentChildProgression | null;
};

const EMPTY_PROGRESSION: ProgressionEntry = {
  data: null,
  state: "idle",
  error: null,
  fetchedAt: null,
};

const ChildrenContext = createContext<ChildrenContextValue | null>(null);

function isFresh(fetchedAt: number | null, ttlMs: number): boolean {
  if (fetchedAt == null) return false;
  return Date.now() - fetchedAt < ttlMs;
}

function milestoneIds(progression: ParentChildProgression | null): string[] {
  if (!progression?.recentMilestones?.length) return [];
  return progression.recentMilestones
    .map(
      (item, index) =>
        item.id ?? `${item.type ?? "event"}-${item.occurredAt ?? index}`,
    )
    .filter(Boolean);
}

export function ChildrenProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<ParentLink[]>([]);
  const [linksState, setLinksState] = useState<LoadState>("idle");
  const [linksError, setLinksError] = useState<string | null>(null);
  const [linksFetchedAt, setLinksFetchedAt] = useState<number | null>(null);
  const [progressions, setProgressions] = useState<
    Record<string, ProgressionEntry>
  >({});
  const [seenMilestoneIds, setSeenMilestoneIds] = useState<
    Record<string, string[]>
  >({});

  const linksInFlight = useRef<Promise<void> | null>(null);
  const progressionInFlight = useRef<
    Record<string, Promise<ParentChildProgression | null>>
  >({});
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const progressionsRef = useRef(progressions);
  const linksRef = useRef(links);
  const linksFetchedAtRef = useRef(linksFetchedAt);
  const didMountRefresh = useRef(false);

  useEffect(() => {
    progressionsRef.current = progressions;
  }, [progressions]);

  useEffect(() => {
    linksRef.current = links;
  }, [links]);

  useEffect(() => {
    linksFetchedAtRef.current = linksFetchedAt;
  }, [linksFetchedAt]);

  const patchProgression = useCallback(
    (studentId: string, patch: Partial<ProgressionEntry>) => {
      setProgressions((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] ?? EMPTY_PROGRESSION),
          ...patch,
        },
      }));
    },
    [],
  );

  const refreshProgression = useCallback(
    async (
      studentId: string,
      options?: { force?: boolean },
    ): Promise<ParentChildProgression | null> => {
      const force = options?.force === true;
      const current = progressionsRef.current[studentId] ?? EMPTY_PROGRESSION;

      if (
        !force &&
        current.data &&
        isFresh(current.fetchedAt, PROGRESSION_TTL_MS)
      ) {
        return current.data;
      }

      const existing = progressionInFlight.current[studentId];
      if (existing) return existing;

      const hasCache = current.data != null;
      patchProgression(studentId, {
        state: hasCache ? "refreshing" : "loading",
        error: null,
      });

      const request = (async () => {
        try {
          const value = await getChildProgression({ studentId });
          const data = value.data ?? null;
          const fetchedAt = Date.now();

          patchProgression(studentId, {
            data,
            state: "ready",
            error: null,
            fetchedAt,
          });

          // Baseline milestones on first successful fetch so the "mới" badge
          // only counts events that arrive later in this session.
          setSeenMilestoneIds((prev) => {
            if (prev[studentId]) return prev;
            return {
              ...prev,
              [studentId]: milestoneIds(data),
            };
          });

          return data;
        } catch (err) {
          const reason = resolveAppError(err).reason;
          patchProgression(studentId, {
            state: hasCache ? "ready" : "error",
            error: reason,
            fetchedAt: hasCache ? current.fetchedAt : null,
          });
          return hasCache ? current.data : null;
        } finally {
          delete progressionInFlight.current[studentId];
        }
      })();

      progressionInFlight.current[studentId] = request;
      return request;
    },
    [patchProgression],
  );

  const prefetchVerified = useCallback(
    (nextLinks: ParentLink[]) => {
      const verified = nextLinks
        .filter((link) => link.isVerified)
        .slice(0, PREFETCH_VERIFIED_LIMIT);

      for (const link of verified) {
        void refreshProgression(link.linkedUserId);
      }
    },
    [refreshProgression],
  );

  const refreshLinks = useCallback(
    async (options?: { force?: boolean }) => {
      const force = options?.force === true;
      const currentLinks = linksRef.current;

      if (
        !force &&
        currentLinks.length > 0 &&
        isFresh(linksFetchedAtRef.current, LINKS_TTL_MS)
      ) {
        return;
      }

      if (linksInFlight.current) {
        await linksInFlight.current;
        return;
      }

      const hasCache = currentLinks.length > 0;
      setLinksState(hasCache ? "refreshing" : "loading");
      setLinksError(null);

      const request = (async () => {
        try {
          const value = await getParentLinks();
          const nextLinks = value.data ?? [];
          setLinks(nextLinks);
          setLinksFetchedAt(Date.now());
          setLinksState("ready");
          setLinksError(null);
          prefetchVerified(nextLinks);
        } catch (err) {
          const reason = resolveAppError(err).reason;
          setLinksError(reason);
          setLinksState(hasCache ? "ready" : "error");
        } finally {
          linksInFlight.current = null;
        }
      })();

      linksInFlight.current = request;
      await request;
    },
    [prefetchVerified],
  );

  useEffect(() => {
    if (didMountRefresh.current) return;
    didMountRefresh.current = true;
    void refreshLinks({ force: true });
  }, [refreshLinks]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next) => {
      const previous = appStateRef.current;
      appStateRef.current = next;

      if (
        (previous === "background" || previous === "inactive") &&
        next === "active"
      ) {
        void refreshLinks({ force: true });
      }
    });

    return () => subscription.remove();
  }, [refreshLinks]);

  const getProgression = useCallback(
    (studentId: string): ProgressionEntry =>
      progressions[studentId] ?? EMPTY_PROGRESSION,
    [progressions],
  );

  const progressSummaryFor = useCallback(
    (studentId: string): ParentChildProgression | null =>
      progressions[studentId]?.data ?? null,
    [progressions],
  );

  const markChildSeen = useCallback((studentId: string) => {
    const data = progressionsRef.current[studentId]?.data ?? null;
    setSeenMilestoneIds((prev) => ({
      ...prev,
      [studentId]: milestoneIds(data),
    }));
  }, []);

  const newMilestoneCount = useCallback(
    (studentId: string): number => {
      const data = progressions[studentId]?.data ?? null;
      const current = milestoneIds(data);
      const seen = seenMilestoneIds[studentId];
      if (!seen) return 0;
      const seenSet = new Set(seen);
      return current.filter((id) => !seenSet.has(id)).length;
    },
    [progressions, seenMilestoneIds],
  );

  const value = useMemo<ChildrenContextValue>(
    () => ({
      links,
      linksState,
      linksError,
      progressions,
      refreshLinks,
      refreshProgression,
      getProgression,
      markChildSeen,
      newMilestoneCount,
      progressSummaryFor,
    }),
    [
      links,
      linksState,
      linksError,
      progressions,
      refreshLinks,
      refreshProgression,
      getProgression,
      markChildSeen,
      newMilestoneCount,
      progressSummaryFor,
    ],
  );

  return (
    <ChildrenContext.Provider value={value}>{children}</ChildrenContext.Provider>
  );
}

export function useChildren(): ChildrenContextValue {
  const ctx = useContext(ChildrenContext);
  if (!ctx) {
    throw new Error("useChildren must be used within ChildrenProvider");
  }
  return ctx;
}

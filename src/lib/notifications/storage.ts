import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Notification } from "@/lib/api/entities/notification";

const CACHE_PREFIX = "oboxsteam.notifications.cache.";
const OUTBOX_PREFIX = "oboxsteam.notifications.outbox.";
const CACHE_CAP = 50;

export type NotificationCache = {
  items: Notification[];
  unreadCount: number;
  fetchedAt: number;
};

export type NotificationOutboxEntry =
  | { kind: "read"; id: string }
  | { kind: "readAll" };

function cacheKey(userId: string): string {
  return `${CACHE_PREFIX}${userId}`;
}

function outboxKey(userId: string): string {
  return `${OUTBOX_PREFIX}${userId}`;
}

export async function readNotificationCache(
  userId: string,
): Promise<NotificationCache | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NotificationCache;
    if (!Array.isArray(parsed.items) || typeof parsed.unreadCount !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function writeNotificationCache(
  userId: string,
  cache: NotificationCache,
): Promise<void> {
  const payload: NotificationCache = {
    items: cache.items.slice(0, CACHE_CAP),
    unreadCount: Math.max(0, cache.unreadCount),
    fetchedAt: cache.fetchedAt,
  };
  await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(payload));
}

export async function clearNotificationCache(userId: string): Promise<void> {
  await AsyncStorage.removeItem(cacheKey(userId));
}

export async function readNotificationOutbox(
  userId: string,
): Promise<NotificationOutboxEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(outboxKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as NotificationOutboxEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeNotificationOutbox(
  userId: string,
  entries: NotificationOutboxEntry[],
): Promise<void> {
  if (entries.length === 0) {
    await AsyncStorage.removeItem(outboxKey(userId));
    return;
  }
  await AsyncStorage.setItem(outboxKey(userId), JSON.stringify(entries));
}

/** Enqueue mark-read; `readAll` collapses all pending single-read entries. */
export function enqueueOutbox(
  current: NotificationOutboxEntry[],
  next: NotificationOutboxEntry,
): NotificationOutboxEntry[] {
  if (next.kind === "readAll") {
    return [{ kind: "readAll" }];
  }

  if (current.some((entry) => entry.kind === "readAll")) {
    return current;
  }

  if (
    current.some((entry) => entry.kind === "read" && entry.id === next.id)
  ) {
    return current;
  }

  return [...current, next];
}

/** Drop cached inbox/outbox for every user except the active one. */
export async function purgeOtherNotificationUsers(
  keepUserId: string,
): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const stale = keys.filter((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      return key !== cacheKey(keepUserId);
    }
    if (key.startsWith(OUTBOX_PREFIX)) {
      return key !== outboxKey(keepUserId);
    }
    return false;
  });
  if (stale.length > 0) {
    await AsyncStorage.multiRemove(stale);
  }
}

export async function purgeAllNotificationStorage(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const targets = keys.filter(
    (key) =>
      key.startsWith(CACHE_PREFIX) || key.startsWith(OUTBOX_PREFIX),
  );
  if (targets.length > 0) {
    await AsyncStorage.multiRemove(targets);
  }
}

export function isNetworkFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === "AbortError") return false;
  // ApiRequestError / ApiResponseError mean we reached the server.
  if (error.name === "ApiRequestError" || error.name === "ApiResponseError") {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("network request failed") ||
    error.name === "TypeError"
  );
}

import {
  clearAuthSession,
  getAuthSession,
  persistAuthSession,
} from "@/lib/auth/session";
import { getApiBaseUrl } from "@/lib/api/config";
import { ApiRequestError } from "@/lib/api/errors";

export type ApiFetchOptions = {
  method?: string;
  body?: unknown;
  /** Skip Bearer + refresh (login, refresh, magic-login, etc.). */
  skipAuth?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

type RefreshResult = {
  accessToken: string;
  refreshToken: string;
};

let refreshPromise: Promise<RefreshResult | null> | null = null;

async function refreshAccessToken(): Promise<RefreshResult | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const session = await getAuthSession();
    if (!session?.refreshToken) {
      await clearAuthSession();
      return null;
    }

    const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh-token`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });

    let json: unknown = null;
    try {
      json = await response.json();
    } catch {
      json = null;
    }

    const envelope = json as {
      isSuccess?: boolean;
      value?: { data?: { accessToken?: string | null; refreshToken?: string | null } };
    } | null;

    const accessToken = envelope?.value?.data?.accessToken ?? null;
    const refreshToken = envelope?.value?.data?.refreshToken ?? null;

    if (!response.ok || !envelope?.isSuccess || !accessToken || !refreshToken) {
      await clearAuthSession();
      return null;
    }

    await persistAuthSession(
      { accessToken, refreshToken },
      session.user,
    );
    return { accessToken, refreshToken };
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function buildHeaders(
  options: ApiFetchOptions,
  accessToken?: string | null,
): Promise<Headers> {
  const headers = new Headers(options.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!options.skipAuth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return headers;
}

/**
 * Low-level fetch with SecureStore Bearer + one-shot refresh on 401.
 */
export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const url = path.startsWith("http")
    ? path
    : `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const session = options.skipAuth ? null : await getAuthSession();
  const headers = await buildHeaders(options, session?.accessToken);

  const init: RequestInit = {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers,
    signal: options.signal,
    body:
      options.body === undefined
        ? undefined
        : typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body),
  };

  let response = await fetch(url, init);

  if (response.status === 401 && !options.skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retryHeaders = await buildHeaders(options, refreshed.accessToken);
      response = await fetch(url, { ...init, headers: retryHeaders });
    }
  }

  return response;
}

export async function parseJsonOrThrow(response: Response): Promise<unknown> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message =
      typeof body === "object" &&
      body &&
      "error" in body &&
      typeof (body as { error?: { message?: unknown } }).error?.message ===
        "string"
        ? (body as { error: { message: string } }).error.message
        : `HTTP ${response.status}`;
    throw new ApiRequestError(response.status, message, body);
  }

  return body;
}

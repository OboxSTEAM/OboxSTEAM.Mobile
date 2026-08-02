import * as SecureStore from "expo-secure-store";

const AUTH_STORAGE_KEY = "oboxsteam.auth";
const REMEMBER_EMAIL_KEY = "oboxsteam.rememberEmail";

export type StoredAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type StoredAuthUser = {
  email: string;
  code?: string;
  displayName?: string;
  avatarUrl?: string | null;
  /** Cached from profile for header/nav before `/api/account/me` finishes. */
  role?: string;
};

export type StoredAuthSession = StoredAuthTokens & {
  user?: StoredAuthUser;
};

export async function persistAuthSession(
  tokens: StoredAuthTokens,
  user?: StoredAuthUser,
): Promise<StoredAuthSession> {
  const session: StoredAuthSession = { ...tokens, ...(user ? { user } : {}) };
  await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export async function clearAuthSession(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
}

export async function getAuthSession(): Promise<StoredAuthSession | null> {
  const raw = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredAuthSession;
  } catch {
    return null;
  }
}

export async function persistRememberedEmail(email: string): Promise<void> {
  await SecureStore.setItemAsync(REMEMBER_EMAIL_KEY, email);
}

export async function getRememberedEmail(): Promise<string | null> {
  return SecureStore.getItemAsync(REMEMBER_EMAIL_KEY);
}

export async function clearRememberedEmail(): Promise<void> {
  await SecureStore.deleteItemAsync(REMEMBER_EMAIL_KEY);
}

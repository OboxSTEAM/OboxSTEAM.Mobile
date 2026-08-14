import { getCurrentUser, login as apiLogin, type UserProfile } from "@/lib/api";
import { ApiRequestError } from "@/lib/api/errors";
import { isParentRole } from "@/lib/auth/roles";
import {
  clearAuthSession,
  getAuthSession,
  persistAuthSession,
  type StoredAuthUser,
} from "@/lib/auth/session";
import { onAuthSessionInvalidated } from "@/lib/auth/session-events";
import { resolveAppError } from "@/lib/errors/resolve-app-error";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthStatus =
  | "bootstrapping"
  | "guest"
  | "authenticated"
  | "blocked";

type AuthContextValue = {
  status: AuthStatus;
  user: UserProfile | null;
  blockReason: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toStoredUser(profile: UserProfile): StoredAuthUser {
  return {
    email: profile.email ?? "",
    code: profile.code ?? undefined,
    displayName: profile.fullName ?? undefined,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
  };
}

function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 401;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("bootstrapping");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [blockReason, setBlockReason] = useState<string | null>(null);

  const applyProfile = useCallback((profile: UserProfile) => {
    if (!isParentRole(profile.role)) {
      setUser(profile);
      setBlockReason(
        "Ứng dụng di động hiện chỉ hỗ trợ tài khoản Parent. Vui lòng dùng website cho vai trò khác.",
      );
      setStatus("blocked");
      return;
    }
    setUser(profile);
    setBlockReason(null);
    setStatus("authenticated");
  }, []);

  const resetToGuest = useCallback(() => {
    setUser(null);
    setBlockReason(null);
    setStatus("guest");
  }, []);

  // apiFetch emits this when refresh fails or the session is no longer valid.
  useEffect(() => {
    return onAuthSessionInvalidated(() => {
      resetToGuest();
    });
  }, [resetToGuest]);

  const bootstrap = useCallback(async () => {
    try {
      const session = await getAuthSession();
      if (!session?.accessToken && !session?.refreshToken) {
        resetToGuest();
        return;
      }

      // getCurrentUser goes through apiFetch — expired access auto-refreshes once.
      const value = await getCurrentUser();
      const profile = value.data;
      if (!profile) {
        await clearAuthSession();
        resetToGuest();
        return;
      }

      // Prefer tokens written by a successful mid-flight refresh.
      const latest = await getAuthSession();
      if (!latest?.accessToken || !latest.refreshToken) {
        await clearAuthSession();
        resetToGuest();
        return;
      }

      await persistAuthSession(
        {
          accessToken: latest.accessToken,
          refreshToken: latest.refreshToken,
        },
        toStoredUser(profile),
      );
      applyProfile(profile);
    } catch (error) {
      // Client already cleared SecureStore when refresh was rejected.
      // Network blips leave tokens intact for the next launch / retry.
      if (isUnauthorizedError(error)) {
        const still = await getAuthSession();
        if (!still?.refreshToken) {
          resetToGuest();
          return;
        }
      }
      resetToGuest();
    }
  }, [applyProfile, resetToGuest]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const value = await apiLogin({ email, password });
      const tokens = value.data;
      if (!tokens?.accessToken || !tokens.refreshToken) {
        throw new Error("Đăng nhập thất bại: thiếu token.");
      }

      await persistAuthSession(tokens);

      const me = await getCurrentUser();
      const profile = me.data;
      if (!profile) {
        await clearAuthSession();
        throw new Error("Không lấy được thông tin tài khoản.");
      }

      await persistAuthSession(tokens, toStoredUser(profile));
      applyProfile(profile);
    },
    [applyProfile],
  );

  const signOut = useCallback(async () => {
    await clearAuthSession();
    resetToGuest();
  }, [resetToGuest]);

  const refreshProfile = useCallback(async () => {
    try {
      const value = await getCurrentUser();
      const profile = value.data;
      if (!profile) {
        await signOut();
        return;
      }
      const session = await getAuthSession();
      if (session) {
        await persistAuthSession(
          {
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
          },
          toStoredUser(profile),
        );
      }
      applyProfile(profile);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        const still = await getAuthSession();
        if (!still?.refreshToken) {
          resetToGuest();
          return;
        }
      }
      throw error;
    }
  }, [applyProfile, resetToGuest, signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      blockReason,
      signIn,
      signOut,
      refreshProfile,
    }),
    [status, user, blockReason, signIn, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function formatAuthError(error: unknown): string {
  return resolveAppError(error).reason;
}

import { getCurrentUser, login as apiLogin, type UserProfile } from "@/lib/api";
import { isParentRole } from "@/lib/auth/roles";
import {
  clearAuthSession,
  getAuthSession,
  persistAuthSession,
  type StoredAuthUser,
} from "@/lib/auth/session";
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

  const bootstrap = useCallback(async () => {
    try {
      const session = await getAuthSession();
      if (!session?.accessToken) {
        setUser(null);
        setBlockReason(null);
        setStatus("guest");
        return;
      }

      const value = await getCurrentUser();
      const profile = value.data;
      if (!profile) {
        await clearAuthSession();
        setUser(null);
        setStatus("guest");
        return;
      }

      await persistAuthSession(
        {
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
        },
        toStoredUser(profile),
      );
      applyProfile(profile);
    } catch {
      await clearAuthSession();
      setUser(null);
      setBlockReason(null);
      setStatus("guest");
    }
  }, [applyProfile]);

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
    setUser(null);
    setBlockReason(null);
    setStatus("guest");
  }, []);

  const refreshProfile = useCallback(async () => {
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
  }, [applyProfile, signOut]);

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

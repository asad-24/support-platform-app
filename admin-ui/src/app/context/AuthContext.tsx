import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { apiRequest, clearAdminTokens, getAdminRefreshToken } from "../lib/api";
import type { AdminUser } from "../lib/types";

type AuthContextValue = {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
};

type UserResponse = {
  success: true;
  data: {
    user: AdminUser;
    accessToken?: string;
    refreshToken?: string;
  };
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionRequestId = useRef(0);

  const restoreSession = async () => {
    const requestId = ++sessionRequestId.current;
    try {
      const response = await apiRequest<UserResponse>("/auth/admin/me", {
        suppressAuthExpired: true,
      });
      if (requestId !== sessionRequestId.current) return;
      setUser(response.data.user);
    } catch {
      if (requestId !== sessionRequestId.current) return;
      setUser(null);
    } finally {
      if (requestId === sessionRequestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    void restoreSession();

    const handleExpired = () => {
      sessionRequestId.current += 1;
      setUser(null);
      setLoading(false);
    };

    window.addEventListener("admin-auth-expired", handleExpired);
    return () => window.removeEventListener("admin-auth-expired", handleExpired);
  }, []);

  const login = async (email: string, password: string) => {
    const requestId = ++sessionRequestId.current;
    setLoading(true);
    try {
      const response = await apiRequest<UserResponse>("/auth/admin/login", {
        method: "POST",
        body: { email, password },
        retryOnUnauthorized: false,
      });
      if (requestId !== sessionRequestId.current) return;
      setUser(response.data.user);
    } catch (error) {
      throw error;
    } finally {
      if (requestId === sessionRequestId.current) setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest<{ success: true }>("/auth/admin/logout", {
        method: "POST",
        body: getAdminRefreshToken() ? { refreshToken: getAdminRefreshToken() } : {},
        retryOnUnauthorized: false,
      });
    } finally {
      clearAdminTokens();
      sessionRequestId.current += 1;
      setUser(null);
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, restoreSession }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

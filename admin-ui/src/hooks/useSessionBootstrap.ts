import { useEffect } from "react";
import { apiRequest, clearAdminTokens } from "@services/api";
import type { AdminUser } from "@app/lib/types";
import { authActions } from "@store/authSlice";
import { useAppDispatch } from "@store/hooks";

type UserResponse = {
  success: true;
  data: {
    user: AdminUser;
    accessToken?: string;
    refreshToken?: string;
  };
};

export function useSessionBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      dispatch(authActions.setChecking());
      try {
        const response = await apiRequest<UserResponse>("/auth/admin/me", {
          suppressAuthExpired: true,
        });
        if (active) {
          dispatch(authActions.setUser(response.data.user));
        }
      } catch {
        clearAdminTokens();
        if (active) {
          dispatch(authActions.setUnauthenticated());
        }
      }
    }

    const handleExpired = () => {
      clearAdminTokens();
      if (active) {
        dispatch(authActions.setUnauthenticated());
      }
    };

    window.addEventListener("admin-auth-expired", handleExpired);
    void restoreSession();

    return () => {
      active = false;
      window.removeEventListener("admin-auth-expired", handleExpired);
    };
  }, [dispatch]);
}

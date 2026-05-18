import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AdminUser } from "@app/lib/types";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

type AuthState = {
  status: AuthStatus;
  user: AdminUser | null;
};

const initialState: AuthState = {
  status: "checking",
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setChecking(state) {
      state.status = "checking";
    },
    setUnauthenticated(state) {
      state.status = "unauthenticated";
      state.user = null;
    },
    setUser(state, action: PayloadAction<AdminUser>) {
      state.status = "authenticated";
      state.user = action.payload;
    },
  },
});

export const authReducer = authSlice.reducer;
export const authActions = authSlice.actions;

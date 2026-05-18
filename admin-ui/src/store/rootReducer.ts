import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "./authSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
});

export type RootReducerState = ReturnType<typeof rootReducer>;

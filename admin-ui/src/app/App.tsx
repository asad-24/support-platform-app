import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { Toaster } from "@app/components/ui/sonner";
import { LoadingBlock } from "@components/StateBlock";
import { useSessionBootstrap } from "@hooks/useSessionBootstrap";
import { DashboardLayout } from "@layouts/DashboardLayout";
import { DashboardPage } from "@pages/admin/DashboardPage";
import { NeedsPage } from "@pages/admin/NeedsPage";
import { RegistrationRequestsPage } from "@pages/admin/RegistrationRequestsPage";
import { SchoolsPage } from "@pages/admin/SchoolsPage";
import { SponsorsPage } from "@pages/admin/SponsorsPage";
import { UsersPage } from "@pages/admin/UsersPage";
import { LoginPage } from "@pages/auth/LoginPage";
import { store } from "@store";
import { useAppSelector } from "@store/hooks";
import { queryClient } from "./queryClient";

function SessionBootstrap() {
  useSessionBootstrap();
  return null;
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SessionBootstrap />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="/schools" element={<SchoolsPage />} />
                <Route path="/needs" element={<NeedsPage />} />
                <Route path="/sponsors" element={<SponsorsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/registration-requests" element={<RegistrationRequestsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </Provider>
  );
}

function ProtectedRoute() {
  const location = useLocation();
  const { status, user } = useAppSelector((state) => state.auth);

  if (status === "checking") {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: "#f8faf9" }}>
        <LoadingBlock label="Restoring admin session..." />
      </div>
    );
  }

  if (status === "unauthenticated" || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { status, user } = useAppSelector((state) => state.auth);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";

  if (status === "checking") {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: "#f8faf9" }}>
        <LoadingBlock label="Checking session..." />
      </div>
    );
  }

  if (status === "authenticated" && user) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

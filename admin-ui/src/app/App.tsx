import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { AdminLayout } from "./components/AdminLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegistrationRequestsPage } from "./pages/RegistrationRequestsPage";
import { UsersPage } from "./pages/UsersPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/registration-requests" element={<RegistrationRequestsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-lg border bg-card px-6 py-4 text-sm text-muted-foreground shadow-sm">
          Restoring admin session...
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

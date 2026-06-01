import { Outlet, useLocation } from "react-router";
import { Sidebar } from "./Sidebar";
import { NotificationMenu } from "./NotificationMenu";
import { NotificationsProvider } from "../context/NotificationsContext";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Dashboard",
    subtitle: "Overview of Support Atlas admin activity.",
  },
  "/users": {
    title: "Users",
    subtitle: "View active users, inspect volunteer profiles, and deactivate accounts.",
  },
  "/schools": {
    title: "Schools",
    subtitle: "Review, approve, reject, and manage submitted schools.",
  },
  "/users/registration-requests": {
    title: "Registration Requests",
    subtitle: "Review volunteer applications and approve or reject access.",
  },
};

export function AdminLayout() {
  const location = useLocation();
  const page = titles[location.pathname] || titles["/"];

  return (
    <NotificationsProvider>
      <div className="flex min-h-screen bg-background">
        <div className="hidden flex-shrink-0 lg:block">
          <Sidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
            <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold text-foreground sm:text-2xl">{page.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{page.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <NotificationMenu />
              </div>
            </div>
          </header>
          <main className="min-w-0 flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationsProvider>
  );
}

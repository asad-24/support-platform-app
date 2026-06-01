import { useState, type ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import {
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  Shield,
  Users,
} from "lucide-react";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import { Sheet, SheetContent } from "@app/components/ui/sheet";
import { DashboardSidebar, type SidebarItem } from "@components/DashboardSidebar";
import { NotificationMenu } from "@components/NotificationMenu";
import { NotificationsProvider } from "@app/context/NotificationsContext";
import { apiRequest, clearAdminTokens, getAdminRefreshToken } from "@services/api";
import { authActions } from "@store/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";

const adminItems: SidebarItem[] = [
  { id: "dashboard", name: "Dashboard", description: "Operational overview", icon: LayoutDashboard, path: "/", group: "Overview" },
  { id: "schools", name: "Schools", description: "School review", icon: School, path: "/schools", group: "Review" },
  { id: "users", name: "Users", description: "Active accounts", icon: Users, path: "/users", group: "People" },
  {
    id: "requests",
    name: "Registration Requests",
    description: "Volunteer review",
    icon: ClipboardList,
    path: "/users/registration-requests",
    group: "People",
  },
];

type DashboardLayoutProps = {
  children?: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const activeItem =
    adminItems.find((item) => {
      if (item.path === "/") {
        return location.pathname === item.path;
      }
      return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
    }) ?? adminItems[0];

  async function handleLogout() {
    try {
      await apiRequest<{ success: true }>("/auth/admin/logout", {
        method: "POST",
        body: getAdminRefreshToken() ? { refreshToken: getAdminRefreshToken() } : {},
        retryOnUnauthorized: false,
      });
    } finally {
      clearAdminTokens();
      dispatch(authActions.setUnauthenticated());
      navigate("/login", { replace: true });
    }
  }

  return (
    <NotificationsProvider>
      <div className="flex h-screen bg-background">
        <div className="hidden flex-shrink-0 lg:block">
          <DashboardSidebar items={adminItems} label="Support Atlas" sublabel="Admin Panel" />
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden border-0 bg-transparent p-0 shadow-none">
            <DashboardSidebar
              items={adminItems}
              label="Support Atlas"
              sublabel="Admin Panel"
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <main className="min-w-0 flex-1 overflow-auto">
          <div className="min-h-screen" style={{ backgroundColor: "#f8faf9" }}>
            <div className="sticky top-0 z-20 border-b border-border/60 bg-background/95 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                    <Button
                      variant="outline"
                      size="icon"
                      className="mr-1 size-9 rounded-2xl lg:hidden"
                      onClick={() => setMobileOpen(true)}
                    >
                      <Menu className="size-4" />
                      <span className="sr-only">Open navigation</span>
                    </Button>
                    <span className="shrink-0 font-medium text-foreground">Support Atlas</span>
                    <ChevronRight className="size-3 shrink-0" />
                    <span className="shrink-0">Admin Panel</span>
                    <ChevronRight className="size-3 shrink-0" />
                    <span className="truncate">{activeItem.name}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-foreground">{activeItem.name}</h2>
                    <Badge className="border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                      <span className="mr-2 size-2 rounded-full bg-primary animate-pulse" />
                      Live
                    </Badge>
                    <Badge variant="outline" className="gap-2">
                      <Shield className="size-3" />
                      Admin
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{activeItem.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <NotificationMenu />
                  <div className="rounded-2xl border bg-card px-4 py-2 text-right shadow-sm">
                    <div className="max-w-48 truncate text-sm font-medium">{user?.name || user?.email || "Authenticated admin"}</div>
                    <div className="text-xs capitalize text-muted-foreground">{user?.role || "admin"} session</div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => void handleLogout()}>
                    <LogOut className="size-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-6 p-4 sm:p-6">{children ?? <Outlet />}</div>
          </div>
        </main>
      </div>
    </NotificationsProvider>
  );
}

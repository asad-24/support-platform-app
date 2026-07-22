import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { cn } from "./ui/utils";
import { ChevronDown, ClipboardList, LayoutDashboard, LogOut, School, UserRound, Users, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [usersOpen, setUsersOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigateTo = (path: string) => {
    if (!isExpanded) {
      setIsExpanded(true);
      window.setTimeout(() => navigate(path), 120);
      return;
    }
    navigate(path);
  };

  const handleUsersClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setUsersOpen(true);
      window.setTimeout(() => navigate("/users"), 120);
      return;
    }
    setUsersOpen((open) => !open);
    navigate("/users");
  };

  const isDashboard = location.pathname === "/";
  const isSchools = location.pathname.startsWith("/schools");
  const isUsers = location.pathname === "/users";
  const isRequests = location.pathname.startsWith("/users/registration-requests");
  const usersActive = isUsers || isRequests;

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="ml-6 my-6">
      <div 
        className={cn(
          "flex flex-col h-[calc(100vh-3rem)] transition-all duration-300 ease-in-out rounded-3xl",
          "bg-gradient-to-b from-sidebar via-sidebar to-sidebar-accent shadow-2xl border border-sidebar-border/20 overflow-hidden",
          isExpanded ? "w-64" : "w-20"
        )}
      >
        {/* Header with Logo */}
        <div className="p-6 flex flex-col items-center relative">
          {/* Close button when expanded */}
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-sidebar-accent/50 hover:bg-sidebar-accent rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <X className="w-4 h-4 text-sidebar-foreground" />
            </button>
          )}
          
          <div className="w-12 h-12 overflow-hidden rounded-2xl bg-white flex items-center justify-center shadow-lg ring-1 ring-sidebar-border/30">
            <img src="/logo_school.png" alt="School Support Atlas" className="h-full w-full object-cover" />
          </div>
          {isExpanded && (
            <div className="mt-3 text-center">
              <h2 className="text-sidebar-foreground font-semibold text-base whitespace-nowrap">
                School Support Atlas
              </h2>
              <p className="text-sidebar-foreground/70 text-xs whitespace-nowrap mt-1">
                Admin Panel
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-4">
            <div className="relative group">
              <button
                onClick={() => navigateTo("/")}
                className={cn(
                  "transition-all duration-300 flex items-center relative overflow-hidden hover:scale-105 hover:shadow-lg",
                  isExpanded ? "w-full px-4 py-3 justify-start rounded-xl" : "w-12 h-12 justify-center mx-auto rounded-full",
                  isDashboard
                    ? "bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 shadow-lg shadow-sidebar-primary/30 scale-105"
                    : "bg-gradient-to-br from-sidebar-accent to-sidebar-accent/80 hover:from-sidebar-primary/80 hover:to-sidebar-primary/60",
                )}
              >
                <LayoutDashboard className={cn("w-5 h-5 flex-shrink-0", isDashboard ? "text-sidebar-primary-foreground" : "text-sidebar-accent-foreground group-hover:text-sidebar-primary-foreground")} />
                {isExpanded && (
                  <div className="ml-3 overflow-hidden text-left">
                    <div className={cn("font-medium text-sm whitespace-nowrap", isDashboard ? "text-sidebar-primary-foreground" : "text-sidebar-accent-foreground group-hover:text-sidebar-primary-foreground")}>Dashboard</div>
                    {isDashboard && <div className="text-xs text-sidebar-primary-foreground/70 mt-0.5 whitespace-nowrap">Admin overview</div>}
                  </div>
                )}
                {isDashboard && isExpanded && <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-sidebar-primary-foreground rounded-full animate-pulse" />}
              </button>
              {!isExpanded && <SidebarTooltip title="Dashboard" description="Admin overview" />}
            </div>

            <div className="relative group">
              <button
                onClick={() => navigateTo("/schools")}
                className={cn(
                  "transition-all duration-300 flex items-center relative overflow-hidden hover:scale-105 hover:shadow-lg",
                  isExpanded ? "w-full px-4 py-3 justify-start rounded-xl" : "w-12 h-12 justify-center mx-auto rounded-full",
                  isSchools
                    ? "bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 shadow-lg shadow-sidebar-primary/30 scale-105"
                    : "bg-gradient-to-br from-sidebar-accent to-sidebar-accent/80 hover:from-sidebar-primary/80 hover:to-sidebar-primary/60",
                )}
              >
                <School className={cn("w-5 h-5 flex-shrink-0", isSchools ? "text-sidebar-primary-foreground" : "text-sidebar-accent-foreground group-hover:text-sidebar-primary-foreground")} />
                {isExpanded && (
                  <div className="ml-3 overflow-hidden text-left">
                    <div className={cn("font-medium text-sm whitespace-nowrap", isSchools ? "text-sidebar-primary-foreground" : "text-sidebar-accent-foreground group-hover:text-sidebar-primary-foreground")}>Schools</div>
                    {isSchools && <div className="text-xs text-sidebar-primary-foreground/70 mt-0.5 whitespace-nowrap">School review</div>}
                  </div>
                )}
                {isSchools && isExpanded && <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-sidebar-primary-foreground rounded-full animate-pulse" />}
              </button>
              {!isExpanded && <SidebarTooltip title="Schools" description="School review" />}
            </div>

            <div className="relative group">
              <button
                onClick={handleUsersClick}
                className={cn(
                  "transition-all duration-300 flex items-center relative overflow-hidden hover:scale-105 hover:shadow-lg",
                  isExpanded ? "w-full px-4 py-3 justify-start rounded-xl" : "w-12 h-12 justify-center mx-auto rounded-full",
                  usersActive
                    ? "bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 shadow-lg shadow-sidebar-primary/30 scale-105"
                    : "bg-gradient-to-br from-sidebar-accent to-sidebar-accent/80 hover:from-sidebar-primary/80 hover:to-sidebar-primary/60",
                )}
              >
                <Users className={cn("w-5 h-5 flex-shrink-0", usersActive ? "text-sidebar-primary-foreground" : "text-sidebar-accent-foreground group-hover:text-sidebar-primary-foreground")} />
                {isExpanded && (
                  <>
                    <div className="ml-3 overflow-hidden text-left">
                      <div className={cn("font-medium text-sm whitespace-nowrap", usersActive ? "text-sidebar-primary-foreground" : "text-sidebar-accent-foreground group-hover:text-sidebar-primary-foreground")}>Users</div>
                      {usersActive && <div className="text-xs text-sidebar-primary-foreground/70 mt-0.5 whitespace-nowrap">{isRequests ? "Registration review" : "Active accounts"}</div>}
                    </div>
                    <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", usersOpen && "rotate-180", usersActive ? "text-sidebar-primary-foreground" : "text-sidebar-accent-foreground")} />
                  </>
                )}
              </button>
              {!isExpanded && <SidebarTooltip title="Users" description="Registration requests" />}
            </div>

            {isExpanded && usersOpen && (
              <div className="w-full space-y-2">
                <button
                  onClick={() => navigateTo("/users")}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-all",
                    isUsers
                      ? "bg-sidebar-primary/20 text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <Users className="h-4 w-4" />
                  <span className="whitespace-nowrap">Active Users</span>
                </button>
                <button
                  onClick={() => navigateTo("/users/registration-requests")}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-all",
                    isRequests
                      ? "bg-sidebar-primary/20 text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <ClipboardList className="h-4 w-4" />
                  <span className="whitespace-nowrap">Registration Requests</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="space-y-3 p-4">
          {isExpanded && user && (
            <div className="rounded-2xl bg-sidebar-accent/70 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</div>
                  <div className="truncate text-xs text-sidebar-foreground/70">{user.email}</div>
                </div>
              </div>
            </div>
          )}
          <div className="relative group flex justify-center">
            <button
              onClick={() => void handleLogout()}
              className={cn(
                "flex items-center justify-center bg-sidebar-accent/80 text-sidebar-accent-foreground transition-all hover:bg-destructive hover:text-destructive-foreground",
                isExpanded ? "h-10 w-full gap-2 rounded-xl px-4" : "h-12 w-12 rounded-full",
              )}
            >
              <LogOut className="h-5 w-5" />
              {isExpanded && <span className="text-sm font-medium">Logout</span>}
            </button>
            {!isExpanded && <SidebarTooltip title="Logout" description="End admin session" />}
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarTooltip({ title, description }: { title: string; description: string }) {
  return (
    <div className="absolute left-full ml-4 px-3 py-2 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/90 text-sidebar-primary-foreground rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg transform translate-x-2 group-hover:translate-x-0">
      <div className="font-medium text-sm">{title}</div>
      <div className="text-xs opacity-75 mt-1">{description}</div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-sidebar-primary rotate-45" />
    </div>
  );
}

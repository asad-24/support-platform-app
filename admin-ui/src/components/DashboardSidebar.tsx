import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { LucideIcon } from "lucide-react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ScrollArea } from "@app/components/ui/scroll-area";
import { cn } from "@app/components/ui/utils";
import { useAppSelector } from "@store/hooks";
import { initials } from "@utils/format";

export type SidebarItem = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  path: string;
  group?: string;
};

type DashboardSidebarProps = {
  items: SidebarItem[];
  label: string;
  sublabel: string;
  onNavigate?: () => void;
};

export function DashboardSidebar({ items, label, sublabel, onNavigate }: DashboardSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigationClick = (path: string) => {
    setIsExpanded(true);
    navigate(path);
    onNavigate?.();
  };

  const isItemActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const groups = items.reduce<Array<{ name: string; items: SidebarItem[] }>>((acc, item) => {
    const groupName = item.group || "Workspace";
    const existing = acc.find((group) => group.name === groupName);
    if (existing) {
      existing.items.push(item);
    } else {
      acc.push({ name: groupName, items: [item] });
    }
    return acc;
  }, []);

  return (
    <aside className="my-4 ml-4 md:my-6 md:ml-6">
      <div
        className={cn(
          "flex h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-3xl border border-sidebar-border/20",
          "bg-gradient-to-b from-sidebar via-sidebar to-sidebar-accent shadow-2xl transition-all duration-300 ease-in-out",
          isExpanded ? "w-72" : "w-20",
        )}
      >
        <div className={cn("relative border-b border-sidebar-border/30 p-4", isExpanded ? "pb-5" : "pb-4")}>
          <div className={cn("flex items-center", isExpanded ? "justify-between gap-3" : "justify-center")}>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className={cn(
                "flex items-center transition-all duration-200",
                isExpanded ? "min-w-0 gap-3 text-left" : "justify-center",
              )}
              aria-label="Expand sidebar"
            >
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-sidebar-border/30">
                <img src="/logo_school.png" alt="School Support Atlas" className="h-full w-full object-cover" />
              </span>
              {isExpanded ? (
                <span className="min-w-0">
                  <span className="block truncate text-base font-semibold text-sidebar-foreground">{label}</span>
                  <span className="mt-0.5 block truncate text-xs text-sidebar-foreground/70">{sublabel}</span>
                </span>
              ) : null}
            </button>
            {isExpanded ? (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent/60 text-sidebar-foreground transition-all duration-200 hover:scale-105 hover:bg-sidebar-accent"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="size-4" />
              </button>
            ) : null}
          </div>
          {!isExpanded ? (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="mx-auto mt-4 flex size-9 items-center justify-center rounded-full bg-sidebar-accent/60 text-sidebar-foreground transition-all duration-200 hover:scale-105 hover:bg-sidebar-accent"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="size-4" />
            </button>
          ) : null}
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-5">
            {groups.map((group) => (
              <div key={group.name} className="space-y-2">
                {isExpanded ? (
                  <div className="px-3 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/45">
                    {group.name}
                  </div>
                ) : null}
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isItemActive(item.path);
                    return (
                      <div key={item.id} className="group relative">
                        <button
                          type="button"
                          onClick={() => handleNavigationClick(item.path)}
                          className={cn(
                            "relative flex items-center overflow-hidden transition-all duration-300 hover:shadow-lg",
                            isExpanded
                              ? "min-h-12 w-full justify-start rounded-2xl px-4 py-3"
                              : "mx-auto size-12 justify-center rounded-full",
                            isActive
                              ? "bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 shadow-lg shadow-sidebar-primary/30"
                              : "bg-sidebar-accent/65 hover:bg-sidebar-primary/80",
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {isActive && isExpanded ? (
                            <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary-foreground" />
                          ) : null}
                          <Icon
                            className={cn(
                              "size-5 flex-shrink-0 transition-colors duration-300",
                              isActive
                                ? "text-sidebar-primary-foreground"
                                : "text-sidebar-accent-foreground group-hover:text-sidebar-primary-foreground",
                            )}
                          />
                          {isExpanded ? (
                            <span className="ml-3 min-w-0 text-left">
                              <span
                                className={cn(
                                  "block truncate text-sm font-medium transition-colors duration-300",
                                  isActive
                                    ? "text-sidebar-primary-foreground"
                                    : "text-sidebar-accent-foreground group-hover:text-sidebar-primary-foreground",
                                )}
                              >
                                {item.name}
                              </span>
                              <span
                                className={cn(
                                  "mt-0.5 block truncate text-xs",
                                  isActive ? "text-sidebar-primary-foreground/75" : "text-sidebar-foreground/55",
                                )}
                              >
                                {item.description}
                              </span>
                            </span>
                          ) : null}
                          {isActive && !isExpanded ? (
                            <>
                              <span className="absolute inset-0 animate-pulse rounded-full bg-sidebar-primary opacity-20" />
                              <span className="absolute -right-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-sidebar-primary" />
                            </>
                          ) : null}
                        </button>

                        {!isExpanded ? (
                          <div className="pointer-events-none absolute left-full z-50 ml-4 translate-x-2 whitespace-nowrap rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/90 px-3 py-2 text-sidebar-primary-foreground opacity-0 shadow-lg transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                            <div className="text-sm font-medium">{item.name}</div>
                            <div className="mt-1 text-xs opacity-75">{item.description}</div>
                            <div className="absolute left-0 top-1/2 size-2 -translate-x-1 -translate-y-1/2 rotate-45 bg-sidebar-primary" />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t border-sidebar-border/30 p-4">
          <div className="group relative">
            <button
              type="button"
              className={cn(
                "flex cursor-pointer items-center rounded-2xl bg-sidebar-accent/65 text-sidebar-foreground shadow-lg transition-all duration-300 hover:bg-sidebar-accent",
                isExpanded ? "w-full gap-3 px-3 py-3 text-left" : "mx-auto size-12 justify-center rounded-full",
              )}
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label="Toggle profile panel"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-base font-semibold text-sidebar-primary-foreground">
                {initials(user?.name || user?.email)}
              </span>
              {isExpanded ? (
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{user?.name || user?.email || "Admin user"}</span>
                  <span className="mt-0.5 block truncate text-xs capitalize text-sidebar-foreground/65">
                    {user?.role || "admin"} account
                  </span>
                </span>
              ) : null}
            </button>
            {!isExpanded ? (
              <div className="pointer-events-none absolute left-full z-50 ml-4 translate-x-2 whitespace-nowrap rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/90 px-3 py-2 text-sidebar-primary-foreground opacity-0 shadow-lg transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                <div className="text-sm font-medium">{user?.name || user?.email || "Admin user"}</div>
                <div className="mt-1 text-xs capitalize opacity-75">{user?.role || "admin"}</div>
                <div className="absolute left-0 top-1/2 size-2 -translate-x-1 -translate-y-1/2 rotate-45 bg-sidebar-primary" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ApiError, apiRequest } from "../lib/api";
import type { AdminNotification } from "../lib/types";
import { formatDateTime } from "../lib/format";
import { useAppSelector } from "@store/hooks";

type NotificationListResponse = {
  success: true;
  data: {
    items: AdminNotification[];
    pagination: {
      total: number;
      page: number;
      limit: number;
    };
  };
};

type NotificationsContextValue = {
  notifications: AdminNotification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<AdminNotification | null>(null);
  const seenIds = useRef<Set<number>>(new Set());
  const firstLoadDone = useRef(false);

  const refreshNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await apiRequest<NotificationListResponse>("/admin/notifications?status=unread&page=1&limit=50");
      const nextItems = response.data.items.filter((item) => (
        item.type === "volunteer_application_received" || item.type === "school_submitted"
      ));
      const newItems = nextItems.filter((item) => !seenIds.current.has(item.id));
      seenIds.current = new Set(nextItems.map((item) => item.id));
      if (firstLoadDone.current && newItems.length > 0) setPopup(newItems[0]);
      firstLoadDone.current = true;
      setNotifications(nextItems);
    } catch (error) {
      if (error instanceof ApiError && [400, 401, 403].includes(error.status)) {
        setNotifications([]);
        return;
      }
      console.error("Failed to refresh admin notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setPopup(null);
      seenIds.current = new Set();
      firstLoadDone.current = false;
      return;
    }

    void refreshNotifications();
    const interval = window.setInterval(() => {
      void refreshNotifications();
    }, 20000);

    return () => window.clearInterval(interval);
  }, [user?.id]);

  const markRead = async (id: number) => {
    await apiRequest(`/admin/notifications/${id}/read`, {
      method: "POST",
      body: {},
    });
    await refreshNotifications();
  };

  const markAllRead = async () => {
    await apiRequest("/admin/notifications/read-all", {
      method: "POST",
      body: {},
    });
    await refreshNotifications();
  };

  useEffect(() => {
    if (!popup) return;
    const timeout = window.setTimeout(() => setPopup(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [popup?.id]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.length,
      loading,
      refreshNotifications,
      markRead,
      markAllRead,
    }),
    [notifications, loading],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      {popup && (
        <div className="fixed right-4 top-24 z-[60] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border bg-card p-4 text-card-foreground shadow-xl">
          <div className="text-sm font-semibold">{popup.title}</div>
          <div className="mt-1 text-sm text-muted-foreground">{popup.message}</div>
          <div className="mt-2 text-xs text-muted-foreground">{formatDateTime(popup.created_at)}</div>
        </div>
      )}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used inside NotificationsProvider");
  return context;
}

import { useState } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@app/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@app/components/ui/sheet";
import { formatDateTime } from "@utils/format";
import { useNotifications } from "@app/context/NotificationsContext";

export function NotificationMenu() {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, refreshNotifications, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const openNotification = async (notification: (typeof notifications)[number]) => {
    const applicationId = typeof notification.metadata?.applicationId === "number" ? notification.metadata.applicationId : undefined;
    const schoolId = notification.school_id || numberFromMetadata(notification.metadata?.school_id);

    if (notification.type === "school_submitted" && schoolId) {
      navigate(`/schools?schoolId=${schoolId}`);
    } else if (applicationId) {
      navigate(`/users/registration-requests?applicationId=${applicationId}`);
    }
    await markRead(notification.id);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="icon" className="relative rounded-2xl bg-card shadow-sm" onClick={() => setOpen(true)}>
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">
            {unreadCount}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </Button>

      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>Unread registration and school submission notifications.</SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-between border-y px-4 py-3">
          <div className="text-sm text-muted-foreground">{unreadCount} unread</div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void refreshNotifications()}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => void markAllRead()} disabled={unreadCount === 0}>
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          </div>
        </div>

        <div className="space-y-3 px-4 py-4">
          {notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">
              No unread notifications.
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                className="flex w-full cursor-pointer flex-col items-start gap-1 rounded-2xl border bg-card p-3 text-left shadow-sm transition-colors hover:bg-accent"
                onClick={() => void openNotification(notification)}
              >
                <div className="font-medium text-foreground">{notification.title}</div>
                <div className="text-sm text-muted-foreground">{notification.message}</div>
                <div className="text-xs text-muted-foreground">{formatDateTime(notification.created_at)}</div>
              </button>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function numberFromMetadata(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

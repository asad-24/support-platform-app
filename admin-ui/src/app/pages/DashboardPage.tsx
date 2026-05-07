import { useEffect, useState } from "react";
import { Bell, CheckCircle2, ClipboardCheck, RefreshCw, School, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { apiRequest, errorMessage } from "../lib/api";
import type { DashboardStats } from "../lib/types";

type DashboardResponse = {
  success: true;
  data: {
    stats: DashboardStats;
  };
};

const statCards = [
  { key: "pending_reviews", label: "Pending school reviews", icon: ClipboardCheck },
  { key: "approved_schools", label: "Approved schools", icon: CheckCircle2 },
  { key: "rejected_schools", label: "Rejected schools", icon: School },
  { key: "total_volunteers", label: "Total volunteers", icon: Users },
  { key: "completed_volunteer_profiles", label: "Completed profiles", icon: Users },
  { key: "unread_notifications", label: "Unread notifications", icon: Bell },
] as const;

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest<DashboardResponse>("/admin/dashboard");
      setStats(response.data.stats);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Admin summary</h2>
          <p className="text-sm text-muted-foreground">Live backend summary for schools and volunteer activity.</p>
        </div>
        <Button variant="outline" onClick={() => void loadDashboard()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.key} className="rounded-lg shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <div className="text-sm text-muted-foreground">{card.label}</div>
                  <div className="mt-2 text-3xl font-semibold text-foreground">{stats ? stats[card.key] : loading ? "..." : 0}</div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

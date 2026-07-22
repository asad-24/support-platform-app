import { useQuery } from "@tanstack/react-query";
import { Bell, CheckCircle2, ClipboardCheck, RefreshCw, School, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/components/ui/card";
import { Skeleton } from "@app/components/ui/skeleton";
import { MetricCard } from "@components/MetricCard";
import { PageHeader } from "@components/PageHeader";
import { ErrorBlock } from "@components/StateBlock";
import { apiRequest, errorMessage } from "@services/api";
import { formatNumber, titleCase } from "@utils/format";
import type { DashboardStats } from "@app/lib/types";

type DashboardResponse = {
  success: true;
  data: {
    stats: DashboardStats;
    analytics: DashboardAnalytics;
  };
};

type AnalyticsDatum<K extends string> = Record<K, string> & { count: number };

type DashboardAnalytics = {
  schools_by_status: AnalyticsDatum<"status">[];
  schools_by_urgency: AnalyticsDatum<"urgency">[];
  schools_by_state: AnalyticsDatum<"state">[];
  users_by_status: AnalyticsDatum<"status">[];
  volunteer_profile_completion: AnalyticsDatum<"status">[];
};

const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "#94a3b8"];

const metricCards = [
  { key: "pending_reviews", label: "Pending school reviews", description: "Records awaiting admin decision", icon: ClipboardCheck, tone: "dark" },
  { key: "approved_schools", label: "Approved schools", description: "Schools cleared for School Support Atlas", icon: CheckCircle2, tone: "light" },
  { key: "rejected_schools", label: "Rejected schools", description: "Records returned or declined", icon: School, tone: "light" },
  { key: "total_volunteers", label: "Total volunteers", description: "Volunteer accounts in the system", icon: Users, tone: "dark" },
  { key: "completed_volunteer_profiles", label: "Completed profiles", description: "Volunteers with full profiles", icon: Users, tone: "light" },
  { key: "unread_notifications", label: "Unread notifications", description: "Admin items still unread", icon: Bell, tone: "light" },
] as const;

export function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await apiRequest<DashboardResponse>("/admin/dashboard");
      return response.data;
    },
  });

  const stats = dashboardQuery.data?.stats;
  const analytics = dashboardQuery.data?.analytics;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin summary"
        description="Live backend summary for schools, volunteers, and review activity."
        action={
          <Button variant="outline" onClick={() => void dashboardQuery.refetch()} disabled={dashboardQuery.isFetching}>
            <RefreshCw className={`h-4 w-4 ${dashboardQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {dashboardQuery.error ? (
        <ErrorBlock message={errorMessage(dashboardQuery.error)} onRetry={() => void dashboardQuery.refetch()} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => (
          <MetricCard
            key={card.key}
            title={card.label}
            value={dashboardQuery.isLoading ? "..." : formatNumber(stats?.[card.key] ?? 0)}
            description={card.description}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl shadow-lg xl:col-span-2">
          <CardHeader>
            <CardTitle>Review queue</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <QueueItem label="Pending" value={stats?.pending_reviews ?? 0} tone="amber" />
            <QueueItem label="Approved" value={stats?.approved_schools ?? 0} tone="green" />
            <QueueItem label="Rejected" value={stats?.rejected_schools ?? 0} tone="red" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Volunteer coverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QueueItem label="Total volunteers" value={stats?.total_volunteers ?? 0} tone="green" />
            <QueueItem label="Completed profiles" value={stats?.completed_volunteer_profiles ?? 0} tone="slate" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsPieCard
          title="Schools by status"
          description="Current review state across school records."
          data={analytics?.schools_by_status}
          nameKey="status"
          loading={dashboardQuery.isLoading}
        />
        <AnalyticsBarCard
          title="Schools by urgency"
          description="Operational priority across submitted school records."
          data={analytics?.schools_by_urgency}
          nameKey="urgency"
          fill="var(--chart-2)"
          loading={dashboardQuery.isLoading}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsBarCard
          title="Schools by state"
          description="Top school locations by state, including unknown coordinates."
          data={analytics?.schools_by_state}
          nameKey="state"
          fill="var(--chart-1)"
          loading={dashboardQuery.isLoading}
        />
        <AnalyticsPieCard
          title="Users and profile completion"
          description="Account status and volunteer profile readiness."
          data={mergeUserAnalytics(analytics)}
          nameKey="status"
          loading={dashboardQuery.isLoading}
        />
      </div>
    </div>
  );
}

function QueueItem({ label, value, tone }: { label: string; value: number; tone: "amber" | "green" | "red" | "slate" }) {
  const toneClass = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-primary/10 text-primary border-primary/20",
    red: "bg-red-50 text-red-700 border-red-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{formatNumber(value)}</div>
    </div>
  );
}

function AnalyticsPieCard({
  title,
  description,
  data,
  nameKey,
  loading,
}: {
  title: string;
  description: string;
  data: Array<Record<string, string> & { count: number }> | undefined;
  nameKey: string;
  loading: boolean;
}) {
  const normalized = normalizeChartData(data, nameKey);
  const total = normalized.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="min-h-72">
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : total > 0 ? (
          <div className="grid gap-6 md:grid-cols-[11rem_1fr] md:items-center">
            <div className="h-44 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={normalized}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={72}
                    strokeWidth={1}
                  >
                    {normalized.map((_, index) => (
                      <Cell key={index} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-sm">
              {normalized.map((item, index) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                  <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                  <span className="text-muted-foreground">{formatNumber(item.count)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ChartEmpty label="No analytics data yet." />
        )}
      </CardContent>
    </Card>
  );
}

function AnalyticsBarCard({
  title,
  description,
  data,
  nameKey,
  fill,
  loading,
}: {
  title: string;
  description: string;
  data: Array<Record<string, string> & { count: number }> | undefined;
  nameKey: string;
  fill: string;
  loading: boolean;
}) {
  const normalized = normalizeChartData(data, nameKey);

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : normalized.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={normalized}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" interval={0} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill={fill} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty label="No analytics data yet." />
        )}
      </CardContent>
    </Card>
  );
}

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-48 items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function normalizeChartData(data: Array<Record<string, string> & { count: number }> | undefined, key: string) {
  return (data || []).map((item) => ({
    label: titleCase(item[key] || "unknown"),
    count: Number(item.count) || 0,
  }));
}

function mergeUserAnalytics(analytics: DashboardAnalytics | undefined) {
  if (!analytics) return [];
  return [
    ...analytics.users_by_status.map((item) => ({ status: `${item.status} users`, count: item.count })),
    ...analytics.volunteer_profile_completion.map((item) => ({ status: `${item.status} profiles`, count: item.count })),
  ];
}

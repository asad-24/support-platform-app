import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@app/components/ui/card";
import { cn } from "@app/components/ui/utils";

type MetricCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone?: "dark" | "light";
};

export function MetricCard({ title, value, description, icon: Icon, tone = "dark" }: MetricCardProps) {
  const dark = tone === "dark";

  return (
    <Card
      className={cn(
        "border-sidebar-border/30 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
        dark ? "bg-gradient-to-br from-sidebar via-sidebar to-sidebar-accent" : "bg-card",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className={cn("text-sm font-medium", dark ? "text-sidebar-foreground" : "text-muted-foreground")}>
          {title}
        </CardTitle>
        <div
          className={cn(
            "rounded-full p-2 shadow-sm",
            dark ? "bg-sidebar-primary/20 text-sidebar-primary" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", dark ? "text-sidebar-foreground" : "text-foreground")}>{value}</div>
        <p className={cn("mt-2 text-xs", dark ? "text-sidebar-foreground/70" : "text-muted-foreground")}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

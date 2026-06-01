import { Badge } from "@app/components/ui/badge";
import { titleCase } from "@utils/format";

const statusClasses: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  approved: "bg-primary/10 text-primary border-primary/20",
  archived: "bg-slate-100 text-slate-600 border-slate-200",
  draft: "bg-muted text-muted-foreground border-border",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const key = (status || "unknown").toLowerCase();

  return (
    <Badge variant="outline" className={statusClasses[key] ?? "bg-secondary text-secondary-foreground border-border"}>
      {titleCase(status || "unknown")}
    </Badge>
  );
}

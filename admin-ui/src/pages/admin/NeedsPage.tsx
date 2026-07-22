import { useEffect, useMemo, useState } from "react";
import { Eye, PauseCircle, PlayCircle, RefreshCw, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import { Card, CardContent } from "@app/components/ui/card";
import { Input } from "@app/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@app/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@app/components/ui/tabs";
import { apiRequest, errorMessage } from "@services/api";
import { formatDateTime, titleCase } from "@utils/format";
import type { SchoolNeed, SchoolNeedStatus } from "@app/lib/types";

type NeedListResponse = {
  success: true;
  data: {
    items: SchoolNeed[];
    pagination: { total: number; page: number; limit: number };
  };
};

type NeedStatusResponse = {
  success: true;
  data: {
    need: SchoolNeed;
  };
};

type NeedFilter = "all" | SchoolNeedStatus;

const statusOptions: NeedFilter[] = ["all", "active", "paused", "deleted"];

export function NeedsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<NeedFilter>("all");
  const [items, setItems] = useState<SchoolNeed[]>([]);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: "1", limit: "100" });
    if (status !== "all") params.set("status", status);
    if (appliedSearch) params.set("search", appliedSearch);
    return params.toString();
  }, [appliedSearch, status]);

  const loadNeeds = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest<NeedListResponse>(`/admin/needs?${query}`);
      setItems(response.data.items);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const updateNeedStatus = async (need: SchoolNeed, nextStatus: "active" | "paused") => {
    setActionLoading(need.id);
    setError("");
    try {
      await apiRequest<NeedStatusResponse>(`/admin/needs/${need.id}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      await loadNeeds();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setActionLoading(null);
    }
  };

  const deleteNeed = async (need: SchoolNeed) => {
    if (!window.confirm(`Delete "${need.title}"? It will be hidden from the public website.`)) return;
    setActionLoading(need.id);
    setError("");
    try {
      await apiRequest(`/admin/needs/${need.id}`, { method: "DELETE" });
      await loadNeeds();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    void loadNeeds();
  }, [query]);

  const visibleCount = items.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={status} onValueChange={(value) => setStatus(value as NeedFilter)}>
          <TabsList>
            {statusOptions.map((option) => (
              <TabsTrigger key={option} value={option}>{titleCase(option)}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex gap-2">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search needs" />
            <Button variant="outline" size="icon" onClick={() => setAppliedSearch(search.trim())}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={() => void loadNeeds()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}

      <Card className="rounded-lg shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <div className="font-medium text-foreground">{status === "all" ? "All school needs" : `${titleCase(status)} school needs`}</div>
              <div className="text-sm text-muted-foreground">{visibleCount} needs found</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Need</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Volunteer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">Loading needs...</TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No needs found.</TableCell>
                  </TableRow>
                ) : (
                  items.map((need) => (
                    <TableRow key={need.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{need.title}</div>
                        <div className="text-sm text-muted-foreground">{[need.category, need.urgency ? `${titleCase(need.urgency)} urgency` : ""].filter(Boolean).join(" - ")}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{need.school?.school_name || `School #${need.school_id}`}</div>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-xs"
                          onClick={() => navigate(`/schools?schoolId=${need.school_id}`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View school
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div>{need.school?.submitted_by?.name || `User #${need.submitted_by_user_id || need.school?.submitted_by_user_id || "-"}`}</div>
                        <div className="text-sm text-muted-foreground">{need.school?.submitted_by?.email}</div>
                      </TableCell>
                      <TableCell>{locationLabel(need)}</TableCell>
                      <TableCell>{formatMoney(need.estimated_cost ?? need.estimatedCost)}</TableCell>
                      <TableCell><NeedStatusBadge status={need.status} /></TableCell>
                      <TableCell>{formatDateTime(need.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {need.status === "paused" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void updateNeedStatus(need, "active")}
                              disabled={actionLoading === need.id}
                            >
                              <PlayCircle className="h-4 w-4" />
                              Resume
                            </Button>
                          ) : need.status === "active" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void updateNeedStatus(need, "paused")}
                              disabled={actionLoading === need.id}
                            >
                              <PauseCircle className="h-4 w-4" />
                              Pause
                            </Button>
                          ) : null}
                          {need.status !== "deleted" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => void deleteNeed(need)}
                              disabled={actionLoading === need.id}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NeedStatusBadge({ status }: { status: SchoolNeedStatus }) {
  if (status === "active") return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700" variant="outline">Active</Badge>;
  if (status === "paused") return <Badge className="border-amber-200 bg-amber-50 text-amber-700" variant="outline">Paused</Badge>;
  return <Badge variant="destructive">Deleted</Badge>;
}

function locationLabel(need: SchoolNeed) {
  const location = need.school?.location;
  return [location?.community, location?.lga, location?.state].filter(Boolean).join(", ") || "Not set";
}

function formatMoney(value: unknown) {
  if (value === null || value === undefined || value === "") return "Not set";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(numeric);
}

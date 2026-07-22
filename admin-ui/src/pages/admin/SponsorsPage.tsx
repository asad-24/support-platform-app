import { useEffect, useMemo, useState } from "react";
import { Eye, RefreshCw } from "lucide-react";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import { Card, CardContent } from "@app/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@app/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@app/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@app/components/ui/tabs";
import { apiRequest, errorMessage } from "@services/api";
import { useNotifications } from "@app/context/NotificationsContext";
import { formatDateTime, titleCase } from "@utils/format";
import type { SponsorRequest, SponsorRequestStatus } from "@app/lib/types";

type SponsorListResponse = {
  success: true;
  data: {
    items: SponsorRequest[];
    pagination: { total: number; page: number; limit: number };
  };
};

type SponsorShowResponse = {
  success: true;
  data: {
    sponsorRequest: SponsorRequest;
  };
};

type SponsorFilter = "all" | SponsorRequestStatus;

const statusOptions: SponsorFilter[] = ["all", "new", "contacted", "committed", "declined", "closed"];
const nextStatuses: SponsorRequestStatus[] = ["new", "contacted", "committed", "declined", "closed"];

export function SponsorsPage() {
  const [status, setStatus] = useState<SponsorFilter>("all");
  const [items, setItems] = useState<SponsorRequest[]>([]);
  const [selected, setSelected] = useState<SponsorRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const { refreshNotifications } = useNotifications();

  const loadSponsors = async (nextStatus = status) => {
    setLoading(true);
    setError("");
    try {
      const query = nextStatus === "all" ? "" : `?status=${nextStatus}`;
      const response = await apiRequest<SponsorListResponse>(`/admin/sponsor-requests${query}`);
      setItems(response.data.items);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const openSponsor = async (id: number) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    setDetailError("");
    setSelected(null);
    try {
      const response = await apiRequest<SponsorShowResponse>(`/admin/sponsor-requests/${id}`);
      setSelected(response.data.sponsorRequest);
    } catch (requestError) {
      setDetailError(errorMessage(requestError));
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (nextStatus: SponsorRequestStatus) => {
    if (!selected) return;
    setStatusLoading(true);
    setDetailError("");
    try {
      const response = await apiRequest<SponsorShowResponse>(`/admin/sponsor-requests/${selected.id}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      setSelected(response.data.sponsorRequest);
      await loadSponsors(status);
      await refreshNotifications();
    } catch (requestError) {
      setDetailError(errorMessage(requestError));
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    void loadSponsors(status);
  }, [status]);

  const counts = useMemo(
    () => ({
      current: items.length,
    }),
    [items.length],
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={status} onValueChange={(value) => setStatus(value as SponsorFilter)}>
          <TabsList>
            {statusOptions.map((option) => (
              <TabsTrigger key={option} value={option}>{titleCase(option)}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button variant="outline" onClick={() => void loadSponsors()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error ? <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}

      <Card className="rounded-lg shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <div className="font-medium text-foreground">{status === "all" ? "All" : titleCase(status)} sponsor requests</div>
              <div className="text-sm text-muted-foreground">{counts.current} requests found</div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sponsor</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Need</TableHead>
                <TableHead>Help Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">Loading sponsor requests...</TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No {status} sponsor requests found.</TableCell>
                </TableRow>
              ) : (
                items.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{request.sponsorName}</div>
                      <div className="text-sm text-muted-foreground">{request.sponsorEmail}</div>
                    </TableCell>
                    <TableCell>{request.sponsorPhone}</TableCell>
                    <TableCell>{request.schoolName}</TableCell>
                    <TableCell>{needSummary(request)}</TableCell>
                    <TableCell>{request.preferredHelpType}</TableCell>
                    <TableCell><StatusBadge status={request.status} /></TableCell>
                    <TableCell>{formatDateTime(request.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => void openSponsor(request.id)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{selected ? selected.sponsorName : "Sponsor request"}</SheetTitle>
            <SheetDescription>
              {selected ? `${selected.schoolName} - ${titleCase(selected.status)}` : "Loading sponsor data."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-5 px-4">
            {detailLoading ? <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">Loading sponsor request...</div> : null}
            {detailError ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{detailError}</div> : null}
            {selected ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <Badge variant="outline">{selected.requestId}</Badge>
                  <Badge variant="secondary">Submitted {formatDateTime(selected.createdAt)}</Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {sponsorFields(selected).map((field) => (
                    <div key={field.label} className="rounded-md border bg-card p-3">
                      <div className="text-xs font-medium uppercase text-muted-foreground">{field.label}</div>
                      <div className="mt-1 whitespace-pre-wrap text-sm text-foreground">{field.value || "Not provided"}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-md border bg-card p-3">
                  <div className="text-xs font-medium uppercase text-muted-foreground">Selected needs</div>
                  <div className="mt-2 space-y-2">
                    {selected.selectedNeeds.map((need) => (
                      <div key={need.id || need.title} className="rounded-md bg-muted/60 p-3 text-sm">
                        <div className="font-medium text-foreground">{need.title || need.id}</div>
                        <div className="mt-1 text-muted-foreground">
                          {[need.category, formatMoney(need.estimatedCost)].filter(Boolean).join(" - ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-foreground">Sponsor status</span>
                  <select
                    value={selected.status}
                    onChange={(event) => void updateStatus(event.target.value as SponsorRequestStatus)}
                    disabled={statusLoading}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                  >
                    {nextStatuses.map((option) => (
                      <option key={option} value={option}>{titleCase(option)}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : null}
          </div>

          <SheetFooter className="border-t">
            <div className="text-sm text-muted-foreground">
              {statusLoading ? "Updating status..." : "Status changes are saved immediately."}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function StatusBadge({ status }: { status: SponsorRequestStatus }) {
  if (status === "new") return <Badge variant="secondary">New</Badge>;
  if (status === "committed") return <Badge className="bg-primary/10 text-primary" variant="outline">Committed</Badge>;
  if (status === "declined") return <Badge variant="destructive">Declined</Badge>;
  if (status === "closed") return <Badge variant="outline">Closed</Badge>;
  return <Badge className="border-blue-200 bg-blue-50 text-blue-700" variant="outline">Contacted</Badge>;
}

function sponsorFields(request: SponsorRequest) {
  return [
    { label: "Sponsor name", value: request.sponsorName },
    { label: "Email", value: request.sponsorEmail },
    { label: "Phone", value: request.sponsorPhone },
    { label: "Country", value: request.sponsorCountry },
    { label: "Organization", value: request.organizationName },
    { label: "Help type", value: request.preferredHelpType },
    { label: "Pledge amount", value: formatMoney(request.pledgeAmount) },
    { label: "School", value: request.schoolName },
    { label: "School ID", value: request.schoolId },
    { label: "Profile link", value: request.profileLink },
    { label: "Help details", value: request.helpDetails },
    { label: "Message", value: request.message },
    { label: "Updated", value: formatDateTime(request.updatedAt) },
  ];
}

function needSummary(request: SponsorRequest) {
  return request.selectedNeeds.map((need) => need.title || need.id).filter(Boolean).join(", ") || "Not provided";
}

function formatMoney(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

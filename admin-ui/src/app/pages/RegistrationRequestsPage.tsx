import { useEffect, useMemo, useState } from "react";
import { Eye, RefreshCw, XCircle, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "react-router";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { apiRequest, errorMessage } from "../lib/api";
import { formatDate, formatDateTime, titleCase } from "../lib/format";
import type { VolunteerApplication, VolunteerApplicationStatus } from "../lib/types";
import { useNotifications } from "../context/NotificationsContext";

type ApplicationListResponse = {
  success: true;
  data: {
    items: VolunteerApplication[];
  };
};

type ApplicationShowResponse = {
  success: true;
  data: {
    application: VolunteerApplication;
  };
};

type ApplicationFilter = "all" | VolunteerApplicationStatus;

const statusOptions: ApplicationFilter[] = ["all", "pending", "approved", "rejected"];

export function RegistrationRequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<ApplicationFilter>("all");
  const [items, setItems] = useState<VolunteerApplication[]>([]);
  const [selected, setSelected] = useState<VolunteerApplication | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const { refreshNotifications } = useNotifications();

  const loadApplications = async (nextStatus = status) => {
    setLoading(true);
    setError("");
    try {
      const query = nextStatus === "all" ? "" : `?status=${nextStatus}`;
      const response = await apiRequest<ApplicationListResponse>(`/admin/volunteer-applications${query}`);
      setItems(response.data.items);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const openApplication = async (id: number) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    setDetailError("");
    setSelected(null);
    setAdminNotes("");
    try {
      const response = await apiRequest<ApplicationShowResponse>(`/admin/volunteer-applications/${id}`);
      setSelected(response.data.application);
      setAdminNotes(response.data.application.adminNotes || "");
    } catch (requestError) {
      setDetailError(errorMessage(requestError));
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications(status);
  }, [status]);

  useEffect(() => {
    const applicationId = Number(searchParams.get("applicationId"));
    if (applicationId) {
      void openApplication(applicationId);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const counts = useMemo(
    () => ({
      current: items.length,
    }),
    [items.length],
  );

  const reviewApplication = async (action: "approve" | "reject") => {
    if (!selected) return;
    setActionLoading(action);
    setDetailError("");
    try {
      const response = await apiRequest<ApplicationShowResponse>(`/admin/volunteer-applications/${selected.id}/${action}`, {
        method: "POST",
        body: { adminNotes },
      });
      setSelected(response.data.application);
      await loadApplications(status);
      await refreshNotifications();
      if (status === "pending" || status === "all") setDrawerOpen(false);
    } catch (requestError) {
      setDetailError(errorMessage(requestError));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={status} onValueChange={(value) => setStatus(value as ApplicationFilter)}>
          <TabsList>
            {statusOptions.map((option) => (
              <TabsTrigger key={option} value={option}>{titleCase(option)}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button variant="outline" onClick={() => void loadApplications()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <Card className="rounded-lg shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <div className="font-medium text-foreground">{status === "all" ? "All" : titleCase(status)} registration requests</div>
              <div className="text-sm text-muted-foreground">{counts.current} applications found</div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Loading requests...</TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No {status} requests found.</TableCell>
                </TableRow>
              ) : (
                items.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{application.fullName}</div>
                      <div className="text-sm text-muted-foreground">{application.email}</div>
                    </TableCell>
                    <TableCell>{application.phone}</TableCell>
                    <TableCell>{application.lga}, {application.state}</TableCell>
                    <TableCell><StatusBadge status={application.status} /></TableCell>
                    <TableCell>{formatDateTime(application.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => void openApplication(application.id)}>
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
            <SheetTitle>{selected ? selected.fullName : "Registration request"}</SheetTitle>
            <SheetDescription>
              {selected ? `${selected.email} - ${titleCase(selected.status)}` : "Loading application data."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-5 px-4">
            {detailLoading && <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">Loading application...</div>}
            {detailError && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{detailError}</div>}
            {selected && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <Badge variant="outline">{selected.requestId}</Badge>
                  <Badge variant="secondary">Submitted {formatDate(selected.createdAt)}</Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {applicationFields(selected).map((field) => (
                    <div key={field.label} className="rounded-md border bg-card p-3">
                      <div className="text-xs font-medium uppercase text-muted-foreground">{field.label}</div>
                      <div className="mt-1 whitespace-pre-wrap text-sm text-foreground">{field.value || "Not provided"}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label htmlFor="adminNotes" className="text-sm font-medium text-foreground">Admin notes</label>
                  <Textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(event) => setAdminNotes(event.target.value)}
                    placeholder="Add approval or rejection notes"
                    className="min-h-28"
                    disabled={selected.status !== "pending" || !!actionLoading}
                  />
                </div>
              </>
            )}
          </div>

          {selected?.status === "pending" && (
            <SheetFooter className="border-t">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => void reviewApplication("reject")}
                  disabled={!!actionLoading}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <XCircle className="h-4 w-4" />
                  {actionLoading === "reject" ? "Rejecting..." : "Reject"}
                </Button>
                <Button onClick={() => void reviewApplication("approve")} disabled={!!actionLoading}>
                  <CheckCircle2 className="h-4 w-4" />
                  {actionLoading === "approve" ? "Approving..." : "Approve"}
                </Button>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function StatusBadge({ status }: { status: VolunteerApplicationStatus }) {
  if (status === "approved") return <Badge className="bg-primary/10 text-primary" variant="outline">Approved</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

function applicationFields(application: VolunteerApplication) {
  return [
    { label: "Full name", value: application.fullName },
    { label: "Email", value: application.email },
    { label: "Phone", value: application.phone },
    { label: "Date of birth", value: formatDate(application.dateOfBirth) },
    { label: "Gender", value: application.gender },
    { label: "State", value: application.state },
    { label: "LGA", value: application.lga },
    { label: "Address", value: application.address },
    { label: "Education level", value: application.educationLevel },
    { label: "Occupation", value: application.occupation },
    { label: "Skills", value: application.skills },
    { label: "Volunteer experience", value: application.volunteerExperience },
    { label: "Availability", value: application.availability },
    { label: "Volunteering mode", value: application.volunteeringMode },
    { label: "Motivation", value: application.motivation },
    { label: "Emergency contact", value: application.emergencyContactName },
    { label: "Emergency phone", value: application.emergencyContactPhone },
    { label: "Reviewed at", value: application.reviewedAt ? formatDateTime(application.reviewedAt) : "Not reviewed" },
    { label: "Previous admin notes", value: application.adminNotes || "None" },
  ];
}

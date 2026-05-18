import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Archive, CheckCircle2, Edit, ExternalLink, Eye, Plus, RefreshCw, RotateCcw, Save, Search, XCircle } from "lucide-react";
import { useSearchParams } from "react-router";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import { Card, CardContent } from "@app/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@app/components/ui/dialog";
import { Input } from "@app/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@app/components/ui/table";
import { Textarea } from "@app/components/ui/textarea";
import { PageHeader } from "@components/PageHeader";
import { StatusBadge } from "@components/StatusBadge";
import { useNotifications } from "@app/context/NotificationsContext";
import { apiRequest, errorMessage } from "@services/api";
import { formatDateTime, titleCase } from "@utils/format";
import type { ManagedUser, School, SchoolStatus } from "@app/lib/types";

type SchoolListResponse = {
  success: true;
  data: {
    items: School[];
    pagination: {
      total: number;
      page: number;
      limit: number;
    };
  };
};

type SchoolShowResponse = {
  success: true;
  data: {
    school: School;
  };
};

type UserListResponse = {
  success: true;
  data: {
    items: ManagedUser[];
  };
};

type SchoolFilterStatus = "all" | SchoolStatus;
type ArchiveFilter = "active" | "archived" | "all";

type SchoolFormState = {
  submittedByUserId: string;
  schoolName: string;
  localName: string;
  schoolType: string;
  operatorName: string;
  phone: string;
  status: "draft" | "pending";
  urgency: "low" | "medium" | "high";
  state: string;
  lga: string;
  ward: string;
  community: string;
  landmark: string;
  address: string;
  latitude: string;
  longitude: string;
  needs: string;
  operators: string;
  totalChildren: string;
  boysCount: string;
  girlsCount: string;
  welfareNotes: string;
};

const statusOptions: SchoolFilterStatus[] = ["all", "draft", "pending", "approved", "rejected"];
const schoolTypes = [
  "traditional_quranic_school",
  "integrated_quranic_school",
  "informal_islamic_school",
  "non_formal_education_center",
  "community_islamic_school",
];
const urgencyOptions = ["", "low", "medium", "high"];

const emptyForm: SchoolFormState = {
  submittedByUserId: "",
  schoolName: "",
  localName: "",
  schoolType: "traditional_quranic_school",
  operatorName: "",
  phone: "",
  status: "draft",
  urgency: "low",
  state: "",
  lga: "",
  ward: "",
  community: "",
  landmark: "",
  address: "",
  latitude: "",
  longitude: "",
  needs: "",
  operators: "",
  totalChildren: "",
  boysCount: "",
  girlsCount: "",
  welfareNotes: "",
};

export function SchoolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [schools, setSchools] = useState<School[]>([]);
  const [volunteers, setVolunteers] = useState<ManagedUser[]>([]);
  const [selected, setSelected] = useState<School | null>(null);
  const [status, setStatus] = useState<SchoolFilterStatus>((searchParams.get("status") as SchoolFilterStatus) || "all");
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>(archiveFilterFromParam(searchParams.get("archived")));
  const [submittedByUserId, setSubmittedByUserId] = useState(searchParams.get("submitted_by_user_id") || "");
  const [schoolType, setSchoolType] = useState(searchParams.get("school_type") || "");
  const [urgency, setUrgency] = useState(searchParams.get("urgency") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [lga, setLga] = useState(searchParams.get("lga") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<SchoolFormState>(emptyForm);
  const [reviewComment, setReviewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const { refreshNotifications } = useNotifications();

  const loadVolunteers = async () => {
    try {
      const response = await apiRequest<UserListResponse>("/admin/users?role=volunteer&status=active&page=1&limit=100");
      setVolunteers(response.data.items.filter((user) => user.role === "volunteer"));
    } catch {
      setVolunteers([]);
    }
  };

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ page: "1", limit: "50" });
    if (status !== "all") params.set("status", status);
    if (archiveFilter === "archived") params.set("archived", "true");
    if (archiveFilter === "all") params.set("archived", "all");
    if (submittedByUserId) params.set("submitted_by_user_id", submittedByUserId);
    if (schoolType) params.set("school_type", schoolType);
    if (urgency) params.set("urgency", urgency);
    if (state) params.set("state", state);
    if (lga) params.set("lga", lga);
    if (search) params.set("search", search);
    return params.toString();
  }, [archiveFilter, lga, schoolType, search, state, status, submittedByUserId, urgency]);

  const loadSchools = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest<SchoolListResponse>(`/admin/schools?${queryString}`);
      setSchools(response.data.items);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const openSchool = async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError("");
    setSelected(null);
    setReviewComment("");
    try {
      const response = await apiRequest<SchoolShowResponse>(`/admin/schools/${id}`);
      setSelected(response.data.school);
      setReviewComment(response.data.school.admin_feedback || "");
    } catch (requestError) {
      setDetailError(errorMessage(requestError));
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void loadVolunteers();
  }, []);

  useEffect(() => {
    void loadSchools();
  }, [queryString]);

  useEffect(() => {
    const schoolId = Number(searchParams.get("schoolId"));
    if (schoolId) {
      void openSchool(schoolId);
      const next = new URLSearchParams(searchParams);
      next.delete("schoolId");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const applyFilters = () => {
    const next = new URLSearchParams(queryString);
    next.delete("page");
    next.delete("limit");
    setSearchParams(next, { replace: true });
    void loadSchools();
  };

  const resetFilters = () => {
    setStatus("all");
    setArchiveFilter("active");
    setSubmittedByUserId("");
    setSchoolType("");
    setUrgency("");
    setState("");
    setLga("");
    setSearch("");
    setSearchParams({}, { replace: true });
  };

  const startCreate = () => {
    setForm(emptyForm);
    setCreateOpen(true);
    setDetailError("");
  };

  const startEdit = () => {
    if (!selected) return;
    setForm(formFromSchool(selected));
    setEditOpen(true);
    setDetailError("");
  };

  const saveCreate = async () => {
    if (!form.submittedByUserId) {
      setError("Select the volunteer who submitted or owns this school.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiRequest<SchoolShowResponse>("/admin/schools", {
        method: "POST",
        body: bodyFromForm(form, true),
      });
      setCreateOpen(false);
      await loadSchools();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!selected) return;
    setSaving(true);
    setDetailError("");
    try {
      const response = await apiRequest<SchoolShowResponse>(`/admin/schools/${selected.id}`, {
        method: "PATCH",
        body: bodyFromForm(form, false),
      });
      setSelected(response.data.school);
      setEditOpen(false);
      await loadSchools();
    } catch (requestError) {
      setDetailError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const reviewSchool = async (action: "approve" | "reject") => {
    if (!selected) return;
    setActionLoading(action);
    setDetailError("");
    try {
      const response = await apiRequest<SchoolShowResponse>(`/admin/schools/${selected.id}/${action}`, {
        method: "POST",
        body: { comment: reviewComment },
      });
      setSelected(response.data.school);
      await loadSchools();
      await refreshNotifications();
    } catch (requestError) {
      setDetailError(errorMessage(requestError));
    } finally {
      setActionLoading("");
    }
  };

  const archiveOrRestore = async (action: "archive" | "restore") => {
    if (!selected) return;
    const label = action === "archive" ? "archive" : "restore";
    if (!window.confirm(`Are you sure you want to ${label} this school?`)) return;
    setActionLoading(action);
    setDetailError("");
    try {
      const response = await apiRequest<SchoolShowResponse>(
        action === "archive" ? `/admin/schools/${selected.id}` : `/admin/schools/${selected.id}/restore`,
        { method: action === "archive" ? "DELETE" : "POST", body: action === "restore" ? {} : undefined },
      );
      setSelected(response.data.school);
      await loadSchools();
    } catch (requestError) {
      setDetailError(errorMessage(requestError));
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schools"
        description="Review submitted schools and manage school records."
        action={
          <>
          <Button variant="outline" onClick={() => void loadSchools()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4" />
            Add school
          </Button>
          </>
        }
      />

      <Card className="rounded-2xl shadow-lg">
        <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField label="Status" value={status} onChange={(value) => setStatus(value as SchoolFilterStatus)}>
            {statusOptions.map((option) => <option key={option} value={option}>{titleCase(option)}</option>)}
          </SelectField>
          <SelectField label="Archive" value={archiveFilter} onChange={(value) => setArchiveFilter(value as ArchiveFilter)}>
            <option value="active">Active records</option>
            <option value="archived">Archived records</option>
            <option value="all">All records</option>
          </SelectField>
          <SelectField label="Volunteer" value={submittedByUserId} onChange={setSubmittedByUserId}>
            <option value="">All volunteers</option>
            {volunteers.map((user) => <option key={user.id} value={user.id}>{user.name} - {user.email}</option>)}
          </SelectField>
          <SelectField label="School type" value={schoolType} onChange={setSchoolType}>
            <option value="">All types</option>
            {schoolTypes.map((option) => <option key={option} value={option}>{readable(option)}</option>)}
          </SelectField>
          <SelectField label="Urgency" value={urgency} onChange={setUrgency}>
            {urgencyOptions.map((option) => <option key={option || "all"} value={option}>{option ? titleCase(option) : "All urgency"}</option>)}
          </SelectField>
          <LabeledInput label="State" value={state} onChange={setState} />
          <LabeledInput label="LGA" value={lga} onChange={setLga} />
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-muted-foreground">Search</label>
            <div className="flex gap-2">
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="School name" />
              <Button variant="outline" size="icon" onClick={applyFilters}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-4">
            <Button variant="outline" onClick={applyFilters}>Apply filters</Button>
            <Button variant="ghost" onClick={resetFilters}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <Card className="rounded-2xl shadow-lg">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <div className="font-medium text-foreground">School records</div>
              <div className="text-sm text-muted-foreground">{schools.length} schools loaded</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Loading schools...</TableCell></TableRow>
                ) : schools.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No schools found.</TableCell></TableRow>
                ) : (
                  schools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{school.school_name || `School #${school.id}`}</div>
                        <div className="text-sm text-muted-foreground">{school.unique_site_id || readable(school.school_type || "")}</div>
                      </TableCell>
                      <TableCell>
                        <div>{school.submitted_by?.name || `User #${school.submitted_by_user_id}`}</div>
                        <div className="text-sm text-muted-foreground">{school.submitted_by?.email}</div>
                      </TableCell>
                      <TableCell>{[school.location?.lga, school.location?.state].filter(Boolean).join(", ") || "Not set"}</TableCell>
                      <TableCell><SchoolStatusBadge status={school.status} archived={!!school.archived_at} /></TableCell>
                      <TableCell>{school.urgency ? titleCase(school.urgency) : "Not set"}</TableCell>
                      <TableCell>{school.submitted_at ? formatDateTime(school.submitted_at) : formatDateTime(school.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => void openSchool(school.id)}>
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{selected?.school_name || "School details"}</DialogTitle>
            <DialogDescription>{selected ? `${selected.submitted_by?.name || `User #${selected.submitted_by_user_id}`} - ${titleCase(selected.status)}` : "Loading school record."}</DialogDescription>
          </DialogHeader>
          {detailLoading && <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">Loading school...</div>}
          {detailError && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{detailError}</div>}
          {selected && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <SchoolStatusBadge status={selected.status} archived={!!selected.archived_at} />
                <Badge variant="outline">{selected.unique_site_id || `ID ${selected.id}`}</Badge>
                <Badge variant="secondary">{selected.urgency ? `${titleCase(selected.urgency)} urgency` : "No urgency"}</Badge>
              </div>

              <MediaGallery school={selected} />

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {detailFields(selected).map((field) => <DetailField key={field.label} label={field.label} value={field.value} />)}
                <MapLinkField school={selected} />
              </div>

              <Section title="Operators">
                <div className="grid gap-3 md:grid-cols-2">
                  {(selected.operators || []).length === 0 ? <EmptyDetail label="No operators added." /> : selected.operators?.map((operator) => (
                    <DetailField key={operator.id} label={operator.name || "Operator"} value={operator.phone || "No phone"} />
                  ))}
                </div>
              </Section>

              <Section title="Children and welfare">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {statsFields(selected).map((field) => <DetailField key={field.label} label={field.label} value={field.value} />)}
                </div>
              </Section>

              <Section title="Review history">
                <div className="space-y-2">
                  {(selected.reviews || []).length === 0 ? <EmptyDetail label="No reviews recorded." /> : selected.reviews?.map((review) => (
                    <div key={review.id} className="rounded-2xl border bg-card p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <SchoolStatusBadge status={review.status as SchoolStatus} />
                        <span className="text-xs text-muted-foreground">{formatDateTime(review.created_at)}</span>
                      </div>
                      <div className="mt-2 whitespace-pre-wrap text-sm">{review.comment || "No comment"}</div>
                    </div>
                  ))}
                </div>
              </Section>

              {selected.status === "pending" && !selected.archived_at && (
                <div className="space-y-2 border-t pt-4">
                  <label className="text-sm font-medium text-foreground">Review comment</label>
                  <Textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} className="min-h-24" />
                </div>
              )}
            </div>
          )}
          {selected && (
            <DialogFooter>
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                <Button variant="outline" onClick={startEdit} disabled={!!actionLoading}>
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                {selected.archived_at ? (
                  <Button variant="outline" onClick={() => void archiveOrRestore("restore")} disabled={!!actionLoading}>
                    <RotateCcw className="h-4 w-4" />
                    {actionLoading === "restore" ? "Restoring..." : "Restore"}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => void archiveOrRestore("archive")} disabled={!!actionLoading}>
                    <Archive className="h-4 w-4" />
                    {actionLoading === "archive" ? "Archiving..." : "Archive"}
                  </Button>
                )}
                {selected.status === "pending" && !selected.archived_at && (
                  <>
                    <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => void reviewSchool("reject")} disabled={!!actionLoading}>
                      <XCircle className="h-4 w-4" />
                      {actionLoading === "reject" ? "Rejecting..." : "Reject"}
                    </Button>
                    <Button onClick={() => void reviewSchool("approve")} disabled={!!actionLoading}>
                      <CheckCircle2 className="h-4 w-4" />
                      {actionLoading === "approve" ? "Approving..." : "Approve"}
                    </Button>
                  </>
                )}
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <SchoolEditorDialog
        title="Add school"
        description="Create a school record tied to a volunteer."
        open={createOpen}
        onOpenChange={setCreateOpen}
        form={form}
        setForm={setForm}
        volunteers={volunteers}
        saving={saving}
        create
        onSave={() => void saveCreate()}
      />

      <SchoolEditorDialog
        title="Edit school"
        description="Update school details without changing review status."
        open={editOpen}
        onOpenChange={setEditOpen}
        form={form}
        setForm={setForm}
        volunteers={volunteers}
        saving={saving}
        onSave={() => void saveEdit()}
      />
    </div>
  );
}

function SchoolEditorDialog({
  title,
  description,
  open,
  onOpenChange,
  form,
  setForm,
  volunteers,
  saving,
  create = false,
  onSave,
}: {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: SchoolFormState;
  setForm: (form: SchoolFormState) => void;
  volunteers: ManagedUser[];
  saving: boolean;
  create?: boolean;
  onSave: () => void;
}) {
  const update = (key: keyof SchoolFormState, value: string) => setForm({ ...form, [key]: value });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          {create && (
            <SelectField label="Volunteer" value={form.submittedByUserId} onChange={(value) => update("submittedByUserId", value)}>
              <option value="">Select volunteer</option>
              {volunteers.map((user) => <option key={user.id} value={user.id}>{user.name} - {user.email}</option>)}
            </SelectField>
          )}
          {create && (
            <SelectField label="Initial status" value={form.status} onChange={(value) => update("status", value)}>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
            </SelectField>
          )}
          <LabeledInput label="School name" value={form.schoolName} onChange={(value) => update("schoolName", value)} />
          <LabeledInput label="Local name" value={form.localName} onChange={(value) => update("localName", value)} />
          <SelectField label="School type" value={form.schoolType} onChange={(value) => update("schoolType", value)}>
            {schoolTypes.map((option) => <option key={option} value={option}>{readable(option)}</option>)}
          </SelectField>
          <SelectField label="Urgency" value={form.urgency} onChange={(value) => update("urgency", value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </SelectField>
          <LabeledInput label="Operator name" value={form.operatorName} onChange={(value) => update("operatorName", value)} />
          <LabeledInput label="Phone" value={form.phone} onChange={(value) => update("phone", value)} />
          <LabeledInput label="State" value={form.state} onChange={(value) => update("state", value)} />
          <LabeledInput label="LGA" value={form.lga} onChange={(value) => update("lga", value)} />
          <LabeledInput label="Ward" value={form.ward} onChange={(value) => update("ward", value)} />
          <LabeledInput label="Community" value={form.community} onChange={(value) => update("community", value)} />
          <LabeledInput label="Latitude" value={form.latitude} onChange={(value) => update("latitude", value)} />
          <LabeledInput label="Longitude" value={form.longitude} onChange={(value) => update("longitude", value)} />
          <div className="md:col-span-2">
            <LabeledInput label="Landmark" value={form.landmark} onChange={(value) => update("landmark", value)} />
          </div>
          <div className="md:col-span-2">
            <LabeledInput label="Address" value={form.address} onChange={(value) => update("address", value)} />
          </div>
          <LabeledInput label="Needs" value={form.needs} onChange={(value) => update("needs", value)} placeholder="feeding, waterAccess" />
          <LabeledInput label="Total children" value={form.totalChildren} onChange={(value) => update("totalChildren", value)} />
          <LabeledInput label="Boys" value={form.boysCount} onChange={(value) => update("boysCount", value)} />
          <LabeledInput label="Girls" value={form.girlsCount} onChange={(value) => update("girlsCount", value)} />
          <div className="md:col-span-2">
            <label className="text-xs font-medium uppercase text-muted-foreground">Operators</label>
            <Textarea value={form.operators} onChange={(event) => update("operators", event.target.value)} placeholder="Name | phone, one per line" className="mt-1 min-h-24" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium uppercase text-muted-foreground">Welfare notes</label>
            <Textarea value={form.welfareNotes} onChange={(event) => update("welfareNotes", event.target.value)} className="mt-1 min-h-24" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MediaGallery({ school }: { school: School }) {
  const media = school.photos || [];
  if (media.length === 0) return <EmptyDetail label="No photos or videos added." />;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {media.map((item) => (
        <div key={item.id} className="overflow-hidden rounded-lg border bg-card">
          {item.media_kind === "video" ? (
            <video controls className="aspect-video w-full bg-black object-contain" src={item.file_url} />
          ) : (
            <img className="aspect-video w-full bg-muted object-cover" src={item.file_url} alt={item.caption || item.category || "School media"} />
          )}
          <div className="space-y-1 p-3 text-sm">
            <div className="font-medium text-foreground">{readable(item.category || item.media_kind)}</div>
            <div className="text-muted-foreground">{item.caption || item.mime_type || item.file_url}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SchoolStatusBadge({ status, archived = false }: { status: SchoolStatus | string; archived?: boolean }) {
  return <StatusBadge status={archived ? "archived" : status} />;
}

function archiveFilterFromParam(value: string | null): ArchiveFilter {
  if (value === "true" || value === "archived") return "archived";
  if (value === "all") return "all";
  return "active";
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium uppercase text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-input bg-input-background focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-[3px]"
      >
        {children}
      </select>
    </div>
  );
}

function LabeledInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium uppercase text-muted-foreground">{label}</label>
      <Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-2xl border bg-card p-3">
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm text-foreground">{formatValue(value)}</div>
    </div>
  );
}

function MapLinkField({ school }: { school: School }) {
  const coordinates = coordinatePair(school);
  if (!coordinates) return null;
  const [latitude, longitude] = coordinates;
  const label = `${latitude}, ${longitude}`;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;

  return (
    <div className="rounded-2xl border bg-card p-3">
      <div className="text-xs font-medium uppercase text-muted-foreground">Coordinates</div>
      <div className="mt-1 text-sm text-foreground">{label}</div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        Open in Google Maps
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function EmptyDetail({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">{label}</div>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3 border-t pt-4">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function detailFields(school: School) {
  return [
    { label: "School name", value: school.school_name },
    { label: "Local name", value: school.local_name },
    { label: "Type", value: readable(school.school_type || "") },
    { label: "Operator", value: school.operator_name },
    { label: "Phone", value: school.phone },
    { label: "Submitter", value: `${school.submitted_by?.name || `User #${school.submitted_by_user_id}`}\n${school.submitted_by?.email || ""}` },
    { label: "Location", value: [school.location?.community, school.location?.lga, school.location?.state].filter(Boolean).join(", ") },
    { label: "Address", value: school.location?.address || school.location?.landmark },
    { label: "Needs", value: school.needs?.length ? school.needs.map(readable).join(", ") : null },
    { label: "Admin feedback", value: school.admin_feedback },
    { label: "Reviewed", value: school.reviewed_at ? formatDateTime(school.reviewed_at) : "Not reviewed" },
    { label: "Archived", value: school.archived_at ? formatDateTime(school.archived_at) : "No" },
  ];
}

function coordinatePair(school: School) {
  const rawLatitude = school.location?.latitude;
  const rawLongitude = school.location?.longitude;
  if (rawLatitude === null || rawLatitude === undefined || rawLatitude === "") return null;
  if (rawLongitude === null || rawLongitude === undefined || rawLongitude === "") return null;
  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return [String(rawLatitude), String(rawLongitude)] as const;
}

function statsFields(school: School) {
  const stats = school.children_stats;
  const welfare = school.welfare || {};
  return [
    { label: "Total children", value: stats?.total_children },
    { label: "Boys", value: stats?.boys_count },
    { label: "Girls", value: stats?.girls_count },
    { label: "Residential", value: stats?.residential_children },
    { label: "Non-residential", value: stats?.non_residential_children },
    { label: "Clean water", value: yesNo(welfare.has_clean_water as boolean | null | undefined) },
    { label: "Sanitation", value: yesNo(welfare.has_sanitation as boolean | null | undefined) },
    { label: "Healthcare", value: yesNo(welfare.has_healthcare as boolean | null | undefined) },
    { label: "Welfare notes", value: welfare.additional_notes as string | null | undefined },
  ];
}

function formFromSchool(school: School): SchoolFormState {
  return {
    ...emptyForm,
    submittedByUserId: String(school.submitted_by_user_id),
    schoolName: school.school_name || "",
    localName: school.local_name || "",
    schoolType: school.school_type || "traditional_quranic_school",
    operatorName: school.operator_name || "",
    phone: school.phone || "",
    urgency: (school.urgency as SchoolFormState["urgency"]) || "low",
    state: school.location?.state || "",
    lga: school.location?.lga || "",
    ward: school.location?.ward || "",
    community: school.location?.community || "",
    landmark: school.location?.landmark || "",
    address: school.location?.address || "",
    latitude: school.location?.latitude == null ? "" : String(school.location.latitude),
    longitude: school.location?.longitude == null ? "" : String(school.location.longitude),
    needs: (school.needs || []).join(", "),
    operators: (school.operators || []).map((operator) => [operator.name || "", operator.phone || ""].filter(Boolean).join(" | ")).join("\n"),
    totalChildren: school.children_stats?.total_children == null ? "" : String(school.children_stats.total_children),
    boysCount: school.children_stats?.boys_count == null ? "" : String(school.children_stats.boys_count),
    girlsCount: school.children_stats?.girls_count == null ? "" : String(school.children_stats.girls_count),
    welfareNotes: (school.welfare?.additional_notes as string | null) || "",
  };
}

function bodyFromForm(form: SchoolFormState, create: boolean) {
  const body: Record<string, unknown> = {
    school: {
      school_name: form.schoolName,
      local_name: form.localName,
      school_type: form.schoolType,
      operator_name: form.operatorName,
      phone: form.phone,
      urgency: form.urgency,
      needs: splitCsv(form.needs),
    },
    location: {
      state: form.state,
      lga: form.lga,
      ward: form.ward,
      community: form.community,
      landmark: form.landmark,
      address: form.address,
      latitude: numberOrNull(form.latitude),
      longitude: numberOrNull(form.longitude),
    },
    operators: parseOperators(form.operators),
    children_stats: {
      total_children: numberOrNull(form.totalChildren),
      boys_count: numberOrNull(form.boysCount),
      girls_count: numberOrNull(form.girlsCount),
    },
    welfare: {
      additional_notes: form.welfareNotes,
      notes: form.welfareNotes,
    },
  };
  if (create) {
    body.submitted_by_user_id = Number(form.submittedByUserId);
    body.status = form.status;
  }
  return body;
}

function parseOperators(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, phone] = line.split("|").map((part) => part.trim());
      return { name, phone: phone || "" };
    });
}

function splitCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function numberOrNull(value: string) {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function readable(value: string) {
  return value ? titleCase(value.replace(/_/g, " ")) : "Not set";
}

function yesNo(value: boolean | null | undefined) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return null;
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Not available";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not available";
  return String(value);
}

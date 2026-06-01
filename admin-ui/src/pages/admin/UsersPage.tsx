import { useEffect, useState } from "react";
import { Eye, PauseCircle, PlayCircle, RefreshCw, School } from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import { Card, CardContent } from "@app/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@app/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@app/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@app/components/ui/tabs";
import { PageHeader } from "@components/PageHeader";
import { StatusBadge } from "@components/StatusBadge";
import { useAppSelector } from "@store/hooks";
import { apiRequest, errorMessage } from "@services/api";
import { formatDateTime, titleCase } from "@utils/format";
import type { ManagedUser, VolunteerSummary } from "@app/lib/types";

const PRIMARY_SUPER_ADMIN_EMAIL = (import.meta.env.VITE_SUPER_ADMIN_EMAIL || "admin@schoolsupportatlas.local").toLowerCase();
const SUPER_ADMIN_PROTECTED_MESSAGE = "The primary super admin account cannot be made inactive or deleted.";
type UserStatusFilter = "active" | "inactive";

type UserListResponse = {
  success: true;
  data: {
    items: ManagedUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
    };
  };
};

type UserStatusResponse = {
  success: true;
  data: {
    user: ManagedUser;
  };
};

type VolunteerSummaryResponse = {
  success: true;
  data: VolunteerSummary;
};

export function UsersPage() {
  const currentAdmin = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [volunteerSummary, setVolunteerSummary] = useState<VolunteerSummary | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("active");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest<UserListResponse>(`/admin/users?status=${statusFilter}&page=1&limit=100`);
      setUsers(response.data.items);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [statusFilter]);

  const openUser = async (user: ManagedUser) => {
    setSelectedUser(user);
    setVolunteerSummary(null);
    setDetailError("");
    setDrawerOpen(true);

    if (user.role !== "volunteer") return;

    setDetailLoading(true);
    try {
      const response = await apiRequest<VolunteerSummaryResponse>(`/admin/volunteers/${user.id}`);
      setVolunteerSummary(response.data);
    } catch (requestError) {
      setDetailError(errorMessage(requestError));
    } finally {
      setDetailLoading(false);
    }
  };

  const isProtectedUser = (target: ManagedUser) => (
    target.email.toLowerCase() === PRIMARY_SUPER_ADMIN_EMAIL || target.id === currentAdmin?.id
  );

  const updateVolunteerStatus = async (target: ManagedUser, nextStatus: UserStatusFilter) => {
    if (target.role !== "volunteer") return;
    if (nextStatus === "inactive" && isProtectedUser(target)) {
      setError(SUPER_ADMIN_PROTECTED_MESSAGE);
      return;
    }

    const userId = target.id;
    setActionLoading(userId);
    setError("");
    try {
      const response = await apiRequest<UserStatusResponse>(`/admin/users/${userId}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      setUsers((current) => current.filter((user) => user.id !== userId));
      setSelectedUser(response.data.user);
      if (selectedUser?.id === userId) setDrawerOpen(false);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active users"
        description="Manage active and paused volunteers without deleting their records."
        action={
          <Button variant="outline" onClick={() => void loadUsers()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as UserStatusFilter)}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Paused</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="rounded-2xl shadow-lg">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <div className="font-medium text-foreground">{statusFilter === "active" ? "Active users" : "Paused users"}</div>
              <div className="text-sm text-muted-foreground">{users.length} users found</div>
            </div>
          </div>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Loading users...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No {statusFilter === "active" ? "active" : "paused"} users found.</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <button className="text-left" onClick={() => void openUser(user)}>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </button>
                    </TableCell>
                    <TableCell><Badge variant="outline">{titleCase(user.role)}</Badge></TableCell>
                    <TableCell><StatusBadge status={user.status} /></TableCell>
                    <TableCell>{user.created_at ? formatDateTime(user.created_at) : "Not available"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => void openUser(user)}>
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <VolunteerStatusButton
                          user={user}
                          loading={actionLoading === user.id}
                          onChange={(nextStatus) => void updateVolunteerStatus(user, nextStatus)}
                        />
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

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{selectedUser?.name || "User profile"}</SheetTitle>
            <SheetDescription>{selectedUser ? `${selectedUser.email} - ${titleCase(selectedUser.role)}` : "User detail"}</SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4">
            {detailError && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{detailError}</div>}
            {selectedUser && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ProfileField label="Name" value={selectedUser.name} />
                  <ProfileField label="Email" value={selectedUser.email} />
                  <ProfileField label="Username" value={selectedUser.username || "Not set"} />
                  <ProfileField label="Role" value={titleCase(selectedUser.role)} />
                  <ProfileField label="Status" value={titleCase(selectedUser.status)} />
                  <ProfileField label="Created" value={selectedUser.created_at ? formatDateTime(selectedUser.created_at) : "Not available"} />
                </div>

                {selectedUser.role === "volunteer" && (
                  <>
                    <div className="border-t pt-4">
                      <h3 className="text-base font-semibold text-foreground">Volunteer profile</h3>
                      <p className="text-sm text-muted-foreground">Registration/profile information stored for this volunteer.</p>
                    </div>
                    {detailLoading ? (
                      <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">Loading volunteer profile...</div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {volunteerFields(volunteerSummary).map((field) => (
                          <ProfileField key={field.label} label={field.label} value={field.value} />
                        ))}
                      </div>
                    )}
                  </>
                )}

                <div className="border-t pt-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.role === "volunteer" && (
                      <Button variant="outline" onClick={() => navigate(`/schools?submitted_by_user_id=${selectedUser.id}`)}>
                        <School className="h-4 w-4" />
                        View schools
                      </Button>
                    )}
                    {selectedUser.role === "volunteer" && (
                      <Button
                        variant="outline"
                        className={selectedUser.status === "active" ? "border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive" : ""}
                        onClick={() => void updateVolunteerStatus(selectedUser, selectedUser.status === "active" ? "inactive" : "active")}
                        disabled={actionLoading === selectedUser.id}
                      >
                        {selectedUser.status === "active" ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                        {actionLoading === selectedUser.id
                          ? selectedUser.status === "active" ? "Pausing..." : "Reactivating..."
                          : selectedUser.status === "active" ? "Pause volunteer" : "Reactivate volunteer"}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-2xl border bg-card p-3">
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm text-foreground">{value || "Not available"}</div>
    </div>
  );
}

function VolunteerStatusButton({
  user,
  loading,
  onChange,
}: {
  user: ManagedUser;
  loading: boolean;
  onChange: (nextStatus: UserStatusFilter) => void;
}) {
  if (user.role !== "volunteer") return null;

  if (user.status === "inactive") {
    return (
      <Button variant="outline" size="sm" onClick={() => onChange("active")} disabled={loading}>
        <PlayCircle className="h-4 w-4" />
        {loading ? "Reactivating..." : "Reactivate volunteer"}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={() => onChange("inactive")}
      disabled={loading}
    >
      <PauseCircle className="h-4 w-4" />
      {loading ? "Pausing..." : "Pause volunteer"}
    </Button>
  );
}

function volunteerFields(summary: VolunteerSummary | null) {
  const profile = summary?.volunteer.profile;
  return [
    { label: "Full name", value: profile?.full_name },
    { label: "Phone", value: profile?.phone },
    { label: "State", value: profile?.state },
    { label: "LGA", value: profile?.lga },
    { label: "Ward", value: profile?.ward },
    { label: "Community", value: profile?.community },
    { label: "Address", value: profile?.address },
    { label: "Bio", value: profile?.bio },
    { label: "Date of birth", value: profile?.date_of_birth },
    { label: "Gender", value: profile?.gender },
    { label: "Education", value: profile?.education_level },
    { label: "Occupation", value: profile?.occupation },
    { label: "Skills", value: profile?.skills },
    { label: "Experience", value: profile?.volunteer_experience },
    { label: "Availability", value: profile?.availability },
    { label: "Mode", value: profile?.volunteering_mode },
    { label: "Motivation", value: profile?.motivation },
    { label: "Emergency contact", value: profile?.emergency_contact_name },
    { label: "Emergency phone", value: profile?.emergency_contact_phone },
    { label: "Profile complete", value: profile ? (profile.is_completed ? "Yes" : "No") : null },
  ];
}

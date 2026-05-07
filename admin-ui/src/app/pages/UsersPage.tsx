import { useEffect, useState } from "react";
import { Eye, RefreshCw, UserX } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useAuth } from "../context/AuthContext";
import { apiRequest, errorMessage } from "../lib/api";
import { formatDateTime, titleCase } from "../lib/format";
import type { ManagedUser, VolunteerSummary } from "../lib/types";

const PRIMARY_SUPER_ADMIN_EMAIL = (import.meta.env.VITE_SUPER_ADMIN_EMAIL || "admin@schoolsupportatlas.local").toLowerCase();
const SUPER_ADMIN_PROTECTED_MESSAGE = "The primary super admin account cannot be made inactive or deleted.";

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
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [volunteerSummary, setVolunteerSummary] = useState<VolunteerSummary | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest<UserListResponse>("/admin/users?status=active&page=1&limit=100");
      setUsers(response.data.items);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

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

  const deactivateUser = async (target: ManagedUser) => {
    if (isProtectedUser(target)) {
      setError(SUPER_ADMIN_PROTECTED_MESSAGE);
      return;
    }

    const userId = target.id;
    setActionLoading(userId);
    setError("");
    try {
      await apiRequest<UserStatusResponse>(`/admin/users/${userId}/status`, {
        method: "PATCH",
        body: { status: "inactive" },
      });
      setUsers((current) => current.filter((user) => user.id !== userId));
      if (selectedUser?.id === userId) setDrawerOpen(false);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Active users</h2>
          <p className="text-sm text-muted-foreground">Manage active admins, volunteers, and helpers.</p>
        </div>
        <Button variant="outline" onClick={() => void loadUsers()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <Card className="rounded-lg shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <div className="font-medium text-foreground">All active users</div>
              <div className="text-sm text-muted-foreground">{users.length} users found</div>
            </div>
          </div>
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
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No active users found.</TableCell>
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
                    <TableCell><Badge className="bg-primary/10 text-primary" variant="outline">Active</Badge></TableCell>
                    <TableCell>{user.created_at ? formatDateTime(user.created_at) : "Not available"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => void openUser(user)}>
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => void deactivateUser(user)}
                          disabled={actionLoading === user.id || isProtectedUser(user)}
                          title={isProtectedUser(user) ? SUPER_ADMIN_PROTECTED_MESSAGE : "Deactivate user"}
                        >
                          <UserX className="h-4 w-4" />
                          {isProtectedUser(user) ? "Protected" : actionLoading === user.id ? "Deactivating..." : "Deactivate"}
                        </Button>
                      </div>
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
            <SheetTitle>{selectedUser?.name || "User profile"}</SheetTitle>
            <SheetDescription>{selectedUser ? `${selectedUser.email} - ${titleCase(selectedUser.role)}` : "User detail"}</SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4">
            {detailError && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{detailError}</div>}
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
                      <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">Loading volunteer profile...</div>
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
                  <Button
                    variant="outline"
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => void deactivateUser(selectedUser)}
                    disabled={actionLoading === selectedUser.id || isProtectedUser(selectedUser)}
                    title={isProtectedUser(selectedUser) ? SUPER_ADMIN_PROTECTED_MESSAGE : "Deactivate user"}
                  >
                    <UserX className="h-4 w-4" />
                    {isProtectedUser(selectedUser) ? "Protected account" : actionLoading === selectedUser.id ? "Deactivating..." : "Deactivate user"}
                  </Button>
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
    <div className="rounded-md border bg-card p-3">
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm text-foreground">{value || "Not available"}</div>
    </div>
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

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  username: string | null;
  role: "admin";
  status: "active" | "inactive";
  permissions: string[];
};

export type UserRole = "admin" | "volunteer" | "helper";

export type ManagedUser = {
  id: number;
  name: string;
  email: string;
  username: string | null;
  role: UserRole;
  status: "active" | "inactive";
  created_at?: string;
};

export type VolunteerProfile = {
  id: number;
  user_id: number;
  full_name: string | null;
  phone: string | null;
  profile_photo_url: string | null;
  state: string | null;
  lga: string | null;
  ward: string | null;
  community: string | null;
  address: string | null;
  bio: string | null;
  date_of_birth: string | null;
  gender: string | null;
  education_level: string | null;
  occupation: string | null;
  skills: string | null;
  volunteer_experience: string | null;
  availability: string | null;
  volunteering_mode: string | null;
  motivation: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type VolunteerSummary = {
  volunteer: ManagedUser & {
    profile: VolunteerProfile | null;
  };
  stats: Record<string, number>;
};

export type NotificationStatus = "unread" | "read" | "resolved";

export type AdminNotification = {
  id: number;
  actor_user_id: number | null;
  school_id: number | null;
  type: "volunteer_application_received" | "school_submitted" | "manual" | string;
  title: string;
  message: string;
  status: NotificationStatus;
  read_at: string | null;
  resolved_at: string | null;
  metadata: {
    applicationId?: number;
    requestId?: string;
    email?: string;
    [key: string]: unknown;
  } | null;
  created_at: string;
};

export type VolunteerApplicationStatus = "pending" | "approved" | "rejected";

export type VolunteerApplication = {
  id: number;
  requestId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  state: string;
  lga: string;
  address: string;
  educationLevel: string;
  occupation: string;
  skills: string;
  volunteerExperience: string;
  availability: string;
  volunteeringMode: string;
  motivation: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  status: VolunteerApplicationStatus;
  reviewedByUserId: number | null;
  reviewedAt: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  pending_reviews: number;
  approved_schools: number;
  rejected_schools: number;
  total_volunteers: number;
  completed_volunteer_profiles: number;
  unread_notifications: number;
};

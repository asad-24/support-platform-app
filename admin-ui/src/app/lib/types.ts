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

export type SchoolStatus = "draft" | "pending" | "approved" | "rejected";

export type SchoolLocation = {
  id: number;
  school_id: number;
  latitude: number | string | null;
  longitude: number | string | null;
  country: string | null;
  state: string | null;
  lga: string | null;
  ward?: string | null;
  community: string | null;
  landmark?: string | null;
  address: string | null;
};

export type SchoolOperator = {
  id: number;
  school_id: number;
  name: string | null;
  phone: string | null;
};

export type SchoolPhoto = {
  id: number;
  school_id: number;
  uploaded_by_user_id: number;
  client_id?: string | null;
  file_url: string;
  local_path: string | null;
  media_kind: "image" | "video" | string;
  mime_type: string | null;
  size: number | null;
  category: string;
  caption: string | null;
  captured_at?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  created_at: string;
};

export type SchoolChildrenStats = {
  id: number;
  school_id: number;
  total_children: number | null;
  residential_children: number | null;
  non_residential_children: number | null;
  boys_count: number | null;
  girls_count: number | null;
  age_3_5_count: number | null;
  age_6_10_count: number | null;
  age_11_15_count: number | null;
  age_16_18_count: number | null;
  age_18_plus_count: number | null;
  age_0_to_5?: number | null;
  age_6_to_9?: number | null;
  age_10_to_14?: number | null;
  age_15_plus?: number | null;
  age_groups?: unknown[] | null;
  notes?: string | null;
};

export type SchoolWelfare = {
  id: number;
  school_id: number;
  has_clean_water: boolean | null;
  has_sanitation: boolean | null;
  has_healthcare: boolean | null;
  has_nutritious_food: boolean | null;
  has_educational_materials: boolean | null;
  has_recreational_facilities: boolean | null;
  has_clothing_shelter: boolean | null;
  has_sleeping_area: boolean | null;
  has_electricity: boolean | null;
  has_internet: boolean | null;
  has_transportation: boolean | null;
  has_financial_resources: boolean | null;
  safety_physical_abuse: boolean | null;
  safety_child_labor: boolean | null;
  safety_sexual_abuse: boolean | null;
  safety_trafficking: boolean | null;
  additional_notes: string | null;
  [key: string]: unknown;
};

export type SchoolReview = {
  id: number;
  school_id: number;
  reviewed_by_user_id: number;
  status: "approved" | "rejected" | string;
  comment: string | null;
  created_at: string;
};

export type School = {
  id: number;
  submitted_by_user_id: number;
  approved_by_user_id: number | null;
  unique_site_id: string | null;
  school_name: string | null;
  local_name: string | null;
  school_type: string | null;
  operator_name: string | null;
  phone: string | null;
  status: SchoolStatus;
  urgency: "low" | "medium" | "high" | string | null;
  needs: string[];
  correction_issues: unknown[];
  admin_feedback: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  archived_at: string | null;
  archived_by_user_id: number | null;
  created_at: string;
  updated_at: string;
  submitted_by?: ManagedUser | null;
  approved_by?: ManagedUser | null;
  archived_by?: ManagedUser | null;
  location?: SchoolLocation | null;
  operators?: SchoolOperator[];
  children_stats?: SchoolChildrenStats | null;
  welfare?: SchoolWelfare | null;
  photos?: SchoolPhoto[];
  reviews?: SchoolReview[];
};

export type DashboardStats = {
  pending_reviews: number;
  approved_schools: number;
  rejected_schools: number;
  total_volunteers: number;
  completed_volunteer_profiles: number;
  unread_notifications: number;
};

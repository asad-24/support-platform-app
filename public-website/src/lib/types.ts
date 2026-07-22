export type SchoolType = "Public School" | "Madrasa" | "Community School";
export type VerificationStatus = "Verified" | "Pending" | "Field Review";
export type NeedUrgency = "Critical" | "High" | "Medium" | "Completed";
export type NeedStatus = "Open" | "Partially Funded" | "Funded" | "Completed";
export type NeedCategory =
  | "Water"
  | "Classrooms"
  | "Learning Materials"
  | "Food"
  | "Sanitation"
  | "Teacher Support"
  | "Furniture"
  | "Technology";

export interface Need {
  id: string;
  schoolId: string;
  title: string;
  category: NeedCategory;
  description: string;
  urgency: NeedUrgency;
  estimatedCost: number;
  quantityRequired: number;
  quantityFunded: number;
  status: NeedStatus;
  images: string[];
}

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  description: string;
  state: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  foundedYear: number;
  images: string[];
  contactPerson: string;
  verificationStatus: VerificationStatus;
  lastUpdated: string;
  needs: Need[];
}

export type PreferredHelpType =
  | "Donate Money"
  | "Send Items"
  | "Sponsor Monthly"
  | "Visit/Partner";

export interface SponsorNeedSnapshot {
  id: string;
  title: string;
  category: NeedCategory | string | null;
  estimatedCost: number | null;
}

export type SponsorRequestStatus =
  | "new"
  | "contacted"
  | "committed"
  | "declined"
  | "closed";

export interface SponsorRequest {
  id: number;
  requestId: string;
  schoolId: string;
  schoolName: string;
  selectedNeeds: SponsorNeedSnapshot[];
  sponsorName: string;
  sponsorEmail: string;
  sponsorPhone: string;
  sponsorCountry: string;
  organizationName: string | null;
  preferredHelpType: PreferredHelpType;
  pledgeAmount: number | null;
  helpDetails: string;
  message: string;
  profileLink: string | null;
  status: SponsorRequestStatus;
  createdAt: string;
  updatedAt: string;
}

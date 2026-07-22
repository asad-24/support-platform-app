import { schools as mockSchools } from "@/lib/data/schools";
import type {
  Need,
  NeedCategory,
  NeedStatus,
  NeedUrgency,
  School,
  SchoolType,
  VerificationStatus,
} from "@/lib/types";

const categories: NeedCategory[] = [
  "Water",
  "Classrooms",
  "Learning Materials",
  "Food",
  "Sanitation",
  "Teacher Support",
  "Furniture",
  "Technology",
];

const urgencies: NeedUrgency[] = ["Critical", "High", "Medium", "Completed"];
const statuses: NeedStatus[] = ["Open", "Partially Funded", "Funded", "Completed"];
const types: SchoolType[] = ["Public School", "Madrasa", "Community School"];
const verificationStatuses: VerificationStatus[] = [
  "Verified",
  "Pending",
  "Field Review",
];

const fallbackImages = mockSchools.flatMap((school) => school.images);

export function extractCollection(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];

  const possible = [
    payload.data,
    payload.schools,
    payload.items,
    payload.results,
    payload.docs,
    payload.records,
  ];

  for (const value of possible) {
    if (Array.isArray(value)) return value;
    if (isRecord(value) && Array.isArray(value.data)) return value.data;
    if (isRecord(value) && Array.isArray(value.items)) return value.items;
  }

  return [];
}

export function extractSingle(payload: unknown): unknown {
  if (isRecord(payload)) {
    if (isRecord(payload.data) && payload.data.school) return payload.data.school;
    if (isRecord(payload.data) && payload.data.item) return payload.data.item;
    if (isRecord(payload.data) && payload.data.record) return payload.data.record;
    return (
      payload.data ??
      payload.school ??
      payload.item ??
      payload.result ??
      payload.record ??
      payload
    );
  }

  return payload;
}

export function normalizeSchool(raw: unknown, index = 0): School {
  if (!isRecord(raw)) return mockSchools[index % mockSchools.length];

  const id = stringValue(raw.id ?? raw._id ?? raw.uuid ?? raw.school_id, `school-${index + 1}`);
  const location = isRecord(raw.location) ? raw.location : {};
  const type = enumValue<SchoolType>(
    normalizeType(raw.type ?? raw.schoolType ?? raw.school_type ?? raw.category),
    types,
    "Public School",
  );
  const city = stringValue(raw.city ?? raw.lga ?? raw.localGovernment ?? raw.local_government ?? location.lga ?? location.community, "Unknown city");
  const state = stringValue(raw.state ?? raw.stateName ?? raw.state_name ?? location.state, "Unknown state");
  const images = normalizeImages(raw.images ?? raw.photos ?? raw.media, index);
  const needs = normalizeNeeds(raw.needs ?? raw.welfareNeeds ?? raw.welfare ?? raw.requirements, id);

  return {
    id,
    name: stringValue(raw.name ?? raw.schoolName ?? raw.school_name ?? raw.title, "Unnamed school"),
    type,
    description: stringValue(
      raw.description ?? raw.summary ?? raw.about ?? raw.notes,
      "This school profile was loaded from the API and is ready for admin-managed details.",
    ),
    state,
    city,
    address: stringValue(raw.address ?? raw.locationAddress ?? raw.location_address ?? location.address, `${city}, ${state}`),
    latitude: numberValue(raw.latitude ?? raw.lat ?? location.latitude, mockSchools[index % mockSchools.length].latitude),
    longitude: numberValue(raw.longitude ?? raw.lng ?? raw.lon ?? location.longitude, mockSchools[index % mockSchools.length].longitude),
    totalStudents: numberValue(raw.totalStudents ?? raw.total_students ?? raw.students ?? raw.student_count ?? raw.childrenCount, 0),
    totalTeachers: numberValue(raw.totalTeachers ?? raw.total_teachers ?? raw.teachers ?? raw.teacher_count, 0),
    totalClassrooms: numberValue(raw.totalClassrooms ?? raw.total_classrooms ?? raw.classrooms ?? raw.classroom_count, 0),
    foundedYear: numberValue(raw.foundedYear ?? raw.founded_year ?? raw.yearFounded, new Date().getFullYear()),
    images,
    contactPerson: stringValue(raw.contactPerson ?? raw.contact_person ?? raw.operatorName, "School contact"),
    verificationStatus: enumValue<VerificationStatus>(
      normalizeVerification(raw.verificationStatus ?? raw.verification_status ?? raw.status),
      verificationStatuses,
      "Verified",
    ),
    lastUpdated: stringValue(raw.lastUpdated ?? raw.updatedAt ?? raw.updated_at, new Date().toISOString()),
    needs,
  };
}

function normalizeNeeds(rawNeeds: unknown, schoolId: string): Need[] {
  const list = Array.isArray(rawNeeds) ? rawNeeds : isRecord(rawNeeds) ? extractCollection(rawNeeds) : [];

  if (list.length === 0) {
    return [
      {
        id: `${schoolId}-general-support`,
        schoolId,
        title: "General school support",
        category: "Learning Materials",
        description: "Admin can connect this placeholder to detailed needs from the backend.",
        urgency: "Medium",
        estimatedCost: 0,
        quantityRequired: 1,
        quantityFunded: 0,
        status: "Open",
        images: [fallbackImages[0]],
      },
    ];
  }

  return list.map((need, index) => normalizeNeed(need, schoolId, index));
}

function normalizeNeed(raw: unknown, schoolId: string, index: number): Need {
  if (!isRecord(raw)) {
    return {
      id: `${schoolId}-need-${index + 1}`,
      schoolId,
      title: "School support need",
      category: "Learning Materials",
      description: "Need details will appear here once returned by the API.",
      urgency: "Medium",
      estimatedCost: 0,
      quantityRequired: 1,
      quantityFunded: 0,
      status: "Open",
      images: [fallbackImages[index % fallbackImages.length]],
    };
  }

  const category = enumValue<NeedCategory>(
    normalizeCategory(raw.category ?? raw.type ?? raw.needCategory ?? raw.need_category),
    categories,
    "Learning Materials",
  );
  const urgency = enumValue<NeedUrgency>(
    normalizeUrgency(raw.urgency ?? raw.urgencyLevel ?? raw.urgency_level),
    urgencies,
    "Medium",
  );

  return {
    id: stringValue(raw.id ?? raw._id ?? raw.uuid ?? raw.need_id, `${schoolId}-need-${index + 1}`),
    schoolId: stringValue(raw.schoolId ?? raw.school_id, schoolId),
    title: stringValue(raw.title ?? raw.name ?? raw.need ?? raw.item, "School support need"),
    category,
    description: stringValue(raw.description ?? raw.details ?? raw.notes, "Need details will appear here once returned by the API."),
    urgency,
    estimatedCost: numberValue(raw.estimatedCost ?? raw.estimated_cost ?? raw.cost ?? raw.amount, 0),
    quantityRequired: numberValue(raw.quantityRequired ?? raw.quantity_required ?? raw.required ?? raw.targetQuantity, 1),
    quantityFunded: numberValue(raw.quantityFunded ?? raw.quantity_funded ?? raw.funded ?? raw.completedQuantity, 0),
    status: enumValue<NeedStatus>(normalizeStatus(raw.status), statuses, "Open"),
    images: normalizeImages(raw.images ?? raw.photos ?? raw.media, index),
  };
}

function normalizeImages(raw: unknown, index: number) {
  if (Array.isArray(raw)) {
    const values = raw
      .map((item) => {
        if (typeof item === "string") return item;
        if (isRecord(item)) return stringValue(item.url ?? item.src ?? item.path, "");
        return "";
      })
      .filter(Boolean);

    if (values.length) return values;
  }

  if (typeof raw === "string" && raw) return [raw];

  return [fallbackImages[index % fallbackImages.length]];
}

function normalizeType(value: unknown) {
  const text = stringValue(value, "").toLowerCase();
  if (text.includes("madrasa") || text.includes("islam")) return "Madrasa";
  if (text.includes("community")) return "Community School";
  return "Public School";
}

function normalizeVerification(value: unknown) {
  const text = stringValue(value, "").toLowerCase();
  if (text.includes("pending")) return "Pending";
  if (text.includes("review")) return "Field Review";
  return "Verified";
}

function normalizeCategory(value: unknown) {
  const text = stringValue(value, "").toLowerCase();
  if (text.includes("water")) return "Water";
  if (text.includes("class")) return "Classrooms";
  if (text.includes("food") || text.includes("meal")) return "Food";
  if (text.includes("sanit") || text.includes("toilet")) return "Sanitation";
  if (text.includes("teacher")) return "Teacher Support";
  if (text.includes("furn") || text.includes("desk") || text.includes("chair")) return "Furniture";
  if (text.includes("tech") || text.includes("solar") || text.includes("digital")) return "Technology";
  return "Learning Materials";
}

function normalizeUrgency(value: unknown) {
  const text = stringValue(value, "").toLowerCase();
  if (text.includes("critical") || text.includes("urgent")) return "Critical";
  if (text.includes("high")) return "High";
  if (text.includes("complete")) return "Completed";
  return "Medium";
}

function normalizeStatus(value: unknown) {
  const text = stringValue(value, "").toLowerCase();
  if (text.includes("complete")) return "Completed";
  if (text.includes("partial")) return "Partially Funded";
  if (text.includes("funded")) return "Funded";
  return "Open";
}

function enumValue<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function stringValue(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
}

function numberValue(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

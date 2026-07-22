import { appClient, createRuntimeApiClient, runtimeApiBaseUrl } from "@/lib/api/client";
import {
  extractCollection,
  extractSingle,
  normalizeSchool,
} from "@/lib/api/normalizers";
import { schools as mockSchools } from "@/lib/data/schools";
import type { PreferredHelpType, School, SponsorNeedSnapshot, SponsorRequest } from "@/lib/types";

export type SchoolsQueryParams = {
  page?: number;
  limit?: number;
  status?: string;
  urgency?: string;
  state?: string;
  lga?: string;
  search?: string;
};

export type ApiResult<T> = {
  data: T;
  source: "api" | "mock";
  message?: string;
};

export async function fetchApprovedSchools(
  params: SchoolsQueryParams = {},
): Promise<ApiResult<School[]>> {
  if (!runtimeApiBaseUrl()) {
    return {
      data: mockSchools,
      source: "mock",
      message: "NEXT_PUBLIC_API_BASE_URL is not set, using demo data.",
    };
  }

  try {
    const response = await createRuntimeApiClient().get("/schools", {
      params: {
        page: 1,
        limit: 100,
        status: "approved",
        ...params,
      },
    });
    assertJsonResponse(response.headers["content-type"]);

    return {
      data: extractCollection(response.data).map((item, index) =>
        normalizeSchool(item, index),
      ),
      source: "api",
    };
  } catch (error) {
    return {
      data: mockSchools,
      source: "mock",
      message:
        error instanceof Error
          ? `API unavailable: ${error.message}. Showing demo data.`
          : "API unavailable. Showing demo data.",
    };
  }
}

export async function fetchApprovedSchool(id: string): Promise<ApiResult<School>> {
  if (!runtimeApiBaseUrl()) {
    const school = mockSchools.find((item) => item.id === id) ?? mockSchools[0];
    return {
      data: school,
      source: "mock",
      message: "NEXT_PUBLIC_API_BASE_URL is not set, using demo data.",
    };
  }

  try {
    const response = await createRuntimeApiClient().get(`/schools/${id}`);
    assertJsonResponse(response.headers["content-type"]);
    return {
      data: normalizeSchool(extractSingle(response.data)),
      source: "api",
    };
  } catch (error) {
    const school = mockSchools.find((item) => item.id === id) ?? mockSchools[0];
    return {
      data: school,
      source: "mock",
      message:
        error instanceof Error
          ? `API unavailable: ${error.message}. Showing demo data.`
          : "API unavailable. Showing demo data.",
    };
  }
}

function assertJsonResponse(contentType: unknown) {
  if (typeof contentType === "string" && contentType.includes("application/json")) {
    return;
  }

  throw new Error("API did not return JSON");
}

export type SponsorRequestPayload = {
  schoolId: string;
  schoolName: string;
  selectedNeeds: SponsorNeedSnapshot[];
  sponsorName: string;
  sponsorEmail: string;
  sponsorPhone: string;
  sponsorCountry: string;
  organizationName?: string;
  preferredHelpType: PreferredHelpType;
  pledgeAmount?: string;
  helpDetails: string;
  message: string;
  profileLink?: string;
};

export type ContactRequestPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function createSponsorRequest(payload: SponsorRequestPayload) {
  const response = await appClient.post<{
    success: true;
    data: { sponsorRequest: SponsorRequest };
  }>(
    "/api/sponsor-requests",
    payload,
  );

  return response.data;
}

export async function createContactRequest(payload: ContactRequestPayload) {
  const response = await appClient.post<{ success: true; data: { sent: boolean } }>(
    "/api/contact-requests",
    payload,
  );

  return response.data;
}

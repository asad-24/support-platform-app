import { apiBaseUrl, apiClient, appClient } from "@/lib/api/client";
import {
  extractCollection,
  extractSingle,
  normalizeSchool,
} from "@/lib/api/normalizers";
import { schools as mockSchools } from "@/lib/data/schools";
import type { PreferredHelpType, School } from "@/lib/types";

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
  if (!apiBaseUrl) {
    return {
      data: mockSchools,
      source: "mock",
      message: "NEXT_PUBLIC_API_BASE_URL is not set, using demo data.",
    };
  }

  try {
    const response = await apiClient.get("/schools", {
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
  if (!apiBaseUrl) {
    const school = mockSchools.find((item) => item.id === id) ?? mockSchools[0];
    return {
      data: school,
      source: "mock",
      message: "NEXT_PUBLIC_API_BASE_URL is not set, using demo data.",
    };
  }

  try {
    const response = await apiClient.get(`/schools/${id}`);
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

export type HelpRequestPayload = {
  schoolId: string;
  selectedNeeds: string[];
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorCountry: string;
  preferredHelpType: PreferredHelpType;
  message: string;
};

export async function createHelpRequest(payload: HelpRequestPayload) {
  const response = await appClient.post<{ ok: boolean; helpRequestId: string }>(
    "/api/help-requests",
    payload,
  );

  return response.data;
}

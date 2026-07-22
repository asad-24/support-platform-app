"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createContactRequest,
  createSponsorRequest,
  fetchApprovedSchool,
  fetchApprovedSchools,
  type ApiResult,
  type ContactRequestPayload,
  type SchoolsQueryParams,
  type SponsorRequestPayload,
} from "@/lib/api/schools";
import { queryKeys } from "@/lib/api/queryKeys";
import type { School } from "@/lib/types";

export function useApprovedSchools(params: SchoolsQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.schools(params),
    queryFn: () => fetchApprovedSchools(params),
  });
}

export function useApprovedSchool(id: string, initialData?: ApiResult<School>) {
  return useQuery({
    queryKey: queryKeys.school(id),
    queryFn: () => fetchApprovedSchool(id),
    enabled: Boolean(id),
    initialData,
    staleTime: initialData ? 30_000 : 0,
  });
}

export function useCreateSponsorRequest() {
  return useMutation({
    mutationFn: (payload: SponsorRequestPayload) => createSponsorRequest(payload),
  });
}

export function useCreateContactRequest() {
  return useMutation({
    mutationFn: (payload: ContactRequestPayload) => createContactRequest(payload),
  });
}

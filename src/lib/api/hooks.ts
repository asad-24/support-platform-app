"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createHelpRequest,
  fetchApprovedSchool,
  fetchApprovedSchools,
  type HelpRequestPayload,
  type SchoolsQueryParams,
} from "@/lib/api/schools";
import { queryKeys } from "@/lib/api/queryKeys";

export function useApprovedSchools(params: SchoolsQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.schools(params),
    queryFn: () => fetchApprovedSchools(params),
  });
}

export function useApprovedSchool(id: string) {
  return useQuery({
    queryKey: queryKeys.school(id),
    queryFn: () => fetchApprovedSchool(id),
    enabled: Boolean(id),
  });
}

export function useCreateHelpRequest() {
  return useMutation({
    mutationFn: (payload: HelpRequestPayload) => createHelpRequest(payload),
  });
}

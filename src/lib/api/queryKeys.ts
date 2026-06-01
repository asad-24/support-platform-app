export const queryKeys = {
  schools: (params?: unknown) => ["schools", params] as const,
  school: (id: string) => ["schools", id] as const,
};

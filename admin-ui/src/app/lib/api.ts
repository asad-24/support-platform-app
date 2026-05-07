const API_BASE_URL = resolveApiBaseUrl();

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  retryOnUnauthorized?: boolean;
  suppressAuthExpired?: boolean;
};

function resolveApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
  if (typeof window === "undefined") return configured;

  try {
    const apiUrl = new URL(configured);
    const pageHost = window.location.hostname;
    const loopbackHosts = new Set(["127.0.0.1", "localhost"]);

    if (loopbackHosts.has(apiUrl.hostname) && loopbackHosts.has(pageHost)) {
      apiUrl.hostname = pageHost;
      return apiUrl.toString().replace(/\/+$/, "");
    }
  } catch {
    return configured;
  }

  return configured;
}

type BackendError = {
  code?: string;
  message?: string;
  fields?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  fields?: Record<string, string>;

  constructor(status: number, error: unknown) {
    const parsed = parseError(error);
    super(parsed.message);
    this.name = "ApiError";
    this.status = status;
    this.code = parsed.code;
    this.fields = parsed.fields;
  }
}

function parseError(error: unknown): BackendError & { message: string } {
  if (typeof error === "string") return { message: error };
  if (!error || typeof error !== "object") return { message: "Request failed." };

  const value = error as { error?: unknown; message?: unknown; code?: unknown; fields?: unknown };
  if (value.error && typeof value.error === "object") {
    const nested = value.error as { message?: unknown; code?: unknown; fields?: unknown };
    return {
      message: typeof nested.message === "string" ? nested.message : "Request failed.",
      code: typeof nested.code === "string" ? nested.code : undefined,
      fields: isFieldMap(nested.fields) ? nested.fields : undefined,
    };
  }

  return {
    message: typeof value.message === "string" ? value.message : "Request failed.",
    code: typeof value.code === "string" ? value.code : undefined,
    fields: isFieldMap(value.fields) ? value.fields : undefined,
  };
}

function isFieldMap(value: unknown): value is Record<string, string> {
  return !!value && typeof value === "object" && Object.values(value).every((item) => typeof item === "string");
}

function emitAuthExpired() {
  window.dispatchEvent(new Event("admin-auth-expired"));
}

async function rawRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body,
    credentials: "include",
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const retryOnUnauthorized = options.retryOnUnauthorized !== false;

  try {
    return await rawRequest<T>(path, options);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || !retryOnUnauthorized) {
      throw error;
    }
  }

  try {
    await rawRequest("/auth/admin/refresh", {
      method: "POST",
      retryOnUnauthorized: false,
    });
  } catch (refreshError) {
    if (!options.suppressAuthExpired) emitAuthExpired();
    throw refreshError;
  }

  return rawRequest<T>(path, {
    ...options,
    retryOnUnauthorized: false,
  });
}

export function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Request failed.";
}

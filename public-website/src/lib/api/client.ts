import axios from "axios";

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export function runtimeApiBaseUrl() {
  if (typeof window === "undefined" && apiBaseUrl?.startsWith("/")) {
    const backendUrl =
      process.env.API_PROXY_TARGET?.replace(/\/+$/, "") ||
      "http://127.0.0.1:8000";
    return `${backendUrl}${apiBaseUrl}`;
  }

  return apiBaseUrl;
}

export function createRuntimeApiClient() {
  return axios.create({
    baseURL: runtimeApiBaseUrl(),
    headers: {
      Accept: "application/json",
    },
  });
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: "application/json",
  },
});

export const appClient = axios.create({
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

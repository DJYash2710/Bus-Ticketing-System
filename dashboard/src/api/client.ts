import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "../types/api";
import { API_BASE_URL } from "../lib/api-base-url";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "../lib/storage";

const baseURL = API_BASE_URL;

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const requestUrl = original.url ?? "";
    if (requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register")) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token: string) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<
        ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>
      >(`${baseURL}/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefresh } = data.data.tokens;
      setTokens(accessToken, newRefresh);
      processQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export function getApiErrorDetails(error: unknown): unknown {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { details?: unknown } | undefined;
    return data?.details;
  }
  return undefined;
}

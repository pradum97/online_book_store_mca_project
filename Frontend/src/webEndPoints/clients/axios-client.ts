import { getAuthCookie } from "@/utils/CommonUtils";
import { refreshAccessToken } from "@/utils/refreshToken";
import { getSessionUserId } from "@/utils/sessionStore";
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

interface FailedQueueItem {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _encrypted?: boolean;
}
const AxiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});
export let isRefreshing = false;
export let failedQueue: FailedQueueItem[] = [];
export const onRefreshChange: ((refreshing: boolean) => void)[] = [];
const setIsRefreshing = (value: boolean) => {
  isRefreshing = value;
  onRefreshChange.forEach((cb) => cb(value));
};
const processQueue = (
  error: Error | null = null,
  token: string | null = null,
) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};
AxiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig & { _encrypted?: boolean }) => {
    if (typeof window !== "undefined") {
      const token = await getAuthCookie();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config as InternalAxiosRequestConfig;
  },
);
AxiosClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const status = error.response?.status ?? 500;
    if (!getSessionUserId()) {
      return Promise.reject(error);
    }
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          originalRequest._encrypted = true;
          return AxiosClient(originalRequest);
        });
      }
      originalRequest._retry = true;
      setIsRefreshing(true);
      try {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          throw new Error("Refresh token failed - no token returned");
        }
        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        originalRequest._encrypted = true;
        return AxiosClient(originalRequest);
      } catch (err) {
        const refreshError =
          err instanceof Error ? err : new Error(String(err));
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        setIsRefreshing(false);
      }
    }
    const msg = error.response?.data as { message: string };
    const customError = {
      status: status,
      action: "error",
      message: msg?.message || "Unexpected error occurred",
      data: error.response?.data || null,
    };
    return Promise.reject(customError);
  },
);
export const api = {
  get: AxiosClient.get,
  post: AxiosClient.post,
  put: AxiosClient.put,
  delete: AxiosClient.delete,
  patch: AxiosClient.patch,
};
export default AxiosClient;

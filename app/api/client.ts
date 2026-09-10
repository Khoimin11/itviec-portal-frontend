import axios, { type AxiosRequestConfig } from "axios";

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string | string[];
  data: T;
}

type ErrorBody = {
  message?: string | string[];
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  readonly status: number;
  readonly errors: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface ClientOptions {
  baseURL: string;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
  adapter?: AxiosRequestConfig["adapter"];
}

export function createApiClient({ baseURL, getToken, onUnauthorized, adapter }: ClientOptions) {
  const http = axios.create({
    baseURL: baseURL.replace(/\/+$/, ""),
    timeout: 15000,
    headers: { Accept: "application/json" },
    withCredentials: false,
    paramsSerializer: { indexes: false },
    adapter,
  });

  http.interceptors.request.use((config) => {
    const token = getToken?.();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
    else config.headers.delete("Authorization");
    return config;
  });

  async function request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // PHP/Laravel parses multipart POST; preserve the intended route method.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      const method = config.method?.toUpperCase();
      if (method === "PUT" || method === "PATCH") {
        const form = new FormData();
        config.data.forEach((value, key) => form.append(key, value));
        form.set("_method", method);
        config = { ...config, method: "POST", data: form };
      }
    }

    try {
      const { data, status } = await http.request(config);
      if (data && typeof data === "object" && "isSuccess" in data) {
        if (!data.isSuccess) {
          throw new ApiError([data.message].flat().filter(Boolean).join("\n") || "Yêu cầu thất bại.", status, data.errors);
        }
        return data as ApiResponse<T>;
      }
      return {
        isSuccess: true,
        message: data?.message ?? "",
        data: (data && typeof data === "object" && "data" in data ? data.data : data) ?? null,
      } as ApiResponse<T>;
    } catch (error) {
      if (!axios.isAxiosError<ErrorBody>(error)) throw error;
      const status = error.response?.status ?? 0;
      const body = error.response?.data;
      if (status === 401 && error.config?.headers.get("Authorization")) {
        // Do not clear a newer session if an older request returns late.
        if (error.config.headers.get("Authorization") === `Bearer ${getToken?.()}`) {
          onUnauthorized?.();
        }
      }
      const fields = body?.errors ?? {};
      const messages = Object.values(fields).flat();
      const message = messages.length
        ? messages.join("\n")
        : [body?.message].flat().filter(Boolean).join("\n");
      throw new ApiError(
        message || (status ? "Yêu cầu thất bại. Vui lòng thử lại." : "Không thể kết nối API. Vui lòng kiểm tra kết nối và thử lại."),
        status,
        fields,
      );
    }
  }

  return {
    get: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: "GET", url }),
    post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>({ ...config, method: "POST", url, data }),
    put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>({ ...config, method: "PUT", url, data }),
    patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request<T>({ ...config, method: "PATCH", url, data }),
    delete: <T>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: "DELETE", url }),
  };
}

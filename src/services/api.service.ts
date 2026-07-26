import type { ApiResponse, PramaanError } from "../types";
import { storageService } from "./storage.service";

const AUTH_STORAGE_KEY = "pramaan_auth_session";

export class ApiService {
  private static instance: ApiService;
  private baseUrl = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || process.env.PLASMO_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    
    // Retrieve persistent session token
    const session = await storageService.get<any>(AUTH_STORAGE_KEY);
    const token = session?.token || session?.access_token;

    const authHeaders: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });

      if (response.status === 401) {
        // Handle unauthorized token expiry
        await storageService.remove(AUTH_STORAGE_KEY);
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        let parsedMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        try {
          const errJson = JSON.parse(errorText);
          parsedMessage = errJson.detail || errJson.message || parsedMessage;
        } catch {
          // fallback to raw text
        }
        throw new Error(parsedMessage);
      }

      const json = await response.json();
      return {
        success: true,
        data: json.data ?? json,
        timestamp: Date.now()
      };
    } catch (err: any) {
      const errorPayload: PramaanError = {
        code: "NETWORK_ERROR",
        message: err?.message || "Failed to communicate with PRAMAAN verification API",
        severity: "error",
        timestamp: Date.now()
      };
      return {
        success: false,
        data: null as unknown as T,
        message: errorPayload.message,
        timestamp: Date.now()
      };
    }
  }
}

export const apiService = ApiService.getInstance();

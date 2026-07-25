import { apiService } from "./api.service";
import { storageService } from "./storage.service";
import type { AuthSession, UserProfile } from "../types";

const AUTH_STORAGE_KEY = "pramaan_auth_session";

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async getSession(): Promise<AuthSession | null> {
    return await storageService.get<AuthSession>(AUTH_STORAGE_KEY);
  }

  public async register(email: string, password: string, name?: string): Promise<AuthSession> {
    const res = await apiService.request<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name })
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Registration failed");
    }

    const { access_token, user } = res.data;
    const session: AuthSession = {
      token: access_token,
      refreshToken: access_token,
      expiresAt: Date.now() + 24 * 3600 * 1000,
      user: {
        id: String(user.id),
        email: user.email,
        name: user.name || user.email.split("@")[0],
        plan: "pro",
        verifiedCount: 0,
        createdAt: new Date(user.created_at).getTime() || Date.now(),
        lastActiveAt: Date.now()
      }
    };

    await storageService.set(AUTH_STORAGE_KEY, session);
    return session;
  }

  public async login(email: string, password: string): Promise<AuthSession> {
    const res = await apiService.request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (!res.success || !res.data) {
      throw new Error(res.message || "Invalid email or password");
    }

    const { access_token, user } = res.data;
    const session: AuthSession = {
      token: access_token,
      refreshToken: access_token,
      expiresAt: Date.now() + 24 * 3600 * 1000,
      user: {
        id: String(user.id),
        email: user.email,
        name: user.name || user.email.split("@")[0],
        plan: "pro",
        verifiedCount: 0,
        createdAt: new Date(user.created_at).getTime() || Date.now(),
        lastActiveAt: Date.now()
      }
    };

    await storageService.set(AUTH_STORAGE_KEY, session);
    return session;
  }

  public async loginMock(email = "engineer@google.com"): Promise<AuthSession> {
    try {
      return await this.login(email, "Password123!");
    } catch {
      // Guest session fallback if offline
      const guestSession: AuthSession = {
        token: "pramaan_guest_token",
        refreshToken: "pramaan_guest_refresh",
        expiresAt: Date.now() + 7 * 86400000,
        user: {
          id: "usr_guest",
          email,
          name: "Guest Verified Engineer",
          plan: "pro",
          verifiedCount: 0,
          createdAt: Date.now(),
          lastActiveAt: Date.now()
        }
      };
      await storageService.set(AUTH_STORAGE_KEY, guestSession);
      return guestSession;
    }
  }

  public async getCurrentUser(): Promise<UserProfile | null> {
    const res = await apiService.request<any>("/auth/me", { method: "GET" });
    if (!res.success || !res.data) return null;

    const user = res.data;
    return {
      id: String(user.id),
      email: user.email,
      name: user.name || user.email.split("@")[0],
      plan: "pro",
      verifiedCount: 0,
      createdAt: new Date(user.created_at).getTime() || Date.now(),
      lastActiveAt: Date.now()
    };
  }

  public async logout(): Promise<boolean> {
    return await storageService.remove(AUTH_STORAGE_KEY);
  }
}

export const authService = AuthService.getInstance();

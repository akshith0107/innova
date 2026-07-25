import { create } from "zustand";
import type { AuthSession, UserProfile } from "../types";
import { authService } from "../services/auth.service";

interface AuthState {
  session: AuthSession | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    set({ isLoading: true });
    const session = await authService.getSession();
    if (session) {
      set({ session, user: session.user, isAuthenticated: true, isLoading: false });
    } else {
      // Auto login mock for seamless experience
      const mockSession = await authService.loginMock();
      set({
        session: mockSession,
        user: mockSession.user,
        isAuthenticated: true,
        isLoading: false
      });
    }
  },

  login: async () => {
    set({ isLoading: true });
    const session = await authService.loginMock();
    set({ session, user: session.user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await authService.logout();
    set({ session: null, user: null, isAuthenticated: false, isLoading: false });
  }
}));

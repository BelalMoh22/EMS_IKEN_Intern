import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Role } from "@/types";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: "mock-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: "1",
        email: "admin@example.com",
        firstName: "Admin",
        lastName: "User",
        role: "Admin",
      },
      isAuthenticated: true,
      setAuth: (token, refreshToken, user) =>
        set({ token, refreshToken, user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      logout: () =>
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
      hasRole: (...roles) => {
        const user = get().user;
        return user ? roles.includes(user.role) : false;
      },
    }),
    { name: "hr-auth-mock" }
  )
);

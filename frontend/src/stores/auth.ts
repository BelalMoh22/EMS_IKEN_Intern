import { create } from "zustand";
import { persist } from "zustand/middleware"; // persist save state to localStorage
import type { User, Role } from "@/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setMustChangePassword: (value: boolean) => void;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({ // set : update state, get : read state
      // Initial state
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user, isAuthenticated: true }), // called after login

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setMustChangePassword: (value) =>
        set((state) => ({
          user: state.user ? { ...state.user, mustChangePassword: value } : null,
        })),

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),

      hasRole: (...roles) => {
        const user = get().user;
        return user ? roles.includes(user.role) : false;
      },
    }),
    {
      name: "hr-auth-ems",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

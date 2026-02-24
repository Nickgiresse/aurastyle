"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  setAuthFromRegister: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      _hasHydrated: false,

      setHasHydrated: (val) => set({ _hasHydrated: val }),

      login: async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Identifiants incorrects");

        const user: AuthUser = {
          id: data.user?._id ?? data.user?.id ?? data._id ?? data.id ?? "",
          email: data.user?.email ?? data.email ?? "",
          firstName: data.user?.firstName ?? data.firstName ?? "",
          lastName: data.user?.lastName ?? data.lastName ?? "",
          isAdmin: Boolean(data.user?.isAdmin ?? data.isAdmin ?? false),
        };

        set({ user, token: data.token });
        return user;
      },

      setAuthFromRegister: (token: string, user: AuthUser) => {
        set({ user, token });
      },

      logout: () => set({ user: null, token: null }),
    }),
    {
      name: "aura-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

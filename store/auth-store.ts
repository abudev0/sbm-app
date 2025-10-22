"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/lib/api/auth";

type AuthState = {
  items: any;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (u: AuthUser | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      items: null,
      user: null,
      isAuthenticated: false,
      setUser: (u) => set({ user: u, isAuthenticated: !!u }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "sbm-auth" }
  )
);
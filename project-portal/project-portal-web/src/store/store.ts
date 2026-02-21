import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StoreState } from "./auth/auth.slice";
import { createAuthSlice } from "./auth/auth.slice";
import { setAuthToken } from "@/lib/api/axios";

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
    }),
    {
      name: "project-portal-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        token: s.token,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Called after hydration
        const token = state?.token ?? null;
        setAuthToken(token);
        state?.setHydrated(true);
        // validate token in background (no flicker)
        state?.refreshToken?.();
      },
    },
  ),
);

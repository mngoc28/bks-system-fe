import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getAccessToken, removeAccessToken, setAccessToken, clearAllDashboardDateRanges } from "../utils/storage";

interface UserStore {
  userEmail: string;
  get isAuthenticated(): boolean;
  login: (token: string, email: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore, [["zustand/persist", unknown]]>(
  persist(
    (set, get) => ({
      userEmail: "",
      get isAuthenticated() {
        const token = getAccessToken();
        const state = get();
        const result = !!token && !!state.userEmail;
        return result;
      },
      login(token: string, email: string) {
        setAccessToken(token);
        set(() => ({
          userEmail: email
        }));
      },
      logout() {
        removeAccessToken();
        clearAllDashboardDateRanges();
        set(() => ({
          userEmail: "",
        }));
      },
    }),
    {
      name: "user",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userEmail: state.userEmail
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const token = getAccessToken();
          if (!token) {
            state.userEmail = "";
          }
        }
      },
    },
  ),
);

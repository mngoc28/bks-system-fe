import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getAccessToken, removeAccessToken, setAccessToken, clearAllDashboardDateRanges } from "../utils/storage";
import { disconnectEcho } from "@/lib/echoClient";

interface UserStore {
  userEmail: string;
  userRole: string;
  userName: string;
  get isAuthenticated(): boolean;
  login: (token: string, email: string, role: string, name: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore, [["zustand/persist", unknown]]>(
  persist(
    (set, get) => ({
      userEmail: "",
      userRole: "",
      userName: "",
      get isAuthenticated() {
        const token = getAccessToken();
        const state = get();
        const result = !!token && !!state.userEmail;
        return result;
      },
      login(token: string, email: string, role: string, name: string) {
        setAccessToken(token);
        set(() => ({
          userEmail: email,
          userRole: role ? role.toLowerCase() : "",
          userName: name || ""
        }));
      },
      logout() {
        removeAccessToken();
        clearAllDashboardDateRanges();
        disconnectEcho();
        set(() => ({
          userEmail: "",
          userRole: "",
          userName: ""
        }));
      },
    }),
    {
      name: "user",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userEmail: state.userEmail,
        userRole: state.userRole,
        userName: state.userName
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const token = getAccessToken();
          if (!token) {
            state.userEmail = "";
            state.userRole = "";
          }
        }
      },
    },
  ),
);

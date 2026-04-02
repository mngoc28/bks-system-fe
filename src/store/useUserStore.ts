import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getAccessToken, removeAccessToken, setAccessToken, clearAllDashboardDateRanges } from "../utils/storage";

interface UserStore {
  userEmail: string;
  userRole: string; // Thêm trường Role
  get isAuthenticated(): boolean;
  login: (token: string, email: string, role: string) => void; // Cập nhật hàm login
  logout: () => void;
}

export const useUserStore = create<UserStore, [["zustand/persist", unknown]]>(
  persist(
    (set, get) => ({
      userEmail: "",
      userRole: "",
      get isAuthenticated() {
        const token = getAccessToken();
        const state = get();
        const result = !!token && !!state.userEmail;
        return result;
      },
      login(token: string, email: string, role: string) {
        setAccessToken(token);
        set(() => ({
          userEmail: email,
          userRole: role ? role.toLowerCase() : ""
        }));
      },
      logout() {
        removeAccessToken();
        clearAllDashboardDateRanges();
        set(() => ({
          userEmail: "",
          userRole: ""
        }));
      },
    }),
    {
      name: "user",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userEmail: state.userEmail,
        userRole: state.userRole
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

import { disconnectEcho } from "@/lib/echoClient";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { cancelAllRequests } from "../api/abortService";
import { clearAllDashboardDateRanges, getAccessToken, removeAccessToken, setAccessToken } from "../utils/storage";

const USER_PERSIST_KEY = "user";

/** Read the persist (sync) snapshot — used when the UI renders before Zustand rehydrates.. */
export function readPersistedUserProfile(): {
  userEmail: string;
  userName: string;
  userRole: string;
} {
  if (typeof window === "undefined") {
    return { userEmail: "", userName: "", userRole: "" };
  }
  try {
    const raw = localStorage.getItem(USER_PERSIST_KEY);
    if (!raw) {
      return { userEmail: "", userName: "", userRole: "" };
    }
    const parsed = JSON.parse(raw) as { state?: { userEmail?: string; userName?: string; userRole?: string } };
    return {
      userEmail: parsed?.state?.userEmail ?? "",
      userName: parsed?.state?.userName ?? "",
      userRole: parsed?.state?.userRole ?? "",
    };
  } catch {
    return { userEmail: "", userName: "", userRole: "" };
  }
}

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
        cancelAllRequests();
        set(() => ({
          userEmail: "",
          userRole: "",
          userName: ""
        }));
      },
    }),
    {
      name: USER_PERSIST_KEY,
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

import { STORAGE_VAR } from "../constant";

export const getAccessToken = () => {
  // Priority: localStorage (persistent) > sessionStorage (session)
  return localStorage.getItem(STORAGE_VAR.ACCESS_TOKEN) || sessionStorage.getItem(STORAGE_VAR.ACCESS_TOKEN);
};

export const setAccessToken = (token: string, remember: boolean = true) => {
  if (remember) {
    localStorage.setItem(STORAGE_VAR.ACCESS_TOKEN, token);
  } else {
    // If not remembering, store in sessionStorage (cleared when closing tab)
    sessionStorage.setItem(STORAGE_VAR.ACCESS_TOKEN, token);
  }
};

export const removeAccessToken = () => {
  localStorage.removeItem(STORAGE_VAR.ACCESS_TOKEN);
};

export const getUserEmail = () => {
  return localStorage.getItem(STORAGE_VAR.USER_EMAIL);
};

export const setUserEmail = (email: string) => {
  localStorage.setItem(STORAGE_VAR.USER_EMAIL, email);
};

export const removeUserEmail = () => {
  localStorage.removeItem(STORAGE_VAR.USER_EMAIL);
};

/**
 * Persist the email specifically for the "Remember Me" pre-fill feature.
 */
export const setRememberedEmail = (email: string) => {
  localStorage.setItem("remembered_email", email);
};

/**
 * Get the email specifically for the "Remember Me" pre-fill feature.
 */
export const getRememberedEmail = () => {
  return localStorage.getItem("remembered_email");
};

/**
 * Remove the email specifically for the "Remember Me" pre-fill feature.
 */
export const removeRememberedEmail = () => {
  localStorage.removeItem("remembered_email");
};

const DASHBOARD_DATE_RANGE_KEYS = {
  BOOKINGS_PER_MONTH: "dashboard_bookings_per_month_date_range",
  REVENUE_BY_MONTH: "dashboard_revenue_by_month_date_range",
} as const;

export const getDashboardDateRange = (chartType: keyof typeof DASHBOARD_DATE_RANGE_KEYS) => {
  const key = DASHBOARD_DATE_RANGE_KEYS[chartType];
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        startDate: parsed.startDate || undefined,
        endDate: parsed.endDate || undefined,
      };
    } catch {
      return { startDate: undefined, endDate: undefined };
    }
  }
  return { startDate: undefined, endDate: undefined };
};

export const setDashboardDateRange = (chartType: keyof typeof DASHBOARD_DATE_RANGE_KEYS, startDate?: string, endDate?: string) => {
  const key = DASHBOARD_DATE_RANGE_KEYS[chartType];
  localStorage.setItem(
    key,
    JSON.stringify({
      startDate: startDate || null,
      endDate: endDate || null,
    }),
  );
};

export const removeDashboardDateRange = (chartType: keyof typeof DASHBOARD_DATE_RANGE_KEYS) => {
  const key = DASHBOARD_DATE_RANGE_KEYS[chartType];
  localStorage.removeItem(key);
};

export const clearAllDashboardDateRanges = () => {
  Object.values(DASHBOARD_DATE_RANGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

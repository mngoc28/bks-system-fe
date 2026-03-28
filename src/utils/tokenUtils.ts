import { JwtPayload, RefreshTokenResponse } from "@/dataHelper/auth.dataHelper";
import { getAccessToken, setAccessToken } from "./storage";
import { authApi } from "@/api/authApi";
import { TOKEN_EXPIRATION_BUFFER_MS, TOKEN_REFRESH_THRESHOLD_MINUTES } from "@/constant";

/**
 * Decode JWT token to get payload
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JwtPayload;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param token - JWT token string
 * @returns true if token is expired or invalid, false otherwise
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) {
    return true;
  }

  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  return currentTime >= expirationTime - TOKEN_EXPIRATION_BUFFER_MS;
};

/**
 * Get token expiration time in milliseconds
 */
export const getTokenExpirationTime = (token: string | null): number | null => {
  if (!token) {
    return null;
  }

  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return null;
  }

  return payload.exp * 1000;
};

/**
 * Get time until token expires in milliseconds
 */
export const getTimeUntilExpiration = (token: string | null): number | null => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) {
    return null;
  }

  const timeUntilExpiration = expirationTime - Date.now();
  return timeUntilExpiration > 0 ? timeUntilExpiration : 0;
};

/**
 * Refresh access token using authApi
 * Note: This uses authApi.refresh() directly (same as mutationFn in useRefreshTokenMutation)
 * Cannot use React hooks in utility functions, so we call the API directly
 * @returns Promise<string | null> - New access token or null if refresh failed
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const token = getAccessToken();
    if (!token) {
      return null;
    }

    const response = (await authApi.refresh()) as RefreshTokenResponse;

    const newAccessToken = response?.data?.token;

    if (newAccessToken) {
      setAccessToken(newAccessToken);
      return newAccessToken;
    }

    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

/**
 * Check if token should be refreshed (when remaining time is less than threshold)
 * @param token - JWT token string
 * @param thresholdMinutes - Threshold in minutes (default: TOKEN_REFRESH_THRESHOLD_MINUTES)
 * @returns true if token should be refreshed
 */
export const shouldRefreshToken = (token: string | null, thresholdMinutes: number = TOKEN_REFRESH_THRESHOLD_MINUTES): boolean => {
  if (!token) {
    return false;
  }

  const timeUntilExpiration = getTimeUntilExpiration(token);
  if (!timeUntilExpiration) {
    return false;
  }

  const thresholdMs = thresholdMinutes * 60 * 1000;
  return timeUntilExpiration <= thresholdMs && timeUntilExpiration > 0;
};

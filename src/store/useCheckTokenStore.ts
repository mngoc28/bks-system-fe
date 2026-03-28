import { useEffect, useState } from "react";
import { isTokenExpired, getTimeUntilExpiration, shouldRefreshToken, refreshAccessToken } from "@/utils/tokenUtils";
import { getAccessToken } from "@/utils/storage";
import { useUserStore } from "./useUserStore";
import { TOKEN_CHECK_INTERVAL, TOKEN_REFRESH_TIME } from "@/constant";

export const useCheckTokenStore = () => {
  const userEmail = useUserStore((state) => state.userEmail);
  const logout = useUserStore((state) => state.logout);
  const [token, setToken] = useState<string | null>(getAccessToken());

  useEffect(() => {
    const currentToken = getAccessToken();
    setToken(currentToken);

    if (currentToken && isTokenExpired(currentToken)) {
      logout();
      setToken(null);
      return;
    }

    const isPageVisible = () => !document.hidden;
    if (currentToken && shouldRefreshToken(currentToken, TOKEN_REFRESH_TIME) && isPageVisible()) {
      refreshAccessToken()
        .then((newToken: string | null) => {
          if (newToken) {
            setToken(newToken);
          } else {
            logout();
            setToken(null);
          }
        })
        .catch(() => {
          logout();
          setToken(null);
        });
    }

    const timeUntilExpiration = getTimeUntilExpiration(currentToken);
    if (timeUntilExpiration && timeUntilExpiration > 0) {
      const checkInterval = setInterval(() => {
        if (!isPageVisible()) {
          return;
        }

        const latestToken = getAccessToken();

        if (!latestToken || isTokenExpired(latestToken)) {
          logout();
          setToken(null);
          clearInterval(checkInterval);
          return;
        }

        if (shouldRefreshToken(latestToken, TOKEN_REFRESH_TIME)) {
          refreshAccessToken()
            .then((newToken: string | null) => {
              if (newToken) {
                setToken(newToken);
              } else {
                logout();
                setToken(null);
                clearInterval(checkInterval);
              }
            })
            .catch(() => {
              logout();
              setToken(null);
              clearInterval(checkInterval);
            });
        }
      }, TOKEN_CHECK_INTERVAL);

      const handleVisibilityChange = () => {
        if (!document.hidden) {
          const latestToken = getAccessToken();
          if (latestToken && !isTokenExpired(latestToken)) {
            if (shouldRefreshToken(latestToken, TOKEN_REFRESH_TIME)) {
              refreshAccessToken()
                .then((newToken: string | null) => {
                  if (newToken) {
                    setToken(newToken);
                  }
                })
                .catch(() => {});
            }
          } else if (latestToken && isTokenExpired(latestToken)) {
            logout();
            setToken(null);
          }
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        clearInterval(checkInterval);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [userEmail, logout]);

  return token;
};

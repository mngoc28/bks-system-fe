import { getAccessToken, setAccessToken } from "@/utils/storage";
import axios from "axios";
import { useEffect } from "react";
import { TOKEN_REFRESH_INTERVAL_MS } from "@/constant";

export const useTokenRefresh = () => {
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_URL}/admin/refresh`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const newAccessToken = response.data.data.access_token;
          if (newAccessToken) {
            setAccessToken(newAccessToken);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);
};

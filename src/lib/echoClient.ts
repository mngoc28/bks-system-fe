import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getAccessToken } from "@/utils/storage";
import { decodeToken } from "@/utils/tokenUtils";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { Pusher: any; Echo: any }
}

window.Pusher = Pusher;

let echoInstance: Echo<"pusher"> | null = null;

const apiBaseUrl = import.meta.env.VITE_URL ?? "";
const broadcastAuthEndpoint = `${apiBaseUrl.replace(/\/$/, "")}/broadcasting/auth`;

const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY ?? "local-key";
const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER ?? "mt1";
const pusherHost = import.meta.env.VITE_PUSHER_HOST ?? "";
const pusherPort = Number(import.meta.env.VITE_PUSHER_PORT ?? 443);
const pusherScheme = import.meta.env.VITE_PUSHER_SCHEME ?? "https";

const PARTNER_REALTIME_ENABLED =
  String(import.meta.env.VITE_PARTNER_REALTIME ?? "true").toLowerCase() !== "false";

/**
 * Lazy-init một singleton Laravel Echo client. Authorizer custom đính kèm
 * Authorization: Bearer <jwt> mỗi lần FE subscribe private channel — chính
 * BroadcastAuthController phía BE sẽ xác thực và sinh signature.
 */
export const getEcho = (): Echo<"pusher"> | null => {
  if (!PARTNER_REALTIME_ENABLED) {
    return null;
  }

  if (echoInstance) {
    return echoInstance;
  }

  // Cast về any vì laravel-echo không export đầy đủ type cho options
  // (đặc biệt là `authorizer`, `wsHost`, `wsPort`).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseConfig: any = {
    broadcaster: "pusher",
    key: pusherKey,
    cluster: pusherCluster,
    forceTLS: pusherScheme === "https",
    authorizer: (channel: { name: string }) => ({
      authorize: (
        socketId: string,
        callback: (error: boolean, data: unknown) => void,
      ) => {
        const token = getAccessToken();
        if (!token) {
          callback(true, { message: "Missing access token" });
          return;
        }

        fetch(broadcastAuthEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then(async (res) => {
            if (!res.ok) {
              const text = await res.text().catch(() => "");
              callback(true, { status: res.status, message: text });
              return;
            }
            const data = await res.json();
            callback(false, data);
          })
          .catch((err) => callback(true, err));
      },
    }),
  };

  if (pusherHost) {
    baseConfig.wsHost = pusherHost;
    baseConfig.wsPort = pusherPort;
    baseConfig.wssPort = pusherPort;
    baseConfig.enabledTransports = ["ws", "wss"];
    baseConfig.disableStats = true;
  }

  echoInstance = new Echo(baseConfig);
  if (typeof window !== "undefined") {
    window.Echo = echoInstance;
  }
  return echoInstance;
};

/**
 * Ngắt kết nối khi user logout. Gọi từ logout flow để giải phóng socket +
 * tránh authorizer dùng token đã hết hạn.
 */
export const disconnectEcho = (): void => {
  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch {
      // ignore
    }
    echoInstance = null;
    if (typeof window !== "undefined") {
      window.Echo = null;
    }
  }
};

/**
 * Đọc user id (sub claim) từ JWT đang lưu để FE biết subscribe channel
 * `private-partner.{id}`. Trả null nếu không có token hoặc token không
 * chứa sub.
 */
export const getCurrentUserIdFromToken = (): number | null => {
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  const payload = decodeToken(token) as { sub?: string | number } | null;
  if (!payload?.sub) {
    return null;
  }
  const idNum = Number(payload.sub);
  return Number.isFinite(idNum) ? idNum : null;
};

export const isRealtimeEnabled = (): boolean => PARTNER_REALTIME_ENABLED;

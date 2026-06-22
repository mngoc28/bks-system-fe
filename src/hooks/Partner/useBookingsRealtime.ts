import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  disconnectEcho,
  getCurrentUserIdFromToken,
  getEcho,
  isRealtimeEnabled,
} from "@/lib/echoClient";
import { mapRealtimeChatMessage, type ChatMessagePayload } from "@/utils/chatRealtime";

export type RealtimeBookingPayload = {
  id: number;
  status: number | string;
  room_id?: number;
  partner_id?: number;
  property_id?: number;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string | null;
  actor_id?: number | null;
};

export type BookingEventName =
  | "booking.created"
  | "booking.confirmed"
  | "booking.cancelled"
  | "room_block.changed"
  | "contract.renewal_reminder";

/** Payload broadcast BCP (alias `.cancellation_request.updated`). */
export type RealtimeCancellationRequestPayload = {
  request_id: number;
  booking_id: number;
  property_id: number;
  partner_id: number;
  status: string;
};

export type BookingRealtimeStatus = "connecting" | "connected" | "disconnected";

type Options = {
  enabled?: boolean;
  onEvent?: (event: BookingEventName, payload: RealtimeBookingPayload) => void;
  /** BCP: inbox yêu cầu hủy — payload không chứa PII khách. */
  onCancellationRequestEvent?: (payload: RealtimeCancellationRequestPayload) => void;
  onMessageEvent?: (payload: ChatMessagePayload) => void;
  // Bao nhiêu giây mất kết nối liên tục mới bật polling fallback (mặc định 5s).
  fallbackThresholdMs?: number;
  // Tần suất polling fallback (mặc định 30s).
  pollingIntervalMs?: number;
};

const DEFAULT_FALLBACK_THRESHOLD_MS = 5_000;
const DEFAULT_POLLING_INTERVAL_MS = 30_000;

/**
 * Hook subscribe `private-partner.{userId}` lắng các event Booking realtime
 * (created / confirmed / cancelled) và invalidate cache TanStack Query để
 * Bookings list + Dashboard KPI cards refetch.
 *
 * Kèm polling fallback: nếu mất kết nối Echo > `fallbackThresholdMs` thì
 * tự refetch định kỳ `pollingIntervalMs`. Khi reconnect → ngừng polling.
 *
 * Cleanup an toàn khi unmount hoặc khi token đổi (logout/relogin).
 */
export const useBookingsRealtime = (options: Options = {}) => {
  const queryClient = useQueryClient();
  const enabled = options.enabled ?? true;
  const fallbackThresholdMs = options.fallbackThresholdMs ?? DEFAULT_FALLBACK_THRESHOLD_MS;
  const pollingIntervalMs = options.pollingIntervalMs ?? DEFAULT_POLLING_INTERVAL_MS;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [status, setStatus] = useState<BookingRealtimeStatus>(
    isRealtimeEnabled() ? "connecting" : "disconnected",
  );
  const [pollingActive, setPollingActive] = useState<boolean>(!isRealtimeEnabled());

  useEffect(() => {
    if (!enabled) {
      setStatus("disconnected");
      setPollingActive(false);
      return;
    }

    if (!isRealtimeEnabled()) {
      return;
    }

    const userId = getCurrentUserIdFromToken();
    if (userId === null) {
      setStatus("disconnected");
      return;
    }

    const echo = getEcho();
    if (!echo) {
      setStatus("disconnected");
      return;
    }

    const channelName = `partner.${userId}`;
    const channel = echo.private(channelName);

    const handle =
      (eventName: BookingEventName) =>
      (payload: RealtimeBookingPayload) => {
        queryClient.invalidateQueries({ queryKey: ["partner", "bookings"] });
        queryClient.invalidateQueries({ queryKey: ["partner", "dashboard", "kpis"] });
        queryClient.invalidateQueries({ queryKey: ["partner", "dashboard", "charts"] });
        queryClient.invalidateQueries({ queryKey: ["partner-stats"] });
        queryClient.invalidateQueries({ queryKey: ["partner-pending-bookings"] });
        // Phase 3: calendar phụ thuộc cùng các event này; invalidate prefix
        // để mọi range đang cache đều refetch.
        queryClient.invalidateQueries({ queryKey: ["partner", "calendar"] });
        queryClient.invalidateQueries({ queryKey: ["partner", "maintenances"] });
        queryClient.invalidateQueries({ queryKey: ["partner-urgent-maintenances"] });
        queryClient.invalidateQueries({ queryKey: ["partner", "properties"] });
        // Phase 5: hợp đồng sắp hết hạn (Alert Center).
        if (eventName === "contract.renewal_reminder") {
          queryClient.invalidateQueries({ queryKey: ["partner", "contracts"] });
        }
        optionsRef.current.onEvent?.(eventName, payload);
      };

    const handleCancellationRequest = (payload: RealtimeCancellationRequestPayload) => {
      queryClient.invalidateQueries({ queryKey: ["partner", "cancellation-requests"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "calendar"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "dashboard", "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "dashboard", "charts"] });
      queryClient.invalidateQueries({ queryKey: ["partner-stats"] });
      queryClient.invalidateQueries({ queryKey: ["partner-pending-bookings"] });
      optionsRef.current.onCancellationRequestEvent?.(payload);
    };

    const handleMessageSent = (payload: Record<string, unknown>) => {
      const incoming = mapRealtimeChatMessage(payload);
      optionsRef.current.onMessageEvent?.(incoming);
    };

    channel.listen(".booking.created", handle("booking.created"));
    channel.listen(".booking.confirmed", handle("booking.confirmed"));
    channel.listen(".booking.cancelled", handle("booking.cancelled"));
    channel.listen(".room_block.changed", handle("room_block.changed"));
    channel.listen(".contract.renewal_reminder", handle("contract.renewal_reminder"));
    channel.listen(".cancellation_request.updated", handleCancellationRequest);
    channel.listen(".MessageSent", handleMessageSent);

    const connector = (echo as unknown as { connector: { pusher: { connection: { state: string; bind: (e: string, cb: () => void) => void; unbind: (e: string, cb: () => void) => void } } } }).connector;
    const pusher = connector?.pusher;
    const connection = pusher?.connection;

    let disconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const onConnected = () => {
      setStatus("connected");
      setPollingActive(false);
      if (disconnectTimer) {
        clearTimeout(disconnectTimer);
        disconnectTimer = null;
      }
    };

    const onDisconnected = () => {
      setStatus("disconnected");
      if (disconnectTimer) clearTimeout(disconnectTimer);
      disconnectTimer = setTimeout(() => {
        setPollingActive(true);
      }, fallbackThresholdMs);
    };

    if (connection) {
      if (connection.state === "connected") {
        onConnected();
      }
      connection.bind("connected", onConnected);
      connection.bind("disconnected", onDisconnected);
      connection.bind("unavailable", onDisconnected);
      connection.bind("failed", onDisconnected);
    }

    return () => {
      try {
        channel.stopListening(".booking.created");
        channel.stopListening(".booking.confirmed");
        channel.stopListening(".booking.cancelled");
        channel.stopListening(".room_block.changed");
        channel.stopListening(".contract.renewal_reminder");
        channel.stopListening(".cancellation_request.updated");
        channel.stopListening(".MessageSent");
        echo.leave(channelName);
      } catch {
        // ignore
      }
      if (connection) {
        connection.unbind("connected", onConnected);
        connection.unbind("disconnected", onDisconnected);
        connection.unbind("unavailable", onDisconnected);
        connection.unbind("failed", onDisconnected);
      }
      if (disconnectTimer) {
        clearTimeout(disconnectTimer);
      }
    };
  }, [enabled, queryClient, fallbackThresholdMs]);

  // Polling fallback. Chạy khi pollingActive=true (thường là sau khi mất Echo
  // > fallbackThresholdMs). Khi Echo reconnect, pollingActive=false → cleanup.
  useEffect(() => {
    if (!enabled || !pollingActive) return;

    const tick = () => {
      queryClient.invalidateQueries({ queryKey: ["partner", "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "dashboard", "kpis"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "dashboard", "charts"] });
      queryClient.invalidateQueries({ queryKey: ["partner-stats"] });
      queryClient.invalidateQueries({ queryKey: ["partner-pending-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "calendar"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "maintenances"] });
      queryClient.invalidateQueries({ queryKey: ["partner-urgent-maintenances"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "properties"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "cancellation-requests"] });
    };

    const intervalId = window.setInterval(tick, pollingIntervalMs);
    return () => window.clearInterval(intervalId);
  }, [enabled, pollingActive, pollingIntervalMs, queryClient]);

  // Khi unmount toàn app (vd. user logout) FE useUserStore.logout đã gọi
  // disconnectEcho. Hook không tự disconnect để các component khác cũng
  // tận dụng cùng socket.
  useEffect(() => {
    return () => {
      // no-op: giữ socket cho các subscriber khác
      void disconnectEcho;
    };
  }, []);

  return {
    status,
    isPolling: pollingActive,
  } as const;
};

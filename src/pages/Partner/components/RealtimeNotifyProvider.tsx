import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useBookingsRealtime, type BookingEventName, type RealtimeBookingPayload, type RealtimeCancellationRequestPayload } from "@/hooks/Partner/useBookingsRealtime";
import { ROUTERS } from "@/constant";

/**
 * Provider lắp 1 lần ở Partner layout.
 * Trách nhiệm:
 *   - Subscribe channel partner (qua useBookingsRealtime).
 *   - Hiển thị toast khi có booking mới.
 *   - Hiển thị banner cảnh báo khi mất kết nối WebSocket → polling fallback.
 *
 * Badge trên Header đã có sẵn (NotificationBell). Chỉ cần dispatch event
 * window `partner:realtime-booking` để các consumer khác (vd. Header badge
 * counter) tăng số.
 */
const RealtimeNotifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [bannerVisible, setBannerVisible] = useState<boolean>(false);

  const onEvent = (event: BookingEventName, payload: RealtimeBookingPayload) => {
    const detail = { event, payload };
    window.dispatchEvent(new CustomEvent("partner:realtime-booking", { detail }));

    if (event === "booking.created") {
      toast.success("Có booking mới", {
        description: `Mã booking #${payload.id} vừa được tạo.`,
        action: {
          label: "Xem ngay",
          onClick: () => navigate(`${ROUTERS.PARTNER_BOOKINGS}?status=pending`),
        },
        duration: 8000,
      });
    } else if (event === "booking.confirmed") {
      toast.message("Booking đã xác nhận", {
        description: `Mã booking #${payload.id}.`,
      });
    } else if (event === "booking.cancelled") {
      toast.warning("Booking bị huỷ", {
        description: `Mã booking #${payload.id}.`,
      });
    }
  };

  const { isPolling } = useBookingsRealtime({
    onEvent,
    onCancellationRequestEvent: (p: RealtimeCancellationRequestPayload) => {
      window.dispatchEvent(new CustomEvent("partner:realtime-cancellation-request", { detail: p }));
      if (p.status === "pending") {
        toast.message("Yêu cầu hủy mới", {
          description: `Request #${p.request_id} · Booking #${p.booking_id}`,
          action: {
            label: "Mở inbox",
            onClick: () => navigate(ROUTERS.PARTNER_CANCELLATION_REQUESTS),
          },
          duration: 10_000,
        });
      } else {
        toast.message("Cập nhật yêu cầu hủy", {
          description: `Request #${p.request_id} → ${p.status}`,
          action: {
            label: "Xem inbox",
            onClick: () => navigate(ROUTERS.PARTNER_CANCELLATION_REQUESTS),
          },
          duration: 8000,
        });
      }
    },
  });

  React.useEffect(() => {
    setBannerVisible(isPolling);
  }, [isPolling]);

  return (
    <>
      {bannerVisible && (
        <div className="sticky top-0 z-20 w-full bg-amber-100 px-4 py-2 text-center text-sm text-amber-900 shadow-sm">
          Mất kết nối realtime, hệ thống sẽ tự cập nhật mỗi 30 giây.
        </div>
      )}
      {children}
    </>
  );
};

export default RealtimeNotifyProvider;

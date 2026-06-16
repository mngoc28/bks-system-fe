import { Moon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  BOOKING_DAYS_LABEL,
  BOOKING_NIGHTS_LABEL,
  formatBookingDaysCount,
  formatBookingNightsCount,
} from "@/utils/dateUtils";

type StayDurationMode = "nights" | "calendar_days";

type BookingDaysRowProps = {
  days: number;
  className?: string;
  /** Mặc định đêm — REQ-STAY-003. */
  mode?: StayDurationMode;
};

const resolveDurationLabel = (mode: StayDurationMode): string =>
  mode === "calendar_days" ? BOOKING_DAYS_LABEL : BOOKING_NIGHTS_LABEL;

const formatDurationCount = (count: number, mode: StayDurationMode): string =>
  mode === "calendar_days" ? formatBookingDaysCount(count) : formatBookingNightsCount(count);

/** Hàng đầy đủ: icon + «Tổng số đêm/ngày» (BookingSuccess, MyBookings, …). */
export function BookingDaysRow({ days, className, mode = "nights" }: BookingDaysRowProps) {
  return (
    <p className={cn("flex items-center gap-2 text-sm text-slate-600", className)}>
      <Moon className="size-4 shrink-0 text-sky-500" />
      <span>
        {resolveDurationLabel(mode)}:{" "}
        <span className="font-semibold text-slate-800">{formatDurationCount(days, mode)}</span>
      </span>
    </p>
  );
}

type BookingDaysInlineProps = {
  days: number;
  className?: string;
  mode?: StayDurationMode;
};

/** Dòng gọn trong danh sách (BKS Stay History, …). */
export function BookingDaysInline({ days, className, mode = "nights" }: BookingDaysInlineProps) {
  return (
    <span className={cn("flex items-center gap-1.5 text-[12px] font-medium text-slate-500 sm:text-sm", className)}>
      <Moon className="size-3 shrink-0 text-sky-500" />
      <span>
        {resolveDurationLabel(mode)}:{" "}
        <span className="font-bold text-slate-600">{formatDurationCount(days, mode)}</span>
      </span>
    </span>
  );
}

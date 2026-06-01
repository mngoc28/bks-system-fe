import { Moon } from "lucide-react";

import { cn } from "@/lib/utils";
import { BOOKING_DAYS_LABEL, formatBookingDaysCount } from "@/utils/dateUtils";

type BookingDaysRowProps = {
  days: number;
  className?: string;
};

/** Hàng đầy đủ: icon + «Tổng số ngày đặt: X ngày» (BookingSuccess, MyBookings, …). */
export function BookingDaysRow({ days, className }: BookingDaysRowProps) {
  return (
    <p className={cn("flex items-center gap-2 text-sm text-slate-600", className)}>
      <Moon className="size-4 shrink-0 text-sky-500" />
      <span>
        {BOOKING_DAYS_LABEL}:{" "}
        <span className="font-semibold text-slate-800">{formatBookingDaysCount(days)}</span>
      </span>
    </p>
  );
}

type BookingDaysInlineProps = {
  days: number;
  className?: string;
};

/** Dòng gọn trong danh sách (BKS Stay History, …). */
export function BookingDaysInline({ days, className }: BookingDaysInlineProps) {
  return (
    <span className={cn("flex items-center gap-1.5 text-[12px] font-medium text-slate-500 sm:text-sm", className)}>
      <Moon className="size-3 shrink-0 text-sky-500" />
      <span>
        {BOOKING_DAYS_LABEL}:{" "}
        <span className="font-bold text-slate-600">{formatBookingDaysCount(days)}</span>
      </span>
    </span>
  );
}

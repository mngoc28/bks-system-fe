import { t } from "i18next";

export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD" | "DD MMM YYYY" | "DD-MM-YYYY";

export const formatDate = (date: string | Date, format: DateFormat = "DD/MM/YYYY"): string => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "";
  }

  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  switch (format) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD-MM-YYYY":
      return `${day}-${month}-${year}`;
    case "DD MMM YYYY":
      return `${day} ${monthNames[d.getMonth()]} ${year}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

export const useDateFormatter = () => {
  return {
    formatDate: (date: string | Date, format: DateFormat = "DD/MM/YYYY") => formatDate(date, format),
  };
};

// Vietnam timezone aware formatters (Asia/Ho_Chi_Minh)
export const formatDateVietnam = (date: string | Date): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (type: string) => fmt.find((p) => p.type === type)?.value || "";
  return `${get("day")}-${get("month")}-${get("year")}`;
};

export const formatDateTimeVietnam = (date: string | Date): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => fmt.find((p) => p.type === type)?.value || "";
  return `${get("day")}-${get("month")}-${get("year")}, ${get("hour")}:${get("minute")}:${get("second")}`;
};

// Strict ISO (YYYY-MM-DD) -> VN (DD-MM-YYYY) without timezone shifting
export const formatDateVietnamFromISO = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(iso);
  if (!m) return formatDateVietnam(iso);
  const [, y, mo, d] = m;
  return `${d}-${mo}-${y}`;
};

// VN (DD-MM-YYYY) -> ISO (YYYY-MM-DD). Returns null if invalid.
export const parseVietnamDateToISO = (vn: string | null | undefined): string | null => {
  if (!vn) return null;
  const m = /^\s*([0-9]{2})-([0-9]{2})-([0-9]{4})\s*$/.exec(vn);
  if (!m) return null;
  const [, d, mo, y] = m;
  const day = Number(d),
    month = Number(mo);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${y}-${mo}-${d}`;
};

export const mapDayOfWeek = (dayOfWeek: number) => {
  switch (dayOfWeek) {
    case 2:
      return t("days.monday");
    case 3:
      return t("days.tuesday");
    case 4:
      return t("days.wednesday");
    case 5:
      return t("days.thursday");
    case 6:
      return t("days.friday");
    case 7:
      return t("days.saturday");
    default:
      return t("days.sunday");
  }
};

/** Nhãn hiển thị — ngắn hạn dùng đêm (REQ-STAY-003). */
export const BOOKING_NIGHTS_LABEL = "Tổng số đêm";

/** Prorate gói tháng. */
export const BOOKING_DAYS_LABEL = "Tổng số ngày đặt";

const diffCalendarDaysUtc = (
  startDate: string | undefined | null,
  endDate: string | undefined | null,
): number => {
  if (!startDate || !endDate) {
    return 0;
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }
  const d0 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const d1 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  return Math.round((d1 - d0) / 86_400_000);
};

/**
 * Số đêm lưu trú (checkout exclusive) — REQ-STAY-002, khớp BE countStayNights.
 */
export function countBookingNights(
  startDate: string | undefined | null,
  endDate: string | undefined | null,
): number {
  const diff = diffCalendarDaysUtc(startDate, endDate);

  return diff > 0 ? diff : 1;
}

/**
 * Số ngày lịch inclusive — prorate gói tháng.
 */
export function countBookingDaysInclusive(
  startDate: string | undefined | null,
  endDate: string | undefined | null,
): number {
  const nights = countBookingNights(startDate, endDate);
  const diff = diffCalendarDaysUtc(startDate, endDate);

  return diff > 0 ? nights + 1 : 1;
}

export function formatBookingNightsCount(nights: number): string {
  return `${nights} đêm`;
}

export function formatBookingDaysCount(days: number): string {
  return `${days} ngày`;
}

/** Nhãn dòng phí phòng trong bảng tạm tính / email xác nhận. */
export function formatRoomRentalLineLabel(duration: number, unit?: string | null): string {
  const normalized = (unit ?? "day").toLowerCase();
  if (normalized === "month") {
    return `Phí thuê phòng (${duration} ngày · gói tháng)`;
  }

  return `Phí thuê phòng (${duration} đêm)`;
}

export const safeFormatDateTime = (date: string | Date | undefined): string => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const seconds = d.getSeconds().toString().padStart(2, "0");
  return `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;
};

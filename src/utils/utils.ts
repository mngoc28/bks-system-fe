import React from "react";

// Status color mapping for booking status
export const statusColor: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-primary/10 text-primary",
  cancelled: "bg-red-50 text-red-700",
  completed: "bg-green-50 text-green-700",
};

/**
 * Map news status number to string and color.
 * @param status number
 * @returns {status: string, color: string}
 */
export function statusNews(status: number): { status: string, color: string } {
  switch (status) {
    case 0: return { status: "news.status_draft", color: "bg-yellow-50 text-yellow-700" };
    case 1: return { status: "news.status_published", color: "bg-primary/10 text-primary" };
    case 2: return { status: "news.status_archived", color: "bg-red-50 text-red-700" };
    default: return { status: "news.status_draft", color: "bg-yellow-50 text-yellow-700" };
  }
}

/**
 * Map booking status number from API to string.
 * @param status number
 * @returns "pending" | "confirmed" | "cancelled" | "completed"
 */
export function mapBookingStatus(status: number): "pending" | "confirmed" | "cancelled" | "completed" {
  switch (status) {
    case 0: return "pending";
    case 1: return "confirmed";
    case 2: return "cancelled";
    case 3: return "completed";
    default: return "pending";
  }
}

/**
 * Map booking status string to number for API.
 * @param status "pending" | "confirmed" | "cancelled" | "completed"
 * @returns number
 */
export function mapStatusToNumber(status: string): number {
  switch (status) {
    case "pending": return 0;
    case "confirmed": return 1;
    case "cancelled": return 2;
    case "completed": return 3;
    default: return 0;
  }
}

/**
 * Format a price value as Vietnamese currency (VND).
 * @param v number | string | null | undefined
 * @returns string
 */
export function formatPrice(v?: number | string | null): string {
  if (v == null) return "-";
  const n = typeof v === "number" ? v : parseFloat(v);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
}

/**
 * Map user status number to translation key.
 * @param status 0 | 1 | 2 | "0" | "1" | "2"
 * @returns "pending" | "active" | "blocked"
 */
export function statusNumberToText(status?: number | string): string {
  const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
  switch (statusNum) {
    case 0:
      return "pending";
    case 1:
      return "active";
    case 2:
      return "blocked";
    default:
      return "pending";
  }
}

/**
 * Map user status text to number.
 * @param status
 * @returns number
 */
export function statusTextToNumber(status: string): number {
  switch (status) {
    case "Đang chờ":
      return 0;
    case "Hoạt động":
      return 1;
    case "Đã khóa":
      return 2;
    default:
      return 0;
  }
}

/**
 * Get CSS class for user status.
 * @param status
 * @returns
 */
export function getStatusClass(status?: number | string) {
  const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
  switch (statusNum) {
    case 0:
      return "bg-yellow-50 text-yellow-700";
    case 1:
      return "bg-green-50 text-green-700";
    case 2:
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

// Helper function to format Date to datetime-local format (YYYY-MM-DDTHH:mm)
export const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Format currency input value with thousand separators (dots).
 * Example: "1000000" -> "1.000.000"
 * @param val string value from input field (raw digits)
 * @returns formatted string with thousand separators
 */
export { formatCurrencyInput, parseCurrencyValue } from "@/utils/currencyUtils";

/**
 * Validate and clean currency input value by removing separators.
 * @param value string value from input change event (may contain dots)
 * @returns cleaned string (digits only) or null if invalid
 */
export function validateCurrencyInput(value: string): string | null {
  // Remove all dots (separators)
  const cleaned = value.replace(/\./g, '');
  // Check if it's numeric
  if (cleaned === '' || /^\d*$/.test(cleaned)) {
    return cleaned;
  }
  return null;
};

/**
 * Highlight search text within a given string.
 * @param text
 * @param search
 * @returns
 */
export function highlightText(text: string, search: string): React.ReactNode {
  if (!search) return text;
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedSearch})`, "gi");
  return text.split(regex).map((part, i) =>
    part.toLowerCase() === search.toLowerCase()
      ? React.createElement('span', { key: i, style: { background: '#ffe066', fontWeight: 600 } }, part)
      : part
  );
}

// status news array
export const statusNewsArray = [
  { value: 0, label: "news.status_draft" },
  { value: 1, label: "news.status_published" },
  { value: 2, label: "news.status_archived" },
];

// image partner edit

export function appendImageField(formData: FormData, key: string, value?: File | 'delete' | null) {
  if (value instanceof File) {
    formData.append(key, value);
  } else if (value === 'delete') {
    formData.append(key, 'delete');
  }
}

/**
 * Format a phone number to standard "0987 654 321" or "+84 987 654 321" format.
 * @param phone string
 * @returns string
 */
export function formatPhoneNumber(phone?: string | null): string {
  if (!phone) return "-";
  const cleaned = phone.replace(/\D/g, ""); // remove non-digits

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  } else if (cleaned.length === 11 && cleaned.startsWith("84")) {
    return `+84 ${cleaned.slice(2).replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}`;
  } else if (cleaned.length > 0) {
    return phone;
  }
  return "-";
}

/**
 * Formats a province/city name into a standardized display label.
 * Handles raw DB names that may or may not include admin prefixes
 * like "Thành phố", "Tỉnh", "TP." — output is always consistent.
 *
 * Rules:
 *  - 5 centrally-administered municipalities (Hà Nội, HCM, Đà Nẵng, Hải Phòng, Cần Thơ)
 *    → shown as "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", etc. (no redundant prefix)
 *  - Remaining provinces → shown without any prefix (just the bare name)
 * @param name string
 * @returns string
 */
export function formatProvinceName(name?: string | null): string {
  if (!name) return "";

  // Strip any existing admin prefix the DB may have stored
  const stripped = name
    .trim()
    .replace(/^(thành\s*phố|tỉnh|tp\.?\s*)/i, "")
    .trim();

  const lower = stripped.toLowerCase();

  // Special display label for centrally-administered municipalities
  if (lower === "hồ chí minh") return "TP. Hồ Chí Minh";
  if (lower === "hà nội") return "Hà Nội";
  if (lower === "đà nẵng") return "Đà Nẵng";
  if (lower === "hải phòng") return "Hải Phòng";
  if (lower === "cần thơ") return "Cần Thơ";

  // All other provinces: just return bare name
  return stripped;
}

const PROVINCE_EN_LABELS: Record<string, string> = {
  ho_chi_minh: "Ho Chi Minh City",
  ha_noi: "Hanoi",
  da_nang: "Da Nang",
  hai_phong: "Hai Phong",
  can_tho: "Can Tho",
  hue: "Hue",
  khanh_hoa: "Khanh Hoa",
  quang_ninh: "Quang Ninh",
  lam_dong: "Lam Dong",
};

export function formatProvinceSlugLabel(slug?: string | null): string {
  if (!slug) return "";

  const normalized = slug.trim().toLowerCase().replace(/-/g, "_");
  if (PROVINCE_EN_LABELS[normalized]) {
    return PROVINCE_EN_LABELS[normalized];
  }

  return normalized
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getProvinceDisplayName(
  province: { name: string; name_en?: string | null },
  locale?: string,
): string {
  if (locale?.startsWith("en") && province.name_en) {
    return formatProvinceSlugLabel(province.name_en);
  }

  return formatProvinceName(province.name);
}

/**
 * Simplify a detailed address to show only district/ward and province/city.
 * Example: "Số 11 Hoàng Quốc Việt, Phường Nghĩa Đô, Quận Cầu Giấy, Hà Nội" -> "Quận Cầu Giấy, Hà Nội"
 * @param address string
 * @returns string
 */
export function simplifyAddress(address?: string | null): string {
  if (!address) return "Đang cập nhật";
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return parts.slice(-2).join(", ");
  }
  return address;
}
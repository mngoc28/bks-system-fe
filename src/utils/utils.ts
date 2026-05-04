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
export function statusNews(status: number): {status: string, color: string} {
  switch (status) {
    case 0: return {status: "news.status_draft", color: "bg-yellow-50 text-yellow-700"};
    case 1: return {status: "news.status_published", color: "bg-primary/10 text-primary"};
    case 2: return {status: "news.status_archived", color: "bg-red-50 text-red-700"};
    default: return {status: "news.status_draft", color: "bg-yellow-50 text-yellow-700"};
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
export function formatCurrencyInput(val: string | number | undefined | null): string {
  if (val === undefined || val === null || val === '') return '';
  const stringValue = val.toString().replace(/\D/g, '');
  if (!stringValue) return '';
  return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

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
 * Parse formatted currency string (with dots) to raw number.
 * Example: "1.000.000" -> 1000000
 * @param formattedValue string with separators
 * @returns number
 */
export function parseCurrencyValue(formattedValue: string | undefined | null): number {
  if (!formattedValue) return 0;
  const cleaned = formattedValue.toString().replace(/\D/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

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
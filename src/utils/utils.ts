import React from "react";

// Status color mapping for booking status
export const statusColor: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
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
    case 1: return {status: "news.status_published", color: "bg-blue-50 text-blue-700"};
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
 * Format currency input value with thousand separators.
 * @param val string value from input field
 * @returns formatted string with thousand separators
 */
export function formatCurrencyInput(val: string): string {
  if (!val || val === '') return '';
  const num = parseFloat(val);
  return isNaN(num) ? val : num.toLocaleString('en-US');
}

/**
 * Validate and clean currency input value.
 * @param value string value from input change event
 * @returns cleaned string or empty string if invalid
 */
export function validateCurrencyInput(value: string): string | null {
  const cleaned = value.replace(/,/g, '');
  if (cleaned === '' || /^\d*\.?\d*$/.test(cleaned)) {
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
  const regex = new RegExp(`(${search})`, "gi");
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
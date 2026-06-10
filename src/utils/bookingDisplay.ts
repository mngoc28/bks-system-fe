export type BookingUiStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type AdminBookingDisplayKey =
  | "pending"
  | "confirmed"
  | "in_stay"
  | "checked_out"
  | "no_show"
  | "cancelled"
  | "completed";

/**
 * Combined booking status + stay_status label key for admin i18n (`bookings.display.*`).
 */
export function getAdminBookingDisplayKey(
  status: BookingUiStatus,
  stayStatus?: string | null,
): AdminBookingDisplayKey {
  if (status === "pending") {
    return "pending";
  }
  if (status === "cancelled") {
    return "cancelled";
  }
  if (status === "completed") {
    return "completed";
  }
  if (stayStatus === "checked_in") {
    return "in_stay";
  }
  if (stayStatus === "checked_out") {
    return "checked_out";
  }
  if (stayStatus === "no_show") {
    return "no_show";
  }

  return "confirmed";
}

export function getAdminBookingBadgeClass(
  status: BookingUiStatus,
  stayStatus?: string | null,
): string {
  const key = getAdminBookingDisplayKey(status, stayStatus);
  switch (key) {
    case "pending":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
    case "confirmed":
      return "border-green-200 bg-green-50 text-green-700";
    case "in_stay":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "checked_out":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "no_show":
      return "border-red-200 bg-red-50 text-red-700";
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";
    case "completed":
      return "border-slate-200 bg-slate-50 text-slate-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export function getAdminBookingCardColor(
  status: BookingUiStatus,
  stayStatus?: string | null,
): string {
  const key = getAdminBookingDisplayKey(status, stayStatus);
  switch (key) {
    case "pending":
      return "bg-amber-500";
    case "confirmed":
      return "bg-blue-500";
    case "in_stay":
      return "bg-violet-500";
    case "checked_out":
      return "bg-sky-500";
    case "no_show":
      return "bg-rose-500";
    case "cancelled":
      return "bg-rose-500";
    case "completed":
      return "bg-emerald-500";
    default:
      return "bg-slate-500";
  }
}

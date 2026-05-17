import stayService from "@/services/stayService";
import { PUBLIC_MY_BOOKINGS_STORAGE_KEY } from "@/constant";
import { getAccessToken } from "@/utils/storage";
import { computeStayBookingFingerprint } from "@/utils/bookingFingerprint";
import type { LocalPublicBookingRow } from "@/dataHelper/EU/booking.dataHelper";

export function getPendingLocalBookingsCount(): number {
  if (typeof window === "undefined") {
    return 0;
  }
  return readRows().length;
}

function readRows(): LocalPublicBookingRow[] {
  try {
    const raw = window.localStorage.getItem(PUBLIC_MY_BOOKINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as LocalPublicBookingRow[]) : [];
  } catch {
    return [];
  }
}

/**
 * Gửi đơn cục bộ lên `POST /api/v1/stay/bookings/sync-local` khi đã có JWT.
 * Trả về true nếu không còn pending hoặc sync thành công.
 */
export async function flushPendingLocalBookingsToServer(): Promise<boolean> {
  if (typeof window === "undefined" || !getAccessToken()) {
    return false;
  }

  const rows = readRows();
  if (rows.length === 0) {
    return true;
  }

  const items: Array<{
    local_id: string;
    fingerprint: string;
    room_id: number;
    start_date: string;
    end_date: string;
    email: string;
    price_id?: number;
  }> = [];

  for (const row of rows) {
    if (!row.local_id || !row.room_id || !row.start_date || !row.end_date || !row.email) {
      continue;
    }
    const fingerprint = await computeStayBookingFingerprint(
      row.room_id,
      row.start_date,
      row.end_date,
      row.email,
    );
    items.push({
      local_id: row.local_id,
      fingerprint,
      room_id: row.room_id,
      start_date: row.start_date,
      end_date: row.end_date,
      email: row.email.trim().toLowerCase(),
      ...(row.price_id != null && row.price_id > 0 ? { price_id: row.price_id } : {}),
    });
  }

  if (items.length === 0) {
    window.localStorage.removeItem(PUBLIC_MY_BOOKINGS_STORAGE_KEY);
    return true;
  }

  const res = (await stayService.syncLocalBookings({ items })) as unknown as {
    status?: string;
    message?: string;
  };

  if (res?.status === "success") {
    window.localStorage.removeItem(PUBLIC_MY_BOOKINGS_STORAGE_KEY);
    return true;
  }

  return false;
}

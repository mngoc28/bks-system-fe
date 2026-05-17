/**
 * SHA-256 hex (64 chars), same formula as BE `LocalBookingSyncService`:
 * `room_id|YYYY-MM-DD|YYYY-MM-DD|normalized_email`
 */
export async function computeStayBookingFingerprint(
  roomId: number,
  startDateYmd: string,
  endDateYmd: string,
  email: string,
): Promise<string> {
  const normEmail = email.trim().toLowerCase();
  const s = startDateYmd.length >= 10 ? startDateYmd.slice(0, 10) : startDateYmd;
  const e = endDateYmd.length >= 10 ? endDateYmd.slice(0, 10) : endDateYmd;
  const raw = `${roomId}|${s}|${e}|${normEmail}`;
  const enc = new TextEncoder().encode(raw);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

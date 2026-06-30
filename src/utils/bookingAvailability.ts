/**
 * Kiểm tra xung đột ngày đã đặt/khóa với khoảng lưu trú [checkIn, checkOut).
 * checkOut là ngày trả phòng (exclusive) — khớp quy tắc BE ConflictChecker.
 */
export const hasBookedDateOverlap = (
  checkIn: string,
  checkOut: string,
  bookedDates: string[],
): boolean => {
  if (!checkIn || !checkOut || bookedDates.length === 0) {
    return false;
  }

  return bookedDates.some(
    (dateStr) => dateStr >= checkIn && dateStr < checkOut,
  );
};

export interface StayRange {
  checkIn: string;
  checkOut: string;
}

const parseYmd = (ymd: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    return null;
  }
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const formatYmd = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const addDaysToYmd = (ymd: string, days: number): string => {
  const date = parseYmd(ymd);
  if (!date) {
    return ymd;
  }
  date.setDate(date.getDate() + days);
  return formatYmd(date);
};

/**
 * Tìm khoảng lưu trú liên tiếp đủ durationDays đêm, không trùng bookedDates.
 * checkOut trả về là exclusive (ngày trả phòng).
 */
export const findNextAvailableStayRange = (
  durationDays: number,
  bookedDates: string[],
  searchFrom: string,
  maxSearchDays = 365,
): StayRange | null => {
  if (!searchFrom || durationDays <= 0) {
    return null;
  }

  const maxSearchEnd = addDaysToYmd(searchFrom, maxSearchDays);
  let candidateStart = searchFrom;

  while (candidateStart < maxSearchEnd) {
    const candidateEnd = addDaysToYmd(candidateStart, durationDays);

    if (!hasBookedDateOverlap(candidateStart, candidateEnd, bookedDates)) {
      return { checkIn: candidateStart, checkOut: candidateEnd };
    }

    const firstConflict = bookedDates
      .filter((dateStr) => dateStr >= candidateStart && dateStr < candidateEnd)
      .sort()[0];

    if (!firstConflict) {
      return null;
    }

    candidateStart = addDaysToYmd(firstConflict, 1);
  }

  return null;
};

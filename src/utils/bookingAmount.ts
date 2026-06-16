import { countBookingDaysInclusive, countBookingNights } from "@/utils/dateUtils";

export const DAYS_PER_MONTH = 30;
export const DAYS_PER_WEEK = 7;
export const DAYS_PER_YEAR = 365;

/** Khớp seeder / BE: >= 30 ngày ưu tiên gói tháng. */
export const LONG_STAY_DAYS_THRESHOLD = 30;

export type BookingPriceInput = {
  price?: number | null;
  unit?: string | null;
};

export type BookingAmountInput = {
  start_date: string;
  end_date: string;
  price?: BookingPriceInput | null;
  services?: Array<{ price?: number | null }> | null;
  /** Khi API trả sẵn (sau khi BE tính đúng theo unit). */
  total_amount?: number | null;
};

/** Tiền phòng theo đơn vị gói giá (day/week/month/year), khớp BE. */
export function computeBookingRoomStayTotal(
  input: Pick<BookingAmountInput, "start_date" | "end_date" | "price">,
): number {
  const unitPrice = Number(input.price?.price ?? 0);
  if (unitPrice <= 0) {
    return 0;
  }

  const unit = (input.price?.unit ?? "night").toLowerCase();
  const nights = countBookingNights(input.start_date, input.end_date);
  const calendarDays = countBookingDaysInclusive(input.start_date, input.end_date);

  let total: number;
  switch (unit) {
    case "month":
      total = unitPrice * (calendarDays / DAYS_PER_MONTH);
      break;
    case "week":
      total = unitPrice * (nights / DAYS_PER_WEEK);
      break;
    case "year":
      total = unitPrice * (nights / DAYS_PER_YEAR);
      break;
    default:
      total = unitPrice * nights;
  }

  return Math.round(total);
}

export function computeBookingServicesTotal(services?: Array<{ price?: number | null }> | null): number {
  return (services ?? []).reduce((sum, service) => sum + Number(service.price ?? 0), 0);
}

/** Tổng tạm tính / thanh toán: phòng + dịch vụ. */
export function computeBookingTotalAmount(input: BookingAmountInput): number {
  if (input.price?.price != null && Number(input.price.price) > 0) {
    return computeBookingRoomStayTotal(input) + computeBookingServicesTotal(input.services);
  }

  const fromApi = input.total_amount;
  if (fromApi != null && Number(fromApi) > 0) {
    return Number(fromApi);
  }

  return computeBookingRoomStayTotal(input) + computeBookingServicesTotal(input.services);
}

export type RoomPriceRow = {
  unit: string;
  price: number;
  deposit_amount?: number;
  minimum_stay?: number;
};

export function parseRoomPrices(allPrices: string | unknown): RoomPriceRow[] {
  if (!allPrices) {
    return [];
  }
  try {
    const parsed = typeof allPrices === "string" ? JSON.parse(allPrices) : allPrices;

    return Array.isArray(parsed) ? (parsed as RoomPriceRow[]) : [];
  } catch {
    return [];
  }
}

function filterPriceRowsForStayDuration(rows: RoomPriceRow[], stayNights: number): RoomPriceRow[] {
  const isLongStay = stayNights >= LONG_STAY_DAYS_THRESHOLD;

  if (!isLongStay) {
    const dayRows = rows.filter((row) => (row.unit ?? "night").toLowerCase() === "night");

    return dayRows.length > 0 ? dayRows : rows;
  }

  const monthRows = rows.filter((row) => (row.unit ?? "").toLowerCase() === "month");
  if (monthRows.length > 0) {
    return monthRows;
  }

  return rows.filter((row) => (row.unit ?? "night").toLowerCase() === "night");
}

/** Gói giá cố định theo unit — đơn giá không phụ thuộc số ngày đã chọn. */
function pickCanonicalPriceRow(rows: RoomPriceRow[], days: number): RoomPriceRow | null {
  const eligible = filterPriceRowsForStayDuration(rows, days);

  return eligible.find((row) => Number(row.price ?? 0) > 0) ?? null;
}

/**
 * Giá gói ngắn hạn mặc định để hiển thị trước khi chọn ngày (khớp thẻ "Thuê ngắn hạn" ở Room Detail).
 * Không dùng cheapest_daily_price vì field đó là min(giá đêm, giá tháng/30).
 */
export function getPrimaryDayPackagePrice(
  allPrices: string | unknown,
  cheapestDailyPrice?: number | null,
): { price: number; unit: string } {
  const rows = parseRoomPrices(allPrices);
  const dayRow = rows.find((row) => (row.unit ?? "").toLowerCase() === "night");

  if (dayRow && Number(dayRow.price) > 0) {
    return { price: Number(dayRow.price), unit: "night" };
  }

  return {
    price: Number(cheapestDailyPrice ?? 0),
    unit: "night",
  };
}

/**
 * Chọn một gói giá theo thời lượng; đơn giá = price trên room_prices (cố định), tổng = prorate theo ngày.
 * Khớp ResolvesBookingPriceId (BE seed) và BookingStayAmountCalculator.
 */
export function resolveStayPriceQuote(
  startDate: string,
  endDate: string,
  options: {
    allPrices?: string | unknown;
    cheapestDailyPrice?: number | null;
  },
): { price: number; unit: string; roomStayTotal: number; days: number; nights: number } {
  const nights = countBookingNights(startDate, endDate);
  const calendarDays = countBookingDaysInclusive(startDate, endDate);
  const rows = parseRoomPrices(options.allPrices);

  if (rows.length === 0) {
    const daily = Number(options.cheapestDailyPrice ?? 0);

    return {
      price: daily,
      unit: "night",
      roomStayTotal: Math.round(daily * nights),
      days: nights,
      nights,
    };
  }

  const row = pickCanonicalPriceRow(rows, nights);

  if (row === null) {
    const daily = Number(options.cheapestDailyPrice ?? 0);

    return {
      price: daily,
      unit: "night",
      roomStayTotal: Math.round(daily * nights),
      days: nights,
      nights,
    };
  }

  const unitPrice = Number(row.price);
  const roomStayTotal = computeBookingRoomStayTotal({
    start_date: startDate,
    end_date: endDate,
    price: { price: unitPrice, unit: row.unit },
  });
  const displayDuration =
    (row.unit ?? "night").toLowerCase() === "month" ? calendarDays : nights;

  return {
    price: unitPrice,
    unit: row.unit,
    roomStayTotal,
    days: displayDuration,
    nights,
  };
}

/** Nhãn đơn vị gói giá cho hiển thị. */
export function formatPriceUnitLabel(unit?: string | null): string {
  switch ((unit ?? "night").toLowerCase()) {
    case "month":
      return "tháng";
    case "week":
      return "tuần";
    case "year":
      return "năm";
    case "night":
    default:
      return "đêm";
  }
}

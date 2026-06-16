import { isApartmentSegmentPropertyType } from "@/utils/stayPropertyType";

import { LONG_STAY_DAYS_THRESHOLD } from "@/utils/bookingAmount";

export type StaySegment = "short_term" | "long_term_lease";

/** Khớp PropertyTypesSeeder — không hard-code sai id trong UI. */
const PROPERTY_TYPE_ID_SLUG: Record<number, string> = {
  1: "khach-san-hotel",
  2: "nha-nghi-guesthouse",
  3: "can-ho-dich-vu-theo-phong",
  4: "homestay-co-chia-phong",
};

const HOTEL_GUESTHOUSE_SLUGS = new Set(["khach-san-hotel", "nha-nghi-guesthouse"]);

export const resolvePropertyTypeSlug = (input: {
  propertyTypeId?: number | null;
  propertyTypeName?: string | null;
}): string => {
  if (input.propertyTypeId != null && PROPERTY_TYPE_ID_SLUG[input.propertyTypeId]) {
    return PROPERTY_TYPE_ID_SLUG[input.propertyTypeId];
  }

  const name = (input.propertyTypeName ?? "").toLowerCase();
  if (name.includes("nhà nghỉ") || name.includes("guesthouse")) {
    return "nha-nghi-guesthouse";
  }
  if (name.includes("khách sạn") || name.includes("hotel")) {
    return "khach-san-hotel";
  }
  if (name.includes("homestay")) {
    return "homestay-co-chia-phong";
  }
  if (isApartmentSegmentPropertyType(input.propertyTypeName)) {
    return "can-ho-dich-vu-theo-phong";
  }

  return "";
};

/**
 * REQ-STAY-001 — phân loại ngắn hạn / lease thống nhất Public Booking.
 */
export const resolveStayClassification = (input: {
  propertyTypeId?: number | null;
  propertyTypeName?: string | null;
  stayNights: number;
  priceUnit?: string | null;
}): StaySegment => {
  const slug = resolvePropertyTypeSlug(input);
  const unit = (input.priceUnit ?? "night").toLowerCase();
  const nights = Math.max(1, input.stayNights);

  if (HOTEL_GUESTHOUSE_SLUGS.has(slug)) {
    return "short_term";
  }

  if (slug === "homestay-co-chia-phong") {
    return nights >= LONG_STAY_DAYS_THRESHOLD ? "long_term_lease" : "short_term";
  }

  if (slug === "can-ho-dich-vu-theo-phong" || isApartmentSegmentPropertyType(input.propertyTypeName)) {
    if (nights >= LONG_STAY_DAYS_THRESHOLD || unit === "month") {
      return "long_term_lease";
    }

    return "short_term";
  }

  if (
    (input.propertyTypeName ?? "").toLowerCase().includes("homestay")
  ) {
    return nights >= LONG_STAY_DAYS_THRESHOLD ? "long_term_lease" : "short_term";
  }

  return "short_term";
};

export const isLongTermLeaseBooking = (input: Parameters<typeof resolveStayClassification>[0]): boolean =>
  resolveStayClassification(input) === "long_term_lease";

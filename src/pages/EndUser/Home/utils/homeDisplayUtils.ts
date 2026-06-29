import type { TFunction } from "i18next";
import { formatPrice } from "@/utils/utils";

export type RoomRentDisplay = {
  priceLabel: string;
  rent_type: "daily" | "monthly" | undefined;
  has_nightly_price: boolean;
  has_monthly_price: boolean;
};

export type RoomCardPriceFields = {
  cheapest_nightly_price?: number | null;
  cheapest_monthly_price?: number | null;
};

const hasPositivePrice = (price: number | null | undefined): boolean =>
  price !== null && price !== undefined && Number(price) > 0;

/**
 * Resolves card price label and rent metadata for homepage room listings.
 * Uses only real nightly (`unit = night`) prices — not `cheapest_daily_price`,
 * which may be derived from monthly/30 for long-term-only rooms.
 */
export const resolveRoomRentDisplay = (
  t: TFunction,
  nightlyPrice: number | null | undefined,
  monthlyPrice: number | null | undefined,
): RoomRentDisplay => {
  const hasMonthlyPrice = hasPositivePrice(monthlyPrice);
  const hasNightlyPrice = hasPositivePrice(nightlyPrice);

  if (hasNightlyPrice) {
    return {
      priceLabel: `${formatPrice(nightlyPrice)} ${t("public.home.rooms.perNight")}`,
      rent_type: "daily",
      has_nightly_price: true,
      has_monthly_price: hasMonthlyPrice,
    };
  }

  if (hasMonthlyPrice) {
    return {
      priceLabel: `${formatPrice(monthlyPrice)} ${t("public.home.rooms.perMonth")}`,
      rent_type: "monthly",
      has_nightly_price: false,
      has_monthly_price: true,
    };
  }

  return {
    priceLabel: t("common.contact"),
    rent_type: undefined,
    has_nightly_price: false,
    has_monthly_price: false,
  };
};

export const resolveRoomRentDisplayFromCard = (
  t: TFunction,
  room: RoomCardPriceFields,
): RoomRentDisplay =>
  resolveRoomRentDisplay(t, room.cheapest_nightly_price, room.cheapest_monthly_price);

export const buildRoomPriceLabel = (
  t: TFunction,
  nightlyPrice: number | null | undefined,
  monthlyPrice: number | null | undefined,
): string => resolveRoomRentDisplay(t, nightlyPrice, monthlyPrice).priceLabel;

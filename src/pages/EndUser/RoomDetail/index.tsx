import { useMemo, useState, useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Users, Ruler, CalendarDays, ArrowLeft, FileText, CreditCard, Zap, Droplets, Info, Star, Building2, Phone, Mail, UserCheck, Plus, RotateCcw, BedDouble, Shield, PawPrint, Cigarette, PartyPopper, Volume2, LockKeyhole, Package, Accessibility, Home } from "lucide-react";
import { useRoomReviewsQuery } from "@/hooks/useReviewQuery";
import { resolveCloudinaryUrl } from "@/utils/imageUtils";
import { getRoomFallbackImage } from "@/utils/fallbackImages";

import { roomApi } from "@/api/EU/roomApi";
import Breadcrumb from "@/components/common/Breadcrumb";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePickerField } from "@/components/ui/date-picker-field";
import ImageLightbox from "@/components/ui/image-lightbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { Matcher } from "react-day-picker";
import { ReviewsModal } from "@/components/rooms/ReviewsModal";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS } from "@/constant";
import { normalizeStayPropertyTypeLabel, supportsElectronicContractByPropertyType, isApartmentSegmentPropertyType } from "@/utils/stayPropertyType";
import { formatPrice, formatPhoneNumber } from "@/utils/utils";
import { countBookingNights } from "@/utils/dateUtils";
import { RoomTouristSpotsSection } from "@/components/rooms/RoomTouristSpotsSection";
import { BOOKED_DATES_QUERY_OPTIONS, PUBLIC_DETAIL_QUERY_OPTIONS } from "@/lib/queryCache";

function parseYmdToLocalDate(value: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}

function formatTimeLabel(value: unknown): string {
  if (value == null || value === "") {
    return "";
  }
  const str = String(value).trim();
  const timeMatch = str.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    return `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
  }
  return str;
}

const PublicRoomDetail = () => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language.startsWith("vi");
  const isMobileViewport = useMediaQuery("(max-width: 767px)");
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const id = Number(roomId || 0);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showAllServices, setShowAllServices] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const { data: room, isLoading, isError } = useQuery({
    queryKey: ["public-room-detail", id],
    queryFn: async () => {
      const response = await roomApi.getRoomDetail(id);
      return response.data;
    },
    enabled: !!id,
    ...PUBLIC_DETAIL_QUERY_OPTIONS,
  });

  // Fetch booked dates list
  const { data: bookedDatesResponse } = useQuery({
    queryKey: ["room-booked-dates", id],
    queryFn: async () => {
      const response = await roomApi.getBookedDates(id);
      return response.data;
    },
    enabled: !!id,
    ...BOOKED_DATES_QUERY_OPTIONS,
  });
  const bookedDates = bookedDatesResponse || [];

  const checkin = searchParams.get("startDate") || "";
  const checkout = searchParams.get("endDate") || "";

  const handleStartDateChange = (dateStr: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("startDate", dateStr);
    let finalEnd = checkout;
    if (checkout && checkout <= dateStr) {
      newParams.delete("endDate");
      finalEnd = "";
    }
    if (dateStr && finalEnd) {
      const nights = countBookingNights(dateStr, finalEnd);
      newParams.set("rent_type", nights >= 30 ? "monthly" : "daily");
    }
    setSearchParams(newParams);
  };

  const handleEndDateChange = (dateStr: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("endDate", dateStr);
    if (checkin && dateStr) {
      const nights = countBookingNights(checkin, dateStr);
      newParams.set("rent_type", nights >= 30 ? "monthly" : "daily");
    }
    setSearchParams(newParams);
  };

  const selectedRange = useMemo(() => {
    return {
      from: checkin ? new Date(checkin) : undefined,
      to: checkout ? new Date(checkout) : undefined,
    };
  }, [checkin, checkout]);

  const handleRangeSelect = (range: any) => {
    if (!range) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("startDate");
      newParams.delete("endDate");
      setSearchParams(newParams);
      return;
    }

    const { from, to } = range;
    let finalTo = to;
    if (from && to && format(from, 'yyyy-MM-dd') === format(to, 'yyyy-MM-dd')) {
      finalTo = undefined;
    }

    if (from && finalTo && bookedDates.length > 0) {
      const startStr = format(from, 'yyyy-MM-dd');
      const endStr = format(finalTo, 'yyyy-MM-dd');
      const hasConflict = bookedDates.some(dateStr => {
        return dateStr > startStr && dateStr < endStr;
      });

      if (hasConflict) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("startDate", format(finalTo, 'yyyy-MM-dd'));
        newParams.delete("endDate");
        setSearchParams(newParams);
        return;
      }
    }

    const newParams = new URLSearchParams(searchParams);
    if (from) {
      newParams.set("startDate", format(from, 'yyyy-MM-dd'));
    } else {
      newParams.delete("startDate");
    }
    if (finalTo) {
      newParams.set("endDate", format(finalTo, 'yyyy-MM-dd'));
    } else {
      newParams.delete("endDate");
    }

    if (from && finalTo) {
      const startStr = format(from, 'yyyy-MM-dd');
      const endStr = format(finalTo, 'yyyy-MM-dd');
      const nights = countBookingNights(startStr, endStr);
      newParams.set("rent_type", nights >= 30 ? "monthly" : "daily");
    }

    setSearchParams(newParams);
  };

  const handleClearDates = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("startDate");
    newParams.delete("endDate");
    setSearchParams(newParams);
  };

  const scrollToCalendar = () => {
    const el = document.getElementById("booking-calendar-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const inlineCalendarDisabledMatchers = useMemo((): Matcher[] => {
    const matchers: Matcher[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    matchers.push({ before: today });

    if (bookedDates && bookedDates.length > 0) {
      bookedDates.forEach((dStr) => {
        const dObj = parseYmdToLocalDate(dStr);
        if (dObj) {
          matchers.push(dObj);
        }
      });
    }
    return matchers;
  }, [bookedDates]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const DURATION_PRESETS = useMemo(
    () => [
      { label: t("public.roomDetail.preset1Month"), months: 1, days: 30 },
      { label: t("public.roomDetail.preset3Months"), months: 3, days: 90 },
      { label: t("public.roomDetail.preset6Months"), months: 6, days: 180 },
    ] as const,
    [t],
  );

  const handleDurationPreset = (days: number) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = format(tomorrow, "yyyy-MM-dd");

    const end = new Date(tomorrow);
    end.setDate(end.getDate() + days);
    const endStr = format(end, "yyyy-MM-dd");

    const newParams = new URLSearchParams(searchParams);
    newParams.set("startDate", start);
    newParams.set("endDate", endStr);
    newParams.set("rent_type", "monthly");
    setSearchParams(newParams);
  };

  const { data: reviewsData, isLoading: isLoadingReviews } = useRoomReviewsQuery(id, {
    enabled: !!id,
  });

  const roomImages = useMemo(() => {
    if (!room) {
      return [] as string[];
    }

    let rawImages = room.images;
    if (typeof rawImages === 'string') {
      try {
        rawImages = JSON.parse(rawImages);
      } catch {
        rawImages = [];
      }
    }

    const galleryFromImages = Array.isArray(rawImages)
      ? rawImages
        .map((image: any) => image?.image_url)
        .filter(Boolean)
        .map((url: string) => resolveCloudinaryUrl(url, CLOUDINARY_HEADER_IMAGE_URL))
      : [];

    const cover = room.room_image ? resolveCloudinaryUrl(room.room_image, CLOUDINARY_HEADER_IMAGE_URL) : null;

    return Array.from(new Set([cover, ...galleryFromImages].filter(Boolean))) as string[];
  }, [room]);

  const lightboxSlides = useMemo(() => {
    return roomImages.map((src) => ({ src }));
  }, [roomImages]);

  const amenities = useMemo(() => {
    if (!room?.amenities) {
      return [] as string[];
    }

    if (Array.isArray(room.amenities)) {
      return room.amenities
        .map((item: any) => item?.name || item?.toString())
        .filter(Boolean)
        .map((item: string) => item.trim());
    }

    return room.amenities
      .toString()
      .split(",")
      .map((item: string) => item.trim())
      .filter(Boolean);
  }, [room]);

  const services = useMemo(() => {
    if (!room?.services) {
      return [] as Array<{ id: number; name: string; price: string }>;
    }

    try {
      const parsedServices = JSON.parse(room.services);
      if (!Array.isArray(parsedServices)) {
        return [];
      }
      return parsedServices.map((service: any) => ({
        id: service.id,
        name: service.name,
        price: service.price?.toString() || "0",
      }));
    } catch {
      return [];
    }
  }, [room]);

  const allPrices = useMemo(() => {
    if (!room?.all_prices) return [] as any[];
    try {
      return JSON.parse(room.all_prices);
    } catch { return []; }
  }, [room]);

  const utilityFees = useMemo(() => {
    if (!room?.utility_fees) return [] as any[];
    try {
      return JSON.parse(room.utility_fees);
    } catch { return []; }
  }, [room]);

  const hasNightPrice = useMemo(
    () => allPrices.some((p: any) => p.unit === "night"),
    [allPrices],
  );
  const hasMonthPrice = useMemo(
    () => allPrices.some((p: any) => p.unit === "month"),
    [allPrices],
  );

  const isLongTerm = useMemo(
    () => hasMonthPrice && !hasNightPrice,
    [hasMonthPrice, hasNightPrice],
  );

  const selectedNights = useMemo(() => {
    if (checkin && checkout) {
      return countBookingNights(checkin, checkout);
    }
    return null;
  }, [checkin, checkout]);

  const activeUnit = useMemo(() => {
    if (selectedNights !== null) {
      return selectedNights >= 30 ? "month" : "night";
    }

    const rentTypeParam = searchParams.get("rent_type");
    if (rentTypeParam === "monthly" && hasMonthPrice) {
      return "month";
    }
    if (rentTypeParam === "daily" && hasNightPrice) {
      return "night";
    }

    if (allPrices.length === 1) {
      return allPrices[0].unit;
    }

    if (hasNightPrice) {
      return "night";
    }

    if (hasMonthPrice) {
      return "month";
    }

    const isApartment = room?.property_type_name ? isApartmentSegmentPropertyType(room.property_type_name) : false;
    return isApartment ? "month" : "night";
  }, [selectedNights, room, allPrices, searchParams, hasNightPrice, hasMonthPrice]);

  useEffect(() => {
    if (selectedNights !== null) {
      const currentRentType = searchParams.get("rent_type");
      const expectedRentType = selectedNights >= 30 ? "monthly" : "daily";
      if (currentRentType !== expectedRentType) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("rent_type", expectedRentType);
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [selectedNights, searchParams, setSearchParams]);

  const propertyTypeLabel = normalizeStayPropertyTypeLabel(room?.property_type_name);

  const validationError = useMemo(() => {
    if (!checkin || !checkout || !allPrices.length) return null;
    const nights = countBookingNights(checkin, checkout);
    const rows = allPrices;

    // Find resolved price row (matching pickCanonicalPriceRow / filterPriceRowsForStayDuration)
    const isLongStay = nights >= 30;
    let eligible = rows;
    if (!isLongStay) {
      const dayRows = rows.filter((row: any) => (row.unit ?? "night").toLowerCase() === "night");
      eligible = dayRows.length > 0 ? dayRows : rows;
    } else {
      const monthRows = rows.filter((row: any) => (row.unit ?? "").toLowerCase() === "month");
      if (monthRows.length > 0) {
        eligible = monthRows;
      } else {
        eligible = rows.filter((row: any) => (row.unit ?? "night").toLowerCase() === "night");
      }
    }
    const matchedRow = eligible.find((row: any) => Number(row.price ?? 0) > 0) || null;

    if (matchedRow && matchedRow.minimum_stay > 0) {
      const isMonth = matchedRow.unit === 'month';
      const minNights = isMonth ? matchedRow.minimum_stay * 30 : matchedRow.minimum_stay;
      if (nights < minNights) {
        return {
          message: t("public.roomDetail.minStayError", {
            min: matchedRow.minimum_stay,
            unit: isMonth ? t("public.roomDetail.unitMonth") : t("public.roomDetail.unitNight"),
            minDays: minNights,
            selected: nights,
            nightUnit: t("public.roomDetail.unitNight"),
          }),
          minNights,
        };
      }
    }
    return null;
  }, [checkin, checkout, allPrices, t]);

  const initialPaymentBreakdown = useMemo(() => {
    if (!checkin || !checkout || !allPrices.length || validationError) return null;

    const nights = countBookingNights(checkin, checkout);
    const monthPrice = allPrices.find((p: any) => p.unit === "month");
    const nightPrice = allPrices.find((p: any) => p.unit === "night");

    if (!monthPrice && !nightPrice) return null;

    let rentTotal = 0;
    let depositAmount = 0;

    if (nights >= 30 && monthPrice) {
      const months = nights / 30;
      rentTotal = Math.round(monthPrice.price * months);
      depositAmount = monthPrice.deposit_amount || 0;
    } else if (nightPrice) {
      rentTotal = Math.round(nightPrice.price * nights);
      depositAmount = nightPrice.deposit_amount || 0;
    }

    return { rentTotal, depositAmount, total: rentTotal + depositAmount, nights, isMonthly: nights >= 30 && allPrices.some((p: any) => p.unit === "month") };
  }, [checkin, checkout, allPrices, validationError]);

  const roomRules = useMemo(() => ({
    pet_policy: room?.pet_policy ?? "not_allowed",
    pet_policy_note: room?.pet_policy_note ?? null,
    smoking_allowed: Boolean(room?.smoking_allowed),
    parties_allowed: Boolean(room?.parties_allowed),
    quiet_hours_start: room?.quiet_hours_start ?? "22:00:00",
    quiet_hours_end: room?.quiet_hours_end ?? "06:00:00",
    checkin_method: room?.checkin_method ?? "meet_host",
    standard_checkin_start: room?.standard_checkin_start ?? "14:00:00",
    standard_checkout_end: room?.standard_checkout_end ?? "12:00:00",
    has_elevator: Boolean(room?.has_elevator),
    has_step_free_access: Boolean(room?.has_step_free_access),
    is_ground_floor: Boolean(room?.is_ground_floor),
  }), [room]);

  const handleTabChange = (unit: "night" | "month") => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("rent_type", unit === "month" ? "monthly" : "daily");
    if (checkin && checkout) {
      const nights = countBookingNights(checkin, checkout);
      if (unit === "month" && nights < 30) {
        newParams.delete("startDate");
        newParams.delete("endDate");
      } else if (unit === "night" && nights >= 30) {
        newParams.delete("startDate");
        newParams.delete("endDate");
      }
    }
    setSearchParams(newParams);
  };

  const renderBookingCard = () => {
    const hasNightPrice = allPrices.some((p: any) => p.unit === 'night');
    const hasMonthPrice = allPrices.some((p: any) => p.unit === 'month');
    const showPriceTabs = hasNightPrice && hasMonthPrice;

    const displayedPrices = showPriceTabs
      ? allPrices.filter((price: any) => price.unit === activeUnit)
      : allPrices;

    const pricesSection = (
      <div className="space-y-4">
        {showPriceTabs && (
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner">
            <button
              type="button"
              onClick={() => handleTabChange("night")}
              className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                activeUnit === "night"
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t("public.home.search.tabDaily")}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("month")}
              className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                activeUnit === "month"
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t("public.home.search.tabMonthly")}
            </button>
          </div>
        )}
        {displayedPrices.map((price: any, index: number) => {
          const isMonth = price.unit === 'month';
          const isDay = price.unit === 'night';

          let unitTitle = t("public.home.search.tabDaily");
          let unitLabel = t("public.roomDetail.unitNight");
          if (isMonth) {
            unitTitle = t("public.home.search.tabMonthly");
            unitLabel = t("public.roomDetail.unitMonth");
          } else if (isDay) {
            unitTitle = t("public.home.search.tabDaily");
            unitLabel = t("public.roomDetail.unitNight");
          } else if (price.unit) {
            unitTitle = `${t("public.roomDetail.rentType")}: ${price.unit}`;
            unitLabel = price.unit;
          }

          const isActive = price.unit === activeUnit;

          return (
            <div
              key={index}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                isActive || showPriceTabs
                  ? "border-sky-500 bg-sky-50/70 shadow-sm ring-1 ring-sky-500"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/30"
              }`}
            >
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
                {unitTitle}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-primary">{formatPrice(price.price)}</span>
                <span className="text-sm text-slate-500">/{unitLabel}</span>
              </div>
              {price.minimum_stay > 0 && (
                <p className="text-[10px] text-amber-600 mt-2 font-medium flex items-center gap-1 bg-amber-50/50 p-1.5 rounded-lg border border-amber-100/50">
                  <Info className="size-3.5 text-amber-500 shrink-0" />
                  <span>Yêu cầu thuê tối thiểu {price.minimum_stay} {unitLabel}</span>
                </p>
              )}
              {isMonth && (
                <p className="text-[9.5px] text-slate-500 mt-2 font-medium flex items-center gap-1.5 bg-slate-50/50 p-1.5 rounded-lg border border-slate-100">
                  <Info className="size-3 text-slate-400 shrink-0" />
                  <span>{t("public.roomDetail.dailyRateNote")}</span>
                </p>
              )}
            </div>
          );
        })}
        {!allPrices.length && (
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{t("public.roomDetail.priceFrom")}</p>
            <p className="mt-2 text-3xl font-bold text-primary">{formatPrice(room?.cheapest_daily_price || 0)}</p>
            <p className="text-sm text-slate-500">/ {t("public.roomDetail.unitNight")}</p>
          </div>
        )}
      </div>
    );

    const dateSection = (
      <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
        <h4 className="text-sm font-bold text-slate-800">{t("public.roomDetail.stayDuration")}</h4>
        {hasMonthPrice && activeUnit === "month" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("public.roomDetail.quickSelect")}</span>
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleDurationPreset(preset.days)}
                className="px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100 hover:border-sky-400 transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <DatePickerField
            label={t("public.home.search.checkIn")}
            value={checkin}
            onChange={handleStartDateChange}
            minDate={todayStr}
            excludeDates={bookedDates}
            triggerClassName="h-9 px-2 text-xs rounded-md"
            labelClassName="text-[10px] font-bold text-slate-500"
            placeholder={t("public.home.search.checkIn")}
          />
          <DatePickerField
            label={t("public.home.search.checkOut")}
            value={checkout}
            onChange={handleEndDateChange}
            minDate={(() => {
              if (!checkin) return todayStr;
              const parts = checkin.split("-").map(Number);
              if (parts.length === 3) {
                const date = new Date(parts[0], parts[1] - 1, parts[2] + 1);
                const pad = (n: number) => n.toString().padStart(2, "0");
                return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
              }
              return todayStr;
            })()}
            excludeDates={bookedDates}
            triggerClassName="h-9 px-2 text-xs rounded-md"
            labelClassName="text-[10px] font-bold text-slate-500"
            placeholder={t("public.home.search.checkOut")}
            disabled={!checkin}
          />
        </div>
        {validationError && (
          <p className="text-[10.5px] text-rose-600 font-semibold flex items-start gap-1 bg-rose-50 p-2 rounded-lg border border-rose-100 mt-2">
            <Info className="size-3.5 text-rose-500 shrink-0 mt-0.5" />
            <span>{validationError.message}</span>
          </p>
        )}
        {initialPaymentBreakdown && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
              {initialPaymentBreakdown.isMonthly ? "Tạm tính thanh toán ban đầu" : "Tạm tính chi phí phòng"}
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-700">
                <span>Tiền phòng ({initialPaymentBreakdown.nights} đêm)</span>
                <span className="font-semibold">{formatPrice(initialPaymentBreakdown.rentTotal)}</span>
              </div>
              {initialPaymentBreakdown.depositAmount > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>{t("public.roomDetail.depositSecurity")}</span>
                  <span className="font-semibold text-amber-700">{formatPrice(initialPaymentBreakdown.depositAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 border-t border-indigo-200 pt-2 mt-2">
                <span>{initialPaymentBreakdown.isMonthly ? "Tổng thanh toán đợt 1" : "Tổng tiền thanh toán"}</span>
                <span className="text-primary text-base">{formatPrice(initialPaymentBreakdown.total)}</span>
              </div>
            </div>
            <p className="text-[9px] text-indigo-600/80 italic">
              * Chưa bao gồm phụ phí điện, nước phát sinh trong quá trình lưu trú.
            </p>
          </div>
        )}
      </div>
    );

    const trustSection = (
      <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[10px] text-slate-400 font-medium">
        <span>✓ Giá tốt nhất</span>
        <span>✓ Hỗ trợ 24/7</span>
        <span>✓ An ninh & Hợp đồng</span>
      </div>
    );

    const ctaSection = checkin && checkout ? (
      validationError ? (
        <Button disabled className="w-full rounded-full bg-rose-100 text-rose-400 border border-rose-200 cursor-not-allowed hover:bg-rose-100">
          Chưa đạt ngày tối thiểu
        </Button>
      ) : (
        <Button asChild variant="gradient" className="w-full rounded-full">
          <Link to={`${ROUTERS.BOOKING}/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}>{t("public.roomDetail.bookNow")}</Link>
        </Button>
      )
    ) : (
      <Button disabled className="w-full rounded-full bg-slate-200 text-slate-400 cursor-not-allowed">
        {t("public.roomDetail.noDateSelected")}
      </Button>
    );

    return (
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardContent className="space-y-6 p-6">
          {pricesSection}
          {dateSection}
          <div className="border-t border-slate-100 pt-4">
            {trustSection}
          </div>
          {ctaSection}
        </CardContent>
      </Card>
    );
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40">
        <PublicHeader />
        <main className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-slate-600">{t("public.roomDetail.invalidRoom")}</p>
          <Button className="mt-5 rounded-full" onClick={() => navigate(ROUTERS.SEARCH_ROOMS)}>
            {t("public.roomByProvince.breadcrumb.search")}
          </Button>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40 text-slate-900 pb-20 lg:pb-0">
      <PublicHeader />



      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1440px] py-2.5 px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: t("breadcrumb.home"), href: ROUTERS.HOME },
              { label: t("public.roomByProvince.breadcrumb.search"), href: ROUTERS.SEARCH_ROOMS },
              { label: room?.title || t("breadcrumb.roomDetail") },
            ]}
            className="text-sm"
          />
        </div>
      </div>

      <main className="mx-auto grid max-w-[1440px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:px-8 lg:py-4">
        <section className="space-y-6">
          {isLoading ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
              <Spinner size="lg" showText text={t("public.roomDetail.loading")} className="text-slate-500 font-bold" />
            </div>
          ) : isError || !room ? (
            <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/90 px-6 py-12 text-center text-rose-600">
              {t("common.loading_error")}
            </div>
          ) : (
            <>
              {/* Title & Metadata Section */}
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{room?.title || t("breadcrumb.roomDetail")}</h1>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="size-3.5 text-slate-400" />
                    {t("common.back")}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-500">
                  {reviewsData && reviewsData.total_count > 0 && (
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="size-4 fill-amber-500 text-amber-500 shrink-0" />
                      {reviewsData.average_rating}
                      <span className="text-slate-400 font-normal">{t("public.home.rooms.reviewsCount", { count: reviewsData.total_count })}</span>
                    </span>
                  )}

                  {(room?.property_name || propertyTypeLabel) && (
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Home className="size-4 text-sky-600 shrink-0" />
                      {[room?.property_name, propertyTypeLabel].filter(Boolean).join(" · ")}
                    </span>
                  )}

                  <span className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="size-4 text-slate-400 shrink-0" />
                    {room?.property_address || t("public.roomDetail.addressUpdating")}
                  </span>

                  {room && (room.partner_company_name || room.partner_name) && (
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Building2 className="size-4 text-slate-400 shrink-0" />
                      <span>
                        Đơn vị vận hành:{" "}
                        {room.partner_id ? (
                          <Link
                            to={ROUTERS.PARTNER_DETAIL.replace(":partner_id", String(room.partner_id))}
                            className="font-bold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
                          >
                            {room.partner_company_name || room.partner_name}
                          </Link>
                        ) : (
                          <span className="font-bold">{room.partner_company_name || room.partner_name}</span>
                        )}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Lưới hình ảnh động tối ưu không gian */}
              {(() => {
                const imageCount = roomImages.length;
                const fallbackImg = getRoomFallbackImage(room?.property_type_name, room?.title);
                
                const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = fallbackImg;
                };

                if (imageCount === 0) return null;

                if (imageCount === 1) {
                  return (
                    <div 
                      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white cursor-pointer group"
                      onClick={() => {
                        setLightboxIndex(0);
                        setLightboxOpen(true);
                      }}
                    >
                      <img
                        src={roomImages[0]}
                        alt={room.title}
                        className="h-[320px] w-full object-cover sm:h-[420px] transition-transform duration-300 group-hover:scale-[1.01]"
                        onError={handleImgError}
                      />
                    </div>
                  );
                }

                if (imageCount === 2) {
                  return (
                    <div className="grid gap-3 grid-cols-2">
                      {roomImages.map((image, index) => (
                        <div 
                          key={index}
                          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white cursor-pointer group h-[200px] sm:h-[300px] lg:h-[380px]"
                          onClick={() => {
                            setLightboxIndex(index);
                            setLightboxOpen(true);
                          }}
                        >
                          <img
                            src={image}
                            alt={`${room.title}-${index + 1}`}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={handleImgError}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }

                if (imageCount === 3) {
                  return (
                    <div className="grid gap-3 grid-cols-3 h-[220px] sm:h-[320px] lg:h-[400px]">
                      <div 
                        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white col-span-2 h-full cursor-pointer group min-h-0"
                        onClick={() => {
                          setLightboxIndex(0);
                          setLightboxOpen(true);
                        }}
                      >
                        <img
                          src={roomImages[0]}
                          alt={room.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                          onError={handleImgError}
                        />
                      </div>
                      <div className="flex flex-col gap-3 h-full min-h-0">
                        {roomImages.slice(1, 3).map((image, index) => (
                          <div 
                            key={index}
                            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white flex-1 h-[calc(50%-6px)] cursor-pointer group"
                            onClick={() => {
                              setLightboxIndex(index + 1);
                              setLightboxOpen(true);
                            }}
                          >
                            <img
                              src={image}
                              alt={`${room.title}-${index + 2}`}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={handleImgError}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (imageCount === 4) {
                  return (
                    <div className="grid gap-3 grid-cols-4 h-[220px] sm:h-[320px] lg:h-[400px]">
                      <div 
                        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white col-span-2 h-full cursor-pointer group min-h-0"
                        onClick={() => {
                          setLightboxIndex(0);
                          setLightboxOpen(true);
                        }}
                      >
                        <img
                          src={roomImages[0]}
                          alt={room.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                          onError={handleImgError}
                        />
                      </div>
                      <div 
                        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white col-span-1 h-full cursor-pointer group min-h-0"
                        onClick={() => {
                          setLightboxIndex(1);
                          setLightboxOpen(true);
                        }}
                      >
                        <img
                          src={roomImages[1]}
                          alt={room.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={handleImgError}
                        />
                      </div>
                      <div className="flex flex-col gap-3 h-full col-span-1 min-h-0">
                        {roomImages.slice(2, 4).map((image, index) => (
                          <div 
                            key={index}
                            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white flex-1 h-[calc(50%-6px)] cursor-pointer group"
                            onClick={() => {
                              setLightboxIndex(index + 2);
                              setLightboxOpen(true);
                            }}
                          >
                            <img
                              src={image}
                              alt={`${room.title}-${index + 3}`}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={handleImgError}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Default >= 5 images (Airbnb style 5-photo grid)
                return (
                  <div className="grid gap-3 grid-cols-4 grid-rows-2 h-[220px] sm:h-[320px] lg:h-[400px]">
                    <div 
                      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white col-span-2 row-span-2 h-full cursor-pointer group min-h-0"
                      onClick={() => {
                        setLightboxIndex(0);
                        setLightboxOpen(true);
                      }}
                    >
                      <img
                        src={roomImages[0]}
                        alt={room.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                        onError={handleImgError}
                      />
                    </div>
                    {roomImages.slice(1, 5).map((image, index) => {
                      const isLast = index === 3;
                      const hasMore = roomImages.length > 5;
                      return (
                        <div 
                          key={index}
                          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white cursor-pointer group h-full min-h-0"
                          onClick={() => {
                            setLightboxIndex(index + 1);
                            setLightboxOpen(true);
                          }}
                        >
                          <img
                            src={image}
                            alt={`${room.title}-${index + 2}`}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={handleImgError}
                          />
                          {isLast && hasMore && (
                            <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                              <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                +{roomImages.length - 5} ảnh
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {lightboxOpen && (
                <ImageLightbox
                  open={lightboxOpen}
                  onClose={() => setLightboxOpen(false)}
                  index={lightboxIndex}
                  slides={lightboxSlides}
                />
              )}

              <Card className="rounded-3xl border-slate-200 shadow-sm">
                <CardContent className="space-y-5 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {room.property_type_name && (
                      <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/5 px-3 text-primary font-bold">
                        {propertyTypeLabel}
                      </Badge>
                    )}
                    {supportsElectronicContractByPropertyType(room.property_type_name) && (
                      <Badge className="rounded-full bg-indigo-500 text-white border-none px-3 font-bold flex gap-1.5 items-center">
                        <FileText className="size-3" />
                        Hỗ trợ Hợp đồng điện tử
                      </Badge>
                    )}
                    <Badge variant="secondary" className="rounded-full bg-emerald-100 text-emerald-700 font-bold">{t("public.roomDetail.readyBadge")}</Badge>
                    <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">{room.province_name || "Việt Nam"}</Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden">
                    <div className="flex flex-col items-center justify-center p-3 text-center bg-white/40 border-r border-b sm:border-b-0 border-slate-200/80">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("public.roomDetail.capacity")}</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <Users className="size-3.5 text-sky-600" />
                        {t("public.roomByProvince.guests", { count: room.people || 0 })}
                      </p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 text-center bg-white/40 border-b sm:border-b-0 sm:border-r border-slate-200/80">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("public.roomDetail.roomArea")}</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <Ruler className="size-3.5 text-sky-600" />
                        {room.area || "--"} m2
                      </p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 text-center bg-white/40 border-r sm:border-r border-slate-200/80">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("public.roomDetail.roomLayout")}</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
                        <BedDouble className="size-3.5 text-sky-600" />
                        {t("public.home.rooms.beds_with_bedrooms", { bedrooms: room.bedrooms_count || 1, beds: room.beds_count || 1 })}
                      </p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 text-center bg-white/40">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("public.roomDetail.rentType")}</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
                        {isLongTerm ? (
                          <>
                            <FileText className="size-3.5 text-sky-600" />
                            {t("public.home.search.tabMonthly")}
                          </>
                        ) : (
                          <>
                            <CalendarDays className="size-3.5 text-sky-600" />
                            {t("public.home.search.tabDaily")}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {room.description && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{t("public.roomDetail.description")}</h2>
                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{room.description}</p>
                    </div>
                  )}

                  <RoomTouristSpotsSection summary={room.tourist_summary} />

                  {amenities.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{t("public.roomDetail.featuredAmenities")}</h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(showAllAmenities ? amenities : amenities.slice(0, 8)).map((amenity: string) => (
                          <Badge key={amenity} variant="secondary" className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 text-xs font-medium">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                      {amenities.length > 8 && (
                        <div className="mt-3 text-left">
                          <button
                            type="button"
                            onClick={() => setShowAllAmenities(!showAllAmenities)}
                            className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100"
                          >
                            {showAllAmenities ? "Thu gọn tiện nghi" : `Xem thêm ${amenities.length - 8} tiện nghi`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {isLongTerm && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-3">
                        <Shield className="size-5 text-primary" />
                        {t("public.roomDetail.roomRules")}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{t("public.roomDetail.pets")}</p>
                          <div className="mt-2 space-y-1.5">
                            <div className={`flex items-center gap-2 text-sm font-semibold ${
                              roomRules.pet_policy === "allowed" ? "text-emerald-700" :
                              roomRules.pet_policy === "conditional" ? "text-amber-700" : "text-rose-700"
                            }`}>
                              <PawPrint className="size-4 text-primary shrink-0" />
                              <span>
                                {roomRules.pet_policy === "allowed" ? t("public.roomDetail.petsAllowed") :
                                 roomRules.pet_policy === "conditional" ? t("public.roomDetail.notAllowed") :
                                 t("public.roomDetail.petsNotAllowed")}
                              </span>
                            </div>
                            {roomRules.pet_policy_note && (
                              <p className="text-xs text-slate-500 italic">{roomRules.pet_policy_note}</p>
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{t("public.roomDetail.smoking")}</p>
                          <div className={`mt-2 flex items-center gap-2 text-sm font-semibold ${roomRules.smoking_allowed ? "text-emerald-700" : "text-rose-700"}`}>
                            <Cigarette className="size-4 text-primary shrink-0" />
                            <span>{roomRules.smoking_allowed ? t("public.roomDetail.partiesAllowed") : t("public.roomDetail.notAllowed")}</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{t("public.roomDetail.parties")}</p>
                          <div className="mt-2 space-y-1.5">
                            <div className={`flex items-center gap-2 text-sm font-semibold ${roomRules.parties_allowed ? "text-emerald-700" : "text-rose-700"}`}>
                              <PartyPopper className="size-4 text-primary shrink-0" />
                              <span>{roomRules.parties_allowed ? t("public.roomDetail.partiesAllowed") : t("public.roomDetail.partiesNotAllowed")}</span>
                            </div>
                            {roomRules.quiet_hours_start && roomRules.quiet_hours_end && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Volume2 className="size-3.5 text-slate-400 shrink-0" />
                                <span>
                                  {isVi ? `Giờ yên lặng: ${formatTimeLabel(roomRules.quiet_hours_start)} – ${formatTimeLabel(roomRules.quiet_hours_end)}` : `Quiet hours: ${formatTimeLabel(roomRules.quiet_hours_start)} – ${formatTimeLabel(roomRules.quiet_hours_end)}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{t("public.roomDetail.checkInOut")}</p>
                          <div className="mt-2 space-y-1.5">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                              {roomRules.checkin_method === "smart_lock" ? (
                                <LockKeyhole className="size-4 text-primary shrink-0" />
                              ) : roomRules.checkin_method === "lockbox" ? (
                                <Package className="size-4 text-primary shrink-0" />
                              ) : roomRules.checkin_method === "reception_24h" ? (
                                <Building2 className="size-4 text-primary shrink-0" />
                              ) : (
                                <UserCheck className="size-4 text-primary shrink-0" />
                              )}
                              <span>
                                {roomRules.checkin_method === "smart_lock"
                                  ? (isVi ? "Tự nhận phòng (Smart Lock)" : "Self check-in (Smart Lock)")
                                  : roomRules.checkin_method === "lockbox"
                                    ? (isVi ? "Hộp chứa khóa (Lockbox)" : "Lockbox")
                                    : roomRules.checkin_method === "reception_24h"
                                      ? (isVi ? "Lễ tân 24/7" : "24/7 front desk")
                                      : (isVi ? "Gặp trực tiếp chủ nhà" : "Meet the host in person")}
                              </span>
                            </div>
                            {(roomRules.standard_checkin_start || roomRules.standard_checkout_end) && (
                              <p className="text-xs text-slate-500">
                                {roomRules.standard_checkin_start && (isVi ? `Nhận phòng: từ ${formatTimeLabel(roomRules.standard_checkin_start)}` : `Check-in: from ${formatTimeLabel(roomRules.standard_checkin_start)}`)}
                                {roomRules.standard_checkout_end && (isVi ? ` | Trả phòng: trước ${formatTimeLabel(roomRules.standard_checkout_end)}` : ` | Check-out: before ${formatTimeLabel(roomRules.standard_checkout_end)}`)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {(roomRules.has_elevator || roomRules.has_step_free_access || roomRules.is_ground_floor) && (
                        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            <Accessibility className="size-3.5 text-primary shrink-0" />
                            <span>{t("public.roomDetail.accessibility")}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {roomRules.has_elevator ? (
                              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                                <Building2 className="size-3 shrink-0" />
                                {isVi ? "Có thang máy" : "Elevator"}
                              </Badge>
                            ) : null}
                            {roomRules.has_step_free_access ? (
                              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                                <Accessibility className="size-3 shrink-0" />
                                {isVi ? "Lối đi xe lăn" : "Wheelchair access"}
                              </Badge>
                            ) : null}
                            {roomRules.is_ground_floor ? (
                              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                                <Home className="size-3 shrink-0" />
                                {isVi ? "Tầng trệt" : "Ground floor"}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {utilityFees.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        {t("common.price")}
                        <Badge variant="outline" className="rounded-full text-[10px] uppercase font-bold text-amber-700 border-amber-100 bg-amber-50">{t("public.roomDetail.required")}</Badge>
                      </h2>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {utilityFees.map((fee: any, index: number) => (
                          <div key={index} className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4 bg-white hover:border-sky-200 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                                {fee.type === 'electricity' && <Zap className="size-4 text-yellow-500" />}
                                {fee.type === 'water' && <Droplets className="size-4 text-sky-500" />}
                                {fee.type === 'service' && <Info className="size-4 text-indigo-500" />}
                                {fee.type === 'electricity' ? t("public.roomDetail.feeElectricity") : fee.type === 'water' ? t("public.roomDetail.feeWater") : t("public.roomDetail.feeService")}
                              </span>
                              {fee.included ? (
                                <Badge className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px]">{t("public.roomDetail.included")}</Badge>
                              ) : (
                                <span className="text-sm font-bold text-sky-600">
                                  {formatPrice(fee.price)}
                                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                                    /{fee.method === 'per_unit' ? t("public.roomDetail.unitMeter") : fee.method === 'per_person' ? t("public.roomDetail.unitPerson") : t("public.roomDetail.unitMonth")}
                                  </span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 italic">
                              {fee.method === 'per_unit' ? t("public.roomDetail.feeMethodPerUnit") : fee.method === 'per_person' ? t("public.roomDetail.feeMethodPerPerson") : t("public.roomDetail.feeMethodFixedMonthly")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {allPrices.some((p: any) => p.deposit_amount > 0) && (
                    <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4 flex items-start gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <CreditCard className="size-5 text-sky-600" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <h4 className="text-sm font-bold text-sky-900">{t("public.roomDetail.depositPolicy")}</h4>
                        <div className="text-xs text-sky-700 leading-relaxed space-y-1">
                          <p>{t("public.roomDetail.depositPolicyDesc")}</p>
                          <ul className="list-disc pl-4 space-y-1 mt-1 font-medium">
                            {allPrices
                              .filter((p: any) => p.deposit_amount > 0)
                              .map((p: any, idx: number) => {
                                let unitLabel = t("public.roomDetail.unitNight");
                                if (p.unit === 'month') {
                                  unitLabel = t("public.roomDetail.unitMonth");
                                } else if (p.unit === 'night') {
                                  unitLabel = t("public.roomDetail.unitNight");
                                } else if (p.unit) {
                                  unitLabel = p.unit;
                                }
                                return (
                                  <li key={idx}>
                                    <Trans
                                      i18nKey="public.roomDetail.depositPackageLine"
                                      values={{ unit: unitLabel, amount: formatPrice(p.deposit_amount) }}
                                      components={{ amount: <span className="font-bold underline" /> }}
                                    />
                                  </li>
                                );
                              })}
                          </ul>
                          <p className="text-[10px] text-sky-600/90 italic mt-1.5">{t("public.roomDetail.depositNote")}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {services.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{t("public.roomDetail.extraServices")}</h2>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {(showAllServices ? services : services.slice(0, 4)).map((service) => (
                          <div key={service.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50/50 hover:bg-slate-50 transition-colors">
                            <span className="inline-flex items-center gap-2 text-slate-700 font-medium text-xs sm:text-sm">
                              <Plus className="size-3.5 text-slate-400" />
                              {service.name}
                            </span>
                            <span className="font-semibold text-primary text-xs sm:text-sm">{formatPrice(service.price)}</span>
                          </div>
                        ))}
                      </div>
                      {services.length > 4 && (
                        <div className="mt-3 text-left">
                          <button
                            type="button"
                            onClick={() => setShowAllServices(!showAllServices)}
                            className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100"
                          >
                            {showAllServices ? "Thu gọn dịch vụ" : `Xem thêm ${services.length - 4} dịch vụ`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lịch trống & Đặt phòng Inline Card */}
              <Card id="booking-calendar-card" className="rounded-3xl border-slate-200 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
                <CardContent className="p-6 space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarDays className="size-5 text-primary" />
                        {t("public.roomDetail.stayDuration")}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">{t("public.roomDetail.calendarHint")}</p>
                    </div>
                    {(checkin || checkout) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearDates}
                        className="text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 border border-rose-100 hover:border-rose-200 transition-all duration-200 h-8 font-semibold px-3 rounded-full flex items-center gap-1.5 shadow-sm"
                      >
                        <RotateCcw className="size-3.5" />
                        Xóa ngày chọn
                      </Button>
                    )}
                  </div>

                  <div className="flex border border-slate-100 bg-slate-50/50 rounded-2xl p-4 md:p-6 overflow-x-auto w-full">
                    <Calendar
                      mode="range"
                      locale={vi}
                      selected={selectedRange}
                      onSelect={handleRangeSelect}
                      disabled={inlineCalendarDisabledMatchers}
                      numberOfMonths={isMobileViewport ? 1 : 2}
                      showOutsideDays={false}
                      className="p-0 w-full"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-y-0 justify-between w-full gap-x-6",
                        month: "space-y-4 flex-1",
                        head_row: "flex w-full",
                        head_cell: "text-slate-500 w-full font-medium text-[0.8rem] text-center",
                        row: "flex w-full mt-2",
                        cell: "relative h-10 w-full p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-slate-100 [&:has([aria-selected].day-outside)]:bg-slate-100/50 [&:has([disabled])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                        day: "h-10 w-full p-0 font-normal text-slate-900 aria-selected:opacity-100 hover:bg-slate-100 rounded-lg",
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 justify-center sm:justify-start pt-2">
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded bg-blue-600 block"></span>
                      <span>{t("public.roomDetail.calendarLegendSelected")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded bg-slate-200/80 border border-slate-300 block"></span>
                      <span>{t("public.roomDetail.calendarLegendToday")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded bg-white border border-slate-200 block"></span>
                      <span>{t("public.roomDetail.calendarLegendAvailable")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded bg-slate-50 border border-slate-200 relative overflow-hidden block">
                        <span className="absolute inset-0 bg-slate-300 h-[1px] top-1/2 -translate-y-1/2 rotate-45 block text-slate-300"></span>
                      </span>
                      <span className="line-through text-slate-400">{t("public.roomDetail.calendarBooked")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Booking Card (shown only on mobile/tablet) */}
              <div className="block lg:hidden">
                {renderBookingCard()}
              </div>

              {/* Partner Information Card */}
              {room && (room.partner_name || room.partner_company_name) && (
                <Card className="rounded-3xl border-slate-200 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
                  <CardContent className="p-6 space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="size-5 text-primary" />
                        {t("public.roomDetail.companyName")}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">{t("public.roomDetail.operatorSubtitle")}</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        {room.partner_company_name && (
                          <div>
                        {t("public.roomDetail.companyName")}
                            {room.partner_id ? (
                              <Link
                                to={ROUTERS.PARTNER_DETAIL.replace(":partner_id", String(room.partner_id))}
                                className="mt-1 inline-block text-base font-bold text-slate-800 hover:text-primary hover:underline transition-all duration-200"
                              >
                                {room.partner_company_name}
                              </Link>
                            ) : (
                              <p className="mt-1 text-base font-bold text-slate-800">{room.partner_company_name}</p>
                            )}
                          </div>
                        )}

                        {room.partner_name && (
                          <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold">{t("public.roomDetail.representative")}</p>
                            {room.partner_id ? (
                              <Link
                                to={ROUTERS.PARTNER_DETAIL.replace(":partner_id", String(room.partner_id))}
                                className="mt-1 text-sm font-medium text-slate-700 flex items-center gap-1.5 hover:text-primary hover:underline transition-all duration-200"
                              >
                                <UserCheck className="size-4 text-emerald-500 shrink-0" />
                                {room.partner_name}
                              </Link>
                            ) : (
                              <p className="mt-1 text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                <UserCheck className="size-4 text-emerald-500 shrink-0" />
                                {room.partner_name}
                              </p>
                            )}
                          </div>
                        )}

                        {room.partner_address && (
                          <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold">{t("public.roomDetail.companyAddress")}</p>
                            <p className="mt-1 text-sm text-slate-700 flex items-start gap-2 leading-relaxed break-words">
                              <MapPin className="size-4.5 text-slate-400 mt-0.5 shrink-0" />
                              <span className="font-medium">{room.partner_address}</span>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {room.partner_phone && (
                          <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold">{t("public.roomDetail.companyPhone")}</p>
                            <p className="mt-1 text-sm text-slate-700 flex items-center gap-2 font-bold">
                              <Phone className="size-4 text-sky-500" />
                              <a href={`tel:${room.partner_phone}`} className="transition-colors duration-200 hover:text-primary">
                                {formatPhoneNumber(room.partner_phone)}
                              </a>
                            </p>
                          </div>
                        )}

                        {room.partner_email && (
                          <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold">{t("public.roomDetail.companyEmail")}</p>
                            <p className="mt-1 text-sm text-slate-700 flex items-center gap-2 font-medium">
                              <Mail className="size-4 text-sky-500" />
                              <a href={`mailto:${room.partner_email}`} className="transition-colors duration-200 hover:text-primary underline decoration-slate-200 hover:decoration-primary">
                                {room.partner_email}
                              </a>
                            </p>
                          </div>
                        )}

                        {room.partner_description && (
                          <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold">{t("public.roomDetail.companyIntro")}</p>
                            <p className="mt-1 text-sm text-slate-600 italic leading-relaxed">
                              "{room.partner_description}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Room Reviews List */}
              <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{t("public.roomDetail.reviewsHeading")}</h2>
                      <p className="text-xs text-slate-500 mt-1">{t("public.roomDetail.reviewsSubtitle")}</p>
                    </div>
                    {reviewsData && reviewsData.total_count > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-black text-slate-900 flex items-center gap-1.5 justify-end">
                            <Star className="size-5 text-amber-500 fill-amber-500 shrink-0" />
                            {reviewsData.average_rating}
                          </div>
                          <span className="text-[11px] font-bold text-slate-400">{t("public.home.rooms.reviewsCount", { count: reviewsData.total_count })}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isLoadingReviews ? (
                    <div className="py-8 text-center">
                      <Spinner size="md" />
                    </div>
                  ) : !reviewsData || reviewsData.reviews.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      {t("public.home.rooms.noReviews")}
                    </div>
                  ) : (
                    <>
                      <div className="divide-y divide-slate-100">
                        {reviewsData.reviews.slice(0, 5).map((review) => (
                          <div key={review.id} className="py-5 first:pt-0 last:pb-0 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                  {review.user?.avatar ? (
                                    <img src={review.user.avatar} alt={review.user.name} className="size-full object-cover" />
                                  ) : (
                                    <Users className="size-5 text-slate-400" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-slate-800">{review.user?.name || t("public.home.reviews.guestFallback")}</h4>
                                  <span className="text-[10px] text-slate-400">{new Date(review.created_at).toLocaleDateString("vi-VN")}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`size-3.5 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                                      }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-slate-600 leading-relaxed pl-13 italic">
                                "{review.comment}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      {reviewsData.reviews.length > 5 && (
                        <div className="mt-6 flex justify-center border-t border-slate-100 pt-4">
                          <ReviewsModal
                            title={t("public.roomDetail.reviewsAboutRoom")}
                            reviews={reviewsData.reviews}
                            averageRating={reviewsData.average_rating}
                            totalCount={reviewsData.total_count}
                            trigger={
                              <Button
                                variant="outline"
                                className="rounded-full px-8 transition-all hover:bg-slate-50 font-semibold text-slate-700"
                              >
                                Xem thêm {reviewsData.reviews.length - 5} đánh giá
                              </Button>
                            }
                          />
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </section>

        <aside className="hidden lg:block lg:sticky lg:top-2 lg:z-20 lg:self-start">
          {renderBookingCard()}
        </aside>
      </main>

      <PublicFooter />

      {/* Sticky Bottom Bar for Mobile & Tablet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{t("public.roomDetail.priceFrom")}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-primary">{formatPrice(room?.cheapest_daily_price || 0)}</span>
              <span className="text-xs text-slate-500">/{t("public.roomDetail.unitNight")}</span>
            </div>
            {checkin && checkout ? (
              <span className="text-[10px] font-bold text-emerald-600 mt-0.5">
                {checkin.split('-').slice(1).reverse().join('/')} - {checkout.split('-').slice(1).reverse().join('/')}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 mt-0.5">{t("public.roomDetail.noDateSelected")}</span>
            )}
          </div>

          {checkin && checkout ? (
            validationError ? (
              <Button disabled className="rounded-full bg-rose-100 text-rose-400 border border-rose-200 cursor-not-allowed hover:bg-rose-100 text-xs font-bold h-10 px-6">
                Chưa đủ tối thiểu
              </Button>
            ) : (
              <Button asChild variant="gradient" className="rounded-full px-6 text-xs font-bold h-10 shadow-md">
                <Link to={`${ROUTERS.BOOKING}/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}>
                  {t("public.roomDetail.bookNow")}
                </Link>
              </Button>
            )
          ) : (
            <Button onClick={scrollToCalendar} className="rounded-full bg-primary hover:bg-primary/90 text-white text-xs font-bold px-6 h-10 shadow-md">
              {t("public.home.search.checkIn")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicRoomDetail;


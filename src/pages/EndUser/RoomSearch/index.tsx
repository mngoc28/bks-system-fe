import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Filter, MapPin, SearchX, Users, ArrowDownWideNarrow, Star, Heart, Share2, Sparkles, Home, ShieldCheck, Search, Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

import axiosClient from "@/api/axiosClient";
import SearchableSelect from "@/components/ui/searchable-select";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS, SUGGESTED_ROOM_SPOT_PRIORITY, SUGGESTED_ROOM_SPOT_SLUGS } from "@/constant";
import DestinationKeywordInput from "@/components/search/DestinationKeywordInput";
import type { TouristSpotSuggestion } from "@/dataHelper/EU/touristSpot.dataHelper";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetHomeWardsByProvinceId } from "@/hooks/useWardQuery";
import { usePaginatedRoomsQuery, usePublicAmenitiesQuery, usePublicServicesQuery } from "@/hooks/EU/useRoomQuery";
import { usePropertyTypesQuery } from "@/hooks/usePropertyQuery";
import { normalizeStayPropertyTypeLabel, isApartmentSegmentPropertyType } from "@/utils/stayPropertyType";
import { formatPrice, formatCurrencyInput, parseCurrencyValue, validateCurrencyInput, simplifyAddress, formatProvinceName } from "@/utils/utils";
import { countBookingNights } from "@/utils/dateUtils";
import { getRoomFallbackImage, getProvinceImage } from "@/utils/fallbackImages";
import { toastSuccess, toastError } from "@/components/ui/toast";
import { resolveImageUrl, resolveCloudinaryUrl } from "@/utils/imageUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const LIMIT_OPTIONS = [12, 16, 24, 48];
const DEFAULT_SORT = "price_asc";

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
};
const DiscountBanner = () => {
  const [email, setEmail] = useState("");
  const [couponValue, setCouponValue] = useState<number | string>(10);
  const [couponType, setCouponType] = useState<string>("percent");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [messageKind, setMessageKind] = useState<"validation" | "duplicate" | "server">("validation");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessageKind("validation");

    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosClient.post("/home/coupons/register", { email });
      const dataPayload = response?.data;
      const val = dataPayload?.value ?? 10;
      const typ = dataPayload?.type || "percent";

      setCouponValue(val);
      setCouponType(typ);
      setIsSubmitted(true);
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      const fallbackMessage = "Đã xảy ra lỗi khi đăng ký coupon. Vui lòng thử lại sau.";
      const message = backendMessage || fallbackMessage;
      const isDuplicate = typeof backendMessage === "string" && backendMessage.includes("đã được sử dụng");

      setMessageKind(isDuplicate ? "duplicate" : "server");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="col-span-full my-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-8 text-white shadow-xl relative animate-fade-in">
      {/* Light effect */}
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="text-center md:text-left flex-1">
          <Badge className="mb-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1 rounded-full uppercase tracking-wider text-[10px]">
            Ưu đãi đặc biệt
          </Badge>
          <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
            Đăng ký nhận Coupon giảm giá <span className="text-amber-400">10%</span>
          </h3>
          <p className="mt-2 text-sm text-slate-300 max-w-xl leading-relaxed">
            Đăng ký bản tin để nhận các ưu đãi phòng tốt nhất cùng mã giảm giá độc quyền dành riêng cho thành viên BKS Stay.
          </p>
        </div>

        <div className="w-full max-w-md md:w-auto md:min-w-[320px] lg:min-w-[400px]">
          {isSubmitted ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-6 text-center backdrop-blur-sm animate-fade-in shadow-inner">
              <p className="text-sm font-bold text-emerald-400">🎉 Đăng ký thành công!</p>
              <p className="mt-2 text-xs text-slate-200 leading-relaxed">
                Chúng tôi đã gửi mã giảm giá chào mừng <strong>giảm {couponValue}{couponType === "percent" ? "%" : "đ"}</strong> đến địa chỉ email của bạn.
              </p>
              <p className="mt-2 text-[11px] text-slate-400 italic">
                Vui lòng kiểm tra hộp thư (bao gồm cả mục Thư rác/Spam) để lấy mã và áp dụng khi tiến hành đặt phòng.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) {
                      setError("");
                      setMessageKind("validation");
                    }
                  }}
                  placeholder="Nhập email của bạn..."
                  className="h-11 flex-1 rounded-xl border border-slate-700 bg-slate-900/60 px-4 text-sm text-white placeholder-slate-400 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 backdrop-blur-sm"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="gradient"
                  className="h-11 rounded-xl px-5 text-sm font-semibold"
                >
                  {isLoading ? "Đang gửi..." : "Nhận Coupon"}
                </Button>
              </div>
              {error && (
                <p
                  className={`text-xs font-medium ml-1 leading-relaxed ${
                    messageKind === "duplicate"
                      ? "text-amber-300"
                      : "text-rose-400"
                  }`}
                  role={messageKind === "duplicate" ? "status" : "alert"}
                >
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};


const formatRoomAddress = (provinceName: string, propertyAddress: string) => {
  if (!propertyAddress) return provinceName;
  if (!provinceName) return propertyAddress;
  
  const cleanProvince = provinceName.trim();
  const cleanAddress = propertyAddress.trim();
  
  const lowerAddress = cleanAddress.toLowerCase();
  const lowerProvince = cleanProvince.toLowerCase();
  
  if (lowerAddress.includes(lowerProvince)) {
    return cleanAddress;
  }
  
  return `${cleanProvince} - ${cleanAddress}`;
};

const FEATURED_AMENITY_KEYWORDS = ["wifi", "điều hòa", "bếp", "máy giặt", "ban công", "bãi đỗ xe", "đỗ xe"];
const FEATURED_SERVICE_KEYWORDS = ["giặt ủi", "sân bay", "bữa sáng", "gym", "fitness", "bể bơi", "hồ bơi", "xe máy"];

const isFeaturedAmenity = (name: string) => {
  if (!name) return false;
  const norm = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return FEATURED_AMENITY_KEYWORDS.some(keyword => 
    norm.includes(keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );
};

const isFeaturedService = (name: string) => {
  if (!name) return false;
  const norm = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return FEATURED_SERVICE_KEYWORDS.some(keyword => 
    norm.includes(keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );
};

const RoomSearch = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");

  const [localProvinceId, setLocalProvinceId] = useState<number | null>(() => parsePositiveInt(searchParams.get("provinceId"), 0) || null);
  const [localWardId, setLocalWardId] = useState<number | null>(() => parsePositiveInt(searchParams.get("wardId"), 0) || null);
  const [localStartDate, setLocalStartDate] = useState<string>(() => searchParams.get("startDate") || "");
  const [localEndDate, setLocalEndDate] = useState<string>(() => searchParams.get("endDate") || "");
  const [localAdults, setLocalAdults] = useState<number>(() => {
    const guests = parsePositiveInt(searchParams.get("guests"), 1);
    return Math.max(1, guests);
  });
  const [localChildren, setLocalChildren] = useState<number>(0);
  const [localPriceMinStr, setLocalPriceMinStr] = useState("");
  const [localPriceMaxStr, setLocalPriceMaxStr] = useState("");
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);

  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem("bks_wishlist");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("bks_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const handleToggleWishlist = (e: React.MouseEvent, roomId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => {
      const isAlreadyWishlisted = prev.includes(roomId);
      if (isAlreadyWishlisted) {
        toastSuccess("Đã xóa khỏi danh sách yêu thích");
        return prev.filter((id) => id !== roomId);
      } else {
        toastSuccess("Đã thêm vào danh sách yêu thích");
        return [...prev, roomId];
      }
    });
  };

  const handleShareRoom = (e: React.MouseEvent, roomId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.origin + ROUTERS.PUBLIC_ROOM_DETAIL.replace(":roomId", roomId.toString());
    navigator.clipboard.writeText(url)
      .then(() => {
        toastSuccess("Đã sao chép liên kết phòng!");
      })
      .catch(() => {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          toastSuccess("Đã sao chép liên kết phòng!");
        } catch {
          toastError("Không thể sao chép liên kết!");
        }
        document.body.removeChild(textArea);
      });
  };

  const handleCardClick = (e: React.MouseEvent, roomId: number, cardRentType?: string) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest(".interactive-click")) {
      return;
    }
    const newParams = new URLSearchParams(searchParams);
    if (cardRentType) {
      newParams.set("rent_type", cardRentType);
    }
    const detailUrl = `${ROUTERS.PUBLIC_ROOM_DETAIL.replace(":roomId", roomId.toString())}${newParams.toString() ? `?${newParams.toString()}` : ""}`;
    navigate(detailUrl);
  };

  const provinceId = parsePositiveInt(searchParams.get("provinceId"), 0);
  const wardId = parsePositiveInt(searchParams.get("wardId"), 0);
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const guests = parsePositiveInt(searchParams.get("guests"), 0);

  const requestedPage = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  const requestedLimit = parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);
  const limit = LIMIT_OPTIONS.includes(requestedLimit) ? requestedLimit : DEFAULT_LIMIT;
  const selectedPropertyTypeId = searchParams.get("propertyTypeId")
    ? parsePositiveInt(searchParams.get("propertyTypeId"), 0) || null
    : null;
  const sortBy = searchParams.get("sort") || DEFAULT_SORT;
  const touristSpotSlug = searchParams.get("tourist_spot_slug") || "";
  const deferredKeyword = useDeferredValue(keyword.trim());
  const ratingMin = searchParams.get("rating_min")
    ? Number(searchParams.get("rating_min")) || null
    : null;
  const priceMin = searchParams.get("price_min")
    ? Number(searchParams.get("price_min")) || null
    : null;
  const priceMax = searchParams.get("price_max")
    ? Number(searchParams.get("price_max")) || null
    : null;
  const amenityIds = useMemo(() => {
    const val = searchParams.get("amenity_ids");
    return val ? val.split(",").map(Number).filter(Boolean) : [];
  }, [searchParams]);
  const serviceIds = useMemo(() => {
    const val = searchParams.get("service_ids");
    return val ? val.split(",").map(Number).filter(Boolean) : [];
  }, [searchParams]);

  const hasSecondaryFilters = !!(ratingMin || priceMin || priceMax || amenityIds.length > 0 || serviceIds.length > 0);

  const touristSpotLabel = useMemo(() => {
    if (!touristSpotSlug) {
      return "";
    }
    const index = SUGGESTED_ROOM_SPOT_SLUGS.indexOf(touristSpotSlug as (typeof SUGGESTED_ROOM_SPOT_SLUGS)[number]);
    if (index >= 0) {
      return SUGGESTED_ROOM_SPOT_PRIORITY[index];
    }
    return touristSpotSlug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }, [touristSpotSlug]);

  useEffect(() => {
    setLocalProvinceId(parsePositiveInt(searchParams.get("provinceId"), 0) || null);
    setLocalWardId(parsePositiveInt(searchParams.get("wardId"), 0) || null);
    setLocalStartDate(searchParams.get("startDate") || "");
    setLocalEndDate(searchParams.get("endDate") || "");
    const guestsParam = parsePositiveInt(searchParams.get("guests"), 1);
    setLocalAdults(Math.max(1, guestsParam));
    setLocalChildren(0);
    setKeyword(searchParams.get("keyword") || "");
  }, [searchParams]);

  useEffect(() => {
    setKeyword(searchParams.get("keyword") || "");
  }, [searchParams]);

  useEffect(() => {
    setLocalPriceMinStr(priceMin ? formatCurrencyInput(priceMin) : "");
    setLocalPriceMaxStr(priceMax ? formatCurrencyInput(priceMax) : "");
  }, [priceMin, priceMax]);

  const { data: provincesData } = useGetAllProvincesTypes();
  const { data: wardsData, isLoading: isLoadingWards } = useGetHomeWardsByProvinceId(localProvinceId ?? provinceId ?? 0);
  const { data: propertyTypesData } = usePropertyTypesQuery();
  const { data: publicAmenitiesData } = usePublicAmenitiesQuery();
  const { data: publicServicesData } = usePublicServicesQuery();

  const featuredAmenities = useMemo(() => {
    const list = publicAmenitiesData ?? [];
    return list.filter((am: any) => isFeaturedAmenity(am.name));
  }, [publicAmenitiesData]);

  const otherAmenities = useMemo(() => {
    const list = publicAmenitiesData ?? [];
    return list.filter((am: any) => !isFeaturedAmenity(am.name));
  }, [publicAmenitiesData]);

  const featuredServices = useMemo(() => {
    const list = publicServicesData ?? [];
    return list.filter((sv: any) => isFeaturedService(sv.name));
  }, [publicServicesData]);

  const otherServices = useMemo(() => {
    const list = publicServicesData ?? [];
    return list.filter((sv: any) => !isFeaturedService(sv.name));
  }, [publicServicesData]);

  const provinceOptions = useMemo(() => {
    const options =
      provincesData?.data?.map((province: any) => ({
        value: province.id.toString(),
        label: province.name,
      })) ?? [];

    const priorityNames = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Khánh Hòa", "Quảng Ninh"];

    return [...options].sort((a, b) => {
      const aPriorityIndex = priorityNames.findIndex((name) =>
        a.label
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      );
      const bPriorityIndex = priorityNames.findIndex((name) =>
        b.label
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
      );

      const aHasPriority = aPriorityIndex !== -1;
      const bHasPriority = bPriorityIndex !== -1;

      if (aHasPriority && bHasPriority) {
        return aPriorityIndex - bPriorityIndex;
      }
      if (aHasPriority) return -1;
      if (bHasPriority) return 1;

      return a.label.localeCompare(b.label, "vi");
    });
  }, [provincesData]);

  const wardOptions = useMemo(() => {
    return (
      wardsData?.data?.map((ward: any) => ({
        value: ward.id.toString(),
        label: ward.name,
      })) ?? []
    );
  }, [wardsData]);

  const handleLocalProvinceChange = (value: string) => {
    const nextProvince = value ? Number(value) : null;
    setLocalProvinceId(nextProvince);
    setLocalWardId(null);
  };

  const roomSortParams = useMemo(() => {
    if (sortBy === "price_desc") {
      return { sort_by: "cheapest_daily_price" as const, sort_direction: "desc" as const };
    }

    if (sortBy === "capacity_desc") {
      return { sort_by: "people" as const, sort_direction: "desc" as const };
    }

    return { sort_by: "cheapest_daily_price" as const, sort_direction: "asc" as const };
  }, [sortBy]);

  const showTwoBlocks = selectedPropertyTypeId === null;
  const isApartmentSegment = useMemo(() => {
    if (selectedPropertyTypeId === null || !propertyTypesData?.data) return false;
    const type = propertyTypesData.data.find((t: any) => t.id === selectedPropertyTypeId);
    return type ? isApartmentSegmentPropertyType(type.name) : false;
  }, [selectedPropertyTypeId, propertyTypesData]);

  const baseQueryParams = useMemo(() => ({
    province_id: provinceId || undefined,
    ward_id: wardId || undefined,
    keyword: deferredKeyword || undefined,
    page: requestedPage,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    guests: guests || undefined,
    tourist_spot_slug: touristSpotSlug || undefined,
    rating_min: ratingMin || undefined,
    price_min: priceMin || undefined,
    price_max: priceMax || undefined,
    amenity_ids: amenityIds.length > 0 ? amenityIds : undefined,
    service_ids: serviceIds.length > 0 ? serviceIds : undefined,
    ...roomSortParams,
  }), [provinceId, wardId, deferredKeyword, requestedPage, startDate, endDate, guests, touristSpotSlug, ratingMin, priceMin, priceMax, amenityIds, serviceIds, roomSortParams]);

  const {
    data: dailyRoomsPageData,
    isLoading: isLoadingDaily,
    isError: isErrorDaily,
    isPlaceholderData: isPlaceholderDataDaily,
    refetch: refetchDaily,
  } = usePaginatedRoomsQuery(
    {
      ...baseQueryParams,
      property_type_id: !showTwoBlocks && !isApartmentSegment ? selectedPropertyTypeId : undefined,
      rent_type: showTwoBlocks ? "daily" : undefined,
      per_page: limit,
    },
    { enabled: showTwoBlocks || !isApartmentSegment },
  );

  const {
    data: monthlyRoomsPageData,
    isLoading: isLoadingMonthly,
    isError: isErrorMonthly,
    isPlaceholderData: isPlaceholderDataMonthly,
    refetch: refetchMonthly,
  } = usePaginatedRoomsQuery(
    {
      ...baseQueryParams,
      property_type_id: !showTwoBlocks && isApartmentSegment ? selectedPropertyTypeId : undefined,
      rent_type: showTwoBlocks ? "monthly" : undefined,
      per_page: limit,
    },
    { enabled: showTwoBlocks || isApartmentSegment },
  );

  const dailyRooms = showTwoBlocks 
    ? (dailyRoomsPageData?.data ?? []) 
    : (!isApartmentSegment ? (dailyRoomsPageData?.data ?? []) : []);
  const monthlyRooms = showTwoBlocks 
    ? (monthlyRoomsPageData?.data ?? []) 
    : (isApartmentSegment ? (monthlyRoomsPageData?.data ?? []) : []);

  const totalRooms = showTwoBlocks
    ? (dailyRoomsPageData?.total ?? 0) + (monthlyRoomsPageData?.total ?? 0)
    : (isApartmentSegment ? (monthlyRoomsPageData?.total ?? 0) : (dailyRoomsPageData?.total ?? 0));

  const totalPages = Math.max(
    DEFAULT_PAGE,
    (showTwoBlocks 
      ? Math.max(dailyRoomsPageData?.last_page ?? 1, monthlyRoomsPageData?.last_page ?? 1)
      : (isApartmentSegment ? (monthlyRoomsPageData?.last_page ?? 1) : (dailyRoomsPageData?.last_page ?? 1)))
  );

  const page = Math.min(requestedPage, totalPages);
  const isLoading = (showTwoBlocks && (isLoadingDaily || isLoadingMonthly)) || (!showTwoBlocks && (isApartmentSegment ? isLoadingMonthly : isLoadingDaily));
  const isError = (showTwoBlocks && (isErrorDaily || isErrorMonthly)) || (!showTwoBlocks && (isApartmentSegment ? isErrorMonthly : isErrorDaily));
  const isPlaceholderData = showTwoBlocks 
    ? (isPlaceholderDataDaily || isPlaceholderDataMonthly)
    : (isApartmentSegment ? isPlaceholderDataMonthly : isPlaceholderDataDaily);

  const refetch = () => {
    if (showTwoBlocks) {
      void refetchDaily();
      void refetchMonthly();
    } else if (isApartmentSegment) {
      void refetchMonthly();
    } else {
      void refetchDaily();
    }
  };

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    let changed = false;

    if (next.get("page") !== String(requestedPage)) {
      next.set("page", String(requestedPage));
      changed = true;
    }

    if (next.get("limit") !== String(limit)) {
      next.set("limit", String(limit));
      changed = true;
    }

    if (next.get("sort") !== sortBy) {
      next.set("sort", sortBy);
      changed = true;
    }

    if (changed) {
      setSearchParams(next, { replace: true });
    }
  }, [limit, requestedPage, searchParams, setSearchParams, sortBy]);

  useEffect(() => {
    const currentKeyword = searchParams.get("keyword") || "";

    if (currentKeyword === deferredKeyword) {
      return;
    }

    const next = new URLSearchParams(searchParams);

    if (deferredKeyword) {
      next.set("keyword", deferredKeyword);
    } else {
      next.delete("keyword");
    }

    next.set("page", String(DEFAULT_PAGE));
    setSearchParams(next, { replace: true });
  }, [deferredKeyword, searchParams, setSearchParams]);

  useEffect(() => {
    if (requestedPage <= totalPages) {
      return;
    }

    const next = new URLSearchParams(searchParams);
    next.set("page", String(totalPages));
    setSearchParams(next, { replace: true });
  }, [requestedPage, totalPages, searchParams, setSearchParams]);

  const selectedProvince = useMemo(
    () => provincesData?.data?.find((province) => province.id === provinceId),
    [provinceId, provincesData],
  );

  const selectedWard = useMemo(
    () => wardsData?.data?.find((ward) => ward.id === wardId),
    [wardId, wardsData],
  );

  const updateSearchParams = (
    updates: Record<string, string | null>,
    options?: { replace?: boolean; scroll?: boolean },
  ) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    setSearchParams(next, { replace: options?.replace ?? false });

    if (options?.scroll !== false) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return;
    }

    updateSearchParams({ page: String(nextPage) });
  };

  const handlePerPageChange = (nextLimit: number) => {
    if (!LIMIT_OPTIONS.includes(nextLimit) || nextLimit === limit) {
      return;
    }

    updateSearchParams({
      page: String(DEFAULT_PAGE),
      limit: String(nextLimit),
    });
  };

  const handlePropertyTypeChange = (propertyTypeId: number | null) => {
    updateSearchParams({
      page: String(DEFAULT_PAGE),
      propertyTypeId: propertyTypeId ? String(propertyTypeId) : null,
    }, { scroll: false });
  };

  const handleSortChange = (nextSort: string) => {
    updateSearchParams({
      page: String(DEFAULT_PAGE),
      sort: nextSort,
    }, { scroll: false });
  };

  const handleRatingMinChange = (nextRatingMin: number | null) => {
    updateSearchParams({
      page: String(DEFAULT_PAGE),
      rating_min: nextRatingMin ? String(nextRatingMin) : null,
    }, { scroll: false });
  };

  const handlePriceRangeChange = (min: number | null, max: number | null) => {
    updateSearchParams({
      page: String(DEFAULT_PAGE),
      price_min: min !== null ? String(min) : null,
      price_max: max !== null ? String(max) : null,
    }, { scroll: false });
  };

  const handleAmenityIdsChange = (ids: number[]) => {
    updateSearchParams({
      page: String(DEFAULT_PAGE),
      amenity_ids: ids.length > 0 ? ids.join(",") : null,
    }, { scroll: false });
  };

  const handleServiceIdsChange = (ids: number[]) => {
    updateSearchParams({
      page: String(DEFAULT_PAGE),
      service_ids: ids.length > 0 ? ids.join(",") : null,
    }, { scroll: false });
  };

  const handleClearSecondaryFilters = () => {
    setLocalPriceMinStr("");
    setLocalPriceMaxStr("");
    setShowAllAmenities(false);
    setShowAllServices(false);

    updateSearchParams({
      rating_min: null,
      price_min: null,
      price_max: null,
      amenity_ids: null,
      service_ids: null,
      page: String(DEFAULT_PAGE),
    }, { scroll: false });
  };

  const handleResetFilters = () => {
    setKeyword("");
    setLocalProvinceId(null);
    setLocalWardId(null);
    setLocalStartDate("");
    setLocalEndDate("");
    setLocalAdults(1);
    setLocalChildren(0);
    updateSearchParams({
      page: String(DEFAULT_PAGE),
      keyword: null,
      provinceId: null,
      wardId: null,
      startDate: null,
      endDate: null,
      guests: null,
      propertyTypeId: null,
      tourist_spot_slug: null,
      sort: DEFAULT_SORT,
      rating_min: null,
      price_min: null,
      price_max: null,
      amenity_ids: null,
      service_ids: null,
    }, { scroll: false });
  };

  const handleSelectTouristSpot = (spot: TouristSpotSuggestion) => {
    setKeyword("");
    updateSearchParams({
      page: String(DEFAULT_PAGE),
      tourist_spot_slug: spot.slug,
      keyword: null,
      provinceId: localProvinceId ? String(localProvinceId) : null,
      wardId: null,
    }, { scroll: false });
    setLocalWardId(null);
  };

  const handleClearTouristSpot = () => {
    updateSearchParams({
      tourist_spot_slug: null,
      page: String(DEFAULT_PAGE),
    }, { scroll: false });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (touristSpotSlug) {
      updateSearchParams({
        page: String(DEFAULT_PAGE),
        tourist_spot_slug: touristSpotSlug,
        keyword: null,
        provinceId: localProvinceId ? String(localProvinceId) : null,
        wardId: localWardId ? String(localWardId) : null,
        startDate: localStartDate || null,
        endDate: localEndDate || null,
        guests: (localAdults + localChildren) > 0 ? String(localAdults + localChildren) : null,
      }, { scroll: false });
      return;
    }

    if (!localProvinceId && !keyword.trim()) {
      toastError("Vui lòng chọn điểm đến hoặc Tỉnh/Thành trước khi tìm kiếm");
      return;
    }

    updateSearchParams({
      page: String(DEFAULT_PAGE),
      provinceId: localProvinceId ? String(localProvinceId) : null,
      wardId: localWardId ? String(localWardId) : null,
      startDate: localStartDate || null,
      endDate: localEndDate || null,
      guests: (localAdults + localChildren) > 0 ? String(localAdults + localChildren) : null,
      keyword: keyword.trim() || null,
      tourist_spot_slug: null,
    }, { scroll: false });
  };


  const renderRoomCard = (room: any) => {
    const hasNightlyPrice = room.cheapest_nightly_price !== null && room.cheapest_nightly_price !== undefined && Number(room.cheapest_nightly_price) > 0;
    const hasMonthlyPrice = room.cheapest_monthly_price !== null && room.cheapest_monthly_price !== undefined && Number(room.cheapest_monthly_price) > 0;

    // 1. Determine stay duration if dates selected
    const dateSelected = startDate !== "" && endDate !== "";
    const stayNights = dateSelected ? countBookingNights(startDate, endDate) : 0;

    // 2. Determine primary booking model (monthly vs nightly)
    const isPrimaryMonthly = dateSelected 
      ? stayNights >= 30 
      : isApartmentSegmentPropertyType(room.property_type_name);

    let displayPrice = 0;
    let displayUnit = "";
    let badgeText = "";
    let badgeColorClass = "";
    let hintText = "";

    if (isPrimaryMonthly) {
      if (hasMonthlyPrice) {
        displayPrice = Number(room.cheapest_monthly_price);
        displayUnit = "/tháng";
        badgeText = "Thuê dài hạn";
        badgeColorClass = "bg-sky-500/95 text-white border-sky-400 hover:bg-sky-500";
        if (hasNightlyPrice) {
          hintText = "Hỗ trợ thuê theo đêm";
        }
      } else {
        displayPrice = Number(room.cheapest_daily_price);
        displayUnit = "/đêm";
        badgeText = "Thuê theo đêm";
        badgeColorClass = "bg-amber-500/95 text-white border-amber-400 hover:bg-amber-500";
      }
    } else {
      if (hasNightlyPrice) {
        displayPrice = Number(room.cheapest_nightly_price);
        displayUnit = "/đêm";
        badgeText = "Thuê theo đêm";
        badgeColorClass = "bg-amber-500/95 text-white border-amber-400 hover:bg-amber-500";
        if (hasMonthlyPrice) {
          hintText = "Hỗ trợ thuê dài hạn";
        }
      } else {
        displayPrice = Number(room.cheapest_monthly_price);
        displayUnit = "/tháng";
        badgeText = "Thuê dài hạn";
        badgeColorClass = "bg-sky-500/95 text-white border-sky-400 hover:bg-sky-500";
      }
    }

    const rentType = (isPrimaryMonthly && hasMonthlyPrice) || (!isPrimaryMonthly && !hasNightlyPrice) ? "monthly" : "daily";

    return (
      <div
        key={room.id}
        onClick={(e) => handleCardClick(e, room.id, rentType)}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleCardClick(e as any, room.id, rentType);
          }
        }}
        className="group h-full cursor-pointer outline-none"
      >
        <Card className="flex h-full flex-col overflow-hidden border-slate-200 transition-all duration-300 hover:translate-y-[-4px] hover:border-sky-200 hover:shadow-xl hover:shadow-sky-500/10">
          <div className="relative aspect-[4/3] shrink-0 overflow-hidden">
            <img
              src={resolveImageUrl(room.room_image, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || getRoomFallbackImage(room.property_type_name, room.title)}
              alt={room.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = getRoomFallbackImage(room.property_type_name, room.title);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Left Badges: Types and features */}
            <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5 z-10">
              {badgeText && (
                <Badge className={`rounded-full border font-semibold shadow-md backdrop-blur-sm transition-all ${badgeColorClass}`}>
                  {badgeText}
                </Badge>
              )}
              <Badge variant="secondary" className="rounded-full border border-slate-200 bg-white/90 text-slate-900 font-semibold shadow-md backdrop-blur-sm hover:bg-white transition-all">
                {normalizeStayPropertyTypeLabel(room.property_type_name)}
              </Badge>
            </div>

            {/* Right Buttons: Wishlist and Share */}
            <div className="absolute right-3 top-3 flex items-center gap-2 z-10">
              <button
                onClick={(e) => handleToggleWishlist(e, room.id)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-rose-500 hover:scale-105 active:scale-95 shadow-lg"
                title="Thêm vào yêu thích"
              >
                <Heart
                  className={`h-4.5 w-4.5 transition-all duration-300 ${wishlist.includes(room.id)
                    ? "fill-rose-500 text-rose-500"
                    : ""
                    }`}
                />
              </button>
              <button
                onClick={(e) => handleShareRoom(e, room.id)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-sky-500 hover:scale-105 active:scale-95 shadow-lg"
                title="Chia sẻ phòng"
              >
                <Share2 className="h-4.5 w-4.5 transition-all duration-300" />
              </button>
            </div>
          </div>
          <CardContent className="flex flex-1 flex-col p-3.5">
            <div className="mb-1.5 flex shrink-0 flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-sky-600">
                <span
                  onClick={(e) => {
                    if (room.partner_id) {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(ROUTERS.PARTNER_DETAIL.replace(":partner_id", String(room.partner_id)));
                    }
                  }}
                  className="interactive-click truncate transition-colors hover:text-sky-700 hover:underline cursor-pointer"
                >
                  {room.partner_company_name || "Đối tác BKS"}
                </span>
                {room.reviews_avg_rating && Number(room.reviews_avg_rating) > 0 ? (
                  <div className="flex items-center gap-1 text-[0.75rem] font-bold text-amber-500">
                    <Star className="size-3 fill-amber-500 text-amber-500" />
                    <span>{room.reviews_avg_rating}</span>
                    <span className="font-normal text-slate-400">({room.reviews_count})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[0.75rem] text-slate-400">
                    <Star className="size-3 text-slate-300" />
                    <span className="font-normal text-slate-400">Chưa đánh giá</span>
                  </div>
                )}
              </div>
              <h3 className="line-clamp-1 h-6 font-bold leading-6 text-slate-800 transition-colors group-hover:text-sky-600">
                {room.title}
              </h3>
            </div>

            <div className="mb-3 flex flex-1 flex-col gap-1.5">
              <div className="flex min-h-[1.25rem] items-start gap-1.5 text-xs text-slate-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" />
                <span className="line-clamp-1 leading-tight">
                  {simplifyAddress(formatRoomAddress(room.province_name, room.property_address))}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                {rentType === "monthly" && (
                  <>
                    <span>{room.area}m²</span>
                    <span className="text-slate-300">•</span>
                  </>
                )}
                <span>{room.people} người</span>
                <span className="text-slate-300">•</span>
                <span>{room.bedrooms_count || 1} PN</span>
                <span className="text-slate-300">•</span>
                <span>{room.beds_count || 1} giường</span>
              </div>
            </div>

            <div className="mt-auto flex shrink-0 items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mr-0.5">Giá từ</span>
                  <span className="text-lg font-extrabold text-sky-600 transition-colors group-hover:text-sky-700">
                    {formatPrice(displayPrice)}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {displayUnit}
                  </span>
                </div>
                {hintText && (
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {hintText}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40 text-slate-900">
      <PublicHeader />

      <div className="relative isolate overflow-hidden bg-slate-950 py-10 text-white sm:py-12 lg:py-16">
        {/* Background Image with elegant overlay */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src={selectedProvince?.image ? resolveCloudinaryUrl(selectedProvince.image, CLOUDINARY_HEADER_IMAGE_URL) || getProvinceImage(selectedProvince?.name) : getProvinceImage(selectedProvince?.name)}
            alt={selectedProvince?.name || "Background"}
            className="absolute inset-0 size-full object-cover opacity-60 transition-all duration-700 scale-105"
          />
          {/* Lighter gradients for elite readability on the left and balanced visibility/tint on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
        </div>

        {/* Glow ambient background effects */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-blue-600/5 blur-[90px] pointer-events-none" />

        {/* Subtle geometric pattern/grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
        
        {/* Decorative elements: floating circles */}
        <div className="absolute top-12 right-1/4 h-2 w-2 rounded-full bg-sky-400/40 animate-ping pointer-events-none" />
        <div className="absolute bottom-16 left-1/4 h-3 w-3 rounded-full bg-indigo-400/30 animate-pulse pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:max-w-[1360px] lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Title and details */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <Badge className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300 border border-sky-500/20 backdrop-blur-md transition-all duration-300 hover:bg-sky-500/20">
                <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
                Kết quả tìm kiếm
              </Badge>
              
              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl leading-[1.15] text-white">
                Tìm phòng lưu trú <br />
                <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  phù hợp nhất
                </span>
              </h1>
              
              <p className="mt-6 text-base text-slate-300 max-w-2xl leading-relaxed">
                Khám phá hàng ngàn không gian sống tiện nghi, căn hộ hiện đại và homestay ấm cúng phù hợp cho cả mục đích công tác, du lịch hay cư trú dài hạn.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 text-sm backdrop-blur-md shadow-inner text-slate-200">
                  <MapPin className="h-4.5 w-4.5 text-sky-400 shrink-0" />
                  <span>
                    {touristSpotLabel ? (
                      <>
                        Gần điểm du lịch: <span className="font-semibold text-white">{touristSpotLabel}</span>
                      </>
                    ) : selectedProvince?.name ? (
                      <>
                        Khu vực: <span className="font-semibold text-white">{formatProvinceName(selectedProvince.name)}</span>
                        {selectedWard?.name && (
                          <>
                            <span className="mx-2 text-slate-600">•</span>
                            <span className="text-sky-300">{selectedWard.name}</span>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="font-semibold text-white">Tất cả tỉnh/thành</span>
                    )}
                  </span>
                </div>

                {deferredKeyword && (
                  <div className="flex items-center gap-2 rounded-2xl bg-sky-950/40 border border-sky-800/40 px-4 py-2.5 text-sm backdrop-blur-md text-sky-200">
                    <span className="text-slate-400">Từ khóa:</span>
                    <span className="font-semibold text-sky-300">"{deferredKeyword}"</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Visual Dashboard / Metrics (Hidden on Mobile/Tablet to keep search flow compact) */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0 hidden lg:block">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Background glow behind cards */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 rounded-3xl blur-2xl pointer-events-none" />
                
                {/* Metrics Grid */}
                <div className="relative grid grid-cols-2 gap-4">
                  {/* Card 1: Total items found */}
                  <div className="col-span-2 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-800/80 p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-slate-700/80 hover:translate-y-[-2px] group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all duration-300">
                          <Home className="h-5.5 w-5.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chỗ ở tại Việt Nam</p>
                          <h3 className="text-2xl font-bold mt-0.5 text-white">
                            1.000+
                          </h3>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold px-2 py-0.5">
                        Tin cậy
                      </Badge>
                    </div>
                  </div>

                  {/* Card 2: Support */}
                  <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-800/80 p-5 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-slate-700/80 hover:translate-y-[-2px] group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-all duration-300">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h4 className="mt-4 text-sm font-bold text-white">Xác thực 100%</h4>
                    <p className="mt-1 text-xs text-slate-400 leading-normal">Mọi phòng đều được kiểm định chất lượng thực tế</p>
                  </div>

                  {/* Card 3: Free changes / Best Price */}
                  <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-800/80 p-5 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-slate-700/80 hover:translate-y-[-2px] group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h4 className="mt-4 text-sm font-bold text-white">Giá tốt nhất</h4>
                    <p className="mt-1 text-xs text-slate-400 leading-normal">BKS cam kết mức giá ưu đãi và minh bạch nhất</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:max-w-[1360px] lg:px-8">
          <Breadcrumb
            items={[
              { label: t("breadcrumb.home"), href: ROUTERS.HOME },
              { label: "Tìm phòng" },
            ]}
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl p-4 sm:px-6 lg:max-w-[1360px] lg:px-8">
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Filter className="h-5 w-5 text-sky-600" />
              Lọc theo loại hình
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={selectedPropertyTypeId === null ? "default" : "outline"}
              className={`rounded-full px-6 transition-all ${selectedPropertyTypeId === null
                ? "bg-primary hover:bg-primary/90 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-600 hover:bg-slate-50"
                }`}
              onClick={() => handlePropertyTypeChange(null)}
            >
              Tất cả
            </Button>
            {propertyTypesData?.data?.map((type) => (
              <Button
                key={type.id}
                variant={selectedPropertyTypeId === type.id ? "default" : "outline"}
                className={`rounded-full px-6 transition-all ${selectedPropertyTypeId === type.id
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-600 hover:bg-slate-50"
                  }`}
                onClick={() => handlePropertyTypeChange(type.id)}
              >
                {normalizeStayPropertyTypeLabel(type.name)}
              </Button>
            ))}
          </div>
        </section>
        <form onSubmit={handleSearchSubmit} className="mb-6 grid gap-3 overflow-visible rounded-3xl border border-slate-200 bg-white p-4 shadow-sm grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.5fr_1.2fr_1.2fr_1.2fr_minmax(11rem,2fr)_120px] items-center">
          {/* Cột 1: Tỉnh/Thành */}
          <div className="w-full">
            <SearchableSelect
              value={localProvinceId ? localProvinceId.toString() : ""}
              onValueChange={handleLocalProvinceChange}
              options={provinceOptions}
              placeholder="Chọn Tỉnh/Thành"
              searchPlaceholder="Tìm kiếm Tỉnh/Thành..."
              emptyMessage="Không tìm thấy Tỉnh/Thành"
              icon={<MapPin className="size-4 text-slate-400 shrink-0" />}
              showSearch
              triggerClassName="h-11 w-full rounded-xl border-slate-200 bg-white px-3 text-left text-sm font-semibold text-slate-700 hover:border-sky-400 focus-visible:ring-1 focus-visible:ring-sky-400"
              contentClassName="bg-white text-slate-900"
            />
          </div>

          {/* Cột 2: Phường/Xã */}
          <div className="w-full">
            <SearchableSelect
              value={localWardId ? localWardId.toString() : ""}
              onValueChange={(val) => setLocalWardId(val ? Number(val) : null)}
              options={wardOptions}
              placeholder="Chọn Phường/Xã"
              searchPlaceholder="Tìm kiếm Phường/Xã..."
              emptyMessage="Không tìm thấy Phường/Xã"
              disabled={!localProvinceId || isLoadingWards}
              loading={isLoadingWards}
              icon={<MapPin className="size-4 text-slate-400 shrink-0" />}
              showSearch
              triggerClassName="h-11 w-full rounded-xl border-slate-200 bg-white px-3 text-left text-sm font-semibold text-slate-700 hover:border-sky-400 focus-visible:ring-1 focus-visible:ring-sky-400 disabled:opacity-60"
              contentClassName="bg-white text-slate-900"
            />
          </div>

          {/* Cột 3: Nhận phòng */}
          <div className="w-full">
            <DatePickerField
              label="Nhận phòng"
              labelClassName="hidden"
              placeholder="Nhận phòng"
              value={localStartDate}
              onChange={(val) => {
                setLocalStartDate(val);
                if (localEndDate && val >= localEndDate) {
                  setLocalEndDate("");
                }
              }}
              minDate={format(new Date(), "yyyy-MM-dd")}
              className="space-y-0"
              triggerClassName="h-11 rounded-xl border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-sky-400 focus-visible:ring-1 focus-visible:ring-sky-400"
            />
          </div>

          {/* Cột 4: Trả phòng */}
          <div className="w-full">
            <DatePickerField
              label="Trả phòng"
              labelClassName="hidden"
              placeholder="Trả phòng"
              value={localEndDate}
              onChange={setLocalEndDate}
              minDate={(() => {
                if (!localStartDate) return format(new Date(), "yyyy-MM-dd");
                const parts = localStartDate.split("-").map(Number);
                if (parts.length === 3) {
                  const date = new Date(parts[0], parts[1] - 1, parts[2] + 1);
                  const pad = (n: number) => n.toString().padStart(2, "0");
                  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
                }
                return format(new Date(), "yyyy-MM-dd");
              })()}
              className="space-y-0"
              triggerClassName="h-11 rounded-xl border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-sky-400 focus-visible:ring-1 focus-visible:ring-sky-400"
            />
          </div>

          {/* Cột 5: Số khách */}
          <div className="w-full">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 w-full items-center justify-start rounded-xl border border-slate-200 bg-white px-3 text-left text-sm font-semibold text-slate-700 hover:border-sky-400 focus-visible:ring-1 focus-visible:ring-sky-400"
                >
                  <Users className="mr-2 size-4 shrink-0 text-slate-400" />
                  <span className="truncate">
                    {localChildren > 0
                      ? `${localAdults} NL, ${localChildren} TE`
                      : `${localAdults} Khách`}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl text-slate-900 font-sans" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">Người lớn</span>
                      <span className="text-xs text-slate-400">Từ 13 tuổi trở lên</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-full border-slate-300"
                        disabled={localAdults <= 1}
                        onClick={() => setLocalAdults(localAdults - 1)}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-6 text-center font-bold">{localAdults}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-full border-slate-300"
                        disabled={localAdults >= 10}
                        onClick={() => setLocalAdults(localAdults + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">Trẻ em</span>
                      <span className="text-xs text-slate-400">Độ tuổi 0 - 12</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-full border-slate-300"
                        disabled={localChildren <= 0}
                        onClick={() => setLocalChildren(localChildren - 1)}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-6 text-center font-bold">{localChildren}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-full border-slate-300"
                        disabled={localChildren >= 10}
                        onClick={() => setLocalChildren(localChildren + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Column 6: Destination / keyword */}
          <div className="relative min-w-0 overflow-visible">
            <DestinationKeywordInput
              value={keyword}
              onChange={setKeyword}
              selectedSpotSlug={touristSpotSlug}
              selectedSpotLabel={touristSpotLabel}
              onSelectSpot={handleSelectTouristSpot}
              onClearSpot={handleClearTouristSpot}
              provinceId={localProvinceId}
            />
          </div>

          {/* Cột 7: Tìm kiếm */}
          <div className="w-full">
            <Button
              type="submit"
              variant="gradient"
              className="h-11 w-full text-sm font-semibold flex items-center justify-center shadow-md hover:scale-[1.02] transition-all"
            >
              <Search className="mr-1.5 size-4" />
              Tìm kiếm
            </Button>
          </div>
        </form>


        {isLoading ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <Spinner size="lg" showText text={t("common.loading")} className="text-slate-500 font-bold" />
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/90 px-6 py-16 text-center">
            <p className="text-sm font-semibold text-rose-600">{t("common.loading_error")}</p>
            <div className="mt-6">
              <Button className="rounded-full" variant="outline" onClick={() => void refetch()}>
                {t("public.roomByProvince.retry")}
              </Button>
            </div>
          </div>
        ) : totalRooms === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/70 bg-white/80 px-6 py-16 text-center">
            <SearchX className="mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900">Không tìm thấy phòng nào</h3>
            <p className="mt-1 text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn</p>
            <Button
              variant="outline"
              className="mt-6 rounded-full"
              onClick={handleResetFilters}
            >
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between font-sans">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-600">
                  {touristSpotLabel ? (
                    <>
                      <span className="font-semibold text-slate-800">{totalRooms.toLocaleString("vi-VN")}</span> phòng gần {touristSpotLabel}
                    </>
                  ) : selectedProvince?.name ? (
                    <>
                       <span className="font-semibold text-slate-800">{totalRooms.toLocaleString("vi-VN")}</span> kết quả tại {formatProvinceName(selectedProvince.name)}
                      {selectedWard?.name ? ` - ${selectedWard.name}` : ""}
                    </>
                  ) : (
                    <>Danh sách phòng lưu trú trên toàn quốc</>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {touristSpotLabel && (
                    <button
                      type="button"
                      className="interactive-click w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800"
                      onClick={() => updateSearchParams({ tourist_spot_slug: null, page: String(DEFAULT_PAGE) }, { scroll: false })}
                    >
                      Bỏ lọc {touristSpotLabel}
                    </button>
                  )}
                  {ratingMin && (
                    <button
                      type="button"
                      className="interactive-click w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 flex items-center gap-1"
                      onClick={() => handleRatingMinChange(null)}
                    >
                      <Star className="size-3 fill-amber-500 text-amber-500" />
                      Bỏ lọc: từ {ratingMin}⭐
                    </button>
                  )}
                  {(priceMin || priceMax) && (
                    <button
                      type="button"
                      className="interactive-click w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800"
                      onClick={() => handlePriceRangeChange(null, null)}
                    >
                      Giá: {priceMin ? `${priceMin.toLocaleString("vi-VN")}đ` : "0đ"} - {priceMax ? `${priceMax.toLocaleString("vi-VN")}đ` : "Không giới hạn"} ×
                    </button>
                  )}
                  {amenityIds.map(id => {
                    const name = publicAmenitiesData?.find((am: any) => am.id === id)?.name || `Tiện nghi #${id}`;
                    return (
                      <button
                        key={`am-${id}`}
                        type="button"
                        className="interactive-click w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800"
                        onClick={() => {
                          handleAmenityIdsChange(amenityIds.filter(val => val !== id));
                        }}
                      >
                        {name} ×
                      </button>
                    );
                  })}
                  {serviceIds.map(id => {
                    const name = publicServicesData?.find((sv: any) => sv.id === id)?.name || `Dịch vụ #${id}`;
                    return (
                      <button
                        key={`sv-${id}`}
                        type="button"
                        className="interactive-click w-fit rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800"
                        onClick={() => {
                          handleServiceIdsChange(serviceIds.filter(val => val !== id));
                        }}
                      >
                        {name} ×
                      </button>
                    );
                  })}
                  {hasSecondaryFilters && (
                    <button
                      type="button"
                      className="interactive-click text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline ml-2 py-1 px-3 rounded-full bg-rose-50 border border-rose-100 flex items-center gap-1 transition-all"
                      onClick={handleClearSecondaryFilters}
                    >
                      Xóa tất cả bộ lọc
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-1 scrollbar-hide md:overflow-visible">
                {/* Bộ lọc Giá */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`h-10 rounded-full border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all hover:border-sky-400 focus:ring-sky-500/10 ${
                        priceMin || priceMax ? "border-sky-500 text-sky-600 bg-sky-50/50" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>Giá</span>
                        {priceMin || priceMax ? (
                          <span className="bg-sky-500 text-white size-5 flex items-center justify-center rounded-full text-[10px]">
                            !
                          </span>
                        ) : null}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl text-slate-900 font-sans" align="end">
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm text-slate-800">Khoảng giá</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label htmlFor="price-min-input" className="text-xs font-medium text-slate-400">Tối thiểu</label>
                          <input
                            type="text"
                            placeholder="0đ"
                            value={localPriceMinStr}
                            onChange={(e) => {
                              const cleaned = validateCurrencyInput(e.target.value);
                              if (cleaned !== null) {
                                setLocalPriceMinStr(formatCurrencyInput(cleaned));
                              }
                            }}
                            id="price-min-input"
                            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-sky-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="price-max-input" className="text-xs font-medium text-slate-400">Tối đa</label>
                          <input
                            type="text"
                            placeholder="Không giới hạn"
                            value={localPriceMaxStr}
                            onChange={(e) => {
                              const cleaned = validateCurrencyInput(e.target.value);
                              if (cleaned !== null) {
                                setLocalPriceMaxStr(formatCurrencyInput(cleaned));
                              }
                            }}
                            id="price-max-input"
                            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-sky-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-xs"
                          onClick={() => {
                            setLocalPriceMinStr("");
                            setLocalPriceMaxStr("");
                            handlePriceRangeChange(null, null);
                          }}
                        >
                          Xóa
                        </Button>
                        <Button
                          variant="gradient"
                          size="sm"
                          className="rounded-full text-xs px-4"
                          onClick={() => {
                            const minVal = localPriceMinStr ? parseCurrencyValue(localPriceMinStr) : null;
                            const maxVal = localPriceMaxStr ? parseCurrencyValue(localPriceMaxStr) : null;
                            if (minVal !== null && maxVal !== null && maxVal <= minVal) {
                              toastError("Giá tối đa phải lớn hơn giá tối thiểu");
                              return;
                            }
                            handlePriceRangeChange(minVal, maxVal);
                          }}
                        >
                          Áp dụng
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Bộ lọc Tiện nghi & Dịch vụ */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`h-10 rounded-full border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all hover:border-sky-400 focus:ring-sky-500/10 ${
                        amenityIds.length > 0 || serviceIds.length > 0 ? "border-sky-500 text-sky-600 bg-sky-50/50" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>Tiện ích</span>
                        {(amenityIds.length + serviceIds.length) > 0 ? (
                          <span className="bg-sky-500 text-white size-5 flex items-center justify-center rounded-full text-[10px]">
                            {amenityIds.length + serviceIds.length}
                          </span>
                        ) : null}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[min(340px,calc(100vw-2rem))] max-h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl text-slate-900 font-sans custom-scrollbar" align="end">
                    <div className="space-y-5">
                      {/* Tiện nghi */}
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1.5">
                          <span className="h-3 w-1 rounded-full bg-sky-500" />
                          Tiện nghi phòng
                        </h4>
                        <div className="grid grid-cols-2 gap-2 pr-1">
                          {featuredAmenities.map((am: any) => (
                            <label key={am.id} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={amenityIds.includes(am.id)}
                                onChange={(e) => {
                                  const nextIds = e.target.checked
                                    ? [...amenityIds, am.id]
                                    : amenityIds.filter(id => id !== am.id);
                                  handleAmenityIdsChange(nextIds);
                                }}
                                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 size-3.5"
                              />
                              <span className="truncate">{am.name}</span>
                            </label>
                          ))}
                          {showAllAmenities && otherAmenities.map((am: any) => (
                            <label key={am.id} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={amenityIds.includes(am.id)}
                                onChange={(e) => {
                                  const nextIds = e.target.checked
                                    ? [...amenityIds, am.id]
                                    : amenityIds.filter(id => id !== am.id);
                                  handleAmenityIdsChange(nextIds);
                                }}
                                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 size-3.5"
                              />
                              <span className="truncate">{am.name}</span>
                            </label>
                          ))}
                        </div>
                        {otherAmenities.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowAllAmenities(!showAllAmenities)}
                            className="mt-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-0.5"
                          >
                            {showAllAmenities ? "Thu gọn ▲" : `Xem thêm (+${otherAmenities.length}) ▼`}
                          </button>
                        )}
                      </div>

                      {/* Dịch vụ */}
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1.5">
                          <span className="h-3 w-1 rounded-full bg-indigo-500" />
                          Dịch vụ thêm
                        </h4>
                        <div className="grid grid-cols-2 gap-2 pr-1">
                          {featuredServices.map((sv: any) => (
                            <label key={sv.id} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={serviceIds.includes(sv.id)}
                                onChange={(e) => {
                                  const nextIds = e.target.checked
                                    ? [...serviceIds, sv.id]
                                    : serviceIds.filter(id => id !== sv.id);
                                  handleServiceIdsChange(nextIds);
                                }}
                                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 size-3.5"
                              />
                              <span className="truncate">{sv.name}</span>
                            </label>
                          ))}
                          {showAllServices && otherServices.map((sv: any) => (
                            <label key={sv.id} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={serviceIds.includes(sv.id)}
                                onChange={(e) => {
                                  const nextIds = e.target.checked
                                    ? [...serviceIds, sv.id]
                                    : serviceIds.filter(id => id !== sv.id);
                                  handleServiceIdsChange(nextIds);
                                }}
                                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 size-3.5"
                              />
                              <span className="truncate">{sv.name}</span>
                            </label>
                          ))}
                        </div>
                        {otherServices.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowAllServices(!showAllServices)}
                            className="mt-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-0.5"
                          >
                            {showAllServices ? "Thu gọn ▲" : `Xem thêm (+${otherServices.length}) ▼`}
                          </button>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-xs h-8"
                          onClick={() => {
                            handleAmenityIdsChange([]);
                            handleServiceIdsChange([]);
                            setShowAllAmenities(false);
                            setShowAllServices(false);
                          }}
                        >
                          Xóa tất cả
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="relative w-full min-w-0 sm:w-auto sm:min-w-[180px] shrink-0">
                  <Select
                    value={ratingMin ? String(ratingMin) : "all"}
                    onValueChange={(val) => handleRatingMinChange(val === "all" ? null : Number(val))}
                  >
                    <SelectTrigger className="h-10 rounded-full border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all hover:border-sky-400 focus:ring-sky-500/10">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <SelectValue placeholder="Đánh giá từ" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                      <SelectItem value="all" className="rounded-xl">Tất cả đánh giá</SelectItem>
                      <SelectItem value="4.5" className="rounded-xl">Tuyệt vời (4.5⭐ trở lên)</SelectItem>
                      <SelectItem value="4.0" className="rounded-xl">Rất tốt (4.0⭐ trở lên)</SelectItem>
                      <SelectItem value="3.0" className="rounded-xl">Tốt (3.0⭐ trở lên)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative w-full min-w-0 sm:w-auto sm:min-w-[200px] shrink-0">
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="h-10 rounded-full border-slate-200 bg-white font-semibold text-slate-700 shadow-sm transition-all hover:border-sky-400 focus:ring-sky-500/10">
                      <div className="flex items-center gap-2">
                        <ArrowDownWideNarrow className="h-4 w-4 text-sky-500" />
                        <SelectValue placeholder="Sắp xếp theo" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                      <SelectItem value="price_asc" className="rounded-xl">Giá thấp đến cao</SelectItem>
                      <SelectItem value="price_desc" className="rounded-xl">Giá cao đến thấp</SelectItem>
                      <SelectItem value="capacity_desc" className="rounded-xl">Sức chứa cao nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Badge variant="secondary" className="w-fit rounded-full bg-sky-50 px-3 py-2 text-sky-700 font-semibold shadow-sm border border-sky-100">
                  Trang {page} trên {totalPages}
                </Badge>
              </div>
            </div>

            <div className={isPlaceholderData ? "opacity-50 pointer-events-none transition-opacity duration-200" : "transition-opacity duration-200"}>
              {/* Group 1: Daily Stays (Khách sạn, Nhà nghỉ & Homestay) */}
              {dailyRooms.length > 0 && (
                <div className="mb-8">
                  <div className="mb-4 flex items-center justify-between font-sans">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <span className="h-5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                      Khách sạn/Nhà nghỉ/Homestay
                    </h3>
                    <Badge variant="secondary" className="rounded-full bg-sky-50 text-sky-700 font-semibold px-3 py-1 shadow-sm border border-sky-100">
                      {dailyRooms.length} phòng
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {dailyRooms.map((room) => renderRoomCard(room))}
                  </div>
                </div>
              )}

              {/* Discount CTA Banner */}
              <DiscountBanner />

              {/* Group 2: Monthly Stays (Căn hộ dịch vụ) */}
              {monthlyRooms.length > 0 && (
                <div className="mt-8 mb-8">
                  <div className="mb-4 flex items-center justify-between font-sans">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <span className="h-5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      Căn hộ dịch vụ
                    </h3>
                    <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 shadow-sm border border-indigo-100">
                      {monthlyRooms.length} phòng
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {monthlyRooms.map((room) => renderRoomCard(room))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                perPage={limit}
                onPerPageChange={handlePerPageChange}
                totalItems={totalRooms}
                perPageOptions={LIMIT_OPTIONS}
                resultsText="kết quả"
                hideTotalItems={true}
              />
            </div>
          </>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};

export default RoomSearch;

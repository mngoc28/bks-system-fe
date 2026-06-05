import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Filter, MapPin, SearchX, Users, ArrowDownWideNarrow, Star, Heart, Share2, Sparkles, Home, ShieldCheck, Search, Minus, Plus, Square } from "lucide-react";
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
import { resolveTouristSpotName } from "@/utils/touristSummary";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetHomeWardsByProvinceId } from "@/hooks/useWardQuery";
import { usePaginatedRoomsQuery } from "@/hooks/EU/useRoomQuery";
import { usePropertyTypesQuery } from "@/hooks/usePropertyQuery";
import { normalizeStayPropertyTypeLabel, isApartmentSegmentPropertyType } from "@/utils/stayPropertyType";
import { formatPrice } from "@/utils/utils";
import { getRoomFallbackImage } from "@/utils/fallbackImages";
import { toastSuccess, toastError } from "@/components/ui/toast";
import { resolveImageUrl } from "@/utils/imageUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const LIMIT_OPTIONS = [8, 12, 16, 24];
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
  const [couponCode, setCouponCode] = useState("BKSSUMMER10");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      const code = dataPayload?.code || "BKSSUMMER10";
      setCouponCode(code);
      setIsSubmitted(true);
      toastSuccess("Đăng ký nhận mã coupon thành công!");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đã xảy ra lỗi khi đăng ký coupon.");
      toastError(err?.response?.data?.message || "Không thể đăng ký coupon.");
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

        <div className="w-full md:w-auto min-w-[320px] sm:min-w-[400px]">
          {isSubmitted ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-5 text-center backdrop-blur-sm animate-fade-in shadow-inner">
              <p className="text-sm font-semibold text-emerald-400">🎉 Đăng ký thành công!</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-xs text-slate-300">Mã giảm giá của bạn:</span>
                <code className="rounded bg-emerald-500/20 px-3 py-1.5 text-sm font-bold text-amber-300 border border-emerald-500/20 select-all tracking-wider">
                  {couponCode}
                </code>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">Sử dụng mã coupon này khi tiến hành đặt phòng.</p>
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
                    if (error) setError("");
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
              {error && <p className="text-xs text-rose-400 font-medium ml-1">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const getProvinceHeroImage = (provinceName: string | undefined): string => {
  if (!provinceName) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80"; // Luxury resort default

  const name = provinceName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (name.includes("da nang")) {
    return "https://images.unsplash.com/photo-1559592442-7486a0952042?auto=format&fit=crop&w=1600&q=80";
  }
  if (name.includes("ha noi")) {
    return "https://images.unsplash.com/photo-1509060464153-44667396260f?auto=format&fit=crop&w=1600&q=80";
  }
  if (name.includes("ho chi minh") || name.includes("sai gon")) {
    return "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&w=1600&q=80";
  }
  if (name.includes("quang ninh") || name.includes("ha long")) {
    return "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80";
  }
  if (name.includes("nha trang") || name.includes("khanh hoa")) {
    return "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1600&q=80";
  }
  if (name.includes("lam dong") || name.includes("da lat")) {
    return "https://images.unsplash.com/photo-1583002621936-e82a0134ba44?auto=format&fit=crop&w=1600&q=80";
  }
  if (name.includes("lao cai") || name.includes("sa pa") || name.includes("sapa")) {
    return "https://images.unsplash.com/photo-1550950158-d0d960dff51b?auto=format&fit=crop&w=1600&q=80";
  }
  if (name.includes("phu quoc") || name.includes("kien giang")) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";
  }

  return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80";
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

  const handleCardClick = (e: React.MouseEvent, roomId: number) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest(".interactive-click")) {
      return;
    }
    const detailUrl = `${ROUTERS.PUBLIC_ROOM_DETAIL.replace(":roomId", roomId.toString())}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
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

  const { data: provincesData } = useGetAllProvincesTypes();
  const { data: wardsData, isLoading: isLoadingWards } = useGetHomeWardsByProvinceId(localProvinceId ?? provinceId ?? 0);
  const { data: propertyTypesData } = usePropertyTypesQuery();

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

  const {
    data: roomsPageData,
    isLoading,
    isError,
    refetch,
  } = usePaginatedRoomsQuery(
    {
      province_id: provinceId || undefined,
      ward_id: wardId || undefined,
      property_type_id: selectedPropertyTypeId || undefined,
      keyword: deferredKeyword || undefined,
      page: requestedPage,
      per_page: limit,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      guests: guests || undefined,
      tourist_spot_slug: touristSpotSlug || undefined,
      ...roomSortParams,
    },
    { enabled: true },
  );

  const rooms = roomsPageData?.data ?? [];
  const totalRooms = roomsPageData?.total ?? 0;
  const totalPages = Math.max(DEFAULT_PAGE, roomsPageData?.last_page ?? DEFAULT_PAGE);
  const page = Math.min(requestedPage, totalPages);

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
    });
  };

  const handleSortChange = (nextSort: string) => {
    updateSearchParams({
      page: String(DEFAULT_PAGE),
      sort: nextSort,
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
    });
  };

  const handleSelectTouristSpot = (spot: TouristSpotSuggestion) => {
    setKeyword("");
    updateSearchParams({
      page: String(DEFAULT_PAGE),
      tourist_spot_slug: spot.slug,
      keyword: null,
      provinceId: null,
      wardId: null,
    });
    setLocalProvinceId(null);
    setLocalWardId(null);
  };

  const handleClearTouristSpot = () => {
    updateSearchParams({
      tourist_spot_slug: null,
      page: String(DEFAULT_PAGE),
    });
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
      });
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
    });
  };

  const dailyRooms = rooms.filter(room => !isApartmentSegmentPropertyType(room.property_type_name));
  const monthlyRooms = rooms.filter(room => isApartmentSegmentPropertyType(room.property_type_name));

  const renderRoomCard = (room: any) => {
    const hasMonthlyPrice = room.cheapest_monthly_price !== null && room.cheapest_monthly_price !== undefined;
    const isHotel = room.property_type_name?.toLowerCase().includes("khách sạn") || room.property_type_name?.toLowerCase().includes("hotel");

    return (
      <div
        key={room.id}
        onClick={(e) => handleCardClick(e, room.id)}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleCardClick(e as any, room.id);
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
              {hasMonthlyPrice && (
                <Badge className={`rounded-full border font-semibold shadow-md backdrop-blur-sm transition-all ${isHotel ? "bg-amber-500/90 text-white border-amber-400 hover:bg-amber-500" : "bg-sky-500/90 text-white border-sky-400 hover:bg-sky-500"}`}>
                  {isHotel ? "Ưu đãi dài hạn" : "Thuê dài hạn"}
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
          <CardContent className="flex flex-1 flex-col p-4">
            <div className="mb-2 flex shrink-0 flex-col gap-1">
              <span
                onClick={(e) => {
                  if (room.partner_id) {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(ROUTERS.PARTNER_DETAIL.replace(":partner_id", String(room.partner_id)));
                  }
                }}
                className="interactive-click h-4 truncate text-[10px] font-bold uppercase tracking-widest text-sky-600 transition-colors hover:text-sky-700 hover:underline cursor-pointer"
              >
                {room.partner_company_name || "Đối tác BKS"}
              </span>
              <h3 className="line-clamp-1 h-6 font-bold leading-6 text-slate-800 transition-colors group-hover:text-sky-600">
                {room.title}
              </h3>
              {room.reviews_avg_rating && Number(room.reviews_avg_rating) > 0 ? (
                <div className="flex h-5 items-center gap-1 text-[0.75rem] font-bold text-amber-500">
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  <span>{room.reviews_avg_rating}</span>
                  <span className="font-normal text-slate-400">({room.reviews_count})</span>
                </div>
              ) : (
                <div className="flex h-5 items-center gap-1 text-[0.75rem] text-slate-400">
                  <Star className="size-3.5 text-slate-300" />
                  <span className="font-normal text-slate-400">Chưa có đánh giá</span>
                </div>
              )}
            </div>

            <div className="mb-4 flex flex-1 flex-col gap-2">
              <div className="flex min-h-[2.5rem] items-start gap-1.5 text-sm text-slate-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                <span className="line-clamp-2 leading-tight">
                  {formatRoomAddress(room.province_name, room.property_address)}
                </span>
              </div>
              <div className="flex min-h-[1.25rem] items-center gap-2 text-xs text-slate-400">
                {room.tourist_summary?.has_tourist_mapping && resolveTouristSpotName(room.tourist_summary.tourist_spot_name) ? (
                  <>
                    <svg className="size-3 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>
                    <span className="truncate font-medium">{resolveTouristSpotName(room.tourist_summary.tourist_spot_name)}</span>
                    {room.tourist_summary.travel_time_label && (
                      <span className="shrink-0">• {room.tourist_summary.travel_time_label}</span>
                    )}
                  </>
                ) : null}
              </div>
              <div className="flex h-5 items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Square className="h-4 w-4 text-sky-500" />
                  {room.area}m²
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-sky-500" />
                  {room.people} người
                </div>
              </div>
            </div>

            <div className="mt-auto flex shrink-0 items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Giá từ</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-sky-600 transition-colors group-hover:text-sky-700">
                    {hasMonthlyPrice && room.cheapest_monthly_price
                      ? formatPrice(room.cheapest_monthly_price)
                      : formatPrice(room.cheapest_daily_price)}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {hasMonthlyPrice && room.cheapest_monthly_price ? "/tháng" : "/đêm"}
                  </span>
                </div>
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
            src={getProvinceHeroImage(selectedProvince?.name)}
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

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                        Khu vực: <span className="font-semibold text-white">{selectedProvince.name}</span>
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
        <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: t("breadcrumb.home"), href: ROUTERS.HOME },
              { label: "Tìm phòng" },
            ]}
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
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
                if (localEndDate && val > localEndDate) {
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
              minDate={localStartDate || format(new Date(), "yyyy-MM-dd")}
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
                      <span className="font-semibold text-slate-800">{totalRooms.toLocaleString("vi-VN")}</span> kết quả tại {selectedProvince.name}
                      {selectedWard?.name ? ` - ${selectedWard.name}` : ""}
                    </>
                  ) : (
                    <>Danh sách phòng lưu trú trên toàn quốc</>
                  )}
                </p>
                {touristSpotLabel ? (
                  <button
                    type="button"
                    className="interactive-click w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800"
                    onClick={() => updateSearchParams({ tourist_spot_slug: null, page: String(DEFAULT_PAGE) })}
                  >
                    Bỏ lọc {touristSpotLabel}
                  </button>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px]">
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

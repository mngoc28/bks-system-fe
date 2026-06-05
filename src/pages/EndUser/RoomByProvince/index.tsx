import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Filter, MapPin, SearchX, Users, Star, Heart, Share2, Sparkles, Home, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/Pagination";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS } from "@/constant";
import type { Room } from "@/dataHelper/EU/room.dataHelper";
import { usePaginatedRoomsQuery } from "@/hooks/EU/useRoomQuery";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { formatPrice, formatProvinceName } from "@/utils/utils";
import { resolveImageUrl } from "@/utils/imageUtils";
import { resolveTouristSpotName } from "@/utils/touristSummary";
import { toastSuccess, toastError } from "@/components/ui/toast";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 9;
const LIMIT_OPTIONS = [6, 9, 12, 18];

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
};

type RoomWithOptionalStatus = Room & {
  status?: number | string | null;
};

const getProvinceHeroImage = (provinceName: string | undefined): string => {
  if (!provinceName) return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

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

  return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80";
};

const RoomByProvince = () => {
  const { t } = useTranslation();
  const { provinceId: provinceIdParam } = useParams<{ provinceId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const provinceId = parsePositiveInt(provinceIdParam ?? null, 0);
  const rawPage = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  const requestedLimit = parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);
  const limit = LIMIT_OPTIONS.includes(requestedLimit) ? requestedLimit : DEFAULT_LIMIT;

  const { data: provincesData, isLoading: isLoadingProvinces } = useGetAllProvincesTypes();
  const selectedProvince = useMemo(
    () => provincesData?.data?.find((province) => province.id === provinceId),
    [provinceId, provincesData],
  );

  const {
    data: roomsPageData,
    isLoading: isLoadingRooms,
    isError,
    refetch,
  } = usePaginatedRoomsQuery(
    {
      province_id: provinceId,
      page: rawPage,
      per_page: limit,
    },
    { enabled: provinceId > 0 },
  );

  const roomsFromApi = roomsPageData?.data ?? ([] as Room[]);
  const totalRooms = roomsPageData?.total ?? 0;
  const totalPages = Math.max(DEFAULT_PAGE, roomsPageData?.last_page ?? DEFAULT_PAGE);
  const page = Math.min(rawPage, totalPages);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    let changed = false;

    if (next.get("page") !== String(rawPage)) {
      next.set("page", String(rawPage));
      changed = true;
    }

    if (next.get("limit") !== String(limit)) {
      next.set("limit", String(limit));
      changed = true;
    }

    if (changed) {
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, rawPage, limit, setSearchParams]);

  useEffect(() => {
    if (rawPage <= totalPages) {
      return;
    }

    const next = new URLSearchParams(searchParams);
    next.set("page", String(totalPages));
    setSearchParams(next, { replace: true });
  }, [rawPage, totalPages, searchParams, setSearchParams]);

  const updateSearchParams = (nextPage: number, nextLimit: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    next.set("limit", String(nextLimit));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return;
    }

    updateSearchParams(nextPage, limit);
  };

  const handlePerPageChange = (nextLimit: number) => {
    if (!LIMIT_OPTIONS.includes(nextLimit) || nextLimit === limit) {
      return;
    }

    updateSearchParams(DEFAULT_PAGE, nextLimit);
  };

  const isInvalidProvince = !isLoadingProvinces && (!provinceId || !selectedProvince);

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
          {/* Lighter gradients to make the background image much clearer while preserving text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
        </div>

        {/* Glow ambient background effects */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-blue-600/5 blur-[90px] pointer-events-none" />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,1) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
        
        {/* Decorative elements: floating circles */}
        <div className="absolute top-12 right-1/4 h-2 w-2 rounded-full bg-sky-400/40 animate-ping pointer-events-none" />
        <div className="absolute bottom-16 left-1/4 h-3 w-3 rounded-full bg-indigo-400/30 animate-pulse pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Title and details */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <Badge className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300 border border-sky-500/20 backdrop-blur-md transition-all duration-300 hover:bg-sky-500/20">
                <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
                {t("public.roomByProvince.badge")}
              </Badge>
              
              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl leading-[1.15] text-white">
                {selectedProvince?.name ? (
                  <>
                    Phòng lưu trú tại <br />
                    <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      {formatProvinceName(selectedProvince.name)}
                    </span>
                  </>
                ) : (
                  <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    {t("public.roomByProvince.titleFallback")}
                  </span>
                )}
              </h1>
              
              <p className="mt-6 text-base text-slate-300 max-w-2xl leading-relaxed">
                {t("public.roomByProvince.subtitle")}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 text-sm backdrop-blur-md shadow-inner text-slate-200">
                  <MapPin className="h-4.5 w-4.5 text-sky-400 shrink-0" />
                  <span>
                    Khu vực: <span className="font-semibold text-white">
                      {selectedProvince?.name ? formatProvinceName(selectedProvince.name) : t("public.roomByProvince.breadcrumb.current")}
                    </span>
                  </span>
                </div>
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
              { label: t("public.roomByProvince.breadcrumb.search"), href: ROUTERS.SEARCH_ROOMS },
              { label: formatProvinceName(selectedProvince?.name) || t("public.roomByProvince.breadcrumb.current") },
            ]}
            className="text-sm"
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isInvalidProvince ? (
          <section className="rounded-3xl border border-dashed border-amber-300 bg-amber-50/80 px-6 py-16 text-center">
            <p className="text-lg font-semibold text-amber-800">{t("public.roomByProvince.invalidTitle")}</p>
            <p className="mt-2 text-sm text-amber-700">{t("public.roomByProvince.invalidDescription")}</p>
            <div className="mt-6">
              <Button asChild className="rounded-full">
                <Link to={ROUTERS.HOME}>{t("public.roomByProvince.backHome")}</Link>
              </Button>
            </div>
          </section>
        ) : isLoadingProvinces || isLoadingRooms ? (
          <section className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <Spinner size="lg" showText text={t("public.roomByProvince.loading")} className="text-slate-500 font-bold" />
          </section>
        ) : isError ? (
          <section className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/90 px-6 py-16 text-center">
            <p className="text-base font-semibold text-rose-600">{t("public.roomByProvince.loadError")}</p>
            <div className="mt-6">
              <Button className="rounded-full" variant="outline" onClick={() => void refetch()}>
                {t("public.roomByProvince.retry")}
              </Button>
            </div>
          </section>
        ) : totalRooms === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300/70 bg-white/80 px-6 py-16 text-center">
            <SearchX className="mx-auto mb-3 size-8 text-slate-400" />
            <p className="text-base font-semibold text-slate-700">{t("public.roomByProvince.emptyTitle")}</p>
            <p className="mt-2 text-sm text-slate-500">{t("public.roomByProvince.emptyDescription")}</p>
            <div className="mt-6">
              <Button asChild className="rounded-full" variant="outline">
                <Link to={ROUTERS.HOME}>{t("public.roomByProvince.backHome")}</Link>
              </Button>
            </div>
          </section>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                {t("public.roomByProvince.summary", {
                  count: totalRooms,
                  province: formatProvinceName(selectedProvince?.name) || t("public.roomByProvince.breadcrumb.current"),
                })}
              </p>
              <Badge variant="secondary" className="w-fit rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                <Filter className="mr-1 size-3.5" />
                {t("public.roomByProvince.appliedFilter")}
              </Badge>
            </div>

            <div className="flex flex-col gap-6">
              {roomsFromApi.map((room) => {
                const roomImage = resolveImageUrl(room.room_image, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL })
                  || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

                const statusValue = (room as RoomWithOptionalStatus).status;
                const isAvailable = statusValue === undefined || statusValue === null || statusValue === 1 || statusValue === "1";

                return (
                  <Card
                    key={room.id}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-sky-300 hover:shadow-md md:flex-row"
                  >
                    <div className="relative h-64 shrink-0 overflow-hidden md:h-auto md:w-72 lg:w-96">
                      <img src={roomImage} alt={room.title} className="size-full object-cover transition duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/10 to-transparent md:hidden" />
                      <div className="absolute inset-0 hidden bg-gradient-to-r from-slate-950/20 via-transparent to-transparent md:block" />
                      {/* Wishlist Button */}
                      <div className="absolute right-3 top-3 z-10">
                        <button
                          onClick={(e) => handleToggleWishlist(e, room.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-rose-500 hover:scale-105 active:scale-95 shadow-lg"
                          title="Thêm vào yêu thích"
                        >
                          <Heart
                            className={`h-4.5 w-4.5 transition-all duration-300 ${
                              wishlist.includes(room.id) ? "fill-rose-500 text-rose-500" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <CardContent className="flex flex-1 flex-col p-6">
                      <div className="flex h-full flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1 flex-1 pr-2">
                              {room.partner_id ? (
                                <Link
                                  to={ROUTERS.PARTNER_DETAIL.replace(":partner_id", String(room.partner_id))}
                                  className="text-[10px] font-bold text-sky-600 uppercase tracking-widest truncate block mb-0.5 hover:text-sky-700 hover:underline transition-colors"
                                >
                                  {room.partner_company_name || "Đối tác BKS"}
                                </Link>
                              ) : (
                                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest truncate block mb-0.5">
                                  {room.partner_company_name || "Đối tác BKS"}
                                </span>
                              )}
                              <h3 className="line-clamp-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-sky-600">{room.title}</h3>
                              {room.reviews_avg_rating && Number(room.reviews_avg_rating) > 0 ? (
                                <div className="flex items-center gap-1 text-[0.8rem] font-bold text-amber-500">
                                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                                  <span>{room.reviews_avg_rating}</span>
                                  <span className="text-slate-400 font-normal">({room.reviews_count} đánh giá)</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-[0.8rem] text-slate-400">
                                  <Star className="size-3.5 text-slate-300" />
                                  <span className="font-normal text-slate-400">Chưa có đánh giá</span>
                                </div>
                              )}
                            </div>
                            <Badge variant="secondary" className={`shrink-0 rounded-full px-3 py-1 ${isAvailable ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                              {isAvailable ? t("public.roomByProvince.roomStatus.available") : t("public.roomByProvince.roomStatus.private")}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <p className="inline-flex items-start gap-2 text-sm text-slate-600">
                              <MapPin className="mt-0.5 size-4 shrink-0 text-sky-500" />
                              <span className="line-clamp-2">{room.property_address || t("public.roomByProvince.fallbackAddress")}</span>
                            </p>
                            {room.tourist_summary?.has_tourist_mapping && resolveTouristSpotName(room.tourist_summary.tourist_spot_name) && (
                              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                <svg className="size-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>
                                <span className="font-medium">{resolveTouristSpotName(room.tourist_summary.tourist_spot_name)}</span>
                                {room.tourist_summary.travel_time_label && <span className="ml-2 text-xs text-slate-400">• {room.tourist_summary.travel_time_label}</span>}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5">
                            <Users className="size-4 text-sky-500" />
                            {t("public.roomByProvince.guests", { count: room.people })}
                          </span>
                        </div>

                        <div className="mt-auto flex flex-col justify-between gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("public.roomByProvince.priceLabel", "Từ")}</span>
                            <span className="text-2xl font-bold text-sky-600">
                              {formatPrice(room.cheapest_daily_price)}
                              <span className="ml-1 text-sm font-normal text-slate-500">{t("public.roomByProvince.perNight")}</span>
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Button
                              variant="outline"
                              type="button"
                              className="shrink-0 rounded-full h-10 w-10 p-0 border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-600 hover:text-sky-600 flex items-center justify-center"
                              onClick={(e) => handleShareRoom(e, room.id)}
                              title="Chia sẻ phòng"
                            >
                              <Share2 className="size-4" />
                            </Button>
                            <Button asChild variant="gradient" className="px-8 rounded-full">
                              <Link to={ROUTERS.PUBLIC_ROOM_DETAIL.replace(":roomId", room.id.toString())}>
                                {t("public.roomByProvince.viewDetails")}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
                resultsText={t("public.roomByProvince.results")}
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

export default RoomByProvince;


import { useEffect, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Filter, MapPin, SearchX, Users, Star, Heart, Share2, Sparkles, BedDouble } from "lucide-react";
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
import { formatPrice, formatProvinceName, simplifyAddress } from "@/utils/utils";
import { resolveImageUrl } from "@/utils/imageUtils";
import { usePublicRoomActions } from "@/hooks/usePublicRoomActions";

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


const RoomByProvince = () => {
  const { t } = useTranslation();
  const { provinceId: provinceIdParam } = useParams<{ provinceId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist, handleToggleWishlist, handleShareRoom } = usePublicRoomActions();

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

      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1440px] py-2.5 px-4 sm:px-6 lg:px-8">
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

      {/* Title & Description Section on clean white layout */}
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-8 sm:px-6 lg:px-8 space-y-2">
        <Badge className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 border border-sky-200 transition-all duration-300">
          <Sparkles className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
          {t("public.roomByProvince.badge")}
        </Badge>
        
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {selectedProvince?.name ? (
            <>
              Phòng lưu trú tại{" "}
              <span className="text-sky-600">
                {formatProvinceName(selectedProvince.name)}
              </span>
            </>
          ) : (
            <span className="text-sky-600">
              {t("public.roomByProvince.titleFallback")}
            </span>
          )}
        </h1>
        
        <p className="text-sm text-slate-500 max-w-4xl leading-relaxed">
          {t("public.roomByProvince.subtitle")}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-slate-500 text-xs pt-1">
          <MapPin className="h-3.5 w-3.5 text-sky-500 shrink-0" />
          <span>
            Khu vực: <span className="font-semibold text-slate-700">
              {selectedProvince?.name ? formatProvinceName(selectedProvince.name) : t("public.roomByProvince.breadcrumb.current")}
            </span>
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
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
                    <div className="relative h-64 shrink-0 overflow-hidden md:h-80 md:w-72 lg:w-96">
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
                                  {room.partner_company_name || t("public.home.partners.trust")}
                                </Link>
                              ) : (
                                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest truncate block mb-0.5">
                                  {room.partner_company_name || t("public.home.partners.trust")}
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
                              <span className="line-clamp-1">{simplifyAddress(room.property_address) || t("public.roomByProvince.fallbackAddress")}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5">
                            <Users className="size-4 text-sky-500" />
                            {t("public.roomByProvince.guests", { count: room.people })}
                          </span>
                          {(room.bedrooms_count !== undefined || room.beds_count !== undefined) && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5">
                              <BedDouble className="size-4 text-sky-500" />
                              {room.bedrooms_count || 1} PN • {room.beds_count || 1} giường
                            </span>
                          )}
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
                              <Link to={`${ROUTERS.PUBLIC_ROOM_DETAIL.replace(":roomId", room.id.toString())}?rent_type=daily`}>
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

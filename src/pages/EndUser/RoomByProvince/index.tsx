import { useEffect, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Filter, MapPin, SearchX, Users, Star } from "lucide-react";
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
import { useRoomsQuery } from "@/hooks/EU/useRoomQuery";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { formatPrice } from "@/utils/utils";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 9;
const LIMIT_OPTIONS = [6, 9, 12, 18];

const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

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
    data: roomsFromApi = [],
    isLoading: isLoadingRooms,
    isError,
    refetch,
  } = useRoomsQuery(
    {
      province_id: provinceId,
      page: rawPage,
      per_page: limit,
    },
    { enabled: provinceId > 0 },
  );

  const normalizedProvinceName = useMemo(() => {
    if (!selectedProvince?.name) {
      return "";
    }

    return normalize(selectedProvince.name);
  }, [selectedProvince]);

  const filteredRooms = useMemo(() => {
    if (!provinceId || !roomsFromApi.length) {
      return [] as Room[];
    }

    return roomsFromApi.filter((room) => {
      if (room.province_id) {
        return room.province_id === provinceId;
      }

      if (!normalizedProvinceName) {
        return true;
      }

      return normalize(room.province_name || "").includes(normalizedProvinceName);
    });
  }, [provinceId, roomsFromApi, normalizedProvinceName]);

  const totalRooms = filteredRooms.length;
  const totalPages = Math.max(DEFAULT_PAGE, Math.ceil(totalRooms / limit));
  const page = Math.min(rawPage, totalPages);

  const pagedRooms = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredRooms.slice(start, start + limit);
  }, [filteredRooms, page, limit]);

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

      <div className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900/80" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
            {t("public.roomByProvince.badge")}
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {selectedProvince?.name
              ? t("public.roomByProvince.title", { province: selectedProvince.name })
              : t("public.roomByProvince.titleFallback")}
          </h1>
          <p className="mt-3 text-slate-200">{t("public.roomByProvince.subtitle")}</p>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: t("breadcrumb.home"), href: ROUTERS.HOME },
              { label: t("public.roomByProvince.breadcrumb.search"), href: ROUTERS.SEARCH_ROOMS },
              { label: selectedProvince?.name || t("public.roomByProvince.breadcrumb.current") },
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
            <Spinner size="lg" spinnerClassName="border-y-sky-600" showText text={t("public.roomByProvince.loading")} className="text-slate-500 font-bold" />
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
                  province: selectedProvince?.name || t("public.roomByProvince.breadcrumb.current"),
                })}
              </p>
              <Badge variant="secondary" className="w-fit rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                <Filter className="mr-1 size-3.5" />
                {t("public.roomByProvince.appliedFilter")}
              </Badge>
            </div>

            <div className="flex flex-col gap-6">
              {pagedRooms.map((room) => {
                const roomImage = room.room_image
                  ? `${CLOUDINARY_HEADER_IMAGE_URL}/${room.room_image}`
                  : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

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
                    </div>
                    <CardContent className="flex flex-1 flex-col p-6">
                      <div className="flex h-full flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1 flex-1 pr-2">
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
                            {room.tourist_summary && room.tourist_summary.has_tourist_mapping && (
                              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                <svg className="size-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>
                                <span className="font-medium">{room.tourist_summary.tourist_spot_name}</span>
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
                          <div className="flex shrink-0 gap-3">
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


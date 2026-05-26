import { FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Search, Quote, Star, Building2, Home } from "lucide-react";
import { ROUTERS, CLOUDINARY_HEADER_IMAGE_URL, DEFAULT_ROOM_IMAGE, FEATURED_CITY_PRIORITY, FEATURED_DESTINATION_PRIORITY, SUGGESTED_ROOM_CITY_PRIORITY } from "@/constant";
import { useLandingReviewsQuery } from "@/hooks/useReviewQuery";
import SearchableSelect from "@/components/ui/searchable-select";
import FeaturedRoomCarousel from "@/components/rooms/FeaturedRoomCarousel";
import ContactCard from "@/components/common/ContactCard";
import { toastError } from "@/components/ui/toast";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetHomeWardsByProvinceId } from "@/hooks/useWardQuery";
import { usePropertyTypesQuery } from "@/hooks/usePropertyQuery";
import { useLatestRoomsQuery, useSuggestedRoomsByProvinceQuery } from "@/hooks/EU/useRoomQuery";
import { useRandomPartnersQuery } from "@/hooks/EU/usePartnerQuery";
import type { ProvinceTypes } from "@/dataHelper/province.dataHelper";
import type { Ward } from "@/dataHelper/ward.dataHelper";
import type { RoomCard } from "@/dataHelper/home.dataHelper";
import ProvinceCarousel from "./components/ProvinceCarousel";
import SuggestedRoomsByProvince from "./components/SuggestedRoomsByProvince";
import PartnerGrid from "./components/PartnerGrid";
import NewsGrid from "./components/NewsGrid";
import { PublicHeader, PublicFooter } from "@/components/layout/Public";
import { useLatestNewsQuery } from "@/hooks/useNewsQuery";
import { useNavigate } from "react-router-dom";

const PROVINCE_IMAGE_POOL = [
  "https://images.unsplash.com/photo-1529429617124-aee71981ce52?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1578898887932-990f2fabfc24?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1495435229349-e86db7bfa013?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=80",
];

function normalizeProvinceName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[\s.\-_/]+/g, " ")
    .trim();
}

function getProvincePriority(name: string): number {
  const normalizedName = normalizeProvinceName(name);
  const normalizedPriority = FEATURED_CITY_PRIORITY.map(normalizeProvinceName);
  const matchIndex = normalizedPriority.findIndex((priorityName) => normalizedName.includes(priorityName));

  return matchIndex >= 0 ? matchIndex : Number.POSITIVE_INFINITY;
}

function getDestinationPriority(name: string): number {
  const normalizedName = normalizeProvinceName(name);
  const normalizedPriority = FEATURED_DESTINATION_PRIORITY.map(normalizeProvinceName);
  const matchIndex = normalizedPriority.findIndex((priorityName) => normalizedName.includes(priorityName));

  return matchIndex >= 0 ? matchIndex : Number.POSITIVE_INFINITY;
}

function getRoomLocationText(room: any): string {
  return normalizeProvinceName([room?.province_name, room?.property_address, room?.address_detail, room?.property_name].filter(Boolean).join(" "));
}

function getAvatarColors(name: string): string {
  const charCode = name ? name.charCodeAt(0) : 71; // 'G' is 71
  const index = charCode % 5;
  const colors = [
    "bg-rose-50 text-rose-600 border-rose-200/60",
    "bg-indigo-50 text-indigo-600 border-indigo-200/60",
    "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    "bg-amber-50 text-amber-600 border-amber-200/60",
    "bg-sky-50 text-sky-600 border-sky-200/60",
  ];
  return colors[index];
}

/**
 * Public Home Page
 * The primary landing page for the public-facing site, featuring search, featured rooms, partners, and news.
 */
const PublicHome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [wardId, setWardId] = useState<number | null>(null);
  const [propertyTypeId, setPropertyTypeId] = useState<number | null>(null);

  const { data: provincesData, isLoading: isLoadingProvinces } = useGetAllProvincesTypes();
  const { data: wardsData, isLoading: isLoadingWards } = useGetHomeWardsByProvinceId(provinceId ?? 0);
  const { data: propertyTypesData, isLoading: isLoadingPropertyTypes } = usePropertyTypesQuery();
  const { data: latestNewsData, isLoading: isLoadingNews, isError: isErrorNews } = useLatestNewsQuery(6);

  const { data: latestRoomsData } = useLatestRoomsQuery();
  const { data: randomPartnersData } = useRandomPartnersQuery();
  const { data: landingReviewsData } = useLandingReviewsQuery();

  const featuredRooms: RoomCard[] = useMemo(() => {
    const rooms = (latestRoomsData as any)?.data ?? latestRoomsData ?? [];
    return (rooms as any[]).slice(0, 6).map((room: any) => {
      const monthlyPrice = room.cheapest_monthly_price;
      const dailyPrice = room.cheapest_daily_price;
      const priceLabel = monthlyPrice
        ? `${Number(monthlyPrice).toLocaleString('vi-VN')}₫ / tháng`
        : dailyPrice
          ? `${Number(dailyPrice).toLocaleString('vi-VN')}₫ / ngày`
          : "Liên hệ";

      return {
        id: room.id,
        name: room.title,
        address: room.property_address || "Đang cập nhật",
        price: priceLabel,
        image: room.room_image ? `${CLOUDINARY_HEADER_IMAGE_URL}${room.room_image}` : DEFAULT_ROOM_IMAGE,
        area: `${room.area} m²`,
        beds: room.people ?? 0,
        tourist_summary: (room as any).tourist_summary ?? null,
        reviews_count: room.reviews_count ?? 0,
        reviews_avg_rating: room.reviews_avg_rating ?? 0,
        room_type: room.room_type,
        property_type_name: room.property_type_name,
      };
    });
  }, [latestRoomsData]);

  const featuredProvinces = useMemo(() => {
    const provinces = provincesData?.data ?? [];

    return provinces
      .map((province: ProvinceTypes, index: number) => ({
        province,
        index,
        priority: getProvincePriority(province.name),
        destinationPriority: getDestinationPriority(province.name),
      }))
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }

        if (a.destinationPriority !== b.destinationPriority) {
          return a.destinationPriority - b.destinationPriority;
        }

        return a.index - b.index;
      })
      .map(({ province }, index: number) => ({
        ...province,
        image: PROVINCE_IMAGE_POOL[index % PROVINCE_IMAGE_POOL.length],
      }));
  }, [provincesData]);

  const suggestedProvinceIds = useMemo(() => {
    const provinces = provincesData?.data ?? [];
    const orderedPriorityNames = SUGGESTED_ROOM_CITY_PRIORITY.map(normalizeProvinceName);
    const matchedProvinceIds: number[] = [];

    orderedPriorityNames.forEach((priorityName) => {
      const matchedProvince = provinces.find((province: ProvinceTypes) => normalizeProvinceName(province.name).includes(priorityName));
      if (matchedProvince && !matchedProvinceIds.includes(matchedProvince.id)) {
        matchedProvinceIds.push(matchedProvince.id);
      }
    });

    return matchedProvinceIds;
  }, [provincesData]);

  const { data: suggestedRoomsByProvinceData } = useSuggestedRoomsByProvinceQuery(
    { province_ids: suggestedProvinceIds, limit: 4 },
    { enabled: suggestedProvinceIds.length > 0 },
  );

  const orderedSuggestedRoomsByProvinceData = useMemo(() => {
    const groups = suggestedRoomsByProvinceData ?? [];
    if (!groups.length || !suggestedProvinceIds.length) {
      return groups;
    }

    return [...groups].sort((a, b) => {
      const aIndex = a.province_id != null ? suggestedProvinceIds.indexOf(a.province_id) : Number.POSITIVE_INFINITY;
      const bIndex = b.province_id != null ? suggestedProvinceIds.indexOf(b.province_id) : Number.POSITIVE_INFINITY;

      return aIndex - bIndex;
    });
  }, [suggestedProvinceIds, suggestedRoomsByProvinceData]);

  const fallbackSuggestedRoomsByProvinceData = useMemo(() => {
    const rooms = (latestRoomsData as any)?.data ?? latestRoomsData ?? [];
    if (!suggestedProvinceIds.length || !rooms.length) {
      return [];
    }

    return SUGGESTED_ROOM_CITY_PRIORITY.map((provinceName) => {
      const normalizedProvinceName = normalizeProvinceName(provinceName);
      const matchedProvince = (provincesData?.data ?? []).find(
        (province: ProvinceTypes) => normalizeProvinceName(province.name) === normalizedProvinceName,
      );

      const provinceRooms = (rooms as any[])
        .filter((room: any) => getRoomLocationText(room).includes(normalizedProvinceName))
        .slice(0, 4)
        .map((room: any) => ({
          id: room.id,
          title: room.title,
          room_type: room.room_type,
          people: room.people,
          description: room.description,
          province_id: room.province_id ?? matchedProvince?.id ?? null,
          province_name: room.province_name ?? provinceName,
          province_name_en: room.province_name_en ?? null,
          property_address: room.property_address,
          cheapest_daily_price: room.cheapest_daily_price,
          cheapest_monthly_price: room.cheapest_monthly_price,
          room_image: room.room_image,
          area: room.area,
          tourist_summary: room.tourist_summary ?? null,
          property_type_name: room.property_type_name,
        }));

      return {
        province_id: matchedProvince?.id ?? null,
        province_name: provinceName,
        province_name_en: matchedProvince?.name_en ?? null,
        rooms: provinceRooms,
      };
    });
  }, [latestRoomsData, provincesData, suggestedProvinceIds]);

  const mergedSuggestedRoomsByProvinceData = useMemo(() => {
    const grouped = new Map(
      (orderedSuggestedRoomsByProvinceData.length > 0 ? orderedSuggestedRoomsByProvinceData : fallbackSuggestedRoomsByProvinceData).map((group) => [
        normalizeProvinceName(group.province_name),
        group,
      ]),
    );

    SUGGESTED_ROOM_CITY_PRIORITY.forEach((provinceName, index) => {
      const normalizedProvinceName = normalizeProvinceName(provinceName);
      const fallbackGroup = fallbackSuggestedRoomsByProvinceData[index];
      const apiGroup = orderedSuggestedRoomsByProvinceData.find(
        (group) => normalizeProvinceName(group.province_name) === normalizedProvinceName,
      );

      const chosenGroup = apiGroup && apiGroup.rooms?.length ? apiGroup : fallbackGroup;
      if (chosenGroup) {
        grouped.set(normalizedProvinceName, chosenGroup);
      }
    });

    return SUGGESTED_ROOM_CITY_PRIORITY.map((provinceName) =>
      grouped.get(normalizeProvinceName(provinceName)) ?? {
        province_id: null,
        province_name: provinceName,
        province_name_en: null,
        rooms: [],
      },
    );
  }, [fallbackSuggestedRoomsByProvinceData, orderedSuggestedRoomsByProvinceData]);

  const partnerCompanies = useMemo(() => {
    const partners = (randomPartnersData as any)?.data ?? randomPartnersData ?? [];
    return (partners as any[]).slice(0, 6).map((partner: any) => ({
      id: partner.id,
      name: partner.company_name || [partner.ward_name, partner.province_name].filter(Boolean).join(", ") || "Đối tác BKS",
      address: [partner.ward_name, partner.province_name].filter(Boolean).join(", ") || partner.address || "Đang cập nhật",
      image: partner.image_1 ? `${CLOUDINARY_HEADER_IMAGE_URL}${partner.image_1}` : DEFAULT_ROOM_IMAGE,
      reviews_count: partner.reviews_count ?? 0,
      reviews_avg_rating: partner.reviews_avg_rating ?? 0,
    }));
  }, [randomPartnersData]);

  const latestNews = useMemo(() => {
    const newsItems = latestNewsData?.data ?? [];

    return newsItems.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.summary,
      image: `${CLOUDINARY_HEADER_IMAGE_URL}${item.image_url}`,
      category: item.slug,
      publishedAt: new Date(item.published_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }));
  }, [latestNewsData]);

  const provinceOptions = useMemo(() => {
    return (
      provincesData?.data?.map((province: ProvinceTypes) => ({
        value: province.id.toString(),
        label: province.name,
      })) ?? []
    );
  }, [provincesData]);

  const wardOptions = useMemo(() => {
    return (
      wardsData?.data?.map((ward: Ward) => ({
        value: ward.id.toString(),
        label: ward.name,
      })) ?? []
    );
  }, [wardsData]);

  const selectedProvinceName = useMemo(() => {
    return provincesData?.data?.find((p: ProvinceTypes) => p.id === provinceId)?.name;
  }, [provincesData, provinceId]);

  const propertyTypeOptions = useMemo(() => {
    return (
      propertyTypesData?.data?.map((type: any) => ({
        value: type.id.toString(),
        label: type.name,
      })) ?? []
    );
  }, [propertyTypesData]);

  const resetWard = (nextProvince: number | null) => {
    setProvinceId(nextProvince);
    setWardId(null);
  };

  const performSearch = (selectedProvinceId: number | null, selectedWardId: number | null, selectedPropertyTypeId: number | null) => {
    if (!selectedProvinceId) {
      toastError(t("public.home.search.provinceRequired"));
      return;
    }

    const params = new URLSearchParams({ provinceId: selectedProvinceId.toString() });
    if (selectedWardId) {
      params.set("wardId", selectedWardId.toString());
    }
    if (selectedPropertyTypeId) {
      params.set("propertyTypeId", selectedPropertyTypeId.toString());
    }
    navigate(`${ROUTERS.SEARCH_ROOMS}?${params.toString()}`);
  };

  const handleProvinceChange = (value: string) => {
    const nextProvince = value ? Number(value) : null;
    resetWard(nextProvince);
  };

  const handleWardChange = (value: string) => {
    if (!provinceId) {
      toastError("Vui lòng chọn Tỉnh/Thành trước khi chọn Phường/Xã");
      return;
    }

    const nextWard = value ? Number(value) : null;
    setWardId(nextWard);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    performSearch(provinceId, wardId, propertyTypeId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900">
      <PublicHeader />

      <main className="flex flex-col gap-14 pb-14 text-[15px]">
        <section
          id="hero"
          className="relative isolate z-[60] min-h-[520px] bg-slate-950 text-white md:h-[560px] lg:h-[600px]"
        >
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <img
              src="/assets/images/luxury_banner.png"
              alt={t("public.home.hero.alt")}
              className="animate-slow-zoom absolute inset-0 size-full scale-105 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/20 md:bg-gradient-to-r md:from-slate-950/80 md:via-slate-900/30 md:to-transparent" />
          </div>

          <div className="relative z-20 mx-auto flex size-full max-w-6xl flex-col justify-center gap-10 px-6 py-16">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-primary-10">
                {t("public.home.hero.badge")}
              </span>
              <h1 className="text-[2.5rem] font-bold leading-tight sm:text-[3rem]">
                {t("public.home.hero.title")}
              </h1>
              <p className="text-base text-slate-200">
                {t("public.home.hero.description")}
              </p>
            </div>

            <form
              className="relative z-[200] grid gap-4 rounded-[32px] border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:bg-white/15 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
              onSubmit={handleSearchSubmit}
            >
              <SearchableSelect
                value={provinceId ? provinceId.toString() : ""}
                onValueChange={handleProvinceChange}
                options={provinceOptions}
                placeholder={t("public.home.search.provincePlaceholder")}
                searchPlaceholder={t("public.home.search.provinceSearch")}
                emptyMessage={t("public.home.search.provinceEmpty")}
                disabled={isLoadingProvinces}
                loading={isLoadingProvinces}
                icon={<MapPin className="size-5" />}
                showSearch
                triggerClassName="h-14 rounded-2xl border-none bg-white/85 px-5 text-left text-base font-semibold text-slate-900 shadow-lg backdrop-blur focus-visible:ring-2 focus-visible:ring-primary/50"
                contentClassName="bg-white text-slate-900"
              />

              <SearchableSelect
                value={wardId ? wardId.toString() : ""}
                onValueChange={handleWardChange}
                options={wardOptions}
                placeholder={provinceId ? `Chọn Phường/Xã tại ${selectedProvinceName}` : t("public.home.search.provinceFirstPlaceholder")}
                searchPlaceholder="Tìm kiếm Phường/Xã..."
                emptyMessage={provinceId ? "Không tìm thấy Phường/Xã" : "Vui lòng chọn Tỉnh/Thành trước"}
                disabled={!provinceId || isLoadingWards}
                loading={isLoadingWards}
                icon={<MapPin className="size-5" />}
                showSearch
                triggerClassName="h-14 rounded-2xl border-none bg-white/85 px-5 text-left text-base font-semibold text-slate-900 shadow-lg backdrop-blur focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-60"
                contentClassName="bg-white text-slate-900"
              />

              <SearchableSelect
                value={propertyTypeId ? propertyTypeId.toString() : ""}
                onValueChange={(val) => setPropertyTypeId(val ? Number(val) : null)}
                options={propertyTypeOptions}
                placeholder="Loại hình"
                searchPlaceholder="Tìm loại hình..."
                emptyMessage="Không tìm thấy loại hình"
                disabled={isLoadingPropertyTypes}
                loading={isLoadingPropertyTypes}
                icon={<Search className="size-5" />}
                showSearch
                triggerClassName="h-14 rounded-2xl border-none bg-white/85 px-5 text-left text-base font-semibold text-slate-900 shadow-lg backdrop-blur focus-visible:ring-2 focus-visible:ring-primary/50"
                contentClassName="bg-white text-slate-900"
              />

              <button
                type="submit"
                className="flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-primary via-sky-600 to-sky-700 px-8 text-base font-semibold text-white shadow-lg shadow-sky-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!provinceId}
              >
              <Search className="mr-2 size-5" />
              {t("public.home.search.cta")}
            </button>
          </form>
          </div>
        </section>

        <ProvinceCarousel
          className="mx-auto w-full max-w-6xl"
          heading="Khám phá thành phố đáng đi nhất"
          description="Ưu tiên các thành phố lớn và điểm đến du lịch nổi bật để bạn chọn nhanh hơn ngay từ trang chủ."
          provinces={featuredProvinces}
          ctaLabel="Xem tất cả điểm đến"
          ctaHref={ROUTERS.SEARCH_ROOMS}
        />

        <FeaturedRoomCarousel
          className="mx-auto w-full max-w-6xl"
          heading="Phòng nổi bật dành cho chuyến đi tiếp theo"
          description="Bộ sưu tập phòng được chọn lọc từ dữ liệu hiện có, ưu tiên trải nghiệm đặt phòng rõ ràng và dễ theo dõi."
          rooms={featuredRooms}
          ctaLabel="Khám phá phòng nổi bật"
          ctaHref={ROUTERS.SEARCH_ROOMS}
        />

        <SuggestedRoomsByProvince
          className="mx-auto w-full max-w-6xl"
          groups={mergedSuggestedRoomsByProvinceData}
          priorityProvinceNames={SUGGESTED_ROOM_CITY_PRIORITY}
        />

        <PartnerGrid
          className="mx-auto w-full max-w-6xl"
          heading={t("public.home.partners.heading")}
          description={t("public.home.partners.description")}
          partners={partnerCompanies}
        />

        {/* Testimonials / Reviews Showcase */}
        {landingReviewsData && landingReviewsData.length > 0 && (
          <section className="mx-auto w-full max-w-6xl px-6 py-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Trải nghiệm khách hàng
              </span>
              <h2 className="text-3xl font-bold mt-2 text-slate-900">
                Khách hàng nói gì về BKS Stay
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Những chia sẻ, đóng góp ý kiến thực tế từ những vị khách đã và đang lưu trú cùng chúng tôi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {landingReviewsData.slice(0, 3).map((review: any) => (
                <div
                  key={review.id}
                  className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col justify-between relative group"
                >
                  <div className="absolute top-6 right-8 text-sky-500/10 group-hover:text-sky-500/20 transition-colors duration-300">
                    <Quote className="size-10 fill-current" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`size-4 ${
                              i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      {review.room ? (
                        <span className="inline-flex items-center gap-1 bg-sky-50/70 text-[10px] font-bold text-sky-700 px-2 py-0.5 rounded-md border border-sky-100 max-w-full">
                          <Home className="size-3 text-sky-500 shrink-0" />
                          <span className="truncate">Phòng: {review.room.title}</span>
                        </span>
                      ) : review.partner?.partner_info ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50/70 text-[10px] font-bold text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 max-w-full">
                          <Building2 className="size-3 text-emerald-500 shrink-0" />
                          <span className="truncate">Đối tác: {review.partner.partner_info.company_name}</span>
                        </span>
                      ) : null}
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed italic mb-6">
                      "{review.comment || "Dịch vụ tuyệt vời, phòng ốc sạch sẽ và tiện nghi. Chủ nhà hỗ trợ rất nhiệt tình trong suốt kỳ nghỉ."}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                    <div className={`size-8 rounded-full border overflow-hidden flex items-center justify-center shrink-0 ${
                      review.user?.avatar 
                        ? "bg-slate-100 border-slate-200" 
                        : getAvatarColors(review.user?.name || "Khách lưu trú")
                    }`}>
                      {review.user?.avatar ? (
                        <img
                          src={review.user.avatar}
                          alt={review.user.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold flex items-center justify-center size-full">
                          {review.user?.name?.charAt(0) || "G"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate">
                        {review.user?.name || "Khách lưu trú"}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <ContactCard className="mx-auto w-full max-w-6xl" />

        <NewsGrid
          className="mx-auto w-full max-w-6xl"
          heading={t("public.home.news.heading")}
          description={t("public.home.news.description")}
          articles={latestNews}
          ctaHref={ROUTERS.PUBLIC_NEWS_LIST}
          ctaLabel={t("public.home.news.ctaLabel", "Xem thêm")}
          footerLabel={t("public.home.news.footerCta")}
          loading={isLoadingNews}
          error={isErrorNews}
        />
      </main>

      <PublicFooter />

      <style>{`
        @keyframes slow-zoom {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1.05); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 30s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};


export default PublicHome;


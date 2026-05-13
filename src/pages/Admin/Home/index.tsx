import { FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Search } from "lucide-react";
import { ROUTERS, CLOUDINARY_HEADER_IMAGE_URL, DEFAULT_ROOM_IMAGE } from "@/constant";
import SearchableSelect from "@/components/ui/searchable-select";
import FeaturedRoomCarousel from "@/components/rooms/FeaturedRoomCarousel";
import ContactCard from "@/components/common/ContactCard";
import { toastError } from "@/components/ui/toast";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetHomeWardsByProvinceId } from "@/hooks/useWardQuery";
import { useBuildingTypesQuery } from "@/hooks/useBuildingQuery";
import { useLatestRoomsQuery } from "@/hooks/EU/useRoomQuery";
import { useRandomPartnersQuery } from "@/hooks/EU/usePartnerQuery";
import type { ProvinceTypes } from "@/dataHelper/province.dataHelper";
import type { Ward } from "@/dataHelper/ward.dataHelper";
import type { RoomCard } from "@/dataHelper/home.dataHelper";
import ProvinceCarousel from "./components/ProvinceCarousel";
import PartnerGrid from "./components/PartnerGrid";
import NewsGrid from "./components/NewsGrid";
import { PublicHeader, PublicFooter } from "@/components/layout/Public";
import { useLatestNewsQuery } from "@/hooks/useNewsQuery";
import { useNavigate } from "react-router-dom";
import "@splidejs/splide/css";

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
  const { data: propertyTypesData, isLoading: isLoadingPropertyTypes } = useBuildingTypesQuery();
  const { data: latestNewsData, isLoading: isLoadingNews, isError: isErrorNews } = useLatestNewsQuery(6);

  const { data: latestRoomsData } = useLatestRoomsQuery();
  const { data: randomPartnersData } = useRandomPartnersQuery();

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
        address: room.building_address || "Đang cập nhật",
        price: priceLabel,
        image: room.room_image ? `${CLOUDINARY_HEADER_IMAGE_URL}${room.room_image}` : DEFAULT_ROOM_IMAGE,
        area: `${room.area} m²`,
        beds: room.people ?? 0,
      };
    });
  }, [latestRoomsData]);

  const featuredProvinces = useMemo(() => {
    const provinces = provincesData?.data ?? [];

    return provinces.map((province: ProvinceTypes, index: number) => ({
      ...province,
      image: PROVINCE_IMAGE_POOL[index % PROVINCE_IMAGE_POOL.length],
    }));
  }, [provincesData]);

  const partnerCompanies = useMemo(() => {
    const partners = (randomPartnersData as any)?.data ?? randomPartnersData ?? [];
    return (partners as any[]).slice(0, 6).map((partner: any) => ({
      id: partner.id,
      name: [partner.ward_name, partner.province_name].filter(Boolean).join(", ") || "Đối tác BKS",
      address: partner.address || "Đang cập nhật",
      image: partner.image_1 ? `${CLOUDINARY_HEADER_IMAGE_URL}${partner.image_1}` : DEFAULT_ROOM_IMAGE,
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
                placeholder={provinceId ? `Chọn Phường/Xã tại ${selectedProvinceName}` : "Chọn tỉnh/thành trước"}
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
                className="flex h-14 items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-white shadow-xl transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
          heading={t("public.home.provinceCarousel.heading")}
          description={t("public.home.provinceCarousel.description")}
          provinces={featuredProvinces}
        />

        <FeaturedRoomCarousel
          className="mx-auto w-full max-w-6xl"
          heading={t("public.home.rooms.heading")}
          description={t("public.home.rooms.description")}
          rooms={featuredRooms}
        />

        <PartnerGrid
          className="mx-auto w-full max-w-6xl"
          heading={t("public.home.partners.heading")}
          description={t("public.home.partners.description")}
          partners={partnerCompanies}
        />

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

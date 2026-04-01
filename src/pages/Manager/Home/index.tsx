import { FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Search } from "lucide-react";
import { ROUTERS, CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import SearchableSelect from "@/components/ui/searchable-select";
import FeaturedRoomCarousel from "@/components/rooms/FeaturedRoomCarousel";
import ContactCard from "@/components/common/ContactCard";
import { toastError } from "@/components/ui/toast";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetHomeWardsByProvinceId } from "@/hooks/useWardQuery";
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

const PublicHome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);

  const { data: provincesData, isLoading: isLoadingProvinces } = useGetAllProvincesTypes();
  const { data: districtsData, isLoading: isLoadingDistricts } = useGetHomeWardsByProvinceId(provinceId ?? 0);
  const { data: latestNewsData, isLoading: isLoadingNews, isError: isErrorNews } = useLatestNewsQuery(6);

  const featuredRooms: RoomCard[] = useMemo(
    () => [
      {
        id: 1,
        name: "Skyline Premier Apartment",
        address: "120 Nguyen Trai, District 1",
        price: "18,000,000₫ / month",
        image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
        area: "85 m²",
        beds: 2,
      },
      {
        id: 2,
        name: "Riverside Garden Loft",
        address: "75 Tran Hung Dao, District 5",
        price: "14,500,000₫ / month",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        area: "68 m²",
        beds: 1,
      },
      {
        id: 3,
        name: "Sunset View Condo",
        address: "18 Pham Van Dong, Thu Duc",
        price: "16,200,000₫ / month",
        image: "https://images.unsplash.com/photo-1512914890250-353c87e0e961?auto=format&fit=crop&w=1200&q=80",
        area: "92 m²",
        beds: 3,
      },
      {
        id: 4,
        name: "Urban Nest Studio",
        address: "88 Le Loi, District 3",
        price: "9,800,000₫ / month",
        image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
        area: "48 m²",
        beds: 1,
      },
      {
        id: 5,
        name: "Pearl Residences",
        address: "210 Dien Bien Phu, Binh Thanh",
        price: "21,500,000₫ / month",
        image: "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=1200&q=80",
        area: "105 m²",
        beds: 3,
      },
      {
        id: 6,
        name: "Emerald Suites",
        address: "60 Hoang Dieu, District 4",
        price: "12,700,000₫ / month",
        image: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
        area: "62 m²",
        beds: 1,
      },
      {
        id: 7,
        name: "Lakeside Harmony",
        address: "45 Nguyen Van Cu, District 5",
        price: "13,400,000₫ / month",
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
        area: "74 m²",
        beds: 2,
      },
      {
        id: 8,
        name: "Panorama Heights",
        address: "11 Nguyen Huu Canh, Binh Thanh",
        price: "19,900,000₫ / month",
        image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
        area: "98 m²",
        beds: 3,
      },
      {
        id: 9,
        name: "Crescent Bay Loft",
        address: "9 Nguyen Van Linh, District 7",
        price: "15,300,000₫ / month",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        area: "80 m²",
        beds: 2,
      },
      {
        id: 10,
        name: "Gardenia Residences",
        address: "33 To Hien Thanh, District 10",
        price: "11,200,000₫ / month",
        image: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
        area: "58 m²",
        beds: 1,
      },
    ],
    [],
  );

  const featuredProvinces = useMemo(() => {
    const provinces = provincesData?.data ?? [];

    return provinces.map((province: ProvinceTypes, index: number) => ({
      ...province,
      image: PROVINCE_IMAGE_POOL[index % PROVINCE_IMAGE_POOL.length],
    }));
  }, [provincesData]);


  const partnerCompanies = useMemo(
    () => [
      {
        id: 1,
        name: "Lumiere Property Group",
        address: "Floor 8, 21 Le Duan, District 1",
        image: "https://images.unsplash.com/photo-1529429617124-aee71981ce52?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: 2,
        name: "Metropolitan Realty",
        address: "123 Pasteur, Ben Nghe Ward, District 1",
        image: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: 3,
        name: "Crescent City Holdings",
        address: "26 Nguyen Van Linh, Tan Phu Ward, District 7",
        image: "https://images.unsplash.com/photo-1487956382158-bb926046304a?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: 4,
        name: "Lotus Property Partners",
        address: "55 Dien Bien Phu, Da Kao Ward, District 1",
        image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: 5,
        name: "Harborfront Estates",
        address: "200 Nguyen Huu Canh, Ward 22, Binh Thanh",
        image: "https://images.unsplash.com/photo-1488722796624-0aa6f1bb6399?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: 6,
        name: "Aurora Development",
        address: "88 Tran Hung Dao, Ward 6, District 5",
        image: "https://images.unsplash.com/photo-1496309981847-94b1d1b355ae?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    [],
  );

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

  const districtOptions = useMemo(() => {
    return (
      districtsData?.data?.map((district: Ward) => ({
        value: district.id.toString(),
        label: district.name,
      })) ?? []
    );
  }, [districtsData]);

  const resetDistrict = (nextProvince: number | null) => {
    setProvinceId(nextProvince);
    setDistrictId(null);
  };

  const performSearch = (selectedProvinceId: number | null, selectedDistrictId: number | null) => {
    if (!selectedProvinceId) {
      toastError(t("public.home.search.provinceRequired"));
      return;
    }

    const params = new URLSearchParams({ provinceId: selectedProvinceId.toString() });
    if (selectedDistrictId) {
      params.set("districtId", selectedDistrictId.toString());
    }
    navigate(`${ROUTERS.SEARCH_ROOMS}?${params.toString()}`);
  };

  const handleProvinceChange = (value: string) => {
    const nextProvince = value ? Number(value) : null;
    resetDistrict(nextProvince);
  };

  const handleDistrictChange = (value: string) => {
    if (!provinceId) {
      toastError(t("public.home.search.districtRequiresProvince"));
      return;
    }

    const nextDistrict = value ? Number(value) : null;
    setDistrictId(nextDistrict);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    performSearch(provinceId, districtId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900">
      <PublicHeader />

      <main className="flex flex-col gap-14 pb-14 text-[15px]">
        <section
          id="hero"
          className="relative z-[60] isolate bg-slate-950 text-white min-h-[520px] md:h-[560px] lg:h-[600px]"
        >
          <img
            src="/assets/images/banner.webp"
            alt={t("public.home.hero.alt")}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/30 to-slate-800/20" />

          <div className="relative z-20 mx-auto flex h-full w-full max-w-6xl flex-col justify-center gap-10 px-6 py-16">
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
              className="relative z-[200] grid gap-3 rounded-3xl bg-white/12 p-5 shadow-2xl backdrop-blur md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
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
                icon={<MapPin className="h-5 w-5" />}
                showSearch
                triggerClassName="h-14 rounded-2xl border-none bg-white/85 px-5 text-left text-base font-semibold text-slate-900 shadow-lg backdrop-blur focus-visible:ring-2 focus-visible:ring-primary/50"
                contentClassName="bg-white text-slate-900"
              />

              <SearchableSelect
                value={districtId ? districtId.toString() : ""}
                onValueChange={handleDistrictChange}
                options={districtOptions}
                placeholder={provinceId ? t("public.home.search.districtPlaceholder") : t("public.home.search.provinceFirstPlaceholder")}
                searchPlaceholder={t("public.home.search.districtSearch")}
                emptyMessage={provinceId ? t("public.home.search.districtEmpty") : t("public.home.search.districtPrompt")}
                disabled={!provinceId || isLoadingDistricts}
                loading={isLoadingDistricts}
                icon={<MapPin className="h-5 w-5" />}
                showSearch
                triggerClassName="h-14 rounded-2xl border-none bg-white/85 px-5 text-left text-base font-semibold text-slate-900 shadow-lg backdrop-blur focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-60"
                contentClassName="bg-white text-slate-900"
              />

              <button
                type="submit"
                className="flex h-14 items-center justify-center rounded-2xl bg-primary px-8 text-base font-semibold text-white shadow-xl transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!provinceId}
              >
              <Search className="mr-2 h-5 w-5" />
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
    </div>
  );
};


export default PublicHome;

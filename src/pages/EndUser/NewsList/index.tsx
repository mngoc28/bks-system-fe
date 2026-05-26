import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, TrendingUp, Sparkles } from "lucide-react";
import { format } from "date-fns";
import Breadcrumb from "@/components/common/Breadcrumb";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { useListNewsPublicQuery, useLatestNewsQuery } from "@/hooks/useNewsQuery";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS, DEFAULT_ROOM_IMAGE } from "@/constant";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/Pagination";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 8;

// Regions mapping for Vietnam provinces
const REGIONS = {
  NORTH: {
    label: "Miền Bắc",
    provinces: ["Hà Nội", "Hải Phòng", "Quảng Ninh", "Bắc Ninh", "Hải Dương", "Hưng Yên", "Nam Định", "Ninh Bình", "Thái Bình", "Vĩnh Phúc"]
  },
  CENTRAL: {
    label: "Miền Trung",
    provinces: ["Đà Nẵng", "Thừa Thiên Huế", "Khánh Hòa", "Quảng Nam", "Quảng Ngãi", "Bình Định", "Phú Yên", "Ninh Thuận", "Bình Thuận", "Thanh Hóa", "Nghệ An", "Hà Tĩnh"]
  },
  SOUTH: {
    label: "Miền Nam",
    provinces: ["Hồ Chí Minh", "Bình Dương", "Đồng Nai", "Bà Rịa - Vũng Tàu", "Long An", "Tiền Giang", "Bến Tre", "Vĩnh Long", "Cần Thơ", "An Giang", "Kiên Giang"]
  }
};

const NewsList = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = Number(searchParams.get("page")) || DEFAULT_PAGE;
  const limit = Number(searchParams.get("limit")) || DEFAULT_LIMIT;

  // Data fetching
  const { data: featuredNewsResponse, isLoading: isLoadingFeatured } = useLatestNewsQuery(3);
  const { data: newsListDataResponse, isLoading: isLoadingPopular } = useListNewsPublicQuery({
    page,
    per_page: limit,
  });
  const { data: provincesData } = useGetAllProvincesTypes();

  const featuredItems = featuredNewsResponse?.data || [];
  const popularItems = newsListDataResponse?.data?.data || [];
  const totalItems = newsListDataResponse?.data?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Grouped Provinces
  const groupedProvinces = useMemo(() => {
    const list = provincesData?.data || [];
    return {
      north: list.filter(p => REGIONS.NORTH.provinces.some(name => p.name.includes(name))),
      central: list.filter(p => REGIONS.CENTRAL.provinces.some(name => p.name.includes(name))),
      south: list.filter(p => REGIONS.SOUTH.provinces.some(name => p.name.includes(name))),
      others: list.filter(p => 
        !REGIONS.NORTH.provinces.some(name => p.name.includes(name)) && 
        !REGIONS.CENTRAL.provinces.some(name => p.name.includes(name)) && 
        !REGIONS.SOUTH.provinces.some(name => p.name.includes(name))
      )
    };
  }, [provincesData]);

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(newPage));
    setSearchParams(next);
    // Scroll to Popular section instead of top for better UX
    const popularSection = document.getElementById("popular-articles");
    popularSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <PublicHeader />

      {/* 1. Hero / Banner Section */}
      <section className="relative h-[400px] overflow-hidden md:h-[500px] lg:h-[600px]">
        <img 
          src="https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=2070&auto=format&fit=crop" 
          alt="Hero" 
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col items-start justify-center px-4 text-white">
          <Badge className="mb-6 rounded-full border-none bg-sky-500 px-4 py-1.5 text-sm uppercase tracking-widest hover:bg-sky-600">
            {t("public.newsList.heroBadge", "Tạp chí phong cách sống")}
          </Badge>
          <h1 className="mb-6 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            {t("public.newsList.heroTitle", "Trong một căn phòng khác, Một cuộc sống mới")}
          </h1>
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-100/90 md:text-xl">
            {t("public.newsList.heroSub", "Khám phá những câu chuyện cảm hứng về không gian sống và hành trình tìm kiếm tổ ấm lý tưởng của bạn.")}
          </p>
          <Button asChild className="rounded-full bg-white px-8 py-6 text-lg font-bold text-slate-900 shadow-xl hover:bg-slate-100">
            <Link to="#popular-articles">{t("public.newsList.startReading", "Bắt đầu khám phá")}</Link>
          </Button>
        </div>
      </section>

      {/* Breadcrumb section */}
      <div className="sticky top-0 z-40 border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: t("breadcrumb.home"), href: ROUTERS.HOME },
              { label: t("public.newsList.breadcrumb", "Tin tức") },
            ]}
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-20 px-4 py-12 sm:px-6 lg:px-8">
        
        {/* 2. Featured Articles Section (3-column) */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-2.5">
              <Sparkles className="size-5 text-sky-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
              {t("public.newsList.featuredHeading", "Bài viết được đề xuất")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {isLoadingFeatured ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            ) : (
              featuredItems.map((item) => (
                <Link 
                  key={item.id} 
                  to={ROUTERS.PUBLIC_NEWS_DETAIL.replace(":newsId", item.id.toString())}
                  className="group block space-y-4"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-100 shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-xl">
                    <img 
                      src={item.image_url ? `${CLOUDINARY_HEADER_IMAGE_URL}/${item.image_url}` : DEFAULT_ROOM_IMAGE} 
                      alt={item.title} 
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = DEFAULT_ROOM_IMAGE;
                      }}
                    />
                    <div className="absolute left-4 top-4 z-10">
                      <Badge className="gradient-indigo border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg rounded-full">
                        {item.published_at ? format(new Date(item.published_at), "dd/MM/yyyy") : "-"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="line-clamp-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-sky-600">
                      {item.title}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {item.summary}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* 3. Categories Chips Section */}
        <section id="categories" className="overflow-x-auto border-y border-slate-100 py-6">
          <div className="flex min-w-max items-center gap-4">
            <span className="mr-4 text-sm font-black uppercase tracking-widest text-slate-400">
              {t("public.newsList.categories", "Loại")}:
            </span>
            {["Căn hộ", "Kinh nghiệm", "Mẹo đặt phòng", "Review", "Thị trường", "Phong cách sống"].map((cat) => (
              <Button key={cat} variant="outline" className="rounded-full border-slate-200 px-6 font-semibold hover:border-sky-500 hover:text-sky-600">
                {cat}
              </Button>
            ))}
          </div>
        </section>

        {/* 4. Popular Articles Grid (4-column) */}
        <section id="popular-articles" className="scroll-mt-24 space-y-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-2.5">
              <TrendingUp className="size-5 text-amber-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
              {t("public.newsList.popularHeading", "Bài viết phổ biến")}
            </h2>
            <p className="ml-4 hidden text-sm italic text-slate-500 md:block">
              {t("public.newsList.popularSub", "Chúng tôi mang đến thông tin hữu ích về chỗ ở ngắn hạn, cũng như các câu hỏi thường gặp về cuộc sống...")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoadingPopular ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            ) : (
              popularItems.map((item) => (
                <Link 
                  key={item.id} 
                  to={ROUTERS.PUBLIC_NEWS_DETAIL.replace(":newsId", item.id.toString())}
                  className="group block space-y-3"
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition group-hover:shadow-md">
                    <img 
                      src={item.image_url ? `${CLOUDINARY_HEADER_IMAGE_URL}/${item.image_url}` : DEFAULT_ROOM_IMAGE} 
                      alt={item.title} 
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = DEFAULT_ROOM_IMAGE;
                      }}
                    />
                    <div className="absolute left-3 top-3 z-10">
                      <Badge className="gradient-indigo border-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg rounded-full">
                        {item.published_at ? format(new Date(item.published_at), "dd/MM/yyyy") : "-"}
                      </Badge>
                    </div>
                  </div>
                  <h4 className="line-clamp-2 text-sm font-bold leading-tight text-slate-900 transition-colors group-hover:text-sky-600">
                    {item.title}
                  </h4>
                </Link>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="inline-block rounded-3xl border border-slate-100 bg-white p-2 shadow-sm">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  resultsText={t("pagination.results")}
                />
              </div>
            </div>
          )}
        </section>

        {/* 5. Regional Search Menu */}
        <section className="space-y-12 rounded-[40px] border border-slate-100 bg-white p-8 shadow-sm md:p-12">
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
              {t("public.newsList.regionalHeading", "Tìm kiếm tin tức theo Khu vực")}
            </h2>
            <p className="text-slate-500">{t("public.newsList.regionalSub", "Khám phá các bài viết review và kinh nghiệm tại từng tỉnh thành.")}</p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {[
              { id: 'north', title: REGIONS.NORTH.label, data: groupedProvinces.north },
              { id: 'central', title: REGIONS.CENTRAL.label, data: groupedProvinces.central },
              { id: 'south', title: REGIONS.SOUTH.label, data: groupedProvinces.south }
            ].map((region) => (
              <div key={region.id} className="space-y-6">
                <h3 className="flex w-max items-center gap-2 border-b-2 border-sky-500 pb-2 text-lg font-black text-slate-900">
                  <MapPin className="size-4 text-sky-500" />
                  {region.title}
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {region.data.slice(0, 10).map((p) => (
                    <Link 
                      key={p.id} 
                      to={ROUTERS.PARTNERS.replace(":provinceNameEn", p.name_en)}
                      className="flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-sky-600 hover:underline"
                    >
                      <div className="size-1 rounded-full bg-slate-300" />
                      {p.name}
                    </Link>
                  ))}
                  {region.data.length === 0 && (
                    <span className="text-xs italic text-slate-400">Đang cập nhật...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* CTA Final section before footer */}
      <section className="mt-20 bg-slate-900 py-20">
        <div className="mx-auto max-w-4xl space-y-8 px-4 text-center">
          <h2 className="text-3xl font-black leading-tight text-white md:text-5xl">
            {t("public.newsList.finalCta", "Bạn đang tìm kiếm một không gian sống phù hợp?")}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="h-auto rounded-full bg-sky-500 px-8 py-4 text-lg font-bold text-white hover:bg-sky-600">
              <Link to={ROUTERS.SEARCH_ROOMS}>{t("public.home.hero.cta", "Tìm phòng ngay")}</Link>
            </Button>
            <Button 
              onClick={() => window.dispatchEvent(new CustomEvent("open-public-chatbot"))}
              variant="outline" 
              className="h-auto rounded-full border-white px-8 py-4 text-lg font-bold text-white hover:bg-white hover:text-slate-900"
            >
              {t("public.contact.title", "Liên hệ với chúng tôi")}
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default NewsList;

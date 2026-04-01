import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, TrendingUp, Sparkles } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { useListNewsPublicQuery, useLatestNewsQuery } from "@/hooks/useNewsQuery";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS } from "@/constant";
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
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=2070&auto=format&fit=crop" 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
        <div className="relative h-full mx-auto max-w-7xl px-4 flex flex-col justify-center items-start text-white">
          <Badge className="mb-6 bg-sky-500 hover:bg-sky-600 border-none px-4 py-1.5 text-sm uppercase tracking-widest rounded-full">
            {t("public.newsList.heroBadge", "Tạp chí phong cách sống")}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black leading-tight max-w-3xl mb-6">
            {t("public.newsList.heroTitle", "Trong một căn phòng khác, Một cuộc sống mới")}
          </h1>
          <p className="text-lg md:text-xl text-slate-100/90 max-w-2xl leading-relaxed mb-8">
            {t("public.newsList.heroSub", "Khám phá những câu chuyện cảm hứng về không gian sống và hành trình tìm kiếm tổ ấm lý tưởng của bạn.")}
          </p>
          <Button asChild className="rounded-full bg-white text-slate-900 hover:bg-slate-100 px-8 py-6 text-lg font-bold shadow-xl">
            <Link to="#popular-articles">{t("public.newsList.startReading", "Bắt đầu khám phá")}</Link>
          </Button>
        </div>
      </section>

      {/* Breadcrumb section */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: t("breadcrumb.home"), href: ROUTERS.HOME },
              { label: t("public.newsList.breadcrumb", "Tin tức") },
            ]}
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-20">
        
        {/* 2. Featured Articles Section (3-column) */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-100 rounded-2xl">
              <Sparkles className="h-5 w-5 text-sky-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              {t("public.newsList.featuredHeading", "Bài viết được đề xuất")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-slate-100 shadow-sm transition group-hover:shadow-xl group-hover:-translate-y-1">
                    <img 
                      src={item.image_url ? `${CLOUDINARY_HEADER_IMAGE_URL}/${item.image_url}` : "https://images.unsplash.com/photo-1585829365234-781fcd50c40b?q=80&w=2070&auto=format&fit=crop"} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* 3. Categories Chips Section */}
        <section id="categories" className="py-6 border-y border-slate-100 overflow-x-auto">
          <div className="flex items-center gap-4 min-w-max">
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest mr-4">
              {t("public.newsList.categories", "Loại")}:
            </span>
            {["Căn hộ", "Kinh nghiệm", "Mẹo đặt phòng", "Review", "Thị trường", "Phong cách sống"].map((cat) => (
              <Button key={cat} variant="outline" className="rounded-full border-slate-200 hover:border-sky-500 hover:text-sky-600 font-semibold px-6">
                {cat}
              </Button>
            ))}
          </div>
        </section>

        {/* 4. Popular Articles Grid (4-column) */}
        <section id="popular-articles" className="space-y-8 scroll-mt-24">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-2xl">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              {t("public.newsList.popularHeading", "Bài viết phổ biến")}
            </h2>
            <p className="hidden md:block text-slate-500 text-sm italic ml-4">
              {t("public.newsList.popularSub", "Chúng tôi mang đến thông tin hữu ích về chỗ ở ngắn hạn, cũng như các câu hỏi thường gặp về cuộc sống...")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <div className="aspect-square overflow-hidden rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md transition">
                    <img 
                      src={item.image_url ? `${CLOUDINARY_HEADER_IMAGE_URL}/${item.image_url}` : "https://images.unsplash.com/photo-1585829365234-781fcd50c40b?q=80&w=2070&auto=format&fit=crop"} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-tight">
                    {item.title}
                  </h4>
                </Link>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-sm inline-block">
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
        <section className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 space-y-12 shadow-sm">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              {t("public.newsList.regionalHeading", "Tìm kiếm tin tức theo Khu vực")}
            </h2>
            <p className="text-slate-500">{t("public.newsList.regionalSub", "Khám phá các bài viết review và kinh nghiệm tại từng tỉnh thành.")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { id: 'north', title: REGIONS.NORTH.label, data: groupedProvinces.north },
              { id: 'central', title: REGIONS.CENTRAL.label, data: groupedProvinces.central },
              { id: 'south', title: REGIONS.SOUTH.label, data: groupedProvinces.south }
            ].map((region) => (
              <div key={region.id} className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b-2 border-sky-500 pb-2 w-max">
                  <MapPin className="h-4 w-4 text-sky-500" />
                  {region.title}
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {region.data.slice(0, 10).map((p) => (
                    <Link 
                      key={p.id} 
                      to={ROUTERS.PARTNERS.replace(":provinceNameEn", p.name_en)}
                      className="text-sm text-slate-600 hover:text-sky-600 hover:underline transition-colors flex items-center gap-2"
                    >
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      {p.name}
                    </Link>
                  ))}
                  {region.data.length === 0 && (
                    <span className="text-xs text-slate-400 italic">Đang cập nhật...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* CTA Final section before footer */}
      <section className="bg-slate-900 py-20 mt-20">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            {t("public.newsList.finalCta", "Bạn đang tìm kiếm một không gian sống phù hợp?")}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="rounded-full bg-sky-500 hover:bg-sky-600 text-white px-8 font-bold text-lg h-auto py-4">
              <Link to={ROUTERS.SEARCH_ROOMS}>{t("public.home.hero.cta", "Tìm phòng ngay")}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white text-white hover:bg-white hover:text-slate-900 px-8 font-bold text-lg h-auto py-4">
              <Link to={ROUTERS.CONTACT}>{t("public.contact.title", "Liên hệ với chúng tôi")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default NewsList;

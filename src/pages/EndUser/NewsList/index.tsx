import { useMemo, useState } from "react";
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
import { resolveImageUrl } from "@/utils/imageUtils";

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
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

  const filteredPopularItems = useMemo(() => {
    if (!selectedCategory) return popularItems;
    
    const categoryLower = selectedCategory.toLowerCase();
    
    const keywordMap: Record<string, string[]> = {
      "căn hộ": ["căn hộ", "chung cư", "phòng", "apartment", "nhà", "stay", "villa"],
      "kinh nghiệm": ["kinh nghiệm", "chia sẻ", "trải nghiệm", "hướng dẫn", "lưu ý"],
      "mẹo đặt phòng": ["mẹo", "đặt phòng", "booking", "bí quyết", "tips", "hủy phòng", "đặt chỗ"],
      "review": ["review", "đánh giá", "cảm nhận", "tiện ích", "dịch vụ", "chi tiết"],
      "thị trường": ["thị trường", "bất động sản", "giá cả", "xu hướng", "2025", "2026", "tổng quan"],
      "phong cách sống": ["phong cách", "lối sống", "lifestyle", "decor", "thiết kế", "trang trí", "không gian"]
    };
    
    const keywords = keywordMap[categoryLower] || [categoryLower];
    
    return popularItems.filter(item => {
      const titleLower = item.title?.toLowerCase() || "";
      const summaryLower = item.summary?.toLowerCase() || "";
      return keywords.some(keyword => titleLower.includes(keyword) || summaryLower.includes(keyword));
    });
  }, [popularItems, selectedCategory]);

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
      <section className="relative overflow-hidden py-14 md:py-20">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=2070&auto=format&fit=crop"
          alt="Hero"
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-sky-950/80" />
        {/* Ambient glows */}
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-sky-600/15 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        {/* Coordinate grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          {/* LEFT — 3/5 */}
          <div className="lg:col-span-3">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-sm font-semibold text-sky-300">
              <Sparkles className="size-4" />
              {t("public.newsList.heroBadge", "Tạp chí phong cách sống")}
            </div>

            {/* Title */}
            <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("public.newsList.heroTitle", "Trong một căn phòng khác, Một cuộc sống mới")}
            </h1>

            {/* Subtitle */}
            <p className="mb-8 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {t("public.newsList.heroSub", "Khám phá những câu chuyện cảm hứng về không gian sống và hành trình tìm kiếm tổ ấm lý tưởng của bạn.")}
            </p>

            {/* CTA */}
            <Button asChild className="rounded-full bg-white px-8 py-5 text-base font-bold text-slate-900 shadow-xl hover:bg-slate-100">
              <Link to="#popular-articles">{t("public.newsList.startReading", "Bắt đầu khám phá")}</Link>
            </Button>
          </div>

          {/* RIGHT — 2/5 */}
          <div className="hidden lg:col-span-2 lg:flex lg:flex-col lg:gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <p className="mb-4 text-sm font-bold uppercase tracking-widest text-sky-300">Nội dung nổi bật</p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sky-400" />
                  Kinh nghiệm thuê phòng dài hạn không bị hớ
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sky-400" />
                  Review căn hộ dịch vụ tại TP.HCM &amp; Hà Nội
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sky-400" />
                  Thị trường bất động sản cho thuê 2025
                </li>
              </ul>
            </div>
            {/* Stat cards */}
            <div className="flex gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <Sparkles className="size-5 text-amber-400" />
                <div>
                  <div className="text-lg font-bold text-white">
                    {featuredItems.length > 0 ? `${featuredItems.length}` : "—"}
                  </div>
                  <div className="text-xs text-slate-400">Bài nổi bật</div>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <TrendingUp className="size-5 text-emerald-400" />
                <div>
                  <div className="text-lg font-bold text-white">
                    {totalItems >= 1000 ? `${Math.floor(totalItems / 1000)}k+` : totalItems > 0 ? `${totalItems}` : "—"}
                  </div>
                  <div className="text-xs text-slate-400">Bài viết</div>
                </div>
              </div>
            </div>
          </div>
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
                      src={resolveImageUrl(item.image_url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || DEFAULT_ROOM_IMAGE} 
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
        <section id="categories" className="overflow-x-auto border-y border-slate-100 py-6 scrollbar-hide snap-x snap-mandatory">
          <div className="flex min-w-max items-center gap-2 px-4 sm:px-0">
            <span className="mr-4 text-sm font-black uppercase tracking-widest text-slate-400">
              {t("public.newsList.categories", "Loại")}:
            </span>
            <Button 
              variant={selectedCategory === null ? "default" : "outline"} 
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-6 font-semibold transition-all ${selectedCategory === null ? 'bg-sky-600 hover:bg-sky-500 text-white border-transparent' : 'border-slate-200 hover:border-sky-500 hover:text-sky-600'}`}
            >
              Tất cả
            </Button>
            {["Căn hộ", "Kinh nghiệm", "Mẹo đặt phòng", "Review", "Thị trường", "Phong cách sống"].map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <Button 
                  key={cat} 
                  variant={isActive ? "default" : "outline"} 
                  onClick={() => setSelectedCategory(isActive ? null : cat)}
                  className={`rounded-full px-6 font-semibold transition-all ${isActive ? 'bg-sky-600 hover:bg-sky-500 text-white border-transparent' : 'border-slate-200 hover:border-sky-500 hover:text-sky-600'}`}
                >
                  {cat}
                </Button>
              );
            })}
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
            ) : filteredPopularItems.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <p className="font-bold text-slate-400">Không có bài viết nào thuộc danh mục này.</p>
                <Button 
                  variant="ghost" 
                  className="mt-2 text-sky-600 hover:bg-sky-50 rounded-full" 
                  onClick={() => setSelectedCategory(null)}
                >
                  Làm mới bộ lọc
                </Button>
              </div>
            ) : (
              filteredPopularItems.map((item) => (
                <Link 
                  key={item.id} 
                  to={ROUTERS.PUBLIC_NEWS_DETAIL.replace(":newsId", item.id.toString())}
                  className="group block space-y-3"
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-100 shadow-sm transition group-hover:shadow-md">
                    <img 
                      src={resolveImageUrl(item.image_url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || DEFAULT_ROOM_IMAGE} 
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

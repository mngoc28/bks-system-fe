import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, User, Clock, Share2, Facebook, Twitter, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

import Breadcrumb from "@/components/common/Breadcrumb";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { useNewsDetailPublicQuery, useLatestNewsQuery } from "@/hooks/useNewsQuery";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS } from "@/constant";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const NewsDetail = () => {
  const { t } = useTranslation();
  const { newsId } = useParams<{ newsId: string }>();
  const id = Number(newsId);

  const { data: newsDetailResponse, isLoading: isLoadingDetail, isError } = useNewsDetailPublicQuery(id);
  const { data: latestNewsResponse, isLoading: isLoadingLatest } = useLatestNewsQuery(5);

  const news = newsDetailResponse?.data;
  const latestNews = latestNewsResponse?.data || [];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t("public.newsDetail.copySuccess", "Đã sao chép liên kết!"));
  };

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">{t("public.newsDetail.errorTitle", "Không tìm thấy tin tức")}</h2>
            <p className="text-slate-600">{t("public.newsDetail.errorDesc", "Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.")}</p>
            <Button asChild variant="outline">
              <Link to={ROUTERS.HOME}>{t("public.newsDetail.backHome", "Quay lại trang chủ")}</Link>
            </Button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <PublicHeader />

      {/* Breadcrumb Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: t("breadcrumb.home"), href: ROUTERS.HOME },
              { label: t("public.newsDetail.breadcrumb.news", "Tin tức"), href: "#" },
              { label: news?.title || t("public.newsDetail.breadcrumb.loading", "Đang tải...") },
            ]}
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <article className="lg:col-span-8 space-y-8">
            {isLoadingDetail ? (
              <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <Skeleton className="h-10 w-3/4" />
                <div className="flex gap-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-96 w-full rounded-2xl" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ) : (
              <div className="bg-white overflow-hidden rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                {/* News Image */}
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={news?.image_url ? `${CLOUDINARY_HEADER_IMAGE_URL}/${news.image_url}` : "https://images.unsplash.com/photo-1585829365234-781fcd50c40b?q=80&w=2070&auto=format&fit=crop"}
                    alt={news?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-sky-500 hover:bg-sky-600 border-none px-3 py-1 text-sm rounded-full">
                      {t("public.newsDetail.featured", "Nổi bật")}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 md:p-10 space-y-8">
                  {/* News Header Info */}
                  <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                      {news?.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 border-y border-slate-100 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-sky-50 rounded-lg">
                          <Calendar className="h-4 w-4 text-sky-600" />
                        </div>
                        <span>{news?.published_at ? format(new Date(news.published_at), "dd/MM/yyyy") : "---"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          <User className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span>{news?.user_name || t("public.newsDetail.anonymous", "Tác giả")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-50 rounded-lg">
                          <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                        <span>5 {t("public.newsDetail.readTime", "phút đọc")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  {news?.summary && (
                    <div className="bg-slate-50 border-l-4 border-sky-500 p-6 rounded-r-2xl italic text-slate-700 text-lg">
                      {news.summary}
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="prose prose-slate prose-lg max-w-none text-slate-700 space-y-6 leading-relaxed">
                    {/* If content is HTML, we might need a sanitizer or dangerouslySetInnerHTML */}
                    <div 
                      className="news-content-display"
                      dangerouslySetInnerHTML={{ __html: news?.content || "" }} 
                    />
                  </div>

                  {/* Social Share */}
                  <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t("public.newsDetail.share", "Chia sẻ bài viết")}:</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                          <Facebook className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full bg-sky-50 text-sky-500 hover:bg-sky-500 hover:text-white transition-colors">
                          <Twitter className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleCopyLink} className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-600 hover:text-white transition-colors">
                          <LinkIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    <Button asChild variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50 gap-2">
                      <Link to={ROUTERS.HOME}>
                        <ArrowLeft className="h-4 w-4" />
                        {t("public.newsDetail.backToList", "Xem tin tức khác")}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Search or other widgets could go here */}
            
            {/* Latest News Widget */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 border-b-2 border-sky-500 pb-2 inline-block">
                  {t("public.newsDetail.latestHeading", "Tin mới nhất")}
                </h3>
              </div>

              <div className="space-y-6">
                {isLoadingLatest ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-20 w-20 rounded-xl shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : (
                  latestNews.slice(0, 5).map((item) => (
                    <Link 
                      key={item.id} 
                      to={ROUTERS.PUBLIC_NEWS_DETAIL.replace(":newsId", item.id.toString())}
                      className="group flex gap-4 transition-all hover:translate-x-1"
                    >
                      <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                        <img 
                          src={`${CLOUDINARY_HEADER_IMAGE_URL}/${item.image_url}`} 
                          alt={item.title} 
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-1">
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-sky-600 transition-colors">
                          {item.title}
                        </h4>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.published_at ? format(new Date(item.published_at), "dd/MM/yyyy") : "---"}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <Button asChild className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white mt-4">
                <Link to={ROUTERS.HOME}>
                  {t("public.newsDetail.viewAllNews", "Xem tất cả tin tức")}
                </Link>
              </Button>
            </div>

            {/* Banner/CTA Widget */}
            <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 transition-transform group-hover:scale-110 duration-700">
                <Share2 size={120} />
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-2xl font-bold leading-tight">
                  {t("public.newsDetail.ctaTitle", "Tìm kiếm nơi ở lý tưởng?")}
                </h3>
                <p className="text-sky-100 text-sm leading-relaxed">
                  {t("public.newsDetail.ctaDesc", "Hàng ngàn căn hộ và phòng trọ chất lượng đang chờ đón bạn. Khám phá ngay!")}
                </p>
                <Button asChild className="bg-white text-sky-600 hover:bg-sky-50 rounded-xl px-6 w-full sm:w-auto">
                  <Link to={ROUTERS.SEARCH_ROOMS}>{t("public.newsDetail.ctaBtn", "Tìm phòng ngay")}</Link>
                </Button>
              </div>
            </div>
          </aside>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default NewsDetail;

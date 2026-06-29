import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, User, Clock, Share2, Facebook, Twitter, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

import Breadcrumb from "@/components/common/Breadcrumb";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { useNewsDetailPublicQuery, useLatestNewsQuery } from "@/hooks/useNewsQuery";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS, DEFAULT_ROOM_IMAGE } from "@/constant";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toastSuccess, toastError } from "@/components/ui/toast";
import { resolveImageUrl } from "@/utils/imageUtils";
import { Input } from "@/components/ui/input";
import axiosClient from "@/api/axiosClient";

const NewsDetail = () => {
  const { t } = useTranslation();
  const { newsId } = useParams<{ newsId: string }>();
  const id = Number(newsId);

  const { data: newsDetailResponse, isLoading: isLoadingDetail, isError } = useNewsDetailPublicQuery(id);
  const { data: latestNewsResponse, isLoading: isLoadingLatest } = useLatestNewsQuery(5);

  const news = newsDetailResponse?.data;
  const latestNews = latestNewsResponse?.data || [];

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);
  const [newsletterCoupon, setNewsletterCoupon] = useState<{ code: string; value: number; type: string } | null>(null);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toastError(t("validation.newsletter.email_invalid"));
      return;
    }

    setIsSubmittingNewsletter(true);
    try {
      const response: any = await axiosClient.post("/home/coupons/register", {
        email: newsletterEmail,
      });
      if (response && response.success) {
        toastSuccess(response.message || t("public.newsDetail.subscribeSuccess"));
        if (response.data) {
          setNewsletterCoupon(response.data);
        }
        setNewsletterEmail("");
      } else {
        toastError((response && response.message) || t("public.newsDetail.subscribeFailed"));
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || t("public.newsDetail.subscribeFailed");
      toastError(errorMsg);
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toastSuccess(t("public.newsDetail.copySuccess"));
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "width=600,height=400");
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(news?.title || "BKS Stay News");
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank", "width=600,height=400");
  };

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col">
        <PublicHeader />
        <main className="flex grow items-center justify-center p-4">
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold text-slate-800">{t("public.newsDetail.errorTitle")}</h2>
            <p className="text-slate-600">{t("public.newsDetail.errorDesc")}</p>
            <Button asChild variant="outline" className="rounded-full">
              <Link to={ROUTERS.HOME}>{t("public.newsDetail.backHome")}</Link>
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
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: t("breadcrumb.home"), href: ROUTERS.HOME },
              { label: t("public.newsDetail.breadcrumb.news"), href: ROUTERS.PUBLIC_NEWS_LIST },
              { label: news?.title || t("public.newsDetail.breadcrumb.loading") },
            ]}
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Main Content */}
          <article className="space-y-8 lg:col-span-8">
            {isLoadingDetail ? (
              <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                {/* News Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={resolveImageUrl(news?.image_url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || DEFAULT_ROOM_IMAGE}
                    alt={news?.title}
                    className="size-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = DEFAULT_ROOM_IMAGE;
                    }}
                  />
                  <div className="absolute left-4 top-4">
                    <Badge className="rounded-full border-none bg-sky-500 px-3 py-1 text-sm hover:bg-sky-600">
                      {t("public.newsDetail.featured")}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-8 p-6 md:p-10">
                  {/* News Header Info */}
                  <div className="space-y-4">
                    <h1 className="text-3xl font-extrabold leading-tight text-slate-900 md:text-4xl">
                      {news?.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-6 border-y border-slate-100 py-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-sky-50 p-2">
                          <Calendar className="size-4 text-sky-600" />
                        </div>
                        <span>{news?.published_at ? format(new Date(news.published_at), "dd/MM/yyyy") : "---"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-emerald-50 p-2">
                          <User className="size-4 text-emerald-600" />
                        </div>
                        <span>{news?.user_name || t("public.newsDetail.anonymous")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-amber-50 p-2">
                          <Clock className="size-4 text-amber-600" />
                        </div>
                        <span>5 {t("public.newsDetail.readTime")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  {news?.summary && (
                    <div className="rounded-r-2xl border-l-4 border-sky-500 bg-slate-50 p-6 text-lg italic text-slate-700">
                      {news.summary}
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="prose prose-slate prose-lg max-w-none space-y-6 leading-relaxed text-slate-700">
                    {/* If content is HTML, we might need a sanitizer or dangerouslySetInnerHTML */}
                    <div 
                      className="news-content-display"
                      dangerouslySetInnerHTML={{ __html: news?.content || "" }} 
                    />
                  </div>

                  {/* Social Share */}
                  <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-100 pt-10 sm:flex-row">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">{t("public.newsDetail.share")}:</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white" onClick={handleShareFacebook}>
                          <Facebook className="size-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full bg-sky-50 text-sky-500 transition-colors hover:bg-sky-500 hover:text-white" onClick={handleShareTwitter}>
                          <Twitter className="size-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleCopyLink} className="rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-600 hover:text-white">
                          <LinkIcon className="size-5" />
                        </Button>
                      </div>
                    </div>
                    
                    <Button asChild variant="outline" className="gap-2 rounded-full border-slate-200 hover:bg-slate-50">
                      <Link to={ROUTERS.HOME}>
                        <ArrowLeft className="size-4" />
                        {t("public.newsDetail.backToList")}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-8 lg:col-span-4">
            {/* Search or other widgets could go here */}
            
            {/* Latest News Widget */}
            <div className="space-y-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="inline-block border-b-2 border-sky-500 pb-2 text-xl font-bold text-slate-900">
                  {t("public.newsDetail.latestHeading")}
                </h3>
              </div>

              <div className="space-y-6">
                {isLoadingLatest ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="size-20 shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-2">
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
                      <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 shadow-sm">
                        <img 
                          src={resolveImageUrl(item.image_url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || DEFAULT_ROOM_IMAGE} 
                          alt={item.title} 
                          className="size-full object-cover transition duration-300 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = DEFAULT_ROOM_IMAGE;
                          }}
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-1">
                        <h4 className="line-clamp-2 text-sm font-bold text-slate-900 transition-colors group-hover:text-sky-600">
                          {item.title}
                        </h4>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="size-3" />
                          {item.published_at ? format(new Date(item.published_at), "dd/MM/yyyy") : "---"}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <Button asChild className="mt-4 w-full rounded-full bg-slate-900 text-white hover:bg-slate-800">
                <Link to={ROUTERS.PUBLIC_NEWS_LIST}>
                  {t("public.newsDetail.viewAllNews")}
                </Link>
              </Button>
            </div>

            {/* Banner/CTA Widget */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 p-8 text-white">
              <div className="absolute -bottom-4 -right-4 opacity-10 transition-transform duration-700 group-hover:scale-110">
                <Share2 size={120} />
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-2xl font-bold leading-tight">
                  {t("public.newsDetail.ctaTitle")}
                </h3>
                <p className="text-sm leading-relaxed text-sky-100">
                  {t("public.newsDetail.ctaDesc")}
                </p>
                
                {newsletterCoupon ? (
                  <div className="rounded-2xl bg-white/10 p-5 border border-white/20 backdrop-blur-sm space-y-3 text-center transition-all duration-300">
                    <span className="text-xs uppercase tracking-widest text-emerald-300 font-extrabold">🎉 Đăng ký thành công!</span>
                    <h4 className="text-[15px] font-bold">Mã ưu đãi của bạn:</h4>
                    <div className="bg-white text-sky-800 font-mono font-bold text-lg py-2 px-4 rounded-xl border border-sky-200 shadow-inner inline-block select-all cursor-pointer">
                      {newsletterCoupon.code}
                    </div>
                    <p className="text-xs text-emerald-200">
                      Giảm {newsletterCoupon.value}{newsletterCoupon.type === 'percent' ? '%' : '₫'} cho lần đặt phòng kế tiếp.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubscribe} className="space-y-3 pt-2">
                    <div className="flex flex-col gap-2">
                      <Input
                        type="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder={t("public.footer.newsletter.placeholder")}
                        className="rounded-full bg-white/10 border-white/20 text-white placeholder:text-sky-200/60 focus:bg-white/95 focus:text-slate-900 focus:placeholder:text-slate-400 focus:outline-none"
                      />
                      <Button 
                        type="submit" 
                        disabled={isSubmittingNewsletter}
                        className="w-full rounded-full bg-white text-sky-600 hover:bg-sky-50 font-bold"
                      >
                        {isSubmittingNewsletter ? t("common.processing") : t("public.newsDetail.ctaBtn")}
                      </Button>
                    </div>
                    <p className="text-[10px] text-sky-200/70 italic text-center">
                      * Nhận ngay mã giảm giá chào mừng sau khi đăng ký thành công.
                    </p>
                  </form>
                )}
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

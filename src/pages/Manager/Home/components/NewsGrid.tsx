import { Link } from "react-router-dom";
import { Clock3, Newspaper } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROUTERS } from "@/constant";
import { NewsGridProps } from "@/dataHelper/news.dataHelper";

const NewsGrid = ({
  articles,
  className,
  heading,
  description,
  badgeLabel = "Market pulse",
  badgeIcon = <Newspaper className="h-3.5 w-3.5" />,
  ctaLabel,
  ctaHref,
  footerLabel,
  loading = false,
  error = false,
}: NewsGridProps) => {
  const { t } = useTranslation();

  const primaryCta = ctaHref ?? ROUTERS.NEWS;
  const footerCta = ctaHref ?? ROUTERS.NEWS;
  const headingText = heading ?? t("public.home.news.heading");
  const descriptionText = description ?? t("public.home.news.description");
  const badgeText = badgeLabel ?? t("public.home.news.badge");
  const footerText = footerLabel ?? t("public.home.news.footerCta");
  const ctaText = ctaLabel;
  const loadingLabel = t("public.home.news.latestLoading");
  const errorLabel = t("public.home.news.latestError");
  const emptyLabel = t("public.home.news.availableSoon");

  return (
    <section className={className}>
      {(headingText || descriptionText) && (
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-sky-700">
              {badgeIcon}
              {badgeText}
            </span>
            {headingText && <h2 className="mt-3 text-2xl font-semibold text-slate-900">{headingText}</h2>}
            {descriptionText && <p className="mt-1 text-sm text-slate-600">{descriptionText}</p>}
          </div>
          {ctaText && (
            <Link
              to={primaryCta}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-200/60 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
            >
              {ctaText}
            </Link>
          )}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-dashed border-slate-300/70 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
          {loadingLabel}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/90 px-6 py-10 text-center text-sm font-semibold text-rose-500">
          {errorLabel}
        </div>
      ) : !articles?.length ? (
        <div className="rounded-3xl border border-dashed border-slate-300/70 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
          {emptyLabel}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`${ROUTERS.NEWS_DETAIL}/${article.slug}`}
              aria-label={t("public.home.news.cardLabel", { title: article.title })}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
            >
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="size-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
            </div>
            <div className="flex flex-1 flex-col gap-3 px-4 py-4">
              <div className="space-y-2">
                <h3 className="text-[0.95rem] font-semibold text-slate-900 transition group-hover:text-sky-600">{article.title}</h3>
                {article.excerpt && (
                  <p className="text-[0.875rem] leading-relaxed text-slate-600 line-clamp-3">{article.excerpt}</p>
                )}
              </div>
              {article.publishedAt && (
                <div className="mt-auto flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-sky-500" />
                    {article.publishedAt}
                  </span>
                </div>
              )}
            </div>
          </Link>
          ))}
        </div>
      )}

      {footerText && (
        <div className="mt-8 flex justify-center">
          <Link
            to={footerCta}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-200/60 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
          >
            {footerText}
          </Link>
        </div>
      )}
    </section>
  );
};

export default NewsGrid;

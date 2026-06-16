import { Link } from "react-router-dom";
import { MapPin, Star, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROUTERS, DEFAULT_ROOM_IMAGE } from "@/constant";
import { PartnerGridProps } from "@/dataHelper/partner.dataHelper";
import { Skeleton } from "@/components/ui/skeleton";

export const PartnerCardSkeleton = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white">
    <div className="relative h-40 w-full overflow-hidden">
      <Skeleton className="size-full rounded-none" />
    </div>
    <div className="flex flex-1 flex-col gap-2.5 px-5 py-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/2 rounded" />
        <Skeleton className="h-4 w-1/4 rounded" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Skeleton className="size-4 rounded-full" />
        <Skeleton className="h-4 w-3/4 rounded" />
      </div>
    </div>
  </div>
);

const PartnerGrid = ({ partners, className, heading, description, ctaLabel, ctaHref = ROUTERS.COMPANY_HUB, loading = false }: PartnerGridProps) => {
  const { t } = useTranslation();
  if (!loading && !partners?.length) {
    return null;
  }

  const headingText = heading ?? t("public.home.partners.heading");
  const descriptionText = description ?? t("public.home.partners.description");
  const ctaText = ctaLabel ?? t("public.home.partners.cta");

  return (
    <section className={className}>
      {(headingText || descriptionText) && (
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            {headingText && <h2 className="text-[1.75rem] font-semibold text-slate-900">{headingText}</h2>}
            {descriptionText && <p className="mt-1 text-sm text-slate-600">{descriptionText}</p>}
          </div>
          {ctaText && (
            <Link
              to={ctaHref}
              className="hidden sm:inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
            >
              {ctaText}
            </Link>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <PartnerCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {partners!.map((company) => (
            <Link
              key={company.id}
              to={ROUTERS.PARTNER_DETAIL.replace(":partner_id", company.id.toString())}
              aria-label={t("public.home.partners.cardLabel", { name: company.name })}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow transition hover:-translate-y-1 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 will-change-transform"
              style={{ transform: "translateZ(0)" }}
            >
              <div className="relative h-40 w-full overflow-hidden rounded-t-[22px]">
                <img
                  src={company.image || DEFAULT_ROOM_IMAGE}
                  alt={company.name}
                  className="size-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = DEFAULT_ROOM_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/5 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col gap-2.5 px-5 py-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[1rem] font-semibold text-slate-900 transition group-hover:text-primary flex items-center gap-1.5">
                    <span className="truncate">{company.name}</span>
                    <CheckCircle2 className="size-4 text-blue-500 fill-blue-500/10 shrink-0" />
                  </h3>
                  {company.reviews_avg_rating && Number(company.reviews_avg_rating) > 0 ? (
                    <div className="flex items-center gap-1 text-[0.75rem] font-bold text-amber-500">
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      <span>{company.reviews_avg_rating}</span>
                      <span className="text-slate-400 font-normal">({company.reviews_count} đánh giá)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[0.75rem] text-slate-400">
                      <Star className="size-3.5 text-slate-300" />
                      <span className="font-normal text-slate-400">Chưa có đánh giá</span>
                    </div>
                  )}
                </div>
                <p className="inline-flex items-start gap-2 text-[0.875rem] leading-6 text-slate-600">
                  <MapPin className="mt-0.5 size-4 text-primary" />
                  <span>{company.address}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {ctaText && (
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            to={ctaHref}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-7 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
          >
            {ctaText}
          </Link>
        </div>
      )}
    </section>
  );
};

export default PartnerGrid;

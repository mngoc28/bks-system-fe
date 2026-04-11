import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROUTERS } from "@/constant";
import { PartnerGridProps } from "@/dataHelper/partner.dataHelper";

const PartnerGrid = ({ partners, className, heading, description, ctaLabel, ctaHref = ROUTERS.COMPANY_HUB }: PartnerGridProps) => {
  const { t } = useTranslation();
  if (!partners?.length) {
    return null;
  }

  const headingText = heading ?? t("public.home.partners.heading");
  const descriptionText = description ?? t("public.home.partners.description");
  const badgeText = t("public.home.partners.badge");
  const trustText = t("public.home.partners.trust");
  const ctaText = ctaLabel ?? t("public.home.partners.cta");

  return (
    <section className={className}>
      {(headingText || descriptionText) && (
        <div className="mb-6 max-w-2xl">
          {headingText && <h2 className="text-[1.75rem] font-semibold text-slate-900">{headingText}</h2>}
          {descriptionText && <p className="mt-1 text-sm text-slate-600">{descriptionText}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((company) => (
          <Link
            key={company.id}
            to={`${ROUTERS.PARTNER_DETAIL}/${company.id}`}
            aria-label={t("public.home.partners.cardLabel", { name: company.name })}
            className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow transition hover:-translate-y-1 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="relative h-40 w-full overflow-hidden">
              <img
                src={company.image}
                alt={company.name}
                className="size-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/5 to-transparent" />
              <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-slate-700 shadow">
                {badgeText}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2.5 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[1rem] font-semibold text-slate-900 transition group-hover:text-primary">{company.name}</h3>
              </div>
              <p className="inline-flex items-start gap-2 text-[0.875rem] leading-6 text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <span>{company.address}</span>
              </p>
              <div className="mt-auto inline-flex items-center gap-2 text-[0.875rem] font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                <span className="tracking-wide">{trustText}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {ctaText && (
        <div className="mt-8 flex justify-center">
          <Link
            to={ctaHref}
            className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-200/60 transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {ctaText}
          </Link>
        </div>
      )}
    </section>
  );
};

export default PartnerGrid;

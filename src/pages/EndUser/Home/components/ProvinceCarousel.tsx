import { Splide, SplideSlide } from "@splidejs/react-splide";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTERS, DEFAULT_ROOM_IMAGE } from "@/constant";
import { ProvinceCarouselProps } from "@/dataHelper/province.dataHelper";
import { Skeleton } from "@/components/ui/skeleton";

const sliderOptions = {
  perPage: 5,
  gap: "1.25rem",
  pagination: false,
  breakpoints: {
    1280: { perPage: 4 },
    1024: { perPage: 3 },
    768: { perPage: 2 },
    480: { perPage: 1.5 },
  },
} as const;

const ProvinceCarousel = ({ provinces, className, heading, description, ctaLabel, ctaHref, loading = false }: ProvinceCarouselProps) => {
  const { t } = useTranslation();

  if (!loading && !provinces?.length) {
    return null;
  }

  const headingText = heading ?? t("public.home.provinceCarousel.heading");
  const descriptionText = description ?? t("public.home.provinceCarousel.description");

  return (
    <section className={className}>
      {(headingText || descriptionText) && (
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 inline-flex rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
              Điểm đến nổi bật
            </p>
            {headingText && <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">{headingText}</h2>}
            {descriptionText && <p className="mt-2 text-sm text-slate-600 md:text-base">{descriptionText}</p>}
          </div>
          {ctaLabel && ctaHref && (
            <Link
              to={ctaHref}
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex h-44 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95"
            >
              <div className="relative h-32 w-full overflow-hidden">
                <Skeleton className="size-full rounded-none" />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-1.5 px-5 py-4">
                <Skeleton className="h-5 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Splide aria-label={t("public.home.provinceCarousel.aria")} options={sliderOptions} className="province-carousel">
          {provinces!.map((province) => (
            <SplideSlide key={province.id}>
              <Link
                to={ROUTERS.SEARCH_ROOMS_BY_PROVINCE.replace(":provinceId", province.id.toString())}
                aria-label={t("public.home.provinceCarousel.cardLabel", { name: province.name })}
                className="group relative flex h-44 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 transition hover:-translate-y-1 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="relative h-32 w-full overflow-hidden">
                  <img
                    src={province.image || DEFAULT_ROOM_IMAGE}
                    alt={province.name}
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = DEFAULT_ROOM_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/20 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col justify-center gap-1.5 px-5 py-4">
                  <h3 className="text-base font-semibold text-slate-900 transition group-hover:text-primary">{province.name}</h3>
                </div>
              </Link>
            </SplideSlide>
          ))}
        </Splide>
      )}
    </section>
  );
};

export default ProvinceCarousel;

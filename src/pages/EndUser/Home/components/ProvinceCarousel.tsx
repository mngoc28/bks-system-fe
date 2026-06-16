import { Splide, SplideSlide } from "@splidejs/react-splide";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTERS, DEFAULT_ROOM_IMAGE } from "@/constant";
import { ProvinceCarouselProps } from "@/dataHelper/province.dataHelper";
import { Skeleton } from "@/components/ui/skeleton";
import { formatProvinceName } from "@/utils/utils";

const sliderOptions = {
  type: "slide",
  rewind: false,
  perPage: 5,
  gap: "1rem",
  pagination: false,
  breakpoints: {
    1280: { perPage: 4 },
    1024: { perPage: 3 },
    768: { perPage: 2 },
    480: { perPage: 1.3, padding: { left: "1rem", right: "1rem" } },
  },
} as const;

const ProvinceCarousel = ({
  provinces,
  className,
  heading,
  description,
  ctaLabel,
  ctaHref,
  loading = false,
}: ProvinceCarouselProps) => {
  const { t } = useTranslation();

  if (!loading && !provinces?.length) return null;

  const headingText = heading ?? t("public.home.provinceCarousel.heading");
  const descriptionText =
    description ?? t("public.home.provinceCarousel.description");

  return (
    <section className={className}>
      {/* ── Section header ── */}
      {(headingText || descriptionText) && (
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 inline-flex rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
              Điểm đến nổi bật
            </p>
            {headingText && (
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                {headingText}
              </h2>
            )}
            {descriptionText && (
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                {descriptionText}
              </p>
            )}
          </div>
          {ctaLabel && ctaHref && (
            <Link
              to={ctaHref}
              className="hidden items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 sm:inline-flex"
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      )}

      {/* ── Loading skeletons ── */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-[16/10] w-full rounded-2xl"
            />
          ))}
        </div>
      ) : (
        /* ── Carousel ── */
        <Splide
          aria-label={t("public.home.provinceCarousel.aria")}
          options={sliderOptions}
          className="province-carousel"
        >
          {provinces!.map((province) => (
            <SplideSlide key={province.id}>
              <Link
                to={ROUTERS.SEARCH_ROOMS_BY_PROVINCE.replace(
                  ":provinceId",
                  province.id.toString(),
                )}
                aria-label={t("public.home.provinceCarousel.cardLabel", {
                  name: province.name,
                })}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                style={{ transform: "translateZ(0)" }}
              >
                {/* Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                  <img
                    src={province.image || DEFAULT_ROOM_IMAGE}
                    alt={province.name}
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_ROOM_IMAGE;
                    }}
                  />
                  {/* Subtle bottom scrim for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  {/* Hover shine */}
                  <div className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/5" />
                </div>

                {/* Name below */}
                <div className="mt-3 px-1">
                  <h3 className="truncate text-sm font-bold text-slate-800 transition-colors duration-200 group-hover:text-primary dark:text-slate-100">
                    {formatProvinceName(province.name)}
                  </h3>
                </div>
              </Link>
            </SplideSlide>
          ))}

        </Splide>
      )}

      {/* ── Mobile CTA ── */}
      {ctaLabel && ctaHref && !loading && (
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            to={ctaHref}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:scale-95"
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </section>
  );
};

export default ProvinceCarousel;

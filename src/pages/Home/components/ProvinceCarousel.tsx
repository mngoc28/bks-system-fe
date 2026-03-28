import { Splide, SplideSlide } from "@splidejs/react-splide";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTERS } from "@/constant";
import { ProvinceCarouselProps } from "@/dataHelper/province.dataHelper";

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

const ProvinceCarousel = ({ provinces, className, heading, description }: ProvinceCarouselProps) => {
  const { t } = useTranslation();

  if (!provinces?.length) {
    return null;
  }

  const headingText = heading ?? t("public.home.provinceCarousel.heading");
  const descriptionText = description ?? t("public.home.provinceCarousel.description");

  return (
    <section className={className}>
      {(headingText || descriptionText) && (
        <div className="mb-5 flex items-center justify-between">
          <div>
            {headingText && <h2 className="text-2xl font-semibold text-slate-900">{headingText}</h2>}
            {descriptionText && <p className="mt-1 text-sm text-slate-600">{descriptionText}</p>}
          </div>
        </div>
      )}

      <Splide aria-label={t("public.home.provinceCarousel.aria")} options={sliderOptions} className="province-carousel">
        {provinces.map((province) => (
          <SplideSlide key={province.id}>
            <Link
              to={`${ROUTERS.PROVINCE_DETAIL}/${province.id}`}
              aria-label={t("public.home.provinceCarousel.cardLabel", { name: province.name })}
              className="group relative flex h-44 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 transition hover:-translate-y-1 hover:border-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
            >
              <div className="relative h-32 w-full overflow-hidden">
                <img
                  src={province.image}
                  alt={province.name}
                  className="size-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/20 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-1.5 px-5 py-4">
                <h3 className="text-base font-semibold text-slate-900 transition group-hover:text-sky-600">{province.name}</h3>
              </div>
            </Link>
          </SplideSlide>
        ))}
      </Splide>
    </section>
  );
};

export default ProvinceCarousel;
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=80";

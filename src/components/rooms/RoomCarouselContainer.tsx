import { Splide, SplideSlide } from "@splidejs/react-splide";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import RoomCarouselItem from "./RoomCarouselItem";
import { RoomCarouselContainerProps } from "../type";

const sliderOptions = {
  perPage: 4,
  gap: "1.25rem",
  pagination: false,
  autoplay: true,
  interval: 5000,
  pauseOnHover: true,
  breakpoints: {
    1280: { perPage: 3 },
    1024: { perPage: 2 },
    768: { perPage: 1.5 },
    640: { perPage: 1 },
  },
} as const;

const RoomCarouselContainer = ({
  rooms,
  heading,
  description,
  className,
  sectionId = "favorites",
  ctaLabel,
  ctaHref,
}: RoomCarouselContainerProps) => {
  const { t } = useTranslation();
  if (!rooms?.length) {
    return null;
  }

  const headingText = heading ?? t("public.home.rooms.heading");
  const descriptionText = description ?? t("public.home.rooms.description");

  return (
    <section className={className} id={sectionId}>
      {(headingText || descriptionText) && (
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 inline-flex rounded-full bg-amber-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-950">
              Gợi ý hôm nay
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

      <Splide aria-label={t("public.home.rooms.aria")} options={sliderOptions} className="room-carousel">
        {rooms.map((room) => (
          <SplideSlide key={room.id}>
            <RoomCarouselItem room={room} />
          </SplideSlide>
        ))}
      </Splide>
    </section>
  );
};

export default RoomCarouselContainer;

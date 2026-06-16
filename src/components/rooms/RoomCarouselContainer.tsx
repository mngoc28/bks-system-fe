import { Splide, SplideSlide } from "@splidejs/react-splide";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import RoomCarouselItem from "./RoomCarouselItem";
import { RoomCarouselContainerProps } from "../type";
import { Skeleton } from "@/components/ui/skeleton";

export const RoomCardSkeleton = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white">
    <div className="relative h-56 overflow-hidden">
      <Skeleton className="size-full rounded-none" />
      <div className="absolute inset-x-5 bottom-5 flex items-center justify-between z-10">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
    </div>
    <div className="flex flex-1 flex-col gap-2.5 p-5">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-4 w-full rounded" />
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <Skeleton className="h-6 w-24 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-10 rounded" />
          <Skeleton className="h-4 w-10 rounded" />
        </div>
      </div>
    </div>
  </div>
);

const sliderOptions = {
  type: "slide",
  rewind: false,
  perPage: 4,
  gap: "1.25rem",
  pagination: false,
  autoplay: false,
  breakpoints: {
    1280: { perPage: 3 },
    1024: { perPage: 2 },
    768: { perPage: 1.5 },
    640: { perPage: 1, padding: { left: "0.5rem", right: "0.5rem" } },
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
  loading = false,
}: RoomCarouselContainerProps) => {
  const { t } = useTranslation();
  if (!loading && !rooms?.length) {
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
              className="hidden sm:inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <Splide aria-label={t("public.home.rooms.aria")} options={sliderOptions} className="room-carousel">
          {rooms!.map((room) => (
            <SplideSlide key={room.id}>
              <RoomCarouselItem room={room} />
            </SplideSlide>
          ))}
        </Splide>
      )}

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

export default RoomCarouselContainer;

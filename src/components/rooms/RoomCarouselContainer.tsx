import { Splide, SplideSlide } from "@splidejs/react-splide";
import { useTranslation } from "react-i18next";
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

const RoomCarouselContainer = ({ rooms, heading, description, className }: RoomCarouselContainerProps) => {
  const { t } = useTranslation();
  if (!rooms?.length) {
    return null;
  }

  const headingText = heading ?? t("public.home.rooms.heading");
  const descriptionText = description ?? t("public.home.rooms.description");

  return (
    <section className={className} id="favorites">
      {(headingText || descriptionText) && (
        <div className="mb-5 flex items-center justify-between">
          <div>
            {headingText && <h2 className="text-2xl font-semibold text-slate-900">{headingText}</h2>}
            {descriptionText && <p className="mt-1 text-sm text-slate-600">{descriptionText}</p>}
          </div>
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

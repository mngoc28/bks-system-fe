import { Link } from "react-router-dom";
import { HomeIcon, MapPinHouse, BedDouble, Ruler } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROUTERS } from "@/constant";
import { RoomCarouselItemProps } from "../type";

const RoomCarouselItem = ({ room }: RoomCarouselItemProps) => {
  const { t } = useTranslation();
  const bedCount = Number(room.beds);
  const hasNumericBeds = Number.isFinite(bedCount);
  return (
    <Link
      to={ROUTERS.PUBLIC_ROOM_DETAIL.replace(":roomId", room.id.toString())}
      aria-label={t("public.home.rooms.cardLabel", { name: room.name })}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
    >
      <div className="relative h-56 overflow-hidden">
        <img src={room.image} alt={room.name} className="size-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
        <div className="absolute left-5 right-5 bottom-5 flex items-center justify-between text-sm text-white/90">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
            <HomeIcon className="h-4 w-4" />
            {t("public.home.rooms.badge", { id: room.id })}
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{t("public.home.rooms.area", { area: room.area })}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div>
          <h3 className="text-[0.95rem] font-semibold text-slate-900 group-hover:text-sky-600">{room.name}</h3>
          <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-600">
            <MapPinHouse className="h-4 w-4 text-sky-500" />
            {room.address}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <span className="text-base font-semibold text-sky-600">{t("public.home.rooms.price", { price: room.price })}</span>
          <div className="flex items-center gap-3 text-[0.75rem] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              {hasNumericBeds ? t("public.home.rooms.beds", { count: bedCount }) : room.beds}
            </span>
            <span className="inline-flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" />
              {t("public.home.rooms.area", { area: room.area })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RoomCarouselItem;

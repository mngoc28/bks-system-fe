import { Link } from "react-router-dom";
import { HomeIcon, MapPinHouse, BedDouble, Ruler, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROUTERS, DEFAULT_ROOM_IMAGE } from "@/constant";
import { RoomCarouselItemProps } from "../type";

const shortenPropertyTypeName = (name: string): string => {
  const lower = name.toLowerCase().trim();
  if (lower.includes("căn hộ dịch vụ") || lower.includes("serviced apartment")) {
    return "Căn hộ dịch vụ";
  }
  if (lower.includes("chung cư mini") || lower.includes("mini apartment")) {
    return "Chung cư mini";
  }
  if (lower.includes("căn hộ") || lower.includes("apartment") || lower.includes("condo")) {
    return "Căn hộ";
  }
  if (lower.includes("khách sạn") || lower.includes("hotel")) {
    return "Khách sạn";
  }
  if (lower.includes("homestay")) {
    return "Homestay";
  }
  if (lower.includes("nhà riêng") || lower.includes("house")) {
    return "Nhà riêng";
  }
  if (lower.includes("biệt thự") || lower.includes("villa")) {
    return "Biệt thự";
  }
  if (lower.includes("phòng trọ") || lower.includes("nhà trọ") || lower.includes("boarding house")) {
    return "Phòng trọ";
  }

  const cleaned = name
    .replace(/(cho thuê|theo phòng|theo căn|nguyên căn|for rent|per room)/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || name;
};

const RoomCarouselItem = ({ room }: RoomCarouselItemProps) => {
  const { t } = useTranslation();
  const bedCount = Number(room.beds);
  const hasNumericBeds = Number.isFinite(bedCount);

  const getBadgeText = () => {
    if (room.property_type_name) {
      return shortenPropertyTypeName(room.property_type_name);
    }
    if (room.room_type) {
      const typeNum = Number(room.room_type);
      if (typeNum === 1) return t("rooms.room_type_single");
      if (typeNum === 2) return t("rooms.room_type_double");
      if (typeNum === 3) return t("rooms.room_type_mini_apartment");
    }
    return null;
  };

  const badgeText = getBadgeText();

  return (
    <Link
      to={ROUTERS.PUBLIC_ROOM_DETAIL.replace(":roomId", room.id.toString())}
      aria-label={t("public.home.rooms.cardLabel", { name: room.name })}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={room.image || DEFAULT_ROOM_IMAGE}
          alt={room.name}
          className="size-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = DEFAULT_ROOM_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
        <div className="absolute inset-x-5 bottom-5 flex items-center justify-between text-sm text-white/90">
          {badgeText ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-normal">
              <HomeIcon className="size-4" />
              {badgeText}
            </span>
          ) : (
            <div />
          )}
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{t("public.home.rooms.area", { area: room.area })}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div>
          <h3 className="text-[0.95rem] font-semibold text-slate-900 group-hover:text-primary">{room.name}</h3>
          {room.reviews_avg_rating && Number(room.reviews_avg_rating) > 0 ? (
            <div className="mt-1 flex items-center gap-1 text-[0.8rem] font-bold text-amber-500">
              <Star className="size-3.5 fill-amber-500 text-amber-500" />
              <span>{room.reviews_avg_rating}</span>
              <span className="text-slate-400 font-normal">({room.reviews_count} đánh giá)</span>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-1 text-[0.8rem] text-slate-400">
              <Star className="size-3.5 text-slate-300" />
              <span className="font-normal text-slate-400">Chưa có đánh giá</span>
            </div>
          )}
          <p className="mt-1.5 inline-flex items-center gap-2 text-sm text-slate-600">
            <MapPinHouse className="size-4 text-primary" />
            {room.address}
          </p>
          {room.tourist_summary && room.tourist_summary.has_tourist_mapping && (
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <svg className="size-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>
              <span className="font-medium">{room.tourist_summary.tourist_spot_name}</span>
              {room.tourist_summary.travel_time_label && <span className="ml-2 text-xs text-slate-400">• {room.tourist_summary.travel_time_label}</span>}
            </p>
          )}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <span className="text-base font-semibold text-primary">{t("public.home.rooms.price", { price: room.price })}</span>
          <div className="flex items-center gap-3 text-[0.75rem] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <BedDouble className="size-3.5" />
              {hasNumericBeds ? t("public.home.rooms.beds", { count: bedCount }) : room.beds}
            </span>
            <span className="inline-flex items-center gap-1">
              <Ruler className="size-3.5" />
              {t("public.home.rooms.area", { area: room.area })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RoomCarouselItem;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HomeIcon, MapPinHouse, BedDouble, Ruler, Star, Heart, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROUTERS } from "@/constant";
import { RoomCarouselItemProps } from "../type";
import { getRoomFallbackImage } from "@/utils/fallbackImages";
import { resolveTouristSpotName } from "@/utils/touristSummary";
import { toastSuccess, toastError } from "@/components/ui/toast";

const shortenPropertyTypeName = (name: string): string => {
  const lower = name.toLowerCase().trim();
  if (lower.includes("căn hộ") || lower.includes("apartment")) {
    return "Căn hộ dịch vụ";
  }
  if (lower.includes("khách sạn") || lower.includes("hotel")) {
    return "Khách sạn";
  }
  if (lower.includes("nhà nghỉ") || lower.includes("guesthouse")) {
    return "Nhà nghỉ";
  }
  if (lower.includes("homestay")) {
    return "Homestay";
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

  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem("bks_wishlist");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("bks_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const handleToggleWishlist = (e: React.MouseEvent, roomId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => {
      const isAlreadyWishlisted = prev.includes(roomId);
      if (isAlreadyWishlisted) {
        toastSuccess("Đã xóa khỏi danh sách yêu thích");
        return prev.filter((id) => id !== roomId);
      } else {
        toastSuccess("Đã thêm vào danh sách yêu thích");
        return [...prev, roomId];
      }
    });
  };

  const handleShareRoom = (e: React.MouseEvent, roomId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.origin + ROUTERS.PUBLIC_ROOM_DETAIL.replace(":roomId", roomId.toString());
    navigator.clipboard.writeText(url)
      .then(() => {
        toastSuccess("Đã sao chép liên kết phòng!");
      })
      .catch(() => {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          toastSuccess("Đã sao chép liên kết phòng!");
        } catch {
          toastError("Không thể sao chép liên kết!");
        }
        document.body.removeChild(textArea);
      });
  };

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
          src={room.image || getRoomFallbackImage(room.property_type_name, room.name)}
          alt={room.name}
          className="size-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = getRoomFallbackImage(room.property_type_name, room.name);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
        
        {/* Right Buttons: Wishlist and Share */}
        <div className="absolute right-3 top-3 flex items-center gap-2 z-10">
          <button
            onClick={(e) => handleToggleWishlist(e, Number(room.id))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-rose-500 hover:scale-105 active:scale-95 shadow-lg"
            title="Thêm vào yêu thích"
          >
            <Heart
              className={`h-4.5 w-4.5 transition-all duration-300 ${
                wishlist.includes(Number(room.id))
                  ? "fill-rose-500 text-rose-500"
                  : ""
              }`}
            />
          </button>
          <button
            onClick={(e) => handleShareRoom(e, Number(room.id))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-sky-500 hover:scale-105 active:scale-95 shadow-lg"
            title="Chia sẻ phòng"
          >
            <Share2 className="h-4.5 w-4.5 transition-all duration-300" />
          </button>
        </div>

        <div className="absolute inset-x-5 bottom-5 flex items-center justify-between text-sm text-white/90">
          {badgeText && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-normal">
              <HomeIcon className="size-4" />
              {badgeText}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div>
          <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest truncate block mb-1">
            {room.partner_company_name || "Đối tác BKS"}
          </span>
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
          {room.tourist_summary?.has_tourist_mapping && resolveTouristSpotName(room.tourist_summary.tourist_spot_name) && (
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <svg className="size-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>
              <span className="font-medium">{resolveTouristSpotName(room.tourist_summary.tourist_spot_name)}</span>
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

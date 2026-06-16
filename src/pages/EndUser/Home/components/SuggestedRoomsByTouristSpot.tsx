import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTERS, CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import RoomCarouselContainer, { RoomCardSkeleton } from "@/components/rooms/RoomCarouselContainer";
import type { RoomCard } from "@/dataHelper/home.dataHelper";
import type { SuggestedRoomsByTouristSpotGroup } from "@/dataHelper/EU/room.dataHelper";
import { getRoomFallbackImage } from "@/utils/fallbackImages";
import { resolveCloudinaryUrl } from "@/utils/imageUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { useDragScroll } from "@/hooks/useDragScroll";

interface SuggestedRoomsByTouristSpotProps {
  groups?: SuggestedRoomsByTouristSpotGroup[];
  prioritySpotNames?: readonly string[];
  className?: string;
  loading?: boolean;
}

function toRoomCard(room: SuggestedRoomsByTouristSpotGroup["rooms"][number]): RoomCard {
  const monthlyPrice = room.cheapest_monthly_price;
  const dailyPrice = room.cheapest_daily_price;
  const priceLabel = dailyPrice
    ? `${Number(dailyPrice).toLocaleString("vi-VN")}₫ / đêm`
    : monthlyPrice
      ? `${Number(monthlyPrice).toLocaleString("vi-VN")}₫ / tháng`
      : "Liên hệ";

  return {
    id: room.id,
    name: room.title,
    address: room.property_address || "Đang cập nhật",
    price: priceLabel,
    image: resolveCloudinaryUrl(room.room_image, CLOUDINARY_HEADER_IMAGE_URL) || getRoomFallbackImage(room.property_type_name, room.title),
    area: `${room.area ?? 0} m²`,
    beds: room.people ?? 0,
    bedrooms_count: room.bedrooms_count,
    beds_count: room.beds_count,
    tourist_summary: room.tourist_summary ?? null,
    reviews_count: room.reviews_count ?? 0,
    reviews_avg_rating: room.reviews_avg_rating ?? 0,
    room_type: room.room_type,
    property_type_name: room.property_type_name,
    partner_company_name: room.partner_company_name,
    rent_type: dailyPrice ? "daily" : (monthlyPrice ? "monthly" : undefined),
  };
}

function normalizeSpotName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[\s.\-_/]+/g, " ")
    .trim();
}

const SuggestedRoomsByTouristSpot = ({
  groups = [],
  prioritySpotNames = [],
  className,
  loading = false,
}: SuggestedRoomsByTouristSpotProps) => {
  const [activeTabKey, setActiveTabKey] = useState<string>("");
  const scrollRef = useDragScroll();

  const orderedGroups = useMemo(() => {
    const groupMap = new Map(
      groups.map((group) => [normalizeSpotName(group.tourist_spot_name), group]),
    );

    const orderedPriorityGroups = prioritySpotNames.length
      ? prioritySpotNames.map((spotName) => groupMap.get(normalizeSpotName(spotName))).filter(Boolean) as SuggestedRoomsByTouristSpotGroup[]
      : groups;

    return orderedPriorityGroups
      .map((group) => ({
        ...group,
        rooms: group.rooms.map(toRoomCard),
      }))
      .filter((group) => group.rooms.length > 0);
  }, [groups, prioritySpotNames]);

  const defaultKey = orderedGroups[0] ? String(orderedGroups[0].tourist_spot_id ?? orderedGroups[0].tourist_spot_slug) : "";
  const currentTabKey = activeTabKey || defaultKey;

  const activeGroup = useMemo(() => {
    return orderedGroups.find(
      (group) => String(group.tourist_spot_id ?? group.tourist_spot_slug) === currentTabKey
    );
  }, [orderedGroups, currentTabKey]);

  if (!loading && !orderedGroups.length) {
    return null;
  }

  return (
    <section className={className}>
      <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 inline-flex w-fit rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
            Gợi ý theo điểm du lịch
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Phòng được gợi ý theo từng điểm đến</h2>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Mỗi điểm du lịch có một nhóm phòng gợi ý riêng để bạn xem nhanh các lựa chọn phù hợp tại nơi muốn đi.
          </p>
        </div>
        {activeGroup && (
          <Link
            to={`${ROUTERS.SEARCH_ROOMS}?tourist_spot_slug=${encodeURIComponent(activeGroup.tourist_spot_slug)}`}
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 shrink-0"
          >
            Xem tất cả
          </Link>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-200 pt-1.5 pb-3 scrollbar-hide px-4 sm:px-6 -mx-4 sm:-mx-6"
      >
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))
        ) : (
          orderedGroups.map((group) => {
            const key = String(group.tourist_spot_id ?? group.tourist_spot_slug);
            const isActive = currentTabKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTabKey(key)}
                className={`shrink-0 whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md scale-105"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {group.tourist_spot_name}
              </button>
            );
          })
        )}
      </div>

      <div className="transition-all duration-500 animate-in fade-in-50">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          orderedGroups.map((group) => {
            const key = String(group.tourist_spot_id ?? group.tourist_spot_slug);
            if (currentTabKey !== key) return null;

            const ctaLabel = "Xem tất cả";
            const ctaHref = `${ROUTERS.SEARCH_ROOMS}?tourist_spot_slug=${encodeURIComponent(group.tourist_spot_slug)}`;

            return (
              <div key={key} className="space-y-4">
                {group.rooms.length > 0 ? (
                  <>
                    <RoomCarouselContainer
                      sectionId={`suggested-spot-${group.tourist_spot_slug}`}
                      className="w-full"
                      rooms={group.rooms}
                      heading=""
                      description=""
                    />
                    <div className="mt-6 flex justify-center sm:hidden">
                      <Link
                        to={ctaHref}
                        className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:scale-95"
                      >
                        {ctaLabel}
                      </Link>
                    </div>
                  </>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default SuggestedRoomsByTouristSpot;

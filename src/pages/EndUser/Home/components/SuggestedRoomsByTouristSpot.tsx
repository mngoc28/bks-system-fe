import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTERS, CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import RoomCarouselContainer, { RoomCardSkeleton } from "@/components/rooms/RoomCarouselContainer";
import type { RoomCard } from "@/dataHelper/home.dataHelper";
import type { SuggestedRoomsByTouristSpotGroup } from "@/dataHelper/EU/room.dataHelper";
import { getRoomFallbackImage } from "@/utils/fallbackImages";
import { resolveImageUrl } from "@/utils/imageUtils";
import { Skeleton } from "@/components/ui/skeleton";

interface SuggestedRoomsByTouristSpotProps {
  groups?: SuggestedRoomsByTouristSpotGroup[];
  prioritySpotNames?: readonly string[];
  className?: string;
  loading?: boolean;
}

function toRoomCard(room: SuggestedRoomsByTouristSpotGroup["rooms"][number]): RoomCard {
  const monthlyPrice = room.cheapest_monthly_price;
  const dailyPrice = room.cheapest_daily_price;
  const priceLabel = monthlyPrice
    ? `${Number(monthlyPrice).toLocaleString("vi-VN")}₫ / tháng`
    : dailyPrice
      ? `${Number(dailyPrice).toLocaleString("vi-VN")}₫ / đêm`
      : "Liên hệ";

  return {
    id: room.id,
    name: room.title,
    address: room.property_address || "Đang cập nhật",
    price: priceLabel,
    image: resolveImageUrl(room.room_image, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || getRoomFallbackImage(room.property_type_name, room.title),
    area: `${room.area ?? 0} m²`,
    beds: room.people ?? 0,
    tourist_summary: room.tourist_summary ?? null,
    reviews_count: room.reviews_count ?? 0,
    reviews_avg_rating: room.reviews_avg_rating ?? 0,
    room_type: room.room_type,
    property_type_name: room.property_type_name,
    partner_company_name: room.partner_company_name,
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

  if (!loading && !orderedGroups.length) {
    return null;
  }

  const defaultKey = orderedGroups[0] ? String(orderedGroups[0].tourist_spot_id ?? orderedGroups[0].tourist_spot_slug) : "";
  const currentTabKey = activeTabKey || defaultKey;

  return (
    <section className={className}>
      <div className="mb-5 flex flex-col gap-2 border-b border-slate-200 pb-4">
        <p className="inline-flex w-fit rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
          Gợi ý theo điểm du lịch
        </p>
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Phòng được gợi ý theo từng điểm đến</h2>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Mỗi điểm du lịch có một nhóm phòng gợi ý riêng để bạn xem nhanh các lựa chọn phù hợp tại nơi muốn đi.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
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
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
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

      <div className="space-y-10 transition-all duration-500 animate-in fade-in-50">
        {loading ? (
          <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white/70 p-4 shadow-sm md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="mt-2 h-6 w-56 rounded" />
              </div>
              <Skeleton className="h-9 w-36 rounded-full" />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          orderedGroups.map((group) => {
            const key = String(group.tourist_spot_id ?? group.tourist_spot_slug);
            if (currentTabKey !== key) return null;

            const ctaLabel = `Xem phòng tại ${group.tourist_spot_name}`;
            const ctaHref = `${ROUTERS.SEARCH_ROOMS}?tourist_spot_slug=${encodeURIComponent(group.tourist_spot_slug)}`;

            return (
              <div key={key} className="space-y-4 rounded-[28px] border border-slate-200 bg-white/70 p-4 shadow-sm md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    {group.region_label ? (
                      <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{group.region_label}</p>
                    ) : null}
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">Gợi ý phòng tại {group.tourist_spot_name}</h3>
                  </div>
                  <Link
                    to={ctaHref}
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  >
                    {ctaLabel}
                  </Link>
                </div>

                {group.rooms.length > 0 ? (
                  <RoomCarouselContainer
                    sectionId={`suggested-spot-${group.tourist_spot_slug}`}
                    className="w-full"
                    rooms={group.rooms}
                    heading=""
                    description=""
                  />
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

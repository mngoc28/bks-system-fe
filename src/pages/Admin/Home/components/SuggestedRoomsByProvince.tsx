import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ROUTERS, CLOUDINARY_HEADER_IMAGE_URL, DEFAULT_ROOM_IMAGE } from "@/constant";
import RoomCarouselContainer from "@/components/rooms/RoomCarouselContainer";
import type { RoomCard } from "@/dataHelper/home.dataHelper";
import type { SuggestedRoomsByProvinceGroup } from "@/dataHelper/EU/room.dataHelper";

interface SuggestedRoomsByProvinceProps {
  groups?: SuggestedRoomsByProvinceGroup[];
  priorityProvinceNames?: string[];
  className?: string;
}

function toRoomCard(room: SuggestedRoomsByProvinceGroup["rooms"][number]): RoomCard {
  const monthlyPrice = room.cheapest_monthly_price;
  const dailyPrice = room.cheapest_daily_price;
  const priceLabel = monthlyPrice
    ? `${Number(monthlyPrice).toLocaleString("vi-VN")}₫ / tháng`
    : dailyPrice
      ? `${Number(dailyPrice).toLocaleString("vi-VN")}₫ / ngày`
      : "Liên hệ";

  return {
    id: room.id,
    name: room.title,
    address: room.property_address || "Đang cập nhật",
    price: priceLabel,
    image: room.room_image ? `${CLOUDINARY_HEADER_IMAGE_URL}${room.room_image}` : DEFAULT_ROOM_IMAGE,
    area: `${room.area ?? 0} m²`,
    beds: room.people ?? 0,
    tourist_summary: room.tourist_summary ?? null,
    reviews_count: (room as any).reviews_count ?? 0,
    reviews_avg_rating: (room as any).reviews_avg_rating ?? 0,
    room_type: room.room_type,
    property_type_name: room.property_type_name,
  };
}

function normalizeProvinceName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[\s.\-_/]+/g, " ")
    .trim();
}

const SuggestedRoomsByProvince = ({ groups = [], priorityProvinceNames = [], className }: SuggestedRoomsByProvinceProps) => {
  const orderedGroups = useMemo(() => {
    const groupMap = new Map(
      groups.map((group) => [normalizeProvinceName(group.province_name), group]),
    );

    const orderedPriorityGroups = priorityProvinceNames.length
      ? priorityProvinceNames.map((provinceName) => groupMap.get(normalizeProvinceName(provinceName)) ?? {
          province_id: null,
          province_name: provinceName,
          province_name_en: null,
          rooms: [],
        })
      : groups;

    return orderedPriorityGroups
      .map((group) => ({
        ...group,
        rooms: group.rooms.map(toRoomCard),
      }))
      .filter((group) => group.rooms.length > 0);
  }, [groups, priorityProvinceNames]);

  if (!orderedGroups.length) {
    return null;
  }

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

      <div className="space-y-10">
        {orderedGroups.map((group) => {
          const ctaLabel = `Xem phòng tại ${group.province_name}`;
          const ctaHref = ROUTERS.SEARCH_ROOMS_BY_PROVINCE.replace(":provinceId", String(group.province_id ?? 0));

          return (
            <div key={group.province_id ?? group.province_name} className="space-y-4 rounded-[28px] border border-slate-200 bg-white/70 p-4 shadow-sm md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{group.province_name}</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">Gợi ý phòng tại {group.province_name}</h3>
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
                  sectionId={`suggested-${group.province_id ?? group.province_name}`}
                  className="w-full"
                  rooms={group.rooms}
                  heading=""
                  description=""
                />
              ) : (
                null
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SuggestedRoomsByProvince;
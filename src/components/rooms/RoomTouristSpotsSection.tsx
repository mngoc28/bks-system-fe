import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTERS } from "@/constant";
import {
  listRoomTouristSpots,
  resolveTravelTimeLabel,
  type RoomTouristSummary,
} from "@/utils/touristSummary";

interface RoomTouristSpotsSectionProps {
  summary: RoomTouristSummary | null | undefined;
  className?: string;
}

export function RoomTouristSpotsSection({ summary, className = "" }: RoomTouristSpotsSectionProps) {
  const spots = listRoomTouristSpots(summary);

  if (spots.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-2xl border border-sky-200 bg-sky-50/80 p-4 sm:p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <MapPin className="size-5 shrink-0 text-sky-600 mt-0.5" aria-hidden />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-sky-900">Khoảng cách tới điểm du lịch</h3>
            <p className="mt-1 text-xs text-sky-800/90 leading-relaxed">
              Thời gian di chuyển là ước tính do đơn vị vận hành cung cấp, không phải định vị thời gian thực.
            </p>
          </div>
          <ul className="space-y-2">
            {spots.map((spot) => {
              const timeLabel = resolveTravelTimeLabel(spot, summary);
              const slug = spot.slug?.trim();
              const name = spot.name ?? "";

              return (
                <li
                  key={`${spot.id ?? name}-${spot.is_primary ? "primary" : "secondary"}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-100 bg-white/90 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800">{name}</span>
                    {spot.is_primary && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-sky-600">
                        Gần nhất
                      </span>
                    )}
                    {spot.distance_label && (
                      <p className="text-xs text-slate-500 mt-0.5">{spot.distance_label}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {timeLabel ? (
                      <span className="text-xs font-semibold text-sky-700">{timeLabel}</span>
                    ) : (
                      <span className="text-xs text-slate-400">Chưa có thời gian</span>
                    )}
                    {slug && (
                      <Link
                        to={`${ROUTERS.SEARCH_ROOMS}?tourist_spot_slug=${encodeURIComponent(slug)}`}
                        className="mt-1 block text-[11px] font-medium text-primary hover:underline"
                      >
                        Xem phòng gần điểm này
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

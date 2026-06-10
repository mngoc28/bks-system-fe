import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Room } from "@/dataHelper/room.dataHelper";
import { Building2, CalendarDays, Edit, Trash2, MapPin, Maximize2, Users, ImageIcon } from "lucide-react";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS } from "@/constant";
import { resolveImageUrl } from "@/utils/imageUtils";
import { highlightText } from "@/utils/utils";
import { useNavigate } from "react-router-dom";
import AdminCardCrossNavMenu from "@/components/admin/AdminCardCrossNavMenu";
import { buildAdminUrl, toBookingsByRoom, toRoomsByProperty } from "@/utils/adminNavigation";

interface RoomCardProps {
  room: Room;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (room: Room) => void;
  isDeleting?: boolean;
  highlighted?: boolean;
  highlightTerms?: {
    title?: string;
    room_number?: string;
  };
}

/**
 * Room Card
 * A visually rich card component for the room manager grid, displaying a room's main image, key specifications (area, capacity), and pricing.
 */
const RoomCard: React.FC<RoomCardProps> = ({ room, onView, onEdit, onDelete, isDeleting = false, highlighted = false, highlightTerms }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const mainImage = room.images?.find(img => img.sort === 1)?.image_url || room.images?.[0]?.image_url;
  const imageUrl = resolveImageUrl(mainImage, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL });
  const fallbackImage = "/assets/images/photo_error2.png";


  const price = room.prices?.[0]?.price || 0;

  return (
    <Card
      id={`room-${room.id}`}
      className={`glass-card hover-scale group relative cursor-pointer overflow-hidden rounded-2xl border-none p-0 transition-all duration-300 animate-in ${highlighted ? 'scale-[1.03] shadow-xl shadow-primary/20 ring-2 ring-primary' : ''}`}
      onClick={() => onView(room.id)}
    >
      {/* 16/9 Image Section */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={room.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              if (e.currentTarget.src !== fallbackImage) {
                e.currentTarget.src = fallbackImage;
              }
            }}
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center bg-gray-200 p-4 text-center">
            <ImageIcon className="mx-auto mb-3 size-10 text-gray-400" />
            <p className="text-sm text-gray-500">{t("rooms.no_images_yet")}</p>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute left-4 top-4 z-10 duration-500 animate-in fade-in slide-in-from-top-2">
          <Badge className={`w-fit border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg ${room.status ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            {room.status ? t("rooms.status_public") : t("rooms.status_private")}
          </Badge>
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="size-10 rounded-full bg-white/20 text-white backdrop-blur-md transition-transform hover:scale-110 hover:bg-white/40"
            onClick={(e) => { e.stopPropagation(); onEdit(room.id); }}
          >
            <Edit className="size-5" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="size-10 rounded-full bg-red-500/80 text-white backdrop-blur-md transition-transform hover:scale-110 hover:bg-red-600"
            onClick={(e) => { e.stopPropagation(); onDelete(room); }}
            disabled={isDeleting}
          >
            <Trash2 className="size-5" />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="truncate text-lg font-bold text-slate-800 transition-colors group-hover:text-primary dark:text-slate-100" title={room.title}>
            {highlightText(room.title, highlightTerms?.title || "")}
          </h3>
          <Badge variant="outline" className="whitespace-nowrap border-slate-200 text-[10px] text-slate-500">
            #{highlightText(room.room_number || "N/A", highlightTerms?.room_number || "")}
          </Badge>
        </div>

        <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="size-3.5 text-primary" />
          <span className="truncate">{room.property_name || room.property_name || "-"}</span>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 border-y border-slate-100 py-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
              <Maximize2 className="size-4" />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase leading-none text-slate-400">{t("rooms.area")}</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{room.area} m²</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30">
              <Users className="size-4" />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase leading-none text-slate-400">{t("rooms.people")}</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{room.people}</p>
            </div>
          </div>
        </div>

        {/* Price & Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="mb-1 text-[10px] font-bold uppercase leading-none text-slate-400">{t("rooms.price")}</p>
            <p className="text-base font-black leading-none text-primary dark:text-premium-blue">
              {price > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price) : t("rooms.contact_price")}
            </p>
          </div>
        </div>
        <AdminCardCrossNavMenu
          actions={[
            ...(room.property_id
              ? [
                  {
                    key: "property-rooms",
                    label: t("adminCrossNav.property_rooms"),
                    icon: <Building2 className="size-4" />,
                    onClick: () =>
                      navigate(
                        buildAdminUrl(
                          ROUTERS.ROOMS,
                          toRoomsByProperty(
                            room.property_id as number,
                            "room-management",
                            room.property_name || room.property?.name || undefined,
                          ),
                        ),
                      ),
                  },
                ]
              : []),
            {
              key: "bookings",
              label: t("adminCrossNav.room_bookings"),
              icon: <CalendarDays className="size-4" />,
              onClick: () => {
                const roomDisplayName = room.room_number || room.title;
                navigate(buildAdminUrl(ROUTERS.BOOKING_MANAGE, toBookingsByRoom(room.id, "room-management", roomDisplayName)));
              },
            },
          ]}
        />
      </div>
    </Card>
  );
};

export default RoomCard;


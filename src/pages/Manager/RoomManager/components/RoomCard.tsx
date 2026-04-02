import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Room } from "@/dataHelper/room.dataHelper";
import { Edit, Trash2, MapPin, Maximize2, Users } from "lucide-react";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";

interface RoomCardProps {
  room: Room;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (room: Room) => void;
  isDeleting?: boolean;
  highlighted?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onView, onEdit, onDelete, isDeleting = false, highlighted = false }) => {
  const { t } = useTranslation();

  const mainImage = room.images?.find(img => img.sort === 1)?.image_url || room.images?.[0]?.image_url;
  const imageUrl = mainImage ? `${CLOUDINARY_HEADER_IMAGE_URL}${mainImage.startsWith('/') ? '' : '/'}${mainImage}` : null;

  const getRoomTypeName = (type: number) => {
    switch (type) {
      case 1: return t("rooms.room_type_single");
      case 2: return t("rooms.room_type_double");
      case 3: return t("rooms.room_type_mini_apartment");
      default: return "-";
    }
  };

  const price = room.prices?.[0]?.price || 0;

  return (
    <Card
      id={`room-${room.id}`}
      className={`glass-card hover-scale animate-in group relative overflow-hidden rounded-2xl border-none p-0 transition-all duration-300 cursor-pointer ${highlighted ? 'ring-2 ring-indigo-500 shadow-indigo-200 shadow-xl scale-[1.03]' : ''}`}
      onClick={() => onView(room.id)}
    >
      {/* 16/9 Image Section */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <img
          src={imageUrl || "/assets/images/photo_error2.png"}
          alt={room.title}
          className={`h-full w-full transition-transform duration-500 group-hover:scale-110 ${imageUrl ? 'object-cover' : 'object-contain bg-white p-4'}`}
          onError={(e) => { 
            e.currentTarget.src = "/assets/images/photo_error2.png"; 
            e.currentTarget.className = e.currentTarget.className.replace('object-cover', 'object-contain') + ' bg-white p-4';
            e.currentTarget.parentElement?.classList.add('bg-white');
          }}
        />

        {/* Status Badge */}
        <div className="absolute left-4 top-4">
          <Badge className={`border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg ${room.status ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            {room.status ? t("rooms.status_public") : t("rooms.status_private")}
          </Badge>
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/40 hover:scale-110 transition-transform"
            onClick={(e) => { e.stopPropagation(); onEdit(room.id); }}
          >
            <Edit className="size-5" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-10 w-10 rounded-full bg-red-500/80 text-white backdrop-blur-md hover:bg-red-600 hover:scale-110 transition-transform"
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
          <h3 className="truncate text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors" title={room.title}>
            {room.title}
          </h3>
          <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500 whitespace-nowrap">
            #{room.room_number || "N/A"}
          </Badge>
        </div>

        <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="size-3.5 text-indigo-500" />
          <span className="truncate">{room.building_name || "-"}</span>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 border-y border-slate-100 py-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30">
              <Maximize2 className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold leading-none mb-1">{t("rooms.area")}</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{room.area} m²</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30">
              <Users className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold leading-none mb-1">{t("rooms.people")}</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{room.people}</p>
            </div>
          </div>
        </div>

        {/* Price & Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-[10px] uppercase text-slate-400 font-bold leading-none mb-1">{t("rooms.price")}</p>
            <p className="text-base font-black text-indigo-600 dark:text-indigo-400">
              {price > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price) : t("rooms.contact_price")}
            </p>
          </div>
          <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[10px]">
            {getRoomTypeName(room.room_type)}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default RoomCard;

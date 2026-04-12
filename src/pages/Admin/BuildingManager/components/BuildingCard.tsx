import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, BuildingCardProps } from "@/dataHelper/building.dataHelper";
import { Map, MapPin, Layers, Maximize2, Calendar, Edit, Trash2, ImageIcon } from "lucide-react";
import { useGetUserProfileByIdQuery } from "@/hooks/useUserQuery";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import { safeFormatDateTime } from "@/utils/dateUtils";
import { resolveImageUrl } from "@/utils/imageUtils";
import { highlightText } from "@/utils/utils";

/**
 * Building Card component
 * Displays a summary of building information with thumbnail, key specs, and action buttons.
 */
const BuildingCard: React.FC<BuildingCardProps & { onView?: (building: Building) => void }> = ({ building, onEdit, onDelete, onView, isDeleting = false, highlightTerms }) => {
  const { t } = useTranslation();
  const { data: createdByData } = useGetUserProfileByIdQuery(building.created_by);
  const imageUrl = resolveImageUrl(building.cover_image_url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL });
  const fallbackImage = "/assets/images/photo_error2.png";

  return (
    <Card
      className={`glass-card hover-scale animate-in group relative overflow-hidden rounded-2xl border-none p-0 transition-all duration-300 ${onView ? 'cursor-pointer' : ''}`}
      onClick={() => onView?.(building)}
    >
      {/* 16/9 Image Section */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={building.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              if (e.currentTarget.src !== fallbackImage) {
                e.currentTarget.src = fallbackImage;
              }
            }}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gray-200 p-4 text-center">
            <ImageIcon className="size-10 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 text-sm">{t("rooms.no_images_yet")}</p>
          </div>
        )}

        {/* Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/40 hover:scale-110 transition-transform"
            onClick={(e) => { e.stopPropagation(); onEdit(building); }}
          >
            <Edit className="size-5" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-10 w-10 rounded-full bg-red-500/80 text-white backdrop-blur-md hover:bg-red-600 hover:scale-110 transition-transform"
            onClick={(e) => { e.stopPropagation(); onDelete(building); }}
            disabled={isDeleting}
          >
            <Trash2 className="size-5" />
          </Button>
        </div>

        {/* Property Type/Rent Category Badge */}
        <div className="absolute left-4 top-4 flex flex-col gap-1 z-10 animate-in fade-in slide-in-from-top-2 duration-500">
          <Badge className="gradient-indigo border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
            {building.rent_category ? t(`RENT_CATEGORY.${building.rent_category}`) : t("buildings.status.active")}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="truncate text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors" title={building.name}>
            {highlightText(building.name, highlightTerms?.name || "")}
          </h3>
          <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500 whitespace-nowrap">
            ID: {building.id}
          </Badge>
        </div>

        <div className="mb-4 space-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Map className="size-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">
              {highlightText(building.province_name, highlightTerms?.province_name || "")} - {highlightText(building.ward_name, highlightTerms?.ward_name || "")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 opacity-80 underline decoration-slate-200 underline-offset-4">
            <MapPin className="size-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{building.address_detail || t("buildings.no_address_provided")}</span>
          </div>
        </div>

        {/* Icon Grid for Specs */}
        <div className="grid grid-cols-2 gap-3 border-y border-slate-100 py-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30">
              <Maximize2 className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold leading-none mb-1">{t("buildings.area")}</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{building.area} m²</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30">
              <Layers className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold leading-none mb-1">{t("buildings.floors")}</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{building.number_of_floors}</p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px]">
              {(createdByData?.data?.name || building.user_name || "A")[0].toUpperCase()}
            </div>
            <span className="font-medium text-slate-500">{createdByData?.data?.name || building.user_name || "-"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="size-3 text-slate-300" />
            <span>{t("common.last_updated")}: {safeFormatDateTime(building.updated_at)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BuildingCard;

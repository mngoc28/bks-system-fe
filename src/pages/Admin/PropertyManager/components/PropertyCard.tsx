import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Property, PropertyCardProps } from "@/dataHelper/property.dataHelper";
import { Map, MapPin, Layers, Maximize2, Calendar, Edit, Trash2, ImageIcon } from "lucide-react";
import { useGetUserProfileByIdQuery } from "@/hooks/useUserQuery";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import { safeFormatDateTime } from "@/utils/dateUtils";
import { resolveImageUrl } from "@/utils/imageUtils";
import { highlightText } from "@/utils/utils";

/**
 * Property Card component
 * Displays a summary of property information with thumbnail, key specs, and action buttons.
 */
const PropertyCard: React.FC<PropertyCardProps & { onView?: (property: Property) => void }> = ({ property, onEdit, onDelete, onView, isDeleting = false, highlightTerms }) => {
  const { t } = useTranslation();
  const { data: createdByData } = useGetUserProfileByIdQuery(property.created_by);
  const imageUrl = resolveImageUrl(property.cover_image_url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL });
  const fallbackImage = "/assets/images/photo_error2.png";

  return (
    <Card
      className={`glass-card hover-scale group relative overflow-hidden rounded-2xl border-none p-0 transition-all duration-300 animate-in ${onView ? 'cursor-pointer' : ''}`}
      onClick={() => onView?.(property)}
    >
      {/* 16/9 Image Section */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={property.name}
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

        {/* Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="size-10 rounded-full bg-white/20 text-white backdrop-blur-md transition-transform hover:scale-110 hover:bg-white/40"
            onClick={(e) => { e.stopPropagation(); onEdit(property); }}
          >
            <Edit className="size-5" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="size-10 rounded-full bg-red-500/80 text-white backdrop-blur-md transition-transform hover:scale-110 hover:bg-red-600"
            onClick={(e) => { e.stopPropagation(); onDelete(property); }}
            disabled={isDeleting}
          >
            <Trash2 className="size-5" />
          </Button>
        </div>

        {/* Property Type/Rent Category Badge */}
        <div className="absolute left-4 top-4 z-10 flex flex-col gap-1 duration-500 animate-in fade-in slide-in-from-top-2">
          <Badge className="gradient-indigo border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
            {property.rent_category ? t(`RENT_CATEGORY.${property.rent_category}`) : t("properties.status.active")}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="truncate text-lg font-bold text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-100" title={property.name}>
            {highlightText(property.name, highlightTerms?.name || "")}
          </h3>
          <Badge variant="outline" className="whitespace-nowrap border-slate-200 text-[10px] text-slate-500">
            ID: {property.id}
          </Badge>
        </div>

        <div className="mb-4 space-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Map className="size-3.5 shrink-0 text-indigo-500" />
            <span className="truncate">
              {highlightText(property.province_name, highlightTerms?.province_name || "")} - {highlightText(property.ward_name, highlightTerms?.ward_name || "")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 underline decoration-slate-200 underline-offset-4 opacity-80">
            <MapPin className="size-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{property.address_detail || t("properties.no_address_provided")}</span>
          </div>
        </div>

        {/* Icon Grid for Specs */}
        <div className="grid grid-cols-2 gap-3 border-y border-slate-100 py-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30">
              <Maximize2 className="size-4" />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase leading-none text-slate-400">{t("properties.area")}</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{property.area} m²</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30">
              <Layers className="size-4" />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase leading-none text-slate-400">{t("properties.floors")}</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{property.number_of_floors}</p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
              {(createdByData?.data?.name || property.user_name || "A")[0].toUpperCase()}
            </div>
            <span className="font-medium text-slate-500">{createdByData?.data?.name || property.user_name || "-"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="size-3 text-slate-300" />
            <span>{t("common.last_updated")}: {safeFormatDateTime(property.updated_at)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;


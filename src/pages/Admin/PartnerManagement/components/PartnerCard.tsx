import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartnerInfor } from "@/dataHelper/partner.dataHelper";
import { Map, MapPin, Phone, Edit, Globe, ImageIcon } from "lucide-react";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import { resolveImageUrl } from "@/utils/imageUtils";
import { highlightText } from "@/utils/utils";

interface PartnerCardProps {
  partner: PartnerInfor;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  highlightTerms?: {
    company_name?: string;
    user_name?: string;
    province_name?: string;
    ward_name?: string;
    phone?: string;
    website?: string;
    address?: string;
  };
}

/**
 * Partner Card
 * A visual summary of partner information used in the management grid, featuring company logo and contact details.
 */
const PartnerCard: React.FC<PartnerCardProps> = ({ partner, onView, onEdit, highlightTerms }) => {
  const { t } = useTranslation();
  const imageUrl = resolveImageUrl(partner.image_1, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL });
  const fallbackImage = "/assets/images/photo_error2.png";

  return (
    <Card
      className="glass-card hover-scale group relative cursor-pointer overflow-hidden rounded-2xl border-none p-0 transition-all duration-300 animate-in"
      onClick={() => onView(partner.id)}
    >
      {/* 16/9 Banner/Logo Section */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={partner.user_name}
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
            <p className="text-sm text-gray-500">{t("partner.no_images_yet")}</p>
          </div>
        )}

        {/* Edit Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="size-10 rounded-full bg-white/20 text-white backdrop-blur-md transition-transform hover:scale-110 hover:bg-white/40"
            onClick={(e) => { e.stopPropagation(); onEdit(partner.id); }}
          >
            <Edit className="size-5" />
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <h3
            className="truncate text-xl font-black text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-100"
            title={partner.company_name || partner.user_name}
          >
            {highlightText(partner.company_name || partner.user_name || "", highlightTerms?.company_name || "")}
          </h3>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="outline" className="whitespace-nowrap border-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">
              ID: {partner.id}
            </Badge>
          </div>
        </div>

        {partner.company_name && partner.user_name && (
          <p className="mb-3 mt-[-12px] text-xs font-semibold text-slate-400">
            {t("partner.representative")}: {highlightText(partner.user_name || "", highlightTerms?.user_name || "")}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Map className="size-4 shrink-0 text-indigo-500" />
            <span className="truncate">{highlightText(partner.province_name || "", highlightTerms?.province_name || "")} - {highlightText(partner.ward_name || "", highlightTerms?.ward_name || "")}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Phone className="size-4 shrink-0 text-cyan-500" />
            <span className="font-medium text-slate-600">{highlightText(partner.phone || "-", highlightTerms?.phone || "")}</span>
          </div>
          {partner.website && (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Globe className="size-4 shrink-0 text-emerald-500" />
              <span className="truncate italic text-indigo-400">{highlightText(partner.website, highlightTerms?.website || "")}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm text-slate-500 opacity-80">
            <MapPin className="size-4 shrink-0 text-slate-400" />
            <span className="truncate text-xs">{highlightText(partner.address || t("partner.no_address_provided"), highlightTerms?.address || "")}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PartnerCard;

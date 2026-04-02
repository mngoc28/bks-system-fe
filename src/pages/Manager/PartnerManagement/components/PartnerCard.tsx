import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartnerInfor } from "@/dataHelper/partner.dataHelper";
import { MapPin, Phone, Building, Edit, Globe } from "lucide-react";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";

interface PartnerCardProps {
  partner: PartnerInfor;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
}

const PartnerCard: React.FC<PartnerCardProps> = ({ partner, onView, onEdit }) => {
  const { t } = useTranslation();
  const imageUrl = partner.image_1 ? `${CLOUDINARY_HEADER_IMAGE_URL}/${partner.image_1}` : null;

  return (
    <Card
      className="glass-card hover-scale animate-in group relative overflow-hidden rounded-2xl border-none p-0 transition-all duration-300 cursor-pointer"
      onClick={() => onView(partner.id)}
    >
      {/* 16/9 Banner/Logo Section */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={imageUrl || "/assets/images/photo_error2.png"}
          alt={partner.user_name}
          className={`h-full w-full transition-transform duration-500 group-hover:scale-110 ${imageUrl ? 'object-cover' : 'object-contain bg-white p-4'}`}
          onError={(e) => { 
            e.currentTarget.src = "/assets/images/photo_error2.png"; 
            e.currentTarget.className = e.currentTarget.className.replace('object-cover', 'object-contain') + ' bg-white p-4';
            e.currentTarget.parentElement?.classList.add('bg-white');
          }}
        />

        {/* Edit Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/40 hover:scale-110 transition-transform"
            onClick={(e) => { e.stopPropagation(); onEdit(partner.id); }}
          >
            <Edit className="size-5" />
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3
            className="truncate text-xl font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors"
            title={partner.company_name || partner.user_name}
          >
            {partner.company_name || partner.user_name}
          </h3>
          <Badge className="bg-indigo-50 text-indigo-600 border-none px-2 py-0.5 text-[10px] font-bold">PARTNER</Badge>
        </div>

        {partner.company_name && partner.user_name && (
          <p className="mt-[-12px] mb-3 text-xs font-semibold text-slate-400">
            {t("partner.representative")}: {partner.user_name}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <MapPin className="size-4 text-indigo-500 shrink-0" />
            <span className="truncate">{partner.province_name} - {partner.ward_name}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Phone className="size-4 text-cyan-500 shrink-0" />
            <span className="font-medium text-slate-600">{partner.phone || "-"}</span>
          </div>
          {partner.website && (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Globe className="size-4 text-emerald-500 shrink-0" />
              <span className="truncate text-indigo-400 italic">{partner.website}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm text-slate-500 opacity-80">
            <Building className="size-4 text-slate-400 shrink-0" />
            <span className="truncate text-xs">{partner.address || t("partner.no_address_provided")}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PartnerCard;

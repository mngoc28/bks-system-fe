import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmenitySearchSectionProps } from "@/dataHelper/amenity.dataHelper";
import React from "react";
import { useTranslation } from "react-i18next";

const AmenitySearchSection: React.FC<AmenitySearchSectionProps> = ({
  open,
  searchValue,
  setSearchValue,
  onReset,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="mt-4 w-full rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm text-slate-700">{t("amenities.search_name")}</label>
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t("amenities.search_name_placeholder")}
              className="h-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onReset} type="button" className="h-9">
              {t("common.reset")}
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose} className="h-9">
              {t("common.close")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmenitySearchSection;
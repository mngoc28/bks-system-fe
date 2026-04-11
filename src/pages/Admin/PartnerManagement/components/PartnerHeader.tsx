import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageBar from "@/components/PageBar";
import { useTranslation } from "react-i18next";

import { ViewMode } from "@/components/LayoutToggle";

interface PartnerHeaderProps {
  onOpenFilter: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

/**
 * Partner Header
 * Displays the management section header with access to filtering tools.
 */
const PartnerHeader: React.FC<PartnerHeaderProps> = ({ onOpenFilter, viewMode, onViewModeChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      {/* Removing redundant <h1> as it's often shown in the layout header or breadcrumbs */}
      <PageBar
        subtitle={t("partner.partner_list_subtitle") || "Manage were professional relationship and details of your partners."}
        showLayoutToggle={true}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-200 bg-white font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              onClick={onOpenFilter}
            >
              <Filter className="size-4" />
              {t("common.filter")}
            </Button>
            {/* 
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2 bg-indigo-600 font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-indigo-200"
              onClick={() => {}}
            >
              <Plus className="size-4" />
              {t("common.add_new")}
            </Button> 
            */}
          </>
        }
      />
    </div>
  );
};

export default PartnerHeader;

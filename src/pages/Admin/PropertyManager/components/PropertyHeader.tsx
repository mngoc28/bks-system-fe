import { Button } from "@/components/ui/button";
import { PropertyHeaderProps } from "@/dataHelper/property.dataHelper";
import { Filter, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageBar from "@/components/PageBar";

/**
 * Property Header component
 * Displays the page title, subtitle, and primary actions (Filter and Create).
 */
const PropertyHeader: React.FC<PropertyHeaderProps> = ({ 
  onCreateProperty, 
  onOpenFilter,
  viewMode,
  onViewModeChange 
}) => {
  const { t } = useTranslation();

  return (
    <PageBar
      subtitle={t("properties.property_list_subtitle") || "Quản lý danh sách tòa nhà và căn hộ."}
      showLayoutToggle={true}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-slate-200 bg-white font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-primary"
            onClick={onOpenFilter}
          >
            <Filter className="size-4" />
            {t("common.filter")}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2 bg-primary font-semibold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-primary/25"
            onClick={onCreateProperty}
          >
            <Plus className="size-4" />
            {t("properties.create_property")}
          </Button>
        </div>
      }
    />
  );
};

export default PropertyHeader;



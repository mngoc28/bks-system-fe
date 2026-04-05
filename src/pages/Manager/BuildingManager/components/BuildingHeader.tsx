import { Button } from "@/components/ui/button";
import { BuildingHeaderProps } from "@/dataHelper/building.dataHelper";
import { Filter, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageBar from "@/components/PageBar";

/**
 * Building Header component
 * Displays the page title, subtitle, and primary actions (Filter and Create).
 */
const BuildingHeader: React.FC<BuildingHeaderProps> = ({ onCreateBuilding, onOpenFilter }) => {
  const { t } = useTranslation();

  return (
    <PageBar
      subtitle={t("buildings.building_list_subtitle") || "Quản lý danh sách tòa nhà và căn hộ."}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-slate-200 bg-white font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-indigo-600"
            onClick={onOpenFilter}
          >
            <Filter className="size-4" />
            {t("common.filter")}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2 bg-indigo-600 font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-indigo-200"
            onClick={onCreateBuilding}
          >
            <Plus className="size-4" />
            {t("buildings.create_building")}
          </Button>
        </div>
      }
    />
  );
};

export default BuildingHeader;


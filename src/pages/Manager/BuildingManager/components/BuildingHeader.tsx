import { Button } from "@/components/ui/button";
import { BuildingHeaderProps } from "@/dataHelper/building.dataHelper";
import { Filter, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

const BuildingHeader: React.FC<BuildingHeaderProps> = ({ onCreateBuilding, onOpenFilter }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <h1 className="flex-1 text-xl font-bold text-slate-800">{t("buildings.building_list")}</h1>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 px-4 py-2 border-primary text-primary hover:bg-primary/5"
          onClick={onOpenFilter}
        >
          <Filter className="size-4" />
          {t("common.filter")}
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-2 px-4 py-2"
          onClick={onCreateBuilding}
        >
          <Plus className="size-4" />
          {t("buildings.create_building")}
        </Button>
      </div>
    </div>
  );
};

export default BuildingHeader;


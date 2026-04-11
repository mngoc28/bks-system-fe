import { TableHead, TableHeader } from "@/components/ui/table";
import { BuildingTableHeaderProps, SortKey } from "@/dataHelper/building.dataHelper";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const BuildingTableHeader: React.FC<BuildingTableHeaderProps> = ({
  getSortDirection,
  onToggleSort,
}) => {
  const { t } = useTranslation();

  const renderSortIcon = (key: SortKey) => {
    const direction = getSortDirection(key);
    if (direction === "asc") {
      return <ChevronUp className="size-4 text-slate-700" />;
    } else if (direction === "desc") {
      return <ChevronDown className="size-4 text-slate-700" />;
    } else {
      return <ChevronsUpDown className="size-4 text-slate-500" />;
    }
  };

  const renderSortableHeader = (
    key: SortKey,
    label: string,
    className?: string
  ) => {
    const direction = getSortDirection(key);
    return (
      <TableHead
        className={`cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700 ${className || ""}`}
        onClick={() => onToggleSort(key)}
        aria-sort={direction ? (direction === "asc" ? "ascending" : "descending") : "none"}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {renderSortIcon(key)}
        </span>
      </TableHead>
    );
  };

  return (
    <TableHeader className="sticky top-0 z-10 bg-slate-100">
      <tr className="border-b border-gray-300">
        {renderSortableHeader("id", t("buildings.table_id"))}
        <TableHead className="whitespace-nowrap px-4 py-3 text-center text-slate-700">
          <span className="inline-flex items-center gap-1">
            {t("buildings.table_images")}
          </span>
        </TableHead>
        {renderSortableHeader("name", t("buildings.table_name"))}
        {renderSortableHeader("user_name", t("buildings.table_user_name"))}
        {renderSortableHeader("province_name", t("buildings.table_province"))}
        {renderSortableHeader("ward_name", t("buildings.table_ward"))}
        {renderSortableHeader("area", `${t("buildings.table_area")} (m²)`)}
        <TableHead className="whitespace-nowrap px-4 py-3 text-center text-slate-700">
          <span className="inline-flex items-center gap-1">{t("buildings.table_custom")}</span>
        </TableHead>
      </tr>
    </TableHeader>
  );
};

export default BuildingTableHeader;


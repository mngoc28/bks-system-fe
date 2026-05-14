import { TableHead, TableHeader } from "@/components/ui/table";
import { PropertyTableHeaderProps, SortKey } from "@/dataHelper/property.dataHelper";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const PropertyTableHeader: React.FC<PropertyTableHeaderProps> = ({
  getSortDirection,
  onToggleSort,
}) => {
  const { t } = useTranslation();

  const renderSortIcon = (key: SortKey) => {
    const direction = getSortDirection(key);
    if (direction === "asc") {
      return <ChevronUp className="size-4" />;
    } else if (direction === "desc") {
      return <ChevronDown className="size-4" />;
    } else {
      return <ChevronsUpDown className="size-4" />;
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
        className={`cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700 ${className || ""}`}
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
        {renderSortableHeader("id", t("properties.table_id"), "text-center")}
        <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">
          <span className="inline-flex items-center gap-1">
            {t("properties.table_images")}
          </span>
        </TableHead>
        {renderSortableHeader("name", t("properties.table_name"))}
        {renderSortableHeader("user_name", t("properties.table_user_name"))}
        {renderSortableHeader("province_name", t("properties.table_province"))}
        {renderSortableHeader("ward_name", t("properties.table_ward"))}
        {renderSortableHeader("area", `${t("properties.table_area")} (m²)`, "text-center")}
        <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">
          <span className="inline-flex items-center gap-1">{t("properties.table_custom")}</span>
        </TableHead>
      </tr>
    </TableHeader>
  );
};

export default PropertyTableHeader;



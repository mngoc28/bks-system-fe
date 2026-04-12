import React from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProvinceTableProps } from "@/dataHelper/province.dataHelper";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Province Table Component
 * Displays the list of provinces in a table format with sorting and actions.
 */
const ProvinceTable: React.FC<ProvinceTableProps> = ({
  filtered,
  onView,
  onSort,
  filters,
}) => {
  const { t } = useTranslation();

  const renderSortIcon = (field: string) => {
    if (filters.sort_field !== field) return <ChevronsUpDown className="size-4" />;
    return filters.sort_direction === "asc" ? (
      <ChevronUp className="size-4" />
    ) : (
      <ChevronDown className="size-4" />
    );
  };

  return (
    <div className="w-full overflow-auto rounded-xl border border-blue-100 bg-white shadow-sm">
      <Table className="min-w-max text-sm text-slate-700">
        <TableHeader className="sticky top-0 z-10 bg-slate-100">
          <tr className="border-b border-gray-300">
            <TableHead
              className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
              onClick={() => onSort("id")}
            >
              <span className="inline-flex items-center justify-center gap-1">
                ID
                {renderSortIcon("id")}
              </span>
            </TableHead>
            <TableHead
              className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
              onClick={() => onSort("name")}
            >
              <span className="inline-flex items-center gap-1">
                {t("province.name")}
                {renderSortIcon("name")}
              </span>
            </TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 text-center text-slate-700">
              {t("province.name_en")}
            </TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 text-center text-slate-700">
              {t("province.ward_count")}
            </TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 text-center text-slate-700">
              {t("province.room_count")}
            </TableHead>
            <TableHead className="whitespace-nowrap px-4 py-3 text-center text-slate-700">
              {t("common.customize")}
            </TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {filtered.map((province) => (
            <TableRow key={province.id} className="hover:bg-muted/50">
              <TableCell className="px-4 py-3 text-center align-middle text-slate-700">{province.id}</TableCell>
              <TableCell className="px-4 py-3 align-middle text-slate-700">{province.name}</TableCell>
              <TableCell className="px-4 py-3 text-center align-middle text-slate-600">
                {province.name_en}
              </TableCell>
              <TableCell className="px-4 py-3 text-center align-middle text-slate-700">{province.ward_count}</TableCell>
              <TableCell className="px-4 py-3 text-center align-middle text-slate-700">{province.room_count}</TableCell>
              <TableCell className="px-4 py-3 text-center align-middle">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-medium text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                  onClick={() => onView(province.id)}
                >
                  {t("common.view_details")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProvinceTable;

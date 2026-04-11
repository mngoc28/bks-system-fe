import React from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProvinceTableProps } from "@/dataHelper/province.dataHelper";
import { ChevronDown, ChevronsUpDown, ChevronUp, MapPin } from "lucide-react";
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
    if (filters.sort_field !== field) return <ChevronsUpDown className="size-4 text-slate-400" />;
    return filters.sort_direction === "asc" ? (
      <ChevronUp className="size-4 text-indigo-600" />
    ) : (
      <ChevronDown className="size-4 text-indigo-600" />
    );
  };

  return (
    <div className="w-full overflow-auto rounded-xl border border-blue-100 bg-white shadow-sm">
      <Table className="min-w-max text-sm text-slate-700">
        <TableHeader className="sticky top-0 z-10 bg-slate-100">
          <tr className="border-b border-gray-300">
            <TableHead
              className="px-4 py-3 text-center cursor-pointer select-none"
              onClick={() => onSort("id")}
            >
              <div className="flex items-center justify-center gap-1">
                ID
                {renderSortIcon("id")}
              </div>
            </TableHead>
            <TableHead
              className="px-4 py-3 text-left cursor-pointer select-none"
              onClick={() => onSort("name")}
            >
              <div className="flex items-center gap-1">
                {t("province.name")}
                {renderSortIcon("name")}
              </div>
            </TableHead>
            <TableHead className="px-4 py-3 text-center">
              {t("province.name_en")}
            </TableHead>
            <TableHead className="px-4 py-3 text-center">
              {t("province.ward_count")}
            </TableHead>
            <TableHead className="px-4 py-3 text-center">
              {t("province.room_count")}
            </TableHead>
            <TableHead className="px-4 py-3 text-center">
              {t("common.customize")}
            </TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {filtered.map((province) => (
            <TableRow key={province.id} className="hover:bg-slate-50 transition-colors">
              <TableCell className="px-4 py-3 text-center align-middle font-medium text-slate-500">
                #{province.id}
              </TableCell>
              <TableCell className="px-4 py-3 align-middle">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <MapPin className="size-4" />
                  </div>
                  <span className="font-semibold text-slate-900">{province.name}</span>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 text-center align-middle text-slate-600">
                {province.name_en}
              </TableCell>
              <TableCell className="px-4 py-3 text-center align-middle">
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {province.ward_count} {t("province.wards")}
                </span>
              </TableCell>
              <TableCell className="px-4 py-3 text-center align-middle">
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
                  {province.room_count} {t("province.rooms")}
                </span>
              </TableCell>
              <TableCell className="px-4 py-3 text-center align-middle">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium"
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

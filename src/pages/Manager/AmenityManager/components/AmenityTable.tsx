import Pagination from "@/components/Pagination";
import RowActions from "@/components/RowActions/RowActions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AmenityTableProps } from "@/dataHelper/amenity.dataHelper";
import { safeFormatDateTime } from "@/utils/dateUtils";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

const AmenityTable: React.FC<AmenityTableProps> = ({
  filtered,
  page,
  perPage,
  totalPages,
  totalItems,
  onPageChange,
  onPerPageChange,
  onEdit,
  onDelete,
  highlightedId,
  toggleSort,
  filters,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col px-4">
      <div className="w-full overflow-auto">
        <Table className="admin-table min-w-max bg-white text-sm text-slate-700">
          <TableHeader>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <TableHead
                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                onClick={() => toggleSort("id")}
                aria-sort={filters.sort_field === "id" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  ID
                  {filters.sort_field === "id" ? (
                    filters.sort_direction === "asc" ? (
                      <ChevronUp className="size-4 text-slate-700" />
                    ) : (
                      <ChevronDown className="size-4 text-slate-700" />
                    )
                  ) : (
                    <ChevronsUpDown className="size-4 text-slate-500" />
                  )}
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
                onClick={() => toggleSort("name")}
                aria-sort={filters.sort_field === "name" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("amenities.table_name")}
                  {filters.sort_field === "name" ? (
                    filters.sort_direction === "asc" ? (
                      <ChevronUp className="size-4 text-slate-700" />
                    ) : (
                      <ChevronDown className="size-4 text-slate-700" />
                    )
                  ) : (
                    <ChevronsUpDown className="size-4 text-slate-500" />
                  )}
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
                onClick={() => toggleSort("created_at")}
                aria-sort={filters.sort_field === "created_at" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("amenities.table_created_at")}
                  {filters.sort_field === "created_at" ? (
                    filters.sort_direction === "asc" ? (
                      <ChevronUp className="size-4 text-slate-700" />
                    ) : (
                      <ChevronDown className="size-4 text-slate-700" />
                    )
                  ) : (
                    <ChevronsUpDown className="size-4 text-slate-500" />
                  )}
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
                onClick={() => toggleSort("updated_at")}
                aria-sort={filters.sort_field === "updated_at" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  {t("amenities.table_updated_at")}
                  {filters.sort_field === "updated_at" ? (
                    filters.sort_direction === "asc" ? (
                      <ChevronUp className="size-4 text-slate-700" />
                    ) : (
                      <ChevronDown className="size-4 text-slate-700" />
                    )
                  ) : (
                    <ChevronsUpDown className="size-4 text-slate-500" />
                  )}
                </span>
              </TableHead>
              <TableHead className="px-4 py-3 text-slate-700">{t("common.customize")}</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {filtered.map((amenity) => (
              <TableRow key={amenity.id} className={`hover:bg-muted/50 ${highlightedId === amenity.id ? 'bg-green-100 animate-pulse' : ''}`}>
                <TableCell className="px-4 py-3 text-center align-middle">{amenity.id}</TableCell>
                <TableCell className="px-4 py-3 align-middle">{amenity.name}</TableCell>
                <TableCell className="px-4 py-3 align-middle">{safeFormatDateTime(amenity.created_at)}</TableCell>
                <TableCell className="px-4 py-3 align-middle">{safeFormatDateTime(amenity.updated_at)}</TableCell>
                <TableCell className="px-4 py-3 align-middle">
                  <RowActions
                    id={amenity.id.toString()}
                    onEdit={(id: string | number) => onEdit(Number(id))}
                    onDelete={(id: string | number) => onDelete(Number(id))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalItems > 0 && (
          <div className="p-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
              perPage={perPage}
              onPerPageChange={onPerPageChange}
              totalItems={totalItems}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AmenityTable;
import Pagination from "@/components/Pagination";
import RowActions from "@/components/RowActions/RowActions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AmenityTableProps } from "@/dataHelper/amenity.dataHelper";
import { safeFormatDateTime } from "@/utils/dateUtils";
import { highlightText } from "@/utils/utils";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Amenity Table Component
 * Displays the list of amenities in a table format with sorting and pagination.
 */
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
    <div className="flex flex-1 flex-col">
      <div className="w-full overflow-auto rounded-xl border border-blue-100 bg-white shadow-sm">
        <Table className="min-w-max text-sm text-slate-700">
          <TableHeader className="sticky top-0 z-10 bg-slate-100">
            <tr className="border-b border-gray-300">
              <TableHead
                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                onClick={() => toggleSort("id")}
                aria-sort={filters.sort_field === "id" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center gap-1">
                  ID
                  {filters.sort_field === "id" ? (
                    filters.sort_direction === "asc" ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )
                  ) : (
                    <ChevronsUpDown className="size-4" />
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
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )
                  ) : (
                    <ChevronsUpDown className="size-4" />
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
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )
                  ) : (
                    <ChevronsUpDown className="size-4" />
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
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )
                  ) : (
                    <ChevronsUpDown className="size-4" />
                  )}
                </span>
              </TableHead>
              <TableHead className="px-4 py-3 text-slate-700">{t("common.customize")}</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {filtered.map((amenity) => (
              <TableRow key={amenity.id} className={`hover:bg-muted/50 ${highlightedId === amenity.id ? 'animate-pulse bg-green-100' : ''}`}>
                <TableCell className="px-4 py-3 text-center align-middle">{amenity.id}</TableCell>
                <TableCell className="px-4 py-3 align-middle text-slate-700">{highlightText(amenity.name, filters.name || "")}</TableCell>
                <TableCell className="px-4 py-3 align-middle text-slate-700">{safeFormatDateTime(amenity.created_at)}</TableCell>
                <TableCell className="px-4 py-3 align-middle text-slate-700">{safeFormatDateTime(amenity.updated_at)}</TableCell>
                <TableCell className="px-4 py-3 align-middle text-slate-700">
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
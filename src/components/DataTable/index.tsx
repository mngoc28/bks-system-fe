import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface Column<T> {
  header: React.ReactNode;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  isError?: boolean;
  noDataMessage?: string;
  onRowClick?: (item: T) => void;
}

const DataTable = <T extends object>({ data, columns, isLoading = false, isError = false, noDataMessage, onRowClick }: DataTableProps<T>) => {
  const { t } = useTranslation();

  const renderCell = (item: T, column: Column<T>) => {
    if (column.cell) {
      return column.cell(item);
    }

    const value = item[column.accessorKey as keyof T];
    return value as React.ReactNode;
  };

  return (
    <div className="overflow-x-auto rounded border border-blue-100">
      {isLoading ? (
        <div className="flex h-40 w-full items-center justify-center">
          <Loader2 className="size-8 animate-spin text-slate-500" />
        </div>
      ) : isError ? (
        <div className="flex h-40 w-full items-center justify-center">
          <p className="text-red-500">{t("common.error_loading")}</p>
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-slate-100">
            <TableRow className="whitespace-nowrap">
              {columns.map((column, index) => (
                <TableHead key={index} className={`${column.className} ${column.hideOnMobile ? "hidden md:table-cell" : ""}`}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="px-6 py-10 text-center text-slate-500">
                  {noDataMessage || t("common.no_data")}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow key={rowIndex} className="border-b border-blue-100" onClick={() => onRowClick?.(item)}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={`${column.className} ${column.hideOnMobile ? "hidden md:table-cell" : ""}`}>
                      {renderCell(item, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default DataTable;

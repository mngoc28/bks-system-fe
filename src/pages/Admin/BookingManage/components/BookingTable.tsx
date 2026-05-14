import React from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookingTableProps } from "@/dataHelper/booking.dataHelper";
import { safeFormatDateTime } from "@/utils/dateUtils";
import { Badge } from "@/components/ui/badge";
import RowActions from "@/components/RowActions/RowActions";
import { formatPrice } from "@/utils/utils";
import { highlightText } from "@/utils/utils";

/**
 * Booking Table Component
 * Standardized table for displaying and managing bookings in the admin portal.
 */
const BookingTable: React.FC<BookingTableProps> = ({
  filtered,
  onView,
  onEdit,
  onDelete,
  filters,
}) => {
  const { t } = useTranslation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">{t("bookings.status_pending") || "Đang chờ"}</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">{t("bookings.status_confirmed") || "Đã xác nhận"}</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">{t("bookings.status_cancelled") || "Đã hủy"}</Badge>;
      case "completed":
        return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{t("bookings.status_completed") || "Hoàn thành"}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="w-full overflow-auto rounded-xl border border-blue-100 bg-white shadow-sm">
        <Table className="min-w-max text-sm text-slate-700">
          <TableHeader className="sticky top-0 z-10 bg-slate-100">
            <tr className="border-b border-gray-300">
              <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">ID</TableHead>
              <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">{t("bookings.table.customer") || "Khách hàng"}</TableHead>
              <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">{t("bookings.table.room") || "Phòng"}</TableHead>
              <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">{t("bookings.table.duration") || "Thời gian"}</TableHead>
              <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">{t("bookings.table.price") || "Giá"}</TableHead>
              <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">{t("bookings.table.status") || "Trạng thái"}</TableHead>
              <TableHead className="whitespace-nowrap px-4 py-3 text-center text-slate-700">{t("common.customize")}</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filtered.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-muted/50">
                <TableCell className="px-4 py-3 align-middle text-slate-700">{booking.id}</TableCell>
                <TableCell className="px-4 py-3 align-middle text-slate-700">{highlightText(booking.user.name, filters.q || "")}</TableCell>
                <TableCell className="px-4 py-3 align-middle text-slate-700">
                  <div>{highlightText(booking.room.room_number, filters.room || "")}</div>
                  <div className="text-xs text-slate-500">{highlightText(booking.room.property.name, filters.room || "")}</div>
                </TableCell>
                <TableCell className="px-4 py-3 align-middle text-slate-700">
                  {safeFormatDateTime(booking.start_date)} - {safeFormatDateTime(booking.end_date)}
                </TableCell>
                <TableCell className="px-4 py-3 align-middle text-slate-700">{formatPrice(booking.price)}</TableCell>
                <TableCell className="px-4 py-3 align-middle">{getStatusBadge(booking.status)}</TableCell>
                <TableCell className="px-4 py-3 text-center align-middle">
                  <RowActions
                    id={booking.id}
                    onView={(id) => onView(id)}
                    onEdit={(id) => onEdit(id)}
                    onDelete={(id) => onDelete(id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BookingTable;


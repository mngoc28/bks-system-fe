import React from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookingTableProps } from "@/dataHelper/booking.dataHelper";
import { safeFormatDateTime } from "@/utils/dateUtils";
import { Badge } from "@/components/ui/badge";
import RowActions from "@/components/RowActions/RowActions";
import { formatPrice } from "@/utils/utils";

/**
 * Booking Table Component
 * Standardized table for displaying and managing bookings in the admin portal.
 */
const BookingTable: React.FC<BookingTableProps> = ({
  filtered,
  onView,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{t("bookings.status_pending") || "Đang chờ"}</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{t("bookings.status_confirmed") || "Đã xác nhận"}</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{t("bookings.status_cancelled") || "Đã hủy"}</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{t("bookings.status_completed") || "Hoàn thành"}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="w-full overflow-auto rounded-xl border border-blue-100 bg-white shadow-sm">
      <Table className="min-w-max text-sm text-slate-700">
        <TableHeader className="sticky top-0 z-10 bg-slate-100">
          <tr className="border-b border-gray-300">
            <TableHead className="px-4 py-3 text-slate-700 font-semibold">ID</TableHead>
            <TableHead className="px-4 py-3 text-slate-700 font-semibold">{t("bookings.table.customer") || "Khách hàng"}</TableHead>
            <TableHead className="px-4 py-3 text-slate-700 font-semibold">{t("bookings.table.room") || "Phòng"}</TableHead>
            <TableHead className="px-4 py-3 text-slate-700 font-semibold">{t("bookings.table.duration") || "Thời gian"}</TableHead>
            <TableHead className="px-4 py-3 text-slate-700 font-semibold">{t("bookings.table.price") || "Giá"}</TableHead>
            <TableHead className="px-4 py-3 text-slate-700 font-semibold">{t("bookings.table.status") || "Trạng thái"}</TableHead>
            <TableHead className="px-4 py-3 text-slate-700 font-semibold text-center">{t("common.customize")}</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {filtered.map((booking) => (
            <TableRow key={booking.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
              <TableCell className="px-4 py-4 font-bold text-slate-400">#{booking.id}</TableCell>
              <TableCell className="px-4 py-4">
                <div className="font-bold text-slate-800">{booking.user.name}</div>
              </TableCell>
              <TableCell className="px-4 py-4">
                <div className="font-bold text-indigo-700">{booking.room.room_number}</div>
                <div className="text-xs text-slate-400 font-semibold">{booking.room.building.name}</div>
              </TableCell>
              <TableCell className="px-4 py-4">
                <div className="text-xs font-bold text-slate-700">
                  {safeFormatDateTime(booking.start_date)} - {safeFormatDateTime(booking.end_date)}
                </div>
              </TableCell>
              <TableCell className="px-4 py-4">
                <div className="font-bold text-slate-900">{formatPrice(booking.price)}</div>
              </TableCell>
              <TableCell className="px-4 py-4">
                {getStatusBadge(booking.status)}
              </TableCell>
              <TableCell className="px-4 py-4">
                <div className="flex justify-center">
                  <RowActions
                    id={booking.id}
                    onView={(id) => onView(id)}
                    onEdit={(id) => onEdit(id)}
                    onDelete={(id) => onDelete(id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookingTable;

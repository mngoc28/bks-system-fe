import React from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookingTableProps } from "@/dataHelper/booking.dataHelper";
import { safeFormatDateTime } from "@/utils/dateUtils";
import { Badge } from "@/components/ui/badge";
import RowActions from "@/components/RowActions/RowActions";
import { formatPrice, highlightText } from "@/utils/utils";
import { getAdminBookingBadgeClass, getAdminBookingDisplayKey } from "@/utils/bookingDisplay";

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
  onNavigateUser,
  onNavigateRoom,
  onNavigateProperty,
}) => {
  const { t } = useTranslation();

  const getStatusBadge = (booking: BookingTableProps["filtered"][number]) => {
    const displayKey = getAdminBookingDisplayKey(booking.status, booking.stay_status);
    const className = getAdminBookingBadgeClass(booking.status, booking.stay_status);
    return (
      <Badge variant="outline" className={className}>
        {t(`bookings.display.${displayKey}`, {
          defaultValue: t(`bookings.search.status_${booking.status}`, { defaultValue: booking.status }),
        })}
      </Badge>
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="w-full overflow-auto rounded-xl border border-primary/10 bg-white shadow-sm">
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
                <TableCell className="px-4 py-3 align-middle text-slate-700">
                  {onNavigateUser ? (
                    <button type="button" className="text-left text-primary hover:underline" onClick={() => onNavigateUser(booking)}>
                      {highlightText(booking.user.name, filters.q || "")}
                    </button>
                  ) : (
                    highlightText(booking.user.name, filters.q || "")
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 align-middle text-slate-700">
                  <div className="flex flex-col gap-0.5">
                    {onNavigateRoom ? (
                      <button type="button" className="text-left text-primary hover:underline font-medium" onClick={() => onNavigateRoom(booking)}>
                        {highlightText(booking.room.room_number, filters.room || "")}
                      </button>
                    ) : (
                      <div className="font-medium">{highlightText(booking.room.room_number, filters.room || "")}</div>
                    )}
                    {onNavigateProperty ? (
                      <button
                        type="button"
                        className="text-left text-xs text-slate-500 hover:text-primary hover:underline"
                        onClick={() => onNavigateProperty(booking)}
                      >
                        {highlightText(booking.room.property.name, filters.room || "")}
                      </button>
                    ) : (
                      <div className="text-xs text-slate-500">{highlightText(booking.room.property.name, filters.room || "")}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 align-middle text-slate-700">
                  {safeFormatDateTime(booking.start_date)} - {safeFormatDateTime(booking.end_date)}
                </TableCell>
                <TableCell className="px-4 py-3 align-middle text-slate-700">{formatPrice(booking.price)}</TableCell>
                <TableCell className="px-4 py-3 align-middle">{getStatusBadge(booking)}</TableCell>
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


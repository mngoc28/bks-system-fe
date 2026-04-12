import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/dataHelper/booking.dataHelper";
import { Edit, Trash2, Calendar, User, Home, CreditCard, UserCheck, Clock, ArrowDown } from "lucide-react";
import { formatDateVietnam, safeFormatDateTime } from "@/utils/dateUtils";
import { formatPrice, highlightText } from "@/utils/utils";

interface BookingCardProps {
  booking: Booking;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  highlightTerms?: {
    q?: string;
    room?: string;
    assignee?: string;
  };
}

/**
 * Booking Card component
 * Displays a summary of a booking, including status, user info, room details, and stay duration.
 */
const BookingCard: React.FC<BookingCardProps> = ({ booking, onView, onEdit, onDelete, highlightTerms }) => {
  const { t } = useTranslation();

  const getStatusColor = (status: "pending" | "confirmed" | "cancelled" | "completed") => {
    switch (status) {
      case "pending": return "bg-amber-500";
      case "confirmed": return "bg-blue-500";
      case "cancelled": return "bg-rose-500";
      case "completed": return "bg-emerald-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <Card
      className="glass-card hover-scale animate-in group relative overflow-hidden rounded-2xl border-none p-6 transition-all duration-300 h-full flex flex-col cursor-pointer"
      onClick={() => onView(booking.id)}
    >
      {/* Top Header */}
      <div className="mb-4 flex items-center justify-between">
        <Badge className={`border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg ${getStatusColor(booking.status as any)}`}>
          {t(`bookings.search.status_${booking.status}`)}
        </Badge>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {booking.id}</span>
      </div>

      {/* User Info */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 shadow-inner dark:bg-indigo-900/30">
          <User className="size-6" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{highlightText(booking.user.name, highlightTerms?.q || "")}</h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="size-3" />
            {safeFormatDateTime(booking.created_at)}
          </div>
        </div>
      </div>

      {/* Booking Details Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 border-y border-slate-50 py-5 dark:border-slate-800">
        {/* Room Info */}
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 shrink-0 dark:bg-cyan-900/30">
            <Home className="size-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">{t("bookings.table.room")}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {highlightText(booking.room.room_number, highlightTerms?.room || "")} — {highlightText(booking.room.building.name, highlightTerms?.room || "")}
            </p>
          </div>
        </div>

        {/* Duration Info */}
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0 dark:bg-indigo-900/30">
            <Calendar className="size-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{t("bookings.table.duration")}</p>
            <div className="flex flex-col text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
              <span>{formatDateVietnam(booking.start_date)}</span>
              <div className="flex items-center gap-2 h-4 my-0.5">
                <ArrowDown className="size-3 text-indigo-400/50" />
                <div className="h-px w-8 bg-indigo-100 dark:bg-indigo-900/30" />
              </div>
              <span>{formatDateVietnam(booking.end_date)}</span>
            </div>
          </div>
        </div>

        {/* Price Info */}
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0 dark:bg-emerald-900/30">
            <CreditCard className="size-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">{t("bookings.table.price")}</p>
            <p className="text-base font-black text-emerald-600 leading-none">{formatPrice(booking.price)}</p>
          </div>
        </div>

        {/* Assignee Info */}
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 shrink-0 dark:bg-violet-900/30">
            <UserCheck className="size-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">{t("bookings.table.assignee")}</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-none">{highlightText(booking.assignee || "-", highlightTerms?.assignee || "")}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="mt-auto grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="h-10 rounded-xl border-slate-100 hover:bg-slate-50 hover:text-indigo-600 text-slate-500 font-bold dark:border-slate-800 dark:hover:bg-slate-800"
          onClick={(e) => { e.stopPropagation(); onEdit(booking.id); }}
        >
          <Edit className="size-4 mr-2" />
          {t("common.edit")}
        </Button>
        <Button
          variant="outline"
          className="h-10 rounded-xl border-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-slate-500 font-bold dark:border-slate-800 dark:hover:bg-red-900/30"
          onClick={(e) => { e.stopPropagation(); onDelete(booking.id); }}
        >
          <Trash2 className="size-4 mr-2" />
          {t("common.delete")}
        </Button>
      </div>
    </Card>
  );
};

export default BookingCard;

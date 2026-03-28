import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock3, MapPin, SearchX, XCircle } from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTERS } from "@/constant";
import { formatPrice } from "@/utils/utils";

type BookingStatus = "upcoming" | "completed" | "cancelled";

type UserBooking = {
  id: string;
  roomId: number;
  roomTitle: string;
  provinceName?: string;
  address?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  customerName: string;
  createdAt: string;
  status: BookingStatus;
};

const STORAGE_KEY = "publicMyBookings";

const safeParseBookings = (): UserBooking[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const bookingStatusLabel: Record<BookingStatus, string> = {
  upcoming: "Sap toi",
  completed: "Hoan thanh",
  cancelled: "Da huy",
};

const bookingStatusBadgeClass: Record<BookingStatus, string> = {
  upcoming: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const MyBookings = () => {
  const [tab, setTab] = useState<BookingStatus>("upcoming");
  const [bookings, setBookings] = useState<UserBooking[]>(() => safeParseBookings());

  const filteredBookings = useMemo(() => bookings.filter((booking) => booking.status === tab), [bookings, tab]);

  const persistBookings = (nextBookings: UserBooking[]) => {
    setBookings(nextBookings);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBookings));
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    const nextBookings = bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: "cancelled" as const } : booking,
    );
    persistBookings(nextBookings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40 text-slate-900">
      <PublicHeader />

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900/80" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
            Quan ly dat phong
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Dat phong cua toi</h1>
          <p className="mt-3 text-slate-200">Theo doi trang thai don va quan ly lich luu tru ngay tren BKS Stay.</p>
        </div>
      </section>

      <div className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Trang chu", href: ROUTERS.HOME },
              { label: "Dat phong cua toi" },
            ]}
            className="text-sm"
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["upcoming", "completed", "cancelled"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setTab(status)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === status ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {bookingStatusLabel[status]}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300/70 bg-white/80 px-6 py-14 text-center">
            <SearchX className="mx-auto mb-3 h-8 w-8 text-slate-400" />
            <p className="text-base font-semibold text-slate-700">Chua co don dat phong nao o muc nay</p>
            <p className="mt-2 text-sm text-slate-500">Hay tim phong phu hop va tao don dat dau tien cua ban.</p>
            <Button asChild className="mt-5 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 hover:opacity-90">
              <Link to={ROUTERS.SEARCH_ROOMS}>Tim phong ngay</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings
              .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
              .map((booking) => (
                <Card key={booking.id} className="rounded-3xl border-slate-200 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">{booking.roomTitle}</h3>
                          <Badge className={`rounded-full border-0 ${bookingStatusBadgeClass[booking.status]}`}>{bookingStatusLabel[booking.status]}</Badge>
                        </div>
                        <p className="inline-flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="h-4 w-4 text-sky-500" />
                          {booking.address || "Dang cap nhat dia chi"}
                        </p>
                        <p className="inline-flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays className="h-4 w-4 text-sky-500" />
                          {booking.startDate} - {booking.endDate}
                        </p>
                        <p className="inline-flex items-center gap-2 text-sm text-slate-500">
                          <Clock3 className="h-4 w-4" />
                          Tao luc: {new Date(booking.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>

                      <div className="space-y-3 md:text-right">
                        <p className="text-sm text-slate-500">Tong tam tinh</p>
                        <p className="text-2xl font-bold text-sky-600">{formatPrice(booking.totalPrice)}</p>
                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <Button asChild variant="secondary" className="rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100">
                            <Link to={ROUTERS.PUBLIC_ROOM_DETAIL.replace(":roomId", booking.roomId.toString())}>Xem phong</Link>
                          </Button>

                          {booking.status === "upcoming" && (
                            <Button
                              variant="secondary"
                              className="rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Huy don
                            </Button>
                          )}

                          {booking.status === "completed" && (
                            <Button asChild className="rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 hover:opacity-90">
                              <Link to={`${ROUTERS.BOOKING}/${booking.roomId}`}>
                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                Dat lai
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};

export default MyBookings;

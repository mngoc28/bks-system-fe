import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, CalendarDays, MapPin } from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTERS } from "@/constant";
import { formatPrice } from "@/utils/utils";

type BookingSuccessState = {
  bookingId: string;
  roomTitle: string;
  address?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
};

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state as BookingSuccessState | null) ?? null;

  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40">
        <PublicHeader />
        <main className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-slate-600">Khong tim thay thong tin dat phong.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button onClick={() => navigate(ROUTERS.MY_BOOKINGS)}>Den don cua toi</Button>
            <Button variant="secondary" className="border border-slate-300 bg-white text-slate-700" onClick={() => navigate(ROUTERS.SEARCH_ROOMS)}>
              Tim phong khac
            </Button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40 text-slate-900">
      <PublicHeader />

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900/80" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-300" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Dat phong thanh cong</h1>
          <p className="mt-3 text-slate-200">Yeu cau cua ban da duoc ghi nhan. Chung toi da gui thong tin xac nhan ve email dang ky.</p>
        </div>
      </section>

      <div className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Trang chu", href: ROUTERS.HOME },
              { label: "Dat phong thanh cong" },
            ]}
            className="text-sm"
          />
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="space-y-4 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <p className="text-sm uppercase tracking-[0.15em] text-slate-500">Ma dat phong</p>
              <p className="text-sm font-semibold text-slate-800">{state.bookingId}</p>
            </div>

            <h2 className="text-xl font-semibold text-slate-900">{state.roomTitle}</h2>

            <p className="inline-flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 text-sky-500" />
              {state.address || "Dang cap nhat dia chi"}
            </p>

            <p className="inline-flex items-center gap-2 text-sm text-slate-600">
              <CalendarDays className="h-4 w-4 text-sky-500" />
              {state.startDate} - {state.endDate}
            </p>

            <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
              <p className="text-sm text-slate-600">Tong tam tinh</p>
              <p className="mt-1 text-2xl font-bold text-sky-600">{formatPrice(state.totalPrice)}</p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild className="rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 hover:opacity-90">
                <Link to={ROUTERS.MY_BOOKINGS}>Xem don cua toi</Link>
              </Button>
              <Button asChild variant="secondary" className="rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100">
                <Link to={ROUTERS.SEARCH_ROOMS}>Tiep tuc tim phong</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <PublicFooter />
    </div>
  );
};

export default BookingSuccess;

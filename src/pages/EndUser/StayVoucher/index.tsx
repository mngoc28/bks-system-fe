import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import html2canvas from "html2canvas";
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  QrCode,
  ShieldCheck,
  User,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ROUTERS } from "@/constant";
import stayService, { BookingDetail } from "@/services/stayService";
import { formatPrice } from "@/utils/utils";
import { toastSuccess, toastError } from "@/components/ui/toast";

const StayVoucher = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const voucherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      try {
        const res: any = await stayService.getBookingDetail(id);
        if (res.status === "success" && res.data) {
          setBooking(res.data);
        }
      } catch (err) {
        console.error(err);
        toastError("Không thể tải thông tin phiếu xác nhận.");
      } finally {
        setLoading(false);
      }
    };
    void fetchBooking();
  }, [id]);

  const handleDownloadPng = async () => {
    if (!voucherRef.current) return;
    try {
      toastSuccess("Đang chuẩn bị tải ảnh phiếu xác nhận...");
      const canvas = await html2canvas(voucherRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Stay_Voucher_BKS_${booking?.booking_code || id}.png`;
      link.href = dataUrl;
      link.click();
      toastSuccess("Tải ảnh Stay Voucher thành công!");
    } catch (err) {
      console.error(err);
      toastError("Lỗi khi chuyển đổi ảnh Stay Voucher.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Spinner showText text="Đang tải dữ liệu Stay Voucher..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center">
        <p className="text-slate-700 font-bold">Không tìm thấy thông tin đặt phòng.</p>
        <Button asChild className="mt-4 rounded-xl" variant="outline">
          <Link to={ROUTERS.BKS_STAY_HISTORY}>
            Quay lại lịch sử
          </Link>
        </Button>
      </div>
    );
  }

  const checkInDate = new Date(booking.start_date).toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const checkOutDate = new Date(booking.end_date).toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
      {/* Top bar (Hidden in Print) */}
      <div className="mx-auto max-w-2xl mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Button variant="ghost" asChild className="h-10 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900">
          <Link to={`/bks-stay/bookings/${id}`} className="flex items-center gap-2">
            <ArrowLeft className="size-4" /> Quay lại chi tiết
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPng} className="h-10 gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold px-4">
            <Download className="size-4" /> Tải ảnh (PNG)
          </Button>
          <Button onClick={handlePrint} variant="outline" className="h-10 gap-2 rounded-xl border-slate-200 font-bold px-4 bg-white text-slate-700">
            <Printer className="size-4" /> In phiếu (A4)
          </Button>
        </div>
      </div>

      {/* Stay Voucher (Visible in Print, ID maps to CSS) */}
      <div className="mx-auto max-w-2xl">
        <div 
          ref={voucherRef}
          id="voucher-card-print"
          className="bg-white border border-slate-200 rounded-[24px] shadow-xl p-8 space-y-8 print:border-none print:shadow-none"
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-6 text-emerald-600" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">BKS STAY CONFIRMED</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900">PHIẾU XÁC NHẬN LƯU TRÚ</h1>
              <p className="text-xs text-slate-500 font-medium">Mã đặt phòng: <span className="font-mono font-bold text-slate-900 select-all">{booking.booking_code || id}</span></p>
            </div>
            <div className="text-right space-y-1">
              <span className="text-lg font-black tracking-tight block">Stay <span className="text-sky-600">Portal</span></span>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">StayConnect System</span>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Thông tin khách hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100/60">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                    <User className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Khách hàng</span>
                    <span className="text-sm font-bold text-slate-800">{booking.user?.name || "Thành viên BKS"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">Số điện thoại liên hệ</span>
                    <span className="text-sm font-bold text-slate-800">{booking.user?.phone || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Thông tin cơ sở lưu trú</h2>
              <div className="rounded-2xl border border-slate-100 p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">{booking.room?.title}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{booking.room?.property?.name}</p>
                </div>
                {(booking.room?.property?.address_detail || booking.room?.property?.address) && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin className="size-4 shrink-0 text-slate-400" />
                    <span className="relative top-[1px]">{booking.room?.property?.address_detail || booking.room?.property?.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Check-in / Check-out */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-100 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Calendar className="size-4 text-sky-500" />
                  <span>Nhận phòng</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{checkInDate}</p>
                <p className="text-[11px] font-semibold text-slate-500">Giờ check-in tiêu chuẩn: Từ 14:00</p>
              </div>

              <div className="rounded-2xl border border-slate-100 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Calendar className="size-4 text-sky-500" />
                  <span>Trả phòng</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{checkOutDate}</p>
                <p className="text-[11px] font-semibold text-slate-500">Giờ check-out tiêu chuẩn: Trước 12:00</p>
              </div>
            </div>

            {/* Price details */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Thông tin chi tiết chi phí</h2>
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-3">Danh mục</th>
                      <th className="px-6 py-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-6 py-4 font-semibold">Phí thuê phòng ({booking.price?.price ? `${formatPrice(booking.price.price)} VNĐ/${booking.price.unit === "month" ? "tháng" : "ngày"}` : ""})</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">{formatPrice(booking.total_amount || 0)} VNĐ</td>
                    </tr>
                    {booking.deposit_amount && booking.deposit_amount > 0 ? (
                      <tr>
                        <td className="px-6 py-4 font-semibold text-emerald-600">Tiền đặt cọc đã thanh toán</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600">-{formatPrice(booking.deposit_amount || 0)} VNĐ</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Signatures & Stamp Section */}
          <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-6">
            <div className="text-center italic text-slate-400 space-y-4">
              <p className="text-xs font-bold text-slate-500 not-italic">Khách hàng lưu trú</p>
              <div className="flex h-24 flex-col items-center justify-center">
                <p className="text-xs font-bold text-emerald-600 not-italic">Đã xác nhận tự động</p>
                <p className="mt-1 text-[9px] leading-tight opacity-75 not-italic text-slate-500">Hệ thống khớp mã đặt phòng<br/>{booking.booking_code || id}</p>
              </div>
            </div>
            <div className="text-center italic text-slate-400 space-y-4">
              <p className="text-xs font-bold text-slate-500 not-italic">Đại diện BKS Stay (Bên A)</p>
              <div className="flex h-24 items-center justify-center">
                <div className="relative flex size-24 select-none items-center justify-center rounded-full border-4 border-double border-red-500/80 p-1.5 text-red-500/80 font-black rotate-[-8deg] duration-300 hover:rotate-0">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[6px] font-black uppercase tracking-wider leading-none">CÔNG TY BKS</span>
                    <span className="text-[8px] font-extrabold uppercase tracking-widest border-y border-red-500/80 my-0.5 py-0.5 px-1 leading-none">ĐÃ XÁC THỰC</span>
                    <span className="text-[6px] font-bold uppercase tracking-wider leading-none">BKS STAY STAMP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Validation QR Mock */}
          <div className="flex flex-col items-center justify-center p-6 border-t border-slate-100/60 bg-slate-50/50 rounded-2xl gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-inner">
              <QrCode className="size-20 text-slate-900" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Xác thực Check-in bằng QR</p>
            <p className="text-xs text-slate-500 font-semibold text-center leading-relaxed max-w-sm">
              Lễ tân sẽ quét mã này bằng thiết bị cầm tay để xác minh trạng thái phòng và hoàn tất thủ tục nhận phòng cho bạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StayVoucher;

import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  Phone,
  Mail,
  MessageCircle,
  Key,
  Wifi,
  CreditCard,
  Star,
  MapPin,
  CalendarX,
  Clock,
  BadgeCheck,
  Zap,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toastSuccess } from "@/components/ui/toast";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { useEffect } from "react";

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const CATEGORIES = ["Tất cả", "Đặt phòng", "Thanh toán", "Hủy phòng", "Tài khoản & Bảo mật", "Dịch vụ tại phòng"];

const faqs: FaqItem[] = [
  {
    id: "faq-booking-1",
    category: "Đặt phòng",
    question: "Làm thế nào để đặt phòng trên BKS Stay?",
    answer:
      "Bạn truy cập trang chủ BKS Stay, chọn địa điểm, ngày lưu trú và số lượng khách để tìm kiếm phòng trống phù hợp. Sau khi chọn phòng và điền đầy đủ thông tin người đại diện, bạn tiến hành thanh toán đặt cọc/tiền phòng trực tuyến bằng mã VietQR động qua cổng SePay. Sau khoảng 5 - 15 giây đối soát tự động thành công, hệ thống sẽ gửi email chứa Stay Voucher xác nhận đặt phòng và thông tin đăng nhập Cổng khách lưu trú (Stay Portal).",
    icon: <BadgeCheck className="size-4 text-indigo-500" />,
  },
  {
    id: "faq-booking-2",
    category: "Đặt phòng",
    question: "Tôi có thể đặt phòng hộ người khác không?",
    answer:
      "Có. Khi điền thông tin đặt phòng, bạn hãy nhập chính xác Họ tên, Số điện thoại và Email của người đại diện nhận phòng tại phần thông tin liên hệ. Mọi thông báo xác nhận, Stay Voucher và thông tin đăng nhập Stay Portal sẽ được gửi về email đăng ký đó để người lưu trú làm thủ tục check-in.",
    icon: <Star className="size-4 text-indigo-500" />,
  },
  {
    id: "faq-booking-3",
    category: "Đặt phòng",
    question: "Làm thế nào để xem lại lịch sử đặt phòng?",
    answer:
      "Bạn có thể xem lại lịch sử bằng cách đăng nhập Cổng khách lưu trú (BKS Stay Portal) tại địa chỉ http://localhost:5173/bks-stay/login bằng Mã đặt phòng (Booking Code, ví dụ: BKS-92830-XYZ) và Email đăng ký. Sau khi đăng nhập, chọn mục 'Lịch sử đặt phòng' trên menu trái để kiểm tra danh sách đơn phòng (Upcoming, Completed, Cancelled) và bấm trực tiếp vào thẻ phòng để xem chi tiết.",
    icon: <Clock className="size-4 text-indigo-500" />,
  },
  {
    id: "faq-cancel-1",
    category: "Hủy phòng",
    question: "Quy định hủy phòng tại BKS Stay như thế nào?",
    answer:
      "Hệ thống áp dụng chính sách hủy phòng rõ ràng dựa trên thời gian lưu trú và thời điểm đặt phòng: 1) Đặt phòng ngắn hạn (Dưới 30 đêm): Miễn phí hủy trước check-in từ 7 ngày trở lên (hoàn 100% cọc); phí 50% từ 2 đến dưới 7 ngày; phạt 100% (không hoàn tiền) nếu hủy dưới 48 giờ. 2) Đặt phòng dài hạn (Từ 30 đêm trở lên): Miễn phí hủy trước check-in từ 30 ngày trở lên (hoàn 100% cọc); phí 50% từ 7 đến dưới 30 ngày; phạt 100% (không hoàn tiền) nếu hủy dưới 7 ngày. 3) Đặt phòng sát giờ (Last-Minute < 24h trước check-in): Không hoàn tiền nếu phòng áp dụng Giá không hoàn tiền (non-refundable rate); hoàn tối đa 50% tiền cọc nếu hủy trước check-in tối thiểu 4 tiếng đối với Giá có thể hoàn tiền (refundable rate).",
    icon: <CalendarX className="size-4 text-indigo-500" />,
  },
  {
    id: "faq-cancel-2",
    category: "Hủy phòng",
    question: "Sau khi hủy phòng, tiền hoàn về sau bao lâu?",
    answer:
      "Với các yêu cầu hủy phòng hợp lệ được hệ thống xác nhận, tiền hoàn trả sẽ được chuyển trực tiếp vào tài khoản ngân hàng của bạn trong vòng 3 - 5 ngày làm việc thông qua hệ thống đối soát của BKS Stay. Đối với các đơn thanh toán trực tiếp cho Chủ nhà bên ngoài hệ thống, thời hạn và phương thức hoàn tiền sẽ do hai bên tự thỏa thuận.",
    icon: <CreditCard className="size-4 text-indigo-500" />,
  },
  {
    id: "faq-payment-1",
    category: "Thanh toán",
    question: "BKS Stay hỗ trợ những phương thức thanh toán và đặt cọc nào?",
    answer:
      "Chúng tôi hỗ trợ thanh toán trực tuyến bằng VietQR động (qua cổng SePay) giúp tự động đối khớp giao dịch cực kỳ nhanh chóng (5-15 giây) hoặc chuyển khoản ngân hàng trực tiếp cho Chủ nhà (khách hàng tải ảnh biên lai giao dịch lên hệ thống). Về chính sách cọc động (Dynamic Deposit): Không cần đặt cọc vào ngày thường/mùa thấp điểm (giữ phòng đến 14:00/18:00 cùng ngày); yêu cầu cọc trước 50% - 100% vào cuối tuần (Thứ 6 & Thứ 7), dịp Lễ hoặc mùa cao điểm; yêu cầu đặt cọc/thanh toán 100% đối với đặt phòng sát giờ (Last-minute trong vòng 24h trước check-in). Đối với thuê dài hạn, khách hàng thực hiện ký quỹ cọc giữ chỗ (held in escrow) trực tuyến hoặc trực tiếp trước khi ký hợp đồng lưu trú.",
    icon: <CreditCard className="size-4 text-indigo-500" />,
  },
  {
    id: "faq-payment-2",
    category: "Thanh toán",
    question: "Tôi có thể thanh toán khi nhận phòng không?",
    answer:
      "Có thể. Tuy nhiên, quyền lợi này phụ thuộc vào chính sách cọc động của hệ thống: Nếu đặt phòng vào ngày thường hoặc mùa thấp điểm, bạn được phép thanh toán 100% tại chỗ khi nhận phòng. Nếu kỳ lưu trú rơi vào cuối tuần (Thứ 6, Thứ 7), ngày Lễ, mùa cao điểm hoặc bạn đặt phòng sát giờ (trong vòng 24h trước check-in), bạn bắt buộc phải thanh toán đặt cọc trực tuyến từ 50% - 100% để kích hoạt giữ chỗ thành công.",
    icon: <Zap className="size-4 text-indigo-500" />,
  },
  {
    id: "faq-account-1",
    category: "Tài khoản & Bảo mật",
    question: "Làm thế nào để lấy mã cửa phòng?",
    answer:
      "Mã cửa phòng (mã khóa thông minh) sẽ hiển thị tự động tại mục 'Truy cập phòng' trong trang 'Chi tiết đặt phòng' trên Cổng khách lưu trú (BKS Stay Portal) ngay sau khi bạn thực hiện thủ tục check-in trực tuyến (online check-in) thành công hoặc chính xác vào giờ nhận phòng tiêu chuẩn (từ 14:00 ngày nhận phòng).",
    icon: <Key className="size-4 text-indigo-500" />,
  },
  {
    id: "faq-account-2",
    category: "Tài khoản & Bảo mật",
    question: "Thông tin cá nhân của tôi có được bảo mật không?",
    answer:
      "Có. BKS Stay cam kết bảo mật thông tin cá nhân của khách hàng tuyệt đối. Dữ liệu được truyền tải và lưu trữ an toàn bằng giao thức mã hóa SSL và chỉ được sử dụng cho mục đích xác nhận đơn đặt phòng, thực hiện hợp đồng thuê điện tử và đăng ký khai báo tạm trú theo quy định của pháp luật.",
    icon: <ShieldCheck className="size-4 text-indigo-500" />,
  },
  {
    id: "faq-service-1",
    category: "Dịch vụ tại phòng",
    question: "Tôi có thể đổi mật khẩu Wi-Fi không?",
    answer:
      "Mật khẩu Wi-Fi tại các cơ sở lưu trú được cấu hình cố định nhằm duy trì kết nối ổn định và an toàn. Bạn có thể quét mã QR dán trong phòng hoặc xem trực tiếp thông tin Tên mạng & Mật khẩu Wi-Fi tại mục 'Hướng dẫn ở phòng' (Stay Guide) trên Dashboard của Cổng khách lưu trú sau khi nhận phòng.",
    icon: <Wifi className="size-4 text-indigo-500" />,
  },
  {
    id: "faq-service-2",
    category: "Dịch vụ tại phòng",
    question: "Bãi đỗ xe của tòa nhà ở đâu?",
    answer:
      "Hầu hết các căn hộ/tòa nhà thuộc hệ thống BKS Stay đều có bãi đỗ xe máy và ô tô nội khu. Bạn hãy truy cập mục 'Chỉ đường & Đỗ xe' trong trang chi tiết đặt phòng trên Cổng khách lưu trú để xem sơ đồ lối vào bãi và nội quy đỗ xe, hoặc liên hệ trực tiếp với Chủ nhà/Lễ tân để được hỗ trợ đón tiếp.",
    icon: <MapPin className="size-4 text-indigo-500" />,
  },
];

const PublicFaq = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);

  const filtered = faqs.filter((f) => {
    const matchSearch =
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = activeCategory === "Tất cả" || f.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const openChatbot = () => {
    window.dispatchEvent(new CustomEvent("open-public-chatbot"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <PublicHeader />
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 px-4 py-16 text-center sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.35),transparent)]" />
        <div className="relative mx-auto max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-300 backdrop-blur-sm">
            <HelpCircle className="size-3.5" />
            Trung tâm hỗ trợ
          </div>
          <h1 className="mb-4 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            Câu hỏi thường gặp
          </h1>
          <p className="mb-8 text-base text-indigo-200/80">
            Tìm nhanh câu trả lời hoặc chat trực tiếp với trợ lý AI 24/7 của BKS.
          </p>

          {/* Search */}
          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm câu hỏi... (VD: hủy phòng, mã cửa, Wi-Fi)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-13 w-full rounded-2xl border border-white/10 bg-white/10 pl-11 pr-5 py-3.5 text-sm text-white placeholder-white/40 backdrop-blur-md focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Category tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${activeCategory === cat
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* FAQ Accordion */}
          <div className="lg:col-span-2">
            {filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((faq) => (
                  <div
                    key={faq.id}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                      className={`flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors ${openId === faq.id ? "bg-indigo-50/60" : "bg-white"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                          {faq.icon}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{faq.question}</span>
                      </div>
                      {openId === faq.id ? (
                        <ChevronDown className="size-4 shrink-0 text-indigo-500" />
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-slate-300" />
                      )}
                    </button>
                    {openId === faq.id && (
                      <div className="border-t border-indigo-100/60 bg-indigo-50/30 px-6 pb-5 pt-4 text-sm leading-relaxed text-slate-500 animate-in fade-in slide-in-from-top-2 duration-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center">
                <HelpCircle className="mb-3 size-10 text-slate-200" />
                <p className="font-semibold text-slate-400">Không tìm thấy câu hỏi phù hợp.</p>
                <p className="mt-1 text-sm text-slate-400">Thử từ khóa khác hoặc chat với trợ lý AI bên dưới.</p>
              </div>
            )}

            {/* Chat CTA */}
            <div className="mt-6 flex flex-col items-center gap-4 rounded-[28px] bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white sm:flex-row">
              <div className="rounded-2xl bg-white/10 p-3">
                <MessageCircle className="size-8" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-black">Không tìm thấy câu trả lời?</p>
                <p className="text-sm text-indigo-200">Trợ lý AI của BKS sẵn sàng giải đáp tức thì 24/7.</p>
              </div>
              <Button
                onClick={openChatbot}
                className="shrink-0 rounded-xl bg-white px-6 font-bold text-indigo-700 shadow-lg hover:bg-indigo-50 active:scale-95 transition-all"
              >
                Chat ngay
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <h3 className="px-1 text-lg font-black text-slate-900">Kênh liên hệ</h3>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText("0333494850");
                toastSuccess("Đã sao chép số hotline 0333 494 850 vào bộ nhớ tạm!");
              }}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-rose-200 hover:shadow-md group text-left cursor-pointer"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors">
                <Phone className="size-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hotline 24/7 (Bấm để copy)</p>
                <p className="text-lg font-black text-slate-900">0333 494 850</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText("stay@bks.vn");
                toastSuccess("Đã sao chép email stay@bks.vn vào bộ nhớ tạm!");
              }}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-md group text-left cursor-pointer"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 group-hover:bg-sky-100 transition-colors">
                <Mail className="size-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email hỗ trợ (Bấm để copy)</p>
                <p className="text-lg font-black text-slate-900">stay@bks.vn</p>
              </div>
            </button>

            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <h4 className="mb-3 flex items-center gap-2 font-bold text-sm">
                <ShieldCheck className="size-4 text-indigo-400" />
                Cam kết dịch vụ
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-xs text-slate-400">
                  <Clock className="mt-0.5 size-3.5 shrink-0 text-indigo-400" />
                  Hỗ trợ khẩn cấp 24/7 trong suốt kỳ nghỉ của bạn.
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-400">
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-indigo-400" />
                  Văn phòng đại diện tại 12 tỉnh thành lớn.
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-400">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-indigo-400" />
                  Bảo mật thông tin cá nhân theo chuẩn SSL.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
              <p className="mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Bạn là chủ phòng?</p>
              <Link
                to="/become-a-partner"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
              >
                Đăng ký làm đối tác →
              </Link>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default PublicFaq;

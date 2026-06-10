import { Link } from "react-router-dom";
import { PublicHeader, PublicFooter } from "@/components/layout/Public";
import { ROUTERS } from "@/constant";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Home, 
  Layers, 
  Compass, 
  CheckCircle, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  DollarSign, 
  Activity, 
  Smartphone,
  ChevronDown,
  Lock
} from "lucide-react";
import { useState } from "react";

// FAQ Item definition
interface FAQItem {
  question: string;
  answer: string;
}

export default function BecomeAPartner() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const partnerTypes = [
    {
      title: "Khách sạn (Hotel)",
      description: "Dành cho các doanh nghiệp có pháp nhân, mã số thuế, quy mô sơ đồ phòng lớn và nhiều dịch vụ gia tăng. Yêu cầu xác thực tài liệu pháp lý đầy đủ.",
      icon: <Building2 className="size-8 text-sky-400" />,
      badge: "Phổ biến nhất",
      features: ["Sơ đồ phòng đa cấp", "Đồng bộ kênh bán phòng", "Quản lý dịch vụ đính kèm"]
    },
    {
      title: "Nhà nghỉ (Guesthouse)",
      description: "Dành cho hộ kinh doanh cá thể hoặc doanh nghiệp quy mô vừa và nhỏ. Giao diện tối giản giúp tối ưu hóa công suất lấp phòng.",
      icon: <Home className="size-8 text-indigo-400" />,
      features: ["Xác thực hồ sơ nhanh", "Quản lý phòng trống trực quan", "Thanh toán đối soát hàng tuần"]
    },
    {
      title: "Căn hộ / Căn hộ dịch vụ (Apartment)",
      description: "Dành cho chủ căn hộ hoặc đơn vị vận hành chuỗi căn hộ phục vụ nhu cầu thuê ngắn và trung hạn, với vận hành tiện ích khép kín.",
      icon: <Layers className="size-8 text-emerald-400" />,
      features: ["Chứng minh quyền sở hữu", "Set-up giá theo mùa linh hoạt", "Quản lý hợp đồng dài hạn"]
    },
    {
      title: "Homestay chia phòng (Homestay)",
      description: "Dành cho cá nhân tự vận hành homestay nhỏ lẻ hoặc phòng nghỉ trải nghiệm bản địa. Quy trình xác thực danh tính cá nhân (CCCD) tối giản.",
      icon: <Compass className="size-8 text-rose-400" />,
      features: ["Xác thực CCCD cá nhân", "Lịch đồng bộ qua điện thoại", "Dòng tiền chuyển khoản trực tiếp"]
    }
  ];

  const benefits = [
    {
      title: "Phí dịch vụ nền tảng 5%",
      description: "Không phí khởi tạo hay duy trì. Chi phí dịch vụ cố định 5% tính trên doanh thu đơn hàng hoàn thành.",
      icon: <DollarSign className="size-6 text-emerald-400" />
    },
    {
      title: "Nền tảng Quản lý Extranet Thông minh",
      description: "Theo dõi doanh thu thời gian thực, quản lý đặt phòng, tạo giá khuyến mãi động và tự động khóa/mở phòng trống.",
      icon: <Activity className="size-6 text-sky-400" />
    },
    {
      title: "Ký kết Hợp đồng Điện tử An toàn",
      description: "Hoàn tất thủ tục pháp lý online 100% qua E-Signature chuẩn mã hóa, lưu trữ điện tử bảo mật.",
      icon: <FileText className="size-6 text-indigo-400" />
    },
    {
      title: "Đối soát & Quyết toán tự động",
      description: "Đối soát tự động định kỳ 2 lần/tháng vào ngày 05 và ngày 20 qua hệ thống bảng kê trực quan.",
      icon: <ShieldCheck className="size-6 text-teal-400" />
    }
  ];

  const faqs: FAQItem[] = [
    {
      question: "Quy trình phê duyệt tài khoản đối tác mất bao lâu?",
      answer: "Sau khi bạn hoàn thành 4 bước đăng ký (bao gồm tải lên GPKD/CCCD và ký hợp đồng điện tử), đội ngũ thẩm định của BKS System sẽ xử lý hồ sơ của bạn trong vòng 12 đến 24 giờ làm việc. Bạn sẽ nhận được thông báo kích hoạt tài khoản qua Email ngay khi hồ sơ được phê duyệt."
    },
    {
      question: "Tôi cần chuẩn bị những tài liệu pháp lý gì trước khi đăng ký?",
      answer: "Đối với doanh nghiệp/hộ kinh doanh (Khách sạn, Nhà nghỉ), bạn cần chuẩn bị ảnh chụp rõ nét của Giấy phép đăng ký kinh doanh và CCCD của người đại diện pháp luật. Đối với cá nhân (Homestay, Căn hộ), bạn chỉ cần CCCD mặt trước/sau và Giấy tờ chứng minh quyền sở hữu hoặc ủy quyền khai thác hợp pháp."
    },
    {
      question: "Hợp đồng hợp tác có thời hạn bao lâu và tôi có thể chấm dứt không?",
      answer: "Hợp đồng nguyên tắc hợp tác kinh doanh điện tử của BKS System có thời hạn mặc định là 1 năm và tự động gia hạn. Bạn có thể yêu cầu tạm dừng hoặc chấm dứt hợp tác bất kỳ lúc nào bằng cách gửi thông báo qua hệ thống trước 15 ngày mà không mất phí phạt."
    },
    {
      question: "Làm thế nào để tôi nhận tiền thanh toán phòng từ BKS?",
      answer: "BKS System thực hiện đối soát tự động và chốt bảng kê công nợ định kỳ vào ngày 05 (đối với các đơn hoàn thành từ ngày 16 đến cuối tháng trước) và ngày 20 (đối với các đơn hoàn thành từ ngày 01 đến ngày 15 trong tháng). Đối tác nộp phí hoa hồng dịch vụ 5% cho BKS trong vòng 5 ngày kể từ ngày chốt đối soát."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Decorative background blur blobs */}
        <div className="absolute left-1/4 top-1/4 size-[400px] -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]"></div>
        <div className="absolute right-1/4 bottom-10 size-[300px] rounded-full bg-indigo-600/10 blur-[100px]"></div>

        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-400">
            <Smartphone className="size-3.5 animate-bounce" />
            Hợp Tác Kinh Doanh Lưu Trú Cùng BKS
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Gia tăng doanh thu phòng nghỉ <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Hiện đại hóa vận hành cùng BKS System
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-lg">
            Tham gia cộng đồng hơn 1,000+ đối tác khách sạn, homestay và căn hộ / căn hộ dịch vụ trên toàn quốc. Đăng ký trực tuyến, ký hợp đồng điện tử và bắt đầu đón khách chỉ trong 24 giờ.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to={ROUTERS.REGISTER}>
              <Button className="h-13 bg-blue-600 px-8 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Đăng ký đối tác ngay
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link to={ROUTERS.PARTNER_LOGIN}>
              <Button variant="outline" className="h-13 border-slate-800 bg-slate-900/60 px-8 font-bold text-slate-300 hover:bg-slate-800 hover:text-white">
                Đăng nhập cổng đối tác
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Verticals Section */}
      <section className="border-t border-slate-900 bg-slate-950/40 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">4 Phân Khúc Đối Tác Hợp Tác Chính</h2>
            <p className="mt-4 text-slate-400">BKS System tối ưu hóa biểu mẫu và quy trình quản trị chuyên sâu phù hợp với từng loại hình kinh doanh</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {partnerTypes.map((type, idx) => (
              <div 
                key={idx}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-white/[0.01] p-8 shadow-xl transition-all duration-300 hover:border-blue-500/20 hover:bg-white/[0.02]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-white/[0.03] shadow-inner">
                      {type.icon}
                    </div>
                    {type.badge && (
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                        {type.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{type.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{type.description}</p>
                </div>
                <div className="mt-6 border-t border-white/5 pt-6">
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {type.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-xs font-medium text-slate-300">
                        <CheckCircle className="size-3.5 text-blue-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t border-slate-900 py-20 bg-slate-900/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Lợi Ích Vượt Trội Từ BKS System</h2>
            <p className="mt-4 text-slate-400">Bộ công cụ công nghệ giúp đơn giản hóa quản trị pháp lý, dòng tiền và lấp đầy phòng trống</p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx}
                className="flex flex-col items-start rounded-2xl border border-white/5 bg-slate-950 p-6 shadow-sm hover:border-slate-800 transition-colors"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-white/[0.03] shadow-inner mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{benefit.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Process / Workflow */}
      <section className="border-t border-slate-900 py-20 bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Quy Trình 3 Bước Tham Gia Đơn Giản</h2>
            <p className="mt-4 text-slate-400">Từ đăng ký ban đầu đến khi đón khách và nhận dòng tiền</p>
          </div>

          <div className="relative space-y-12 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-blue-600 before:via-indigo-600 before:to-transparent sm:before:left-1/2 sm:before:-translate-x-1/2">
            
            {/* Step 1 */}
            <div className="relative flex flex-col gap-6 sm:flex-row sm:justify-between sm:even:flex-row-reverse">
              <div className="absolute left-4 top-2 flex size-8 -translate-x-1/2 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] sm:left-1/2">
                1
              </div>
              <div className="ml-10 rounded-2xl border border-white/5 bg-white/[0.01] p-6 shadow-md sm:ml-0 sm:w-[45%]">
                <h4 className="text-lg font-bold text-white">Khởi tạo & Xác thực tài khoản</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Điền các thông tin định danh cơ bản (Tên, SĐT, Email doanh nghiệp). Xác thực địa chỉ email qua mã OTP hoặc liên kết kích hoạt an toàn gửi tới hộp thư để bảo mật tài khoản.
                </p>
              </div>
              <div className="hidden sm:block sm:w-[45%]"></div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col gap-6 sm:flex-row sm:justify-between sm:even:flex-row-reverse">
              <div className="absolute left-4 top-2 flex size-8 -translate-x-1/2 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] sm:left-1/2">
                2
              </div>
              <div className="ml-10 rounded-2xl border border-white/5 bg-white/[0.01] p-6 shadow-md sm:ml-0 sm:w-[45%]">
                <h4 className="text-lg font-bold text-white">Bổ sung hồ sơ pháp lý & Ký E-Contract</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Lựa chọn 1 trong 4 loại hình đối tác. Tải lên Giấy đăng ký kinh doanh/CCCD và thông tin ngân hàng đối soát. Hệ thống sẽ kết xuất file **Hợp đồng điện tử (E-Contract)** để bạn đọc và ký online nhanh chóng.
                </p>
              </div>
              <div className="hidden sm:block sm:w-[45%]"></div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col gap-6 sm:flex-row sm:justify-between sm:even:flex-row-reverse">
              <div className="absolute left-4 top-2 flex size-8 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] sm:left-1/2">
                3
              </div>
              <div className="ml-10 rounded-2xl border border-white/5 bg-white/[0.01] p-6 shadow-md sm:ml-0 sm:w-[45%]">
                <h4 className="text-lg font-bold text-white">Phê duyệt & Kích hoạt bán phòng</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Đội ngũ Quản trị viên (Admin) phê duyệt hồ sơ trong 24 giờ. Tài khoản của bạn được chuyển sang trạng thái **ACTIVE**. Bạn nhận hướng dẫn truy cập Extranet để cài đặt buồng phòng, cập nhật hình ảnh và đón lượt khách đầu tiên!
                </p>
              </div>
              <div className="hidden sm:block sm:w-[45%]"></div>
            </div>

          </div>
        </div>
      </section>

      {/* Security and Required Documents Notice */}
      <section className="border-t border-slate-900 py-16 bg-slate-900/20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-950/20 via-indigo-950/20 to-slate-950 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <Lock className="size-6" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Lưu ý chuẩn bị tài liệu trước khi đăng ký</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Để quá trình đăng ký không bị gián đoạn, chúng tôi khuyến nghị bạn chuẩn bị sẵn các tài liệu bản mềm sau:
                </p>
                <ul className="grid grid-cols-1 gap-2 text-xs font-semibold text-slate-300 sm:grid-cols-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-3.5 text-blue-500 shrink-0" />
                    Bản chụp rõ nét GPKD (Doanh nghiệp)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-3.5 text-blue-500 shrink-0" />
                    Bản chụp CCCD đại diện pháp luật
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-3.5 text-blue-500 shrink-0" />
                    Ảnh thẻ ngân hàng / Sao kê tài khoản
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-3.5 text-blue-500 shrink-0" />
                    Giấy sở hữu hoặc ủy quyền (Homestay)
                  </li>
                </ul>
                <div className="border-t border-white/5 pt-4">
                  <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                    * BKS cam kết bảo mật 100% tài liệu cá nhân của đối tác bằng công nghệ mã hóa lưu trữ tiên tiến nhất, chỉ sử dụng cho mục đích thẩm định pháp lý và kết nối ngân hàng đối soát dòng tiền.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-slate-900 py-20 bg-slate-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Giải Đáp Câu Hỏi Thường Gặp</h2>
            <p className="mt-3 text-slate-400">Những thắc mắc phổ biến của đối tác mới gia nhập hệ thống</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] transition-colors hover:border-slate-800"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left font-bold text-white hover:text-blue-400 focus:outline-none"
                >
                  <span className="text-sm sm:text-base">{faq.question}</span>
                  <ChevronDown className={`size-4 text-slate-500 transition-transform duration-300 ${openFaqIndex === idx ? "rotate-180 text-blue-400" : ""}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="border-t border-white/5 bg-slate-900/10 px-6 py-5">
                    <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final Call to action */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-bold text-white">Bạn đã sẵn sàng đồng hành cùng chúng tôi?</h3>
            <p className="mt-2 text-sm text-slate-400">Tham gia ngay hôm nay để đón đầu xu hướng chuyển đổi số du lịch lưu trú</p>
            <div className="mt-6">
              <Link to={ROUTERS.REGISTER}>
                <Button className="h-13 bg-blue-600 px-10 font-bold text-white hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Đăng ký tài khoản đối tác ngay
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

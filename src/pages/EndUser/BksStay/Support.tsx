import { useState } from "react";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  ChevronDown, 
  ChevronRight,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Wifi,
  Key,
  ShieldCheck,
  Zap,
  Clock,
  Car,
  Dog
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toastSuccess } from "@/components/ui/toast";

const Support = () => {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (id: string) => {
    setOpenFaq(prev => prev === id ? null : id);
  };

  const faqs = [
    {
      id: "faq-1",
      question: "Làm thế nào để lấy mã cửa phòng?",
      answer: "Mã cửa phòng của bạn sẽ xuất hiện trên trang 'Chi tiết đơn hàng' ngay sau khi bạn check-in trực tuyến hoặc đến giờ nhận phòng. Bạn có thể tìm thấy nó trong mục 'Truy cập phòng'.",
      icon: <Key className="size-4 text-sky-500" />
    },
    {
      id: "faq-2",
      question: "Tôi có thể đổi mật khẩu Wi-Fi không?",
      answer: "Hiện tại mật khẩu Wi-Fi được cố định theo từng phòng để đảm bảo bảo mật. Bạn có thể quét mã QR tại phòng hoặc xem mật khẩu trực tiếp trên Dashboard của BKS Stay Portal.",
      icon: <Wifi className="size-4 text-sky-500" />
    },
    {
      id: "faq-3",
      question: "Quy định về việc hủy phòng như thế nào?",
      answer: "Mỗi loại phòng sẽ có quy định hủy khác nhau. Thông thường, bạn được miễn phí hủy trước 48 giờ. Vui lòng kiểm tra mục 'Quy tắc hủy phòng' trong trang chi tiết đơn hàng của bạn.",
      icon: <HelpCircle className="size-4 text-sky-500" />
    },
    {
      id: "faq-4",
      question: "Tôi cần hỗ trợ kỹ thuật trong phòng thì gọi ai?",
      answer: "Bạn có thể nhấn nút 'Gửi yêu cầu dọn dẹp/sửa chữa' ngay trên Dashboard hoặc gọi trực tiếp cho số Hotline lễ tân hiển thị trong mục 'Hỗ trợ khẩn cấp'.",
      icon: <BookOpen className="size-4 text-sky-500" />
    },
    {
      id: "faq-5",
      question: "Chỗ đậu xe của khách ở đâu?",
      answer: "Hầu hết các địa điểm của BKS đều có bãi đỗ xe nội khu. Vui lòng xem mục 'Chỉ đường & Đỗ xe' trong trang chi tiết đơn hàng để thấy vị trí chính xác và hướng dẫn vào bãi.",
      icon: <Car className="size-4 text-sky-500" />
    },
    {
      id: "faq-6",
      question: "Có được mang thú cưng không?",
      answer: "Tùy thuộc vào chính sách của từng tòa nhà. Bạn nên liên kết bộ lọc 'Cho phép thú cưng' khi đặt phòng hoặc liên hệ lễ tân để xác nhận trước khi đến.",
      icon: <Dog className="size-4 text-sky-500" />
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
           <h1 className="text-3xl font-black tracking-tight text-slate-900">Trung tâm Hỗ trợ</h1>
           <p className="mt-1 text-sm text-slate-500">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7 trong suốt kỳ nghỉ.</p>
        </div>
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
           <Input 
            placeholder="Tìm câu trả lời nhanh..." 
            className="h-12 rounded-2xl border-slate-100 bg-white pl-10 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* FAQs Section */}
        <div className="space-y-6 lg:col-span-2">
           <Card className="overflow-hidden rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50">
              <CardContent className="p-8">
                 <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">Câu hỏi thường gặp</h3>
                 <div className="w-full space-y-4">
                    {filteredFaqs.length > 0 ? (
                      filteredFaqs.map((faq) => (
                        <div key={faq.id} className="overflow-hidden rounded-2xl border border-slate-100 transition-all hover:border-sky-200">
                            <button 
                              onClick={() => toggleFaq(faq.id)}
                              className={`flex w-full items-center justify-between px-6 py-4 text-left transition-colors ${openFaq === faq.id ? 'bg-sky-50' : 'bg-white'}`}
                            >
                              <div className="flex items-center gap-3">
                                  <div className="rounded-lg bg-sky-100/50 p-1.5">{faq.icon}</div>
                                  <span className="text-sm font-bold text-slate-700">{faq.question}</span>
                              </div>
                              {openFaq === faq.id ? <ChevronDown className="size-4 text-sky-500" /> : <ChevronRight className="size-4 text-slate-300" />}
                            </button>
                            {openFaq === faq.id && (
                              <div className="border-t border-sky-100/50 bg-sky-50/30 px-14 py-4 text-sm leading-relaxed text-slate-500 duration-200 animate-in fade-in slide-in-from-top-2">
                                  {faq.answer}
                              </div>
                            )}
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center font-medium text-slate-400">
                         Không tìm thấy câu hỏi phù hợp. Vui lòng thử từ khóa khác.
                      </div>
                    )}
                 </div>
              </CardContent>
           </Card>

           {/* Feedback/Contact Form Placeholder */}
           <Card className="group relative overflow-hidden rounded-[32px] border-none bg-sky-50 p-8 shadow-xl shadow-slate-200/50">
              <div className="absolute right-0 top-0 p-8 opacity-5 transition-transform group-hover:scale-110">
                 <Zap className="size-32" />
              </div>
              <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row">
                 <div className="rounded-3xl bg-white p-4 text-sky-600 shadow-sm">
                    <MessageCircle className="size-10" />
                 </div>
                 <div className="text-center md:text-left">
                    <h3 className="text-lg font-black text-sky-900">Không tìm thấy câu trả lời?</h3>
                    <p className="text-sm text-sky-700/70">Gửi tin nhắn trực tiếp cho trợ lý ảo của chúng tôi để được giải đáp tức thì.</p>
                 </div>
                 <Button onClick={() => toastSuccess("AI Assistant đang kết nối...")} className="h-12 rounded-2xl bg-sky-600 px-8 font-bold shadow-lg shadow-sky-600/20 hover:bg-sky-500 md:ml-auto">Chat với AI</Button>
              </div>
           </Card>
        </div>

        {/* Contact Info Sidebar & Quick Facts */}
        <div className="space-y-6">
           <h3 className="px-2 text-xl font-black text-slate-900">Kênh liên hệ</h3>
           <div className="space-y-4">
              <Card className="rounded-[28px] border border-none border-slate-50 bg-white shadow-md transition-all hover:border-sky-200">
                 <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-4">
                       <div className="rounded-2xl bg-rose-50 p-3 text-rose-600"><Phone className="size-6" /></div>
                       <div>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Hotline 24/7</p>
                          <p className="text-lg font-black text-slate-900">0912 345 678</p>
                       </div>
                    </div>
                    <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold" onClick={() => window.location.href = "tel:0912345678"}>Gọi ngay</Button>
                 </CardContent>
              </Card>

              <Card className="rounded-[28px] border border-none border-slate-50 bg-white shadow-md transition-all hover:border-sky-200">
                 <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-4">
                       <div className="rounded-2xl bg-sky-50 p-3 text-sky-600"><Mail className="size-6" /></div>
                       <div>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Email hỗ trợ</p>
                          <p className="text-lg font-black text-slate-900">stay@bks.vn</p>
                       </div>
                    </div>
                    <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold" onClick={() => window.location.href = "mailto:stay@bks.vn"}>Gửi thư</Button>
                 </CardContent>
              </Card>

              <div className="rounded-[32px] bg-slate-900 p-6 text-white">
                 <h4 className="mb-4 flex items-center gap-2 font-bold">
                    <ShieldCheck className="size-5 text-sky-400" /> Cam kết dịch vụ
                 </h4>
                 <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                       <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10"><Clock className="size-3 text-sky-400" /></div>
                       <p className="text-xs font-medium leading-relaxed text-slate-400">Hỗ trợ khẩn cấp 24/7 trong suốt kỳ nghỉ của bạn.</p>
                    </li>
                    <li className="flex items-start gap-3">
                       <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10"><MapPin className="size-3 text-sky-400" /></div>
                       <p className="text-xs font-medium leading-relaxed text-slate-400">Văn phòng đại diện có mặt tại 12 tỉnh thành lớn.</p>
                    </li>
                 </ul>
              </div>

              <Card className="relative overflow-hidden rounded-[28px] border-none bg-white p-6 shadow-md">
                 <div className="absolute right-0 top-0 p-4 opacity-5">
                    <MapPin className="size-20" />
                 </div>
                 <h4 className="mb-2 flex items-center gap-1.5 font-bold text-slate-900">Văn phòng Đà Nẵng <ExternalLink className="size-3 text-sky-400" /></h4>
                 <p className="text-[11px] font-medium leading-relaxed text-slate-400">
                    Số 123, Võ Nguyên Giáp, Quận Ngũ Hành Sơn, Đà Nẵng, Việt Nam.
                 </p>
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Support;

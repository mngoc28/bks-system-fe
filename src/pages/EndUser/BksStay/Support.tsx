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
import { toast } from "sonner";

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
      icon: <Key className="h-4 w-4 text-sky-500" />
    },
    {
      id: "faq-2",
      question: "Tôi có thể đổi mật khẩu Wi-Fi không?",
      answer: "Hiện tại mật khẩu Wi-Fi được cố định theo từng phòng để đảm bảo bảo mật. Bạn có thể quét mã QR tại phòng hoặc xem mật khẩu trực tiếp trên Dashboard của BKS Stay Portal.",
      icon: <Wifi className="h-4 w-4 text-sky-500" />
    },
    {
      id: "faq-3",
      question: "Quy định về việc hủy phòng như thế nào?",
      answer: "Mỗi loại phòng sẽ có quy định hủy khác nhau. Thông thường, bạn được miễn phí hủy trước 48 giờ. Vui lòng kiểm tra mục 'Quy tắc hủy phòng' trong trang chi tiết đơn hàng của bạn.",
      icon: <HelpCircle className="h-4 w-4 text-sky-500" />
    },
    {
      id: "faq-4",
      question: "Tôi cần hỗ trợ kỹ thuật trong phòng thì gọi ai?",
      answer: "Bạn có thể nhấn nút 'Gửi yêu cầu dọn dẹp/sửa chữa' ngay trên Dashboard hoặc gọi trực tiếp cho số Hotline lễ tân hiển thị trong mục 'Hỗ trợ khẩn cấp'.",
      icon: <BookOpen className="h-4 w-4 text-sky-500" />
    },
    {
      id: "faq-5",
      question: "Chỗ đậu xe của khách ở đâu?",
      answer: "Hầu hết các địa điểm của BKS đều có bãi đỗ xe nội khu. Vui lòng xem mục 'Chỉ đường & Đỗ xe' trong trang chi tiết đơn hàng để thấy vị trí chính xác và hướng dẫn vào bãi.",
      icon: <Car className="h-4 w-4 text-sky-500" />
    },
    {
      id: "faq-6",
      question: "Có được mang thú cưng không?",
      answer: "Tùy thuộc vào chính sách của từng tòa nhà. Bạn nên liên kết bộ lọc 'Cho phép thú cưng' khi đặt phòng hoặc liên hệ lễ tân để xác nhận trước khi đến.",
      icon: <Dog className="h-4 w-4 text-sky-500" />
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trung tâm Hỗ trợ</h1>
           <p className="text-slate-500 text-sm mt-1">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7 trong suốt kỳ nghỉ.</p>
        </div>
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <Input 
            placeholder="Tìm câu trả lời nhanh..." 
            className="pl-10 h-12 rounded-2xl border-slate-100 bg-white shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQs Section */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-white overflow-hidden">
              <CardContent className="p-8">
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2">Câu hỏi thường gặp</h3>
                 <div className="w-full space-y-4">
                    {filteredFaqs.length > 0 ? (
                      filteredFaqs.map((faq) => (
                        <div key={faq.id} className="border border-slate-100 rounded-2xl transition-all hover:border-sky-200 overflow-hidden">
                            <button 
                              onClick={() => toggleFaq(faq.id)}
                              className={`w-full px-6 py-4 flex items-center justify-between text-left transition-colors ${openFaq === faq.id ? 'bg-sky-50' : 'bg-white'}`}
                            >
                              <div className="flex items-center gap-3">
                                  <div className="p-1.5 bg-sky-100/50 rounded-lg">{faq.icon}</div>
                                  <span className="font-bold text-slate-700 text-sm">{faq.question}</span>
                              </div>
                              {openFaq === faq.id ? <ChevronDown className="h-4 w-4 text-sky-500" /> : <ChevronRight className="h-4 w-4 text-slate-300" />}
                            </button>
                            {openFaq === faq.id && (
                              <div className="px-14 py-4 bg-sky-50/30 text-slate-500 text-sm leading-relaxed border-t border-sky-100/50 animate-in fade-in slide-in-from-top-2 duration-200">
                                  {faq.answer}
                              </div>
                            )}
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center text-slate-400 font-medium">
                         Không tìm thấy câu hỏi phù hợp. Vui lòng thử từ khóa khác.
                      </div>
                    )}
                 </div>
              </CardContent>
           </Card>

           {/* Feedback/Contact Form Placeholder */}
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] bg-sky-50 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                 <Zap className="h-32 w-32" />
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                 <div className="p-4 bg-white rounded-3xl shadow-sm text-sky-600">
                    <MessageCircle className="h-10 w-10" />
                 </div>
                 <div className="text-center md:text-left">
                    <h3 className="text-lg font-black text-sky-900">Không tìm thấy câu trả lời?</h3>
                    <p className="text-sky-700/70 text-sm">Gửi tin nhắn trực tiếp cho trợ lý ảo của chúng tôi để được giải đáp tức thì.</p>
                 </div>
                 <Button onClick={() => toast.success("AI Assistant đang kết nối...")} className="md:ml-auto rounded-2xl h-12 bg-sky-600 hover:bg-sky-500 font-bold px-8 shadow-lg shadow-sky-600/20">Chat với AI</Button>
              </div>
           </Card>
        </div>

        {/* Contact Info Sidebar & Quick Facts */}
        <div className="space-y-6">
           <h3 className="text-xl font-black text-slate-900 px-2">Kênh liên hệ</h3>
           <div className="space-y-4">
              <Card className="border-none shadow-md rounded-[28px] bg-white hover:border-sky-200 border border-slate-50 transition-all">
                 <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><Phone className="h-6 w-6" /></div>
                       <div>
                          <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Hotline 24/7</p>
                          <p className="text-lg font-black text-slate-900">0912 345 678</p>
                       </div>
                    </div>
                    <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold" onClick={() => window.location.href = "tel:0912345678"}>Gọi ngay</Button>
                 </CardContent>
              </Card>

              <Card className="border-none shadow-md rounded-[28px] bg-white hover:border-sky-200 border border-slate-50 transition-all">
                 <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl"><Mail className="h-6 w-6" /></div>
                       <div>
                          <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Email hỗ trợ</p>
                          <p className="text-lg font-black text-slate-900">stay@bks.vn</p>
                       </div>
                    </div>
                    <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold" onClick={() => window.location.href = "mailto:stay@bks.vn"}>Gửi thư</Button>
                 </CardContent>
              </Card>

              <div className="p-6 bg-slate-900 rounded-[32px] text-white">
                 <h4 className="font-bold flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-5 w-5 text-sky-400" /> Cam kết dịch vụ
                 </h4>
                 <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                       <div className="h-5 w-5 bg-white/10 rounded-full flex items-center justify-center shrink-0 mt-0.5"><Clock className="h-3 w-3 text-sky-400" /></div>
                       <p className="text-xs text-slate-400 leading-relaxed font-medium">Hỗ trợ khẩn cấp 24/7 trong suốt kỳ nghỉ của bạn.</p>
                    </li>
                    <li className="flex items-start gap-3">
                       <div className="h-5 w-5 bg-white/10 rounded-full flex items-center justify-center shrink-0 mt-0.5"><MapPin className="h-3 w-3 text-sky-400" /></div>
                       <p className="text-xs text-slate-400 leading-relaxed font-medium">Văn phòng đại diện có mặt tại 12 tỉnh thành lớn.</p>
                    </li>
                 </ul>
              </div>

              <Card className="border-none shadow-md rounded-[28px] bg-white p-6 overflow-hidden relative">
                 <div className="absolute right-0 top-0 p-4 opacity-5">
                    <MapPin className="h-20 w-20" />
                 </div>
                 <h4 className="font-bold mb-2 flex items-center gap-1.5 text-slate-900">Văn phòng Đà Nẵng <ExternalLink className="h-3 w-3 text-sky-400" /></h4>
                 <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ROUTERS } from "@/constant";

const Support = () => {
   const navigate = useNavigate();
   const [openFaq, setOpenFaq] = useState<string | null>(null);
   const [searchQuery, setSearchQuery] = useState("");

   const toggleFaq = (id: string) => {
      setOpenFaq(prev => prev === id ? null : id);
   };

   const faqs = [
      {
         id: "faq-1",
         question: "Làm thế nào để lấy mã cửa phòng?",
         answer: "Mã cửa phòng (mã khóa thông minh) sẽ tự động hiển thị tại mục 'Truy cập phòng' trên trang 'Chi tiết đặt phòng' ngay sau khi bạn hoàn thành thủ tục check-in trực tuyến (online check-in) thành công hoặc chính xác vào giờ nhận phòng tiêu chuẩn (từ 14:00 ngày nhận phòng).",
         icon: <Key className="size-4 text-sky-500" />
      },
      {
         id: "faq-2",
         question: "Tôi có thể đổi mật khẩu Wi-Fi không?",
         answer: "Hiện tại, mật khẩu Wi-Fi được cấu hình cố định theo từng phòng để đảm bảo tính kết nối ổn định và an toàn bảo mật. Bạn có thể quét nhanh mã QR dán trong phòng hoặc tra cứu Tên mạng & Mật khẩu Wi-Fi trực tiếp tại mục 'Hướng dẫn ở phòng' (Stay Guide) trên Dashboard của Cổng khách lưu trú.",
         icon: <Wifi className="size-4 text-sky-500" />
      },
      {
         id: "faq-3",
         question: "Quy định về việc hủy phòng như thế nào?",
         answer: "BKS Stay áp dụng chính sách hủy dựa trên thời lượng lưu trú và thời điểm tạo đơn hàng: 1) Đặt ngắn hạn (Dưới 30 đêm): Miễn phí hủy trước check-in từ 7 ngày trở lên (hoàn cọc 100%); phí hủy 50% từ 2 ngày đến dưới 7 ngày; phạt 100% (không hoàn tiền) dưới 48 giờ. 2) Đặt dài hạn (Từ 30 đêm trở lên): Miễn phí hủy trước check-in từ 30 ngày trở lên (hoàn cọc 100%); phí hủy 50% từ 7 ngày đến dưới 30 ngày; phạt 100% (không hoàn tiền) dưới 7 ngày. 3) Đặt sát giờ (Last-minute < 24h trước check-in): Không hoàn trả đối với Giá không hoàn tiền (non-refundable rate); hoàn tối đa 50% cọc nếu hủy trước check-in tối thiểu 4 tiếng đối với Giá có thể hoàn tiền (refundable rate).",
         icon: <HelpCircle className="size-4 text-sky-500" />
      },
      {
         id: "faq-4",
         question: "Tôi cần hỗ trợ kỹ thuật trong phòng thì gọi ai?",
         answer: "Nếu gặp sự cố kỹ thuật hoặc hư hỏng thiết bị (như hỏng khóa cửa, rò rỉ nước, mất điện...), bạn hãy gửi yêu cầu hỗ trợ khẩn cấp tại mục 'Hỗ trợ' (Support) trên menu trái để chủ phòng xử lý kịp thời. Bạn cũng có thể trao đổi trực tiếp với Chủ nhà thông qua tính năng 'Trò chuyện' (Chat) thời gian thực hoặc gọi Hotline khẩn cấp.",
         icon: <BookOpen className="size-4 text-sky-500" />
      },
      {
         id: "faq-5",
         question: "Chỗ đậu xe của khách ở đâu?",
         answer: "Hầu hết các căn hộ/tòa nhà của BKS Stay đều có khu vực đỗ xe máy và ô tô nội khu. Vui lòng truy cập mục 'Chỉ đường & Đỗ xe' trong trang chi tiết đơn hàng để xem sơ đồ vị trí chính xác và hướng dẫn lối vào bãi đỗ.",
         icon: <Car className="size-4 text-sky-500" />
      },
      {
         id: "faq-6",
         question: "Có được mang thú cưng không?",
         answer: "Quy định mang thú cưng phụ thuộc vào nội quy của từng căn hộ/phòng do chủ nhà (Partner) thiết lập. Bạn nên sử dụng bộ lọc 'Cho phép thú cưng' khi tìm kiếm phòng trên trang chủ hoặc nhắn tin trực tiếp để xác nhận với Chủ phòng trước khi đến nhận phòng.",
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
                        <p className="text-sm text-sky-700/70">Nhắn tin trực tiếp với chủ nhà để được hỗ trợ realtime trong suốt kỳ lưu trú.</p>
                     </div>
                     <Button onClick={() => navigate(ROUTERS.BKS_STAY_CHAT)} className="h-12 rounded-2xl bg-sky-600 px-8 font-bold shadow-lg shadow-sky-600/20 hover:bg-sky-500 md:ml-auto">Nhắn chủ nhà</Button>
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
                              <p className="text-lg font-black text-slate-900">0333 494 850</p>
                           </div>
                        </div>
                        <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold" onClick={() => { navigator.clipboard.writeText("0333494850"); toastSuccess("Đã sao chép số hotline 0333 494 850 vào bộ nhớ tạm!"); }}>Sao chép số</Button>
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
                        <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold" onClick={() => { navigator.clipboard.writeText("stay@bks.vn"); toastSuccess("Đã sao chép email stay@bks.vn vào bộ nhớ tạm!"); }}>Sao chép thư</Button>
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

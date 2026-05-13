import { useState } from "react";
import { 
  BookOpen, 
  ShieldCheck, 
  Lightbulb, 
  Map, 
  Search, 
  ChevronRight, 
  Waves, 
  AirVent,
  Tv,
  Thermometer,
  Lock,
  FlameKindling,
  Phone,
  Info
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const categories = [
  { id: "rules", label: "Nội quy phòng", icon: <BookOpen className="size-5" />, color: "bg-amber-50 text-amber-600" },
  { id: "appliances", label: "Cách dùng thiết bị", icon: <Lightbulb className="size-5" />, color: "bg-sky-50 text-sky-600" },
  { id: "safety", label: "An toàn & Bảo mật", icon: <ShieldCheck className="size-5" />, color: "bg-rose-50 text-rose-600" },
  { id: "local", label: "Tiện ích lân cận", icon: <Map className="size-5" />, color: "bg-emerald-50 text-emerald-600" },
];

const StayGuide = () => {
  const [activeCat, setActiveCat] = useState("rules");
  const [searchQuery, setSearchQuery] = useState("");

  const content = {
    rules: [
      { title: "Quy định thú nuôi", desc: "Không được mang thú nuôi vào phòng trong mọi trường hợp.", icon: <Lock className="size-4" /> },
      { title: "Hút thuốc", desc: "Nghiêm cấm hút thuốc trong phòng. Vui lòng sử dụng khu vực ban công.", icon: <FlameKindling className="size-4" /> },
      { title: "Giờ giấc yên tĩnh", desc: "Vui lòng giữ im lặng sau 11:00 PM để tôn trọng các cư dân khác.", icon: <Info className="size-4" /> },
    ],
    appliances: [
      { title: "Máy điều hòa", desc: "Nhiệt độ tối ưu là 24-26°C. Tự động ngắt khi mở cửa ban công.", icon: <AirVent className="size-4" /> },
      { title: "Tivi thông minh", desc: "Bấm nút Home trên điều khiển để truy cập Netflix và YouTube.", icon: <Tv className="size-4" /> },
      { title: "Bình nóng lạnh", desc: "Bật trước 15 phút. Nút gạt màu đỏ ở cửa phòng tắm.", icon: <Thermometer className="size-4" /> },
    ],
    safety: [
      { title: "Báo cháy", desc: "Hệ thống báo cháy tự động. Nếu có báo động, dùng lối thoát hiểm.", icon: <FlameKindling className="size-4" /> },
      { title: "Lối thoát hiểm", desc: "Nằm ở phía cuối hành lang bên trái sau thang máy.", icon: <ChevronRight className="size-4" /> },
      { title: "Bộ sơ cứu", desc: "Đặt tại ngăn kéo trên cùng của tủ TV.", icon: <Lock className="size-4" /> },
    ],
    local: [
      { title: "Cửa hàng tiện lợi", desc: "VinMart+ mở cửa 24/7 chỉ cách tòa nhà 50m.", icon: <Map className="size-4" /> },
      { title: "Phòng Gym", desc: "Tầng 3 tòa nhà. Mở cửa từ 6:00 AM - 10:00 PM.", icon: <Waves className="size-4" /> },
      { title: "Tiệm cà phê", desc: "Cà phê HighLands nằm ngay sảnh tầng trệt.", icon: <Coffee  className="size-4" /> },
    ]
  };

  return (
    <div className="space-y-8 pb-20 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Search Header */}
      <div className="relative flex h-64 flex-col items-center justify-center overflow-hidden rounded-[40px] bg-slate-900 p-8 text-center">
        <div className="absolute right-0 top-0 p-8 opacity-10">
          <BookOpen className="size-48 rotate-12 text-white" />
        </div>
        <h1 className="relative z-10 mb-2 text-3xl font-black italic text-white md:text-4xl">Digital Stay <span className="not-italic text-sky-400">Guide</span></h1>
        <p className="relative z-10 mb-8 text-sm font-medium text-slate-400">Tìm mọi thông tin cần thiết cho kỳ nghỉ của bạn tại BKS Stay.</p>
        
        <div className="relative z-10 w-full max-w-lg">
           <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
           <Input 
             placeholder="Bạn cần hỗ trợ gì? (Cách dùng điều hòa, Pass wifi...)" 
             className="h-14 rounded-2xl border-white/10 bg-white/10 pl-12 pr-4 text-white shadow-2xl transition-all placeholder:text-slate-500 focus:bg-white focus:text-slate-900"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
           {categories.map((cat) => (
             <button
               key={cat.id}
               onClick={() => setActiveCat(cat.id)}
               className={`
                 flex w-full items-center justify-between rounded-2xl p-4 transition-all duration-300
                 ${activeCat === cat.id 
                    ? "translate-x-1 bg-white font-bold text-slate-900 shadow-xl shadow-slate-200/50" 
                    : "text-slate-400 hover:bg-slate-100/50 hover:text-slate-600"}
               `}
             >
                <div className="flex items-center gap-3">
                   <div className={`size-10 rounded-xl ${cat.color} flex items-center justify-center`}>
                      {cat.icon}
                   </div>
                   <span className="text-sm">{cat.label}</span>
                </div>
                <ChevronRight className={`size-4 transition-transform ${activeCat === cat.id ? 'opacity-100' : 'opacity-0'}`} />
             </button>
           ))}

           <div className="group relative mt-8 overflow-hidden rounded-3xl bg-sky-900 p-6 text-white">
              <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform duration-500 group-hover:scale-125">
                <Phone className="size-10 text-white" />
              </div>
              <p className="mb-2 font-mono text-[10px] font-black uppercase tracking-widest text-sky-400">Trực tiếp</p>
              <h4 className="mb-4 text-sm font-bold">Bạn không tìm thấy thứ mình muốn?</h4>
              <Button className="h-10 w-full rounded-xl bg-white text-xs font-black text-sky-900 transition-all hover:bg-sky-50">Gọi lễ tân ngay</Button>
           </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
           <div className="grid gap-6">
              {(content as any)[activeCat].map((item: any, i: number) => (
                <Card key={i} className="group overflow-hidden rounded-3xl border-none bg-white shadow-sm transition-all hover:shadow-md">
                   <CardContent className="flex flex-col p-0 md:flex-row">
                      <div className="flex-1 p-8">
                         <div className="mb-4 flex items-center gap-3">
                            <Badge className="rounded-lg border-none bg-slate-900 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Mẹo vặt</Badge>
                            <span className="text-[10px] font-black uppercase tracking-widest text-sky-500">{activeCat}</span>
                         </div>
                         <h3 className="mb-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-sky-600">{item.title}</h3>
                         <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
                      </div>
                      <div className="flex w-full items-center justify-center border-t border-slate-100 bg-slate-50 md:w-48 md:border-l md:border-t-0">
                         <div className="rounded-2xl border border-slate-100 bg-white p-6 text-slate-400 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:text-sky-500">
                           {item.icon}
                         </div>
                      </div>
                   </CardContent>
                </Card>
              ))}
           </div>

           {/* FAQ Placeholder */}
           <div className="mt-12">
              <div className="mb-6 flex items-center justify-between px-2">
                 <h3 className="text-xl font-black italic text-slate-900">Câu hỏi <span className="not-italic text-sky-600">thường gặp</span></h3>
                 <button className="text-xs font-bold text-sky-600 hover:underline">Xem thêm</button>
              </div>
              <div className="space-y-3">
                 {[
                   "Tôi có thể checkout muộn không?",
                   "Giá tiền giặt là được tính như thế nào?",
                   "Làm sao để gọi taxi từ hầm đỗ xe?"
                 ].map((q, i) => (
                   <div key={i} className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 hover:border-sky-100">
                      <p className="text-sm font-bold text-slate-700">{q}</p>
                      <Plus className="size-4 text-slate-300 transition-colors group-hover:text-sky-600" />
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 3.33334V12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.33333 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Coffee = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5.33334H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.66666 12C2.66666 12.7364 3.26361 13.3333 3.99999 13.3333H10.6667C11.403 13.3333 12 12.7364 12 12V5.33334C12 4.59696 11.403 4 10.6667 4H3.99999C3.26361 4 2.66666 4.59696 2.66666 5.33334V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 1.33334V2.66667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.33334 1.33334V2.66667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.6667 1.33334V2.66667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default StayGuide;

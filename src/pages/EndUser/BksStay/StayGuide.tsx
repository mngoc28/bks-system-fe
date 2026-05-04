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
  { id: "rules", label: "Nội quy phòng", icon: <BookOpen className="h-5 w-5" />, color: "bg-amber-50 text-amber-600" },
  { id: "appliances", label: "Cách dùng thiết bị", icon: <Lightbulb className="h-5 w-5" />, color: "bg-sky-50 text-sky-600" },
  { id: "safety", label: "An toàn & Bảo mật", icon: <ShieldCheck className="h-5 w-5" />, color: "bg-rose-50 text-rose-600" },
  { id: "local", label: "Tiện ích lân cận", icon: <Map className="h-5 w-5" />, color: "bg-emerald-50 text-emerald-600" },
];

const StayGuide = () => {
  const [activeCat, setActiveCat] = useState("rules");
  const [searchQuery, setSearchQuery] = useState("");

  const content = {
    rules: [
      { title: "Quy định thú nuôi", desc: "Không được mang thú nuôi vào phòng trong mọi trường hợp.", icon: <Lock className="h-4 w-4" /> },
      { title: "Hút thuốc", desc: "Nghiêm cấm hút thuốc trong phòng. Vui lòng sử dụng khu vực ban công.", icon: <FlameKindling className="h-4 w-4" /> },
      { title: "Giờ giấc yên tĩnh", desc: "Vui lòng giữ im lặng sau 11:00 PM để tôn trọng các cư dân khác.", icon: <Info className="h-4 w-4" /> },
    ],
    appliances: [
      { title: "Máy điều hòa", desc: "Nhiệt độ tối ưu là 24-26°C. Tự động ngắt khi mở cửa ban công.", icon: <AirVent className="h-4 w-4" /> },
      { title: "Tivi thông minh", desc: "Bấm nút Home trên điều khiển để truy cập Netflix và YouTube.", icon: <Tv className="h-4 w-4" /> },
      { title: "Bình nóng lạnh", desc: "Bật trước 15 phút. Nút gạt màu đỏ ở cửa phòng tắm.", icon: <Thermometer className="h-4 w-4" /> },
    ],
    safety: [
      { title: "Báo cháy", desc: "Hệ thống báo cháy tự động. Nếu có báo động, dùng lối thoát hiểm.", icon: <FlameKindling className="h-4 w-4" /> },
      { title: "Lối thoát hiểm", desc: "Nằm ở phía cuối hành lang bên trái sau thang máy.", icon: <ChevronRight className="h-4 w-4" /> },
      { title: "Bộ sơ cứu", desc: "Đặt tại ngăn kéo trên cùng của tủ TV.", icon: <Lock className="h-4 w-4" /> },
    ],
    local: [
      { title: "Cửa hàng tiện lợi", desc: "VinMart+ mở cửa 24/7 chỉ cách tòa nhà 50m.", icon: <Map className="h-4 w-4" /> },
      { title: "Phòng Gym", desc: "Tầng 3 tòa nhà. Mở cửa từ 6:00 AM - 10:00 PM.", icon: <Waves className="h-4 w-4" /> },
      { title: "Tiệm cà phê", desc: "Cà phê HighLands nằm ngay sảnh tầng trệt.", icon: <Coffee  className="h-4 w-4" /> },
    ]
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Search Header */}
      <div className="relative h-64 rounded-[40px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-8 text-center">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BookOpen className="h-48 w-48 text-white rotate-12" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 relative z-10 italic">Digital Stay <span className="text-sky-400 not-italic">Guide</span></h1>
        <p className="text-slate-400 text-sm mb-8 relative z-10 font-medium">Tìm mọi thông tin cần thiết cho kỳ nghỉ của bạn tại BKS Stay.</p>
        
        <div className="relative w-full max-w-lg z-10">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
           <Input 
             placeholder="Bạn cần hỗ trợ gì? (Cách dùng điều hòa, Pass wifi...)" 
             className="h-14 pl-12 pr-4 rounded-2xl bg-white/10 border-white/10 text-white placeholder:text-slate-500 focus:bg-white focus:text-slate-900 transition-all shadow-2xl"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
           {categories.map((cat) => (
             <button
               key={cat.id}
               onClick={() => setActiveCat(cat.id)}
               className={`
                 w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300
                 ${activeCat === cat.id 
                    ? "bg-white shadow-xl shadow-slate-200/50 text-slate-900 font-bold translate-x-1" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"}
               `}
             >
                <div className="flex items-center gap-3">
                   <div className={`h-10 w-10 rounded-xl ${cat.color} flex items-center justify-center`}>
                      {cat.icon}
                   </div>
                   <span className="text-sm">{cat.label}</span>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${activeCat === cat.id ? 'opacity-100' : 'opacity-0'}`} />
             </button>
           ))}

           <div className="mt-8 p-6 rounded-3xl bg-sky-900 text-white relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                <Phone className="h-10 w-10 text-white" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-2 font-mono">Trực tiếp</p>
              <h4 className="text-sm font-bold mb-4">Bạn không tìm thấy thứ mình muốn?</h4>
              <Button className="w-full h-10 rounded-xl bg-white text-sky-900 font-black hover:bg-sky-50 transition-all text-xs">Gọi lễ tân ngay</Button>
           </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
           <div className="grid gap-6">
              {(content as any)[activeCat].map((item: any, i: number) => (
                <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all rounded-3xl bg-white overflow-hidden group">
                   <CardContent className="p-0 flex flex-col md:flex-row">
                      <div className="p-8 flex-1">
                         <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-slate-900 text-white border-none px-2 py-0.5 font-bold rounded-lg text-[9px] uppercase tracking-wider">Mẹo vặt</Badge>
                            <span className="text-sky-500 font-black text-[10px] uppercase tracking-widest">{activeCat}</span>
                         </div>
                         <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">{item.title}</h3>
                         <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                      <div className="w-full md:w-48 bg-slate-50 flex items-center justify-center border-t md:border-t-0 md:border-l border-slate-100">
                         <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 group-hover:text-sky-500 group-hover:scale-110 transition-all duration-300">
                           {item.icon}
                         </div>
                      </div>
                   </CardContent>
                </Card>
              ))}
           </div>

           {/* FAQ Placeholder */}
           <div className="mt-12">
              <div className="flex items-center justify-between mb-6 px-2">
                 <h3 className="text-xl font-black text-slate-900 italic">Câu hỏi <span className="text-sky-600 not-italic">thường gặp</span></h3>
                 <button className="text-xs font-bold text-sky-600 hover:underline">Xem thêm</button>
              </div>
              <div className="space-y-3">
                 {[
                   "Tôi có thể checkout muộn không?",
                   "Giá tiền giặt là được tính như thế nào?",
                   "Làm sao để gọi taxi từ hầm đỗ xe?"
                 ].map((q, i) => (
                   <div key={i} className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-sky-100">
                      <p className="text-sm font-bold text-slate-700">{q}</p>
                      <Plus className="h-4 w-4 text-slate-300 group-hover:text-sky-600 transition-colors" />
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

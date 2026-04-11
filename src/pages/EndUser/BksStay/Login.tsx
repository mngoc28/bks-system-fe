import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Key, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTERS } from "@/constant";
import { useLoginMutation } from "@/hooks/useAuthQuery";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";

const GuestLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: loginMutate } = useLoginMutation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setIsLoading(true);
    
    loginMutate({ email, password }, {
      onSuccess: (response: any) => {
        const { token, role, name, email } = response.data;
        useUserStore.getState().login(token, email, role, name);
        toast.success(`Chào mừng trở lại, ${name}!`);
        navigate(ROUTERS.BKS_STAY_DASHBOARD);
        setIsLoading(false);
      },
      onError: (error: any) => {
        console.error("Login failed", error);
        toast.error(error?.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 font-sans">
      {/* Cinematic Background */}
      <div className="absolute inset-0">
        <img 
          src="/images/bks_stay_login_bg.png" 
          alt="BKS Stay Luxury Background" 
          className="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60" />
      </div>

      {/* Floating Particles Animation Overlay */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[160px] animate-pulse delay-700" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-5xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Branding / Welcome */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
           <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/20">
                 <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="h-10 w-10 drop-shadow-md" />
              </div>
              <div>
                 <p className="text-sky-400 font-black text-xs uppercase tracking-[0.3em]">Welcome to</p>
                 <h1 className="text-3xl font-black text-white tracking-tight">BKS Stay <span className="text-sky-400">Portal</span></h1>
              </div>
           </div>

           <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1]">Quản lý hành trình <br/>nghỉ dưỡng của bạn.</h2>
              <p className="text-slate-400 text-lg max-w-md font-medium">
                 Đăng nhập để nhận mã cửa phòng, thông tin Wi-Fi và các dịch vụ đặc quyền dành riêng cho khách của BKS.
              </p>
           </div>

           <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-slate-300 text-sm font-bold">
                 <ShieldCheck className="h-5 w-5 text-emerald-400" /> Truy cập bảo mật
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-sm font-bold">
                 <ArrowRight className="h-5 w-5 text-sky-400" /> Hỗ trợ 24/7
              </div>
           </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="animate-in fade-in zoom-in-95 duration-700 delay-300">
           <Card className="border-white/10 shadow-2xl bg-white/5 backdrop-blur-2xl rounded-[48px] overflow-hidden">
              <CardContent className="p-10 md:p-12">
                 <div className="mb-10 text-center lg:text-left">
                    <h3 className="text-2xl font-black text-white mb-2 underline underline-offset-8 decoration-sky-500">Đăng nhập</h3>
                    <p className="text-slate-400 text-sm">Vui lòng nhập Email và mã đặt phòng (Booking ID) được cung cấp.</p>
                 </div>

                 <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest ml-1">Email thành viên</label>
                       <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                          <Input 
                            name="email"
                            type="email" 
                            placeholder="example@gmail.com" 
                            className="h-14 pl-12 rounded-2xl bg-white/10 border-white/10 text-white placeholder:text-slate-600 focus:bg-white/20 focus:border-sky-500/50 transition-all font-medium"
                            required
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest ml-1">Mật khẩu (Gửi kèm Email)</label>
                       <div className="relative group">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                          <Input 
                            name="password"
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            className="h-14 pl-12 pr-12 rounded-2xl bg-white/10 border-white/10 text-white placeholder:text-slate-600 focus:bg-white/20 focus:border-sky-500/50 transition-all font-medium"
                            required
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
                          >
                             {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pb-4">
                       <label className="flex items-center gap-2 cursor-pointer group">
                          <div className="h-5 w-5 rounded-lg border-2 border-white/10 flex items-center justify-center group-hover:border-sky-400 transition-colors">
                            <div className="h-2 w-2 rounded-full bg-sky-400 opacity-0 group-hover:opacity-100" />
                          </div>
                          <span className="text-xs text-slate-400 font-bold">Ghi nhớ tôi</span>
                       </label>
                       <Link to="#" className="text-xs font-bold text-sky-400 hover:text-sky-300">Quên mật khẩu?</Link>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-14 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-lg shadow-xl shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                       {isLoading ? (
                         <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       ) : (
                         "Truy cập ngay"
                       )}
                    </Button>
                 </form>

                 <div className="mt-10 pt-8 border-t border-white/10">
                    <p className="text-center text-slate-500 text-xs font-bold">
                       Bạn gặp vấn đề khi đăng nhập? <Link to={ROUTERS.BKS_STAY_SUPPORT} className="text-sky-400 hover:underline">Liên hệ hỗ trợ</Link>
                    </p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600 font-black text-[10px] uppercase tracking-[0.4em] opacity-40">
        POWERED BY BKS STAY ECOSYSTEM
      </div>

      <style>{`
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 25s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default GuestLogin;

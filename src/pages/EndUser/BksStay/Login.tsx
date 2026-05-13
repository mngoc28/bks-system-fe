import React, { useState } from "react"; // test edit
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { toastSuccess, toastError } from "@/components/ui/toast";

const GuestLogin = () => {
  const navigate = useNavigate(); const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: loginMutate } = useLoginMutation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      toastError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setIsLoading(true);
    
    loginMutate({ email, password }, {
      onSuccess: (response: any) => {
        const { token, role, name, email } = response.data;
        useUserStore.getState().login(token, email, role, name);
        toastSuccess(`Chào mừng trở lại, ${name}!`);
        const from = (location.state as any)?.from?.pathname || ROUTERS.BKS_STAY_DASHBOARD; navigate(from, { replace: true });
        setIsLoading(false);
      },
      onError: (error: any) => {
        console.error("Login failed", error);
        toastError(error?.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 font-sans">
      {/* Cinematic Background */}
      <div className="absolute inset-0">
        <img 
          src="/images/bks_stay_login_bg.png" 
          alt="BKS Stay Luxury Background" 
          className="animate-slow-zoom size-full scale-105 object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60" />
      </div>

      {/* Floating Particles Animation Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-30">
        <div className="absolute left-1/4 top-1/4 size-96 animate-pulse rounded-full bg-sky-500 blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 size-96 animate-pulse rounded-full bg-indigo-500 blur-[160px] delay-700" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
        
        {/* Left Side: Branding / Welcome */}
        <div className="space-y-8 duration-700 animate-in fade-in slide-in-from-left-8">
           <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-2xl shadow-white/20">
                 <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="size-10 drop-shadow-md" />
              </div>
              <div>
                 <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-400">Welcome to</p>
                 <h1 className="text-3xl font-black tracking-tight text-white">BKS Stay <span className="text-sky-400">Portal</span></h1>
              </div>
           </div>

           <div className="space-y-4">
              <h2 className="text-4xl font-black leading-[1.1] text-white md:text-5xl">Quản lý hành trình <br/>nghỉ dưỡng của bạn.</h2>
              <p className="max-w-md text-lg font-medium text-slate-400">
                 Đăng nhập để nhận mã cửa phòng, thông tin Wi-Fi và các dịch vụ đặc quyền dành riêng cho khách của BKS.
              </p>
           </div>

           <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                 <ShieldCheck className="size-5 text-emerald-400" /> Truy cập bảo mật
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                 <ArrowRight className="size-5 text-sky-400" /> Hỗ trợ 24/7
              </div>
           </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="delay-300 duration-700 animate-in fade-in zoom-in-95">
           <Card className="overflow-hidden rounded-[48px] border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
              <CardContent className="p-10 md:p-12">
                 <div className="mb-10 text-center lg:text-left">
                    <h3 className="mb-2 text-2xl font-black text-white underline decoration-sky-500 underline-offset-8">Đăng nhập</h3>
                    <p className="text-sm text-slate-400">Vui lòng nhập Email và mã đặt phòng (Booking ID) được cung cấp.</p>
                 </div>

                 <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                       <label htmlFor="email" className="ml-1 text-[10px] font-black uppercase tracking-widest text-sky-400">Email thành viên</label>
                       <div className="group relative">
                          <Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-sky-400" />
                          <Input 
                            id="email"
                             name="email"
                            type="email" 
                            placeholder="example@gmail.com" 
                            className="h-14 rounded-2xl border-white/10 bg-white/10 pl-12 font-medium text-white transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:bg-white/20"
                            required
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label htmlFor="password" className="ml-1 text-[10px] font-black uppercase tracking-widest text-sky-400">Mật khẩu (Gửi kèm Email)</label>
                       <div className="group relative">
                          <Key className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-sky-400" />
                          <Input 
                            id="password"
                             name="password"
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            className="h-14 rounded-2xl border-white/10 bg-white/10 px-12 font-medium text-white transition-all placeholder:text-slate-600 focus:border-sky-500/50 focus:bg-white/20"
                            required
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
                          >
                             {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                          </button>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pb-4">
                       <div className="group flex cursor-pointer items-center gap-2">
                          <div className="flex size-5 items-center justify-center rounded-lg border-2 border-white/10 transition-colors group-hover:border-sky-400">
                            <div className="size-2 rounded-full bg-sky-400 opacity-0 group-hover:opacity-100" />
                          </div>
                          <span className="text-xs font-bold text-slate-400">Ghi nhớ tôi</span>
                       </div>
                       <Link to="/" className="text-xs font-bold text-sky-400 hover:text-sky-300">Quên mật khẩu?</Link>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="h-14 w-full rounded-2xl bg-sky-600 text-lg font-black text-white shadow-xl shadow-sky-600/30 transition-all hover:scale-[1.02] hover:bg-sky-500 active:scale-[0.98]"
                    >
                       {isLoading ? (
                         <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                       ) : (
                         "Truy cập ngay"
                       )}
                    </Button>
                 </form>

                 <div className="mt-10 border-t border-white/10 pt-8">
                    <p className="text-center text-xs font-bold text-slate-500">
                       Bạn gặp vấn đề khi đăng nhập? <Link to={ROUTERS.BKS_STAY_SUPPORT} className="text-sky-400 hover:underline">Liên hệ hỗ trợ</Link>
                    </p>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 opacity-40">
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


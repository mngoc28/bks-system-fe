import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Lock, 
  Check, 
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Fingerprint
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTERS } from "@/constant";

const ForceChangePassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate password update
    setTimeout(() => {
      setSuccess(true);
      setIsLoading(false);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate(ROUTERS.BKS_STAY_DASHBOARD);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="w-full max-w-xl duration-700 animate-in fade-in zoom-in-95">
         
         <div className="mb-10 space-y-4 text-center">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-[32px] bg-sky-100 text-sky-600 shadow-xl shadow-sky-600/10">
               <ShieldCheck className="size-10 animate-pulse" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Thiết lập mật khẩu mới</h1>
            <p className="font-medium text-slate-500">Để đảm bảo an toàn, vui lòng thay đổi mật khẩu tạm thời được cung cấp lần đầu.</p>
         </div>

         <Card className="relative overflow-hidden rounded-[40px] border-none bg-white shadow-2xl shadow-slate-200/60">
            {success && (
               <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-4 bg-white p-8 text-center">
                  <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                     <Check className="size-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Cập nhật thành công!</h3>
                  <p className="font-medium text-slate-500">Mật khẩu của bạn đã được bảo mật. Đang đưa bạn đến Dashboard...</p>
               </div>
            )}

            <CardContent className="p-10 md:p-12">
               <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Security Notification */}
                  <div className="flex gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                     <AlertCircle className="size-6 shrink-0 text-amber-500" />
                     <p className="text-[13px] font-medium leading-relaxed text-amber-800">
                        Mật khẩu phải bao gồm ít nhất 8 ký tự, bao gồm chữ cái, chữ số và một ký tự đặc biệt (!@#$).
                     </p>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                       <label htmlFor="new-password" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Mật khẩu mới</label>
                       <div className="relative">
                          <Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-300" />
                          <Input 
                            id="new-password"
                            type="password" 
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50 pl-12 font-bold transition-all focus:border-sky-500 focus:bg-white"
                            placeholder="Nhập mật khẩu mới"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label htmlFor="confirm-password" className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Xác nhận mật khẩu</label>
                       <div className="relative">
                          <Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-300" />
                          <Input 
                            id="confirm-password"
                            type="password" 
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50 pl-12 font-bold transition-all focus:border-sky-500 focus:bg-white"
                            placeholder="Nhập lại mật khẩu mới"
                          />
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                        <Fingerprint className="size-4 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-500">Mã hóa 256-bit</span>
                     </div>
                     <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                        <ShieldAlert className="size-4 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-500">Bảo mật đa lớp</span>
                     </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-lg font-black text-white shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.01] hover:bg-slate-800"
                  >
                     {isLoading ? (
                        <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                     ) : (
                        <>
                           Xác nhận thay đổi <ArrowRight className="size-5" />
                        </>
                     )}
                  </Button>
               </form>

               <div className="mt-8 text-center">
                  <button type="button" className="text-xs font-bold text-slate-400 transition-colors hover:text-slate-600">
                     Bỏ qua (Tôi sẽ cập nhật sau)
                  </button>
               </div>
            </CardContent>
         </Card>

         <p className="mt-12 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
            Safety First Policy • BKS Ecosystem
         </p>
      </div>
    </div>
  );
};

export default ForceChangePassword;

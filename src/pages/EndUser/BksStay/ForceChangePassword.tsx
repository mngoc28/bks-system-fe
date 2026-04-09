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
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl animate-in fade-in zoom-in-95 duration-700">
         
         <div className="text-center mb-10 space-y-4">
            <div className="mx-auto w-20 h-20 bg-sky-100 rounded-[32px] flex items-center justify-center text-sky-600 shadow-xl shadow-sky-600/10 mb-6">
               <ShieldCheck className="h-10 w-10 animate-pulse" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Thiết lập mật khẩu mới</h1>
            <p className="text-slate-500 font-medium">Để đảm bảo an toàn, vui lòng thay đổi mật khẩu tạm thời được cung cấp lần đầu.</p>
         </div>

         <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[40px] bg-white overflow-hidden relative">
            {success && (
               <div className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                     <Check className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Cập nhật thành công!</h3>
                  <p className="text-slate-500 font-medium">Mật khẩu của bạn đã được bảo mật. Đang đưa bạn đến Dashboard...</p>
               </div>
            )}

            <CardContent className="p-10 md:p-12">
               <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Security Notification */}
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
                     <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
                     <p className="text-[13px] text-amber-800 font-medium leading-relaxed">
                        Mật khẩu phải bao gồm ít nhất 8 ký tự, bao gồm chữ cái, chữ số và một ký tự đặc biệt (!@#$).
                     </p>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                       <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                          <Input 
                            type="password" 
                            className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:border-sky-500 transition-all font-bold"
                            placeholder="Nhập mật khẩu mới"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
                       <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                          <Input 
                            type="password" 
                            className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:border-sky-500 transition-all font-bold"
                            placeholder="Nhập lại mật khẩu mới"
                          />
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                        <Fingerprint className="h-4 w-4 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-500">Mã hóa 256-bit</span>
                     </div>
                     <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                        <ShieldAlert className="h-4 w-4 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-500">Bảo mật đa lớp</span>
                     </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                     {isLoading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                        <>
                           Xác nhận thay đổi <ArrowRight className="h-5 w-5" />
                        </>
                     )}
                  </Button>
               </form>

               <div className="mt-8 text-center">
                  <button type="button" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                     Bỏ qua (Tôi sẽ cập nhật sau)
                  </button>
               </div>
            </CardContent>
         </Card>

         <p className="mt-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            Safety First Policy • BKS Ecosystem
         </p>
      </div>
    </div>
  );
};

export default ForceChangePassword;

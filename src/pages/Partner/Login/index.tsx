import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { useLoginMutation } from "@/hooks/useAuthQuery";
import { loginFormSchema } from "@/shared/shema";
import { useUserStore } from "@/store/useUserStore";
import { setAccessToken, setUserEmail } from "@/utils/storage";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ROUTERS } from "@/constant";

/**
 * Modern Partner Login Screen
 * Featuring Rich Aesthetics, Glassmorphism, and BKS Brand Identity
 */
export default function PartnerLogin() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, status } = useLoginMutation();

  const form = useForm({
    resolver: zodResolver(loginFormSchema(t)),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: { email: string; password: string }) => {
    mutate(
      { email: values.email, password: values.password },
      {
        onSuccess: (res: any) => {
          if (res.status === "success" && res.data) {
            const userData = res.data.user;
            const token = res.data.token || (typeof res.data === "string" ? res.data : "");
            
            // Validate role
            if (userData && userData.role !== 'partner' && userData.role !== 'admin') {
              toastError(t("login.invalid_role_partner") || "Tài khoản không có quyền truy cập cổng Đối tác.");
              return;
            }

            setAccessToken(token);
            setUserEmail(values.email);
            
            // Normalize role to lowercase and save
            const user_role = (userData?.role || 'partner').toLowerCase();
            useUserStore.getState().login(token, values.email, user_role);
            
            toastSuccess(t("login.success"));
            navigate("/partner/dashboard");
          } else {
            toastError(t("login.failed"));
          }
        },
        onError: (_err: any) => {
          toastError(t("login.invalid_credentials"));
        },
      },
    );
  };

  return (
    <>
      {status === 'pending' && <LoadingScreen text={t("common.processing")} />}
      
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f172a] p-4 lg:p-8">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Main Card with Glassmorphism */}
        <div className="relative z-10 flex w-full max-w-5xl flex-col items-stretch overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-xl lg:flex-row">
          
          {/* Left Panel - Branding & Visuals */}
          <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-10 lg:p-12 lg:flex">
            {/* Mesh Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.07]" 
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
            </div>
            
            <div className="relative z-10">
              <a href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner">
                    <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="h-8 w-8 object-contain" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight text-white uppercase italic">BKS System</span>
                </div>
              </a>
            </div>

            <div className="relative z-10">
              <h2 className="mb-6 text-2xl lg:text-3xl font-extrabold leading-tight text-white">
                {t("login.hero_title_partner")}
              </h2>
              <p className="max-w-md text-base lg:text-lg leading-relaxed text-blue-100/80 font-medium">
                {t("login.hero_desc_partner")}
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-blue-800 bg-blue-400/20 backdrop-blur-sm shadow-xl"></div>
                ))}
              </div>
              <p className="text-sm font-medium text-blue-100/60">{t("login.joined_partners")}</p>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="flex flex-1 flex-col justify-center p-8 sm:p-12 lg:p-16">
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-10 lg:hidden text-center">
                <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="mx-auto mb-4 h-16 w-16" />
                <h2 className="text-2xl font-bold text-white uppercase italic">BKS System</h2>
              </div>

              <div className="mb-10 text-center lg:text-left">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
                  <ShieldCheck className="h-3 w-3" />
                  {t("login.portal_partner")}
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">{t("login.title")}</h1>
                <p className="text-slate-400">{t("login.welcome_back")}</p>
              </div>

              <FormProvider {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-slate-300">{t("login.email")}</FormLabel>
                        <FormControl>
                          <div className="group relative">
                            <Input 
                              type="email" 
                              placeholder={t("login.email_placeholder")} 
                              className="h-12 border-slate-700 bg-slate-800/50 pl-4 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all group-hover:bg-slate-800/80 rounded-xl"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-rose-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-slate-300">{t("login.password")}</FormLabel>
                        <FormControl>
                          <div className="group relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder={t("login.password_placeholder")} 
                              className="h-12 border-slate-700 bg-slate-800/50 pl-4 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all group-hover:bg-slate-800/80 rounded-xl"
                              {...field} 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPassword(!showPassword)} 
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-white"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-rose-400" />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="remember" className="h-4 w-4 rounded border-slate-700 bg-slate-800 transition-colors focus:ring-blue-500/20" />
                      <label htmlFor="remember" className="text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-300">{t("login.remember_me")}</label>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="px-0 text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300 hover:bg-transparent"
                      onClick={() => navigate(ROUTERS.FORGOT_PASSWORD)}
                    >
                      {t("login.forgot_password")}
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="group relative flex w-full h-13 items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-6 py-4 font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98]"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {t("login.login_button")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>


                  <div className="mt-8 text-center">
                    <p className="text-sm text-slate-400">
                      {t("login.no_account")}
                      <button 
                        type="button" 
                        className="ml-2 font-bold text-blue-400 transition-colors hover:text-blue-300"
                        onClick={() => navigate(ROUTERS.REGISTER)}
                      >
                        {t("login.register_here")}
                      </button>
                    </p>
                  </div>
                </form>
              </FormProvider>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

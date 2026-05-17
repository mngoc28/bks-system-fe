import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { usePartnerLoginMutation } from "@/hooks/useAuthQuery";
import { loginFormSchema } from "@/shared/shema";
import { useUserStore } from "@/store/useUserStore";
import { setAccessToken, setUserEmail, getRememberedEmail, setRememberedEmail, removeRememberedEmail } from "@/utils/storage";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ROUTERS } from "@/constant";

/**
 * Modern Partner Login Screen
 * Featuring Rich Aesthetics, Glassmorphism, and BKS Brand Identity.
 * Implements "Remember Me" functionality to persist sessions and pre-fill user email.
 */
export default function PartnerLogin() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, status } = usePartnerLoginMutation();

  const savedEmail = getRememberedEmail();

  const form = useForm({
    resolver: zodResolver(loginFormSchema(t)),
    defaultValues: {
      email: savedEmail || "",
      password: "",
      rememberMe: !!savedEmail,
    },
  });

  const onSubmit = (values: { email: string; password: string; rememberMe?: boolean }) => {
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

            // Persist session based on rememberMe preference
            setAccessToken(token, values.rememberMe);
            setUserEmail(values.email);

            // Persist or remove email for pre-fill next time
            if (values.rememberMe) {
              setRememberedEmail(values.email);
            } else {
              removeRememberedEmail();
            }
            
            // Normalize role to lowercase and save
            const user_role = (userData?.role || 'partner').toLowerCase();
            useUserStore.getState().login(token, values.email, user_role, userData?.name || "");
            
            toastSuccess(t("login.success"));
            navigate("/partner/dashboard");
          } else {
            toastError(t("login.failed"));
          }
        },
        onError: (err: any) => {
          const errorMessage = err?.response?.data?.message || t("login.invalid_credentials");
          toastError(errorMessage);
        },
      },
    );
  };

  return (
    <>
      {status === 'pending' && <LoadingScreen text={t("common.processing")} />}
      
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f172a] p-4 lg:p-8">
        {/* Animated Background Gradients */}
        <div className="absolute left-[-10%] top-[-10%] size-2/5 animate-pulse rounded-full bg-blue-600/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] size-2/5 animate-pulse rounded-full bg-indigo-600/20 blur-[120px]" style={{ animationDelay: '2s' }}></div>
        
        {/* Main Card with Glassmorphism */}
        <div className="relative z-10 flex w-full max-w-5xl flex-col items-stretch overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-xl lg:flex-row">
          
          {/* Left Panel - Branding & Visuals */}
          <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-10 lg:flex lg:p-12">
            {/* Mesh Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.07]" 
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
            </div>
            
            <div className="relative z-10">
              <a href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 shadow-inner backdrop-blur-md">
                    <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="size-8 object-contain" />
                  </div>
                  <span className="text-2xl font-bold uppercase italic tracking-tight text-white">BKS System</span>
                </div>
              </a>
            </div>

            <div className="relative z-10">
              <h2 className="mb-6 text-2xl font-extrabold leading-tight text-white lg:text-3xl">
                {t("login.hero_title_partner")}
              </h2>
              <p className="max-w-md text-base font-medium leading-relaxed text-blue-100/80 lg:text-lg">
                {t("login.hero_desc_partner")}
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="size-10 rounded-full border-2 border-blue-800 bg-blue-400/20 shadow-xl backdrop-blur-sm"></div>
                ))}
              </div>
              <p className="text-sm font-medium text-blue-100/60">{t("login.joined_partners")}</p>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="flex flex-1 flex-col justify-center p-8 sm:p-12 lg:p-16">
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-10 text-center lg:hidden">
                <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="mx-auto mb-4 size-16" />
                <h2 className="text-2xl font-bold uppercase italic text-white">BKS System</h2>
              </div>

              <div className="mb-10 text-center lg:text-left">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
                  <ShieldCheck className="size-3" />
                  {t("login.portal_partner")}
                </div>
                <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">{t("login.title")}</h1>
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
                              className="h-12 rounded-xl border-slate-700 bg-slate-800/50 pl-4 text-white transition-all placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 group-hover:bg-slate-800/80"
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
                              className="h-12 rounded-xl border-slate-700 bg-slate-800/50 pl-4 text-white transition-all placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 group-hover:bg-slate-800/80"
                              {...field} 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPassword(!showPassword)} 
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-white"
                            >
                              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-rose-400" />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="size-4 rounded border-slate-700 bg-slate-800 transition-colors data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-300">
                            {t("login.remember_me")}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="px-0 text-xs font-semibold text-blue-400 transition-colors hover:bg-transparent hover:text-blue-300"
                      onClick={() => navigate(ROUTERS.FORGOT_PASSWORD)}
                    >
                      {t("login.forgot_password")}
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="h-13 group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-6 py-4 font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98]"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {t("login.login_button")}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
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

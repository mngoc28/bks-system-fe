import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { useLoginMutation } from "@/hooks/useAuthQuery";
import { loginFormSchema } from "@/shared/shema";
import { useUserStore } from "@/store/useUserStore";
import { setAccessToken, setUserEmail, getRememberedEmail, setRememberedEmail, removeRememberedEmail } from "@/utils/storage";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserCog, ArrowRight } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PERMISSIONS, ROUTERS } from "@/constant";

/**
 * Premium Manager Login Screen
 * Redesigned for visual excellence using BKS Brand Identity.
 * Implements "Remember Me" functionality to persist sessions and pre-fill user email.
 */
export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, status } = useLoginMutation();

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

            // Validate role: Partner accounts are not allowed to access the admin portal
            const user_role = (userData?.role || "").toLowerCase();
            if (user_role === PERMISSIONS.PARTNER) {
              toastError(t("login.invalid_role_partner") || "Tài khoản đối tác không có quyền truy cập cổng Quản trị.");
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
            
            // Pass the role to useUserStore
            const role = userData?.role || "admin";
            useUserStore.getState().login(token, values.email, role, userData?.name || "");
            
            toastSuccess(t("login.success"));
            navigate(ROUTERS.CONTROL);
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
      
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4 lg:p-8">
        {/* Dynamic Background Effects */}
        <div className="absolute left-[-20%] top-[-20%] size-3/5 animate-pulse rounded-full bg-indigo-900/10 blur-[160px]"></div>
        <div className="absolute bottom-[-20%] right-[-20%] size-3/5 animate-pulse rounded-full bg-blue-900/10 blur-[160px]" style={{ animationDelay: '3s' }}></div>
        
        {/* Decorative elements */}
        <div className="absolute left-20 top-40 size-16 animate-bounce rounded-full border border-blue-500/10 shadow-2xl backdrop-blur-sm" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-40 right-20 size-24 animate-bounce rounded-full border border-indigo-500/10 shadow-2xl backdrop-blur-sm" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>

        {/* Login Container */}
        <div className="relative z-10 flex w-full max-w-5xl flex-col items-stretch overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 shadow-[0_0_80px_rgba(30,58,138,0.15)] backdrop-blur-3xl lg:flex-row">
          
          {/* Left Panel - Hero Section */}
          <div className="relative flex flex-1 flex-col justify-center border-r border-white/5 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 p-12 lg:p-16">
            {/* Mesh Gradient Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent_60%)]"></div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <img 
                  src="/app/images/front/bks-icon.svg" 
                  alt="BKS Logo" 
                  className="size-14 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] transition-transform duration-500 hover:scale-105 active:scale-95" 
                />
                <span className="text-3xl font-bold uppercase italic tracking-tight text-white">BKS System</span>
              </div>

              <div>
                <h2 className="mb-4 ml-1 text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80">{t("login.portal_manager")}</h2>
                <h1 className="mb-6 text-2xl font-extrabold leading-[1.1] text-white lg:text-3xl">
                  {t("login.hero_title_manager")}
                </h1>
                <p className="max-w-72 text-base font-medium leading-relaxed text-slate-400/90 lg:text-lg">
                  {t("login.hero_desc_manager")}
                </p>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">100%</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("login.secure_access")}</span>
                </div>
                <div className="h-10 w-px bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">24/7</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("login.cloud_uptime")}</span>
                </div>
              </div>
            </div>
            
            {/* Decorative Grid */}
            <div className="pointer-events-none absolute bottom-0 right-0 h-1/2 w-full opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, #1e3a8a 0%, transparent 50%)' }}></div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="flex flex-1 flex-col justify-center p-8 sm:p-12 lg:p-16">
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-10 text-center lg:text-left">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/10 bg-indigo-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  <UserCog className="size-3" />
                  {t("login.portal_admin")}
                </div>
                <h3 className="mb-3 text-3xl font-extrabold tracking-tight text-white">{t("login.title")}</h3>
                <p className="font-medium text-slate-400">{t("login.subtitle")}</p>
              </div>

              <FormProvider {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-500">{t("login.email")}</FormLabel>
                        <FormControl>
                          <div className="group relative">
                            <Input 
                              type="email" 
                              placeholder={t("login.email_placeholder")} 
                              className="h-13 rounded-2xl border-white/5 bg-white/[0.02] pl-5 text-white transition-all placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 group-hover:bg-white/[0.04]"
                              {...field} 
                            />
                            <div className="absolute bottom-0 left-0 h-px w-0 bg-indigo-500 transition-all duration-300 group-focus-within:w-full"></div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs font-medium text-rose-500/90" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-500">{t("login.password")}</FormLabel>
                        <FormControl>
                          <div className="group relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder={t("login.password_placeholder")} 
                              className="h-13 rounded-2xl border-white/5 bg-white/[0.02] pl-5 text-white transition-all placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 group-hover:bg-white/[0.04]"
                              {...field} 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPassword(!showPassword)} 
                              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 transition-colors hover:text-white"
                            >
                              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                            </button>
                            <div className="absolute bottom-0 left-0 h-px w-0 bg-indigo-500 transition-all duration-300 group-focus-within:w-full"></div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs font-medium text-rose-500/90" />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between px-1">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-white/20 bg-white/5 data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600"
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer select-none text-xs font-bold text-slate-500">
                            {t("login.remember_me")}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 text-xs font-bold text-slate-500 transition-colors hover:bg-transparent hover:text-indigo-400"
                      onClick={() => navigate(ROUTERS.FORGOT_PASSWORD)}
                    >
                      {t("login.forgot_password")}
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-indigo-600 px-8 font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.25)] transition-all duration-300 hover:bg-indigo-500 hover:shadow-[0_15px_40px_rgba(79,70,229,0.35)] active:scale-[0.98]"
                  >
                    <span className="relative z-10 flex items-center gap-2 tracking-wide">
                      {t("login.login_button")}
                      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
                  </Button>

                  {/* Only Login allowed, no registration or contact admin */}
                  
                  <div className="pt-6 text-center">
                     <button 
                       type="button"
                       className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500/60 transition-colors hover:text-indigo-400"
                       onClick={() => navigate(ROUTERS.PARTNER_LOGIN)}
                     >
                       {t("login.login_as_partner")}
                     </button>
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

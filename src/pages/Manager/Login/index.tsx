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
import { ROUTERS } from "@/constant";

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
            useUserStore.getState().login(token, values.email, role);
            
            toastSuccess(t("login.success"));
            navigate(ROUTERS.CONTROL);
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
      
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4 lg:p-8">
        {/* Dynamic Background Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[160px] animate-pulse" style={{ animationDelay: '3s' }}></div>
        
        {/* Decorative elements */}
        <div className="absolute top-40 left-20 w-16 h-16 rounded-full border border-blue-500/10 backdrop-blur-sm shadow-2xl animate-bounce" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 rounded-full border border-indigo-500/10 backdrop-blur-sm shadow-2xl animate-bounce" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>

        {/* Login Container */}
        <div className="relative z-10 flex w-full max-w-5xl flex-col items-stretch overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 shadow-[0_0_80px_rgba(30,58,138,0.15)] backdrop-blur-3xl lg:flex-row">
          
          {/* Left Panel - Hero Section */}
          <div className="relative flex flex-1 flex-col justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 p-12 lg:p-16 border-r border-white/5">
            {/* Mesh Gradient Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent_60%)]"></div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md transition-transform hover:scale-110 active:scale-95 duration-500">
                <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="h-10 w-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
              </div>

              <div>
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-blue-400/80 mb-4 ml-1">{t("login.portal_manager")}</h2>
                <h1 className="text-2xl lg:text-3xl font-extrabold leading-[1.1] text-white mb-6">
                  {t("login.hero_title_manager")}
                </h1>
                <p className="max-w-[18rem] text-base lg:text-lg text-slate-400/90 font-medium leading-relaxed">
                  {t("login.hero_desc_manager")}
                </p>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">100%</span>
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">{t("login.secure_access")}</span>
                </div>
                <div className="h-10 w-px bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">24/7</span>
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">{t("login.cloud_uptime")}</span>
                </div>
              </div>
            </div>
            
            {/* Decorative Grid */}
            <div className="absolute bottom-0 right-0 w-full h-1/2 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, #1e3a8a 0%, transparent 50%)' }}></div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="flex flex-1 flex-col justify-center p-8 sm:p-12 lg:p-16">
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-10 text-center lg:text-left">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-indigo-400 border border-indigo-500/10">
                  <UserCog className="h-3 w-3" />
                  {t("login.portal_admin")}
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight text-white mb-3">{t("login.title")}</h3>
                <p className="text-slate-400 font-medium">{t("login.subtitle")}</p>
              </div>

              <FormProvider {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t("login.email")}</FormLabel>
                        <FormControl>
                          <div className="group relative">
                            <Input 
                              type="email" 
                              placeholder={t("login.email_placeholder")} 
                              className="h-13 border-white/5 bg-white/[0.02] pl-5 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all group-hover:bg-white/[0.04] rounded-2xl"
                              {...field} 
                            />
                            <div className="absolute bottom-0 left-0 h-px w-0 bg-indigo-500 transition-all duration-300 group-focus-within:w-full"></div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-rose-500/90 font-medium" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t("login.password")}</FormLabel>
                        <FormControl>
                          <div className="group relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder={t("login.password_placeholder")} 
                              className="h-13 border-white/5 bg-white/[0.02] pl-5 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all group-hover:bg-white/[0.04] rounded-2xl"
                              {...field} 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPassword(!showPassword)} 
                              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 transition-colors hover:text-white"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                            <div className="absolute bottom-0 left-0 h-px w-0 bg-indigo-500 transition-all duration-300 group-focus-within:w-full"></div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-rose-500/90 font-medium" />
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
                              className="border-white/20 bg-white/5 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                          </FormControl>
                          <FormLabel className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                            {t("login.remember_me")}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 text-xs font-bold text-slate-500 transition-colors hover:text-indigo-400 hover:bg-transparent"
                      onClick={() => navigate(ROUTERS.FORGOT_PASSWORD)}
                    >
                      {t("login.forgot_password")}
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="group relative flex w-full h-14 items-center justify-center overflow-hidden rounded-2xl bg-indigo-600 px-8 font-bold text-white shadow-[0_10px_30px_rgba(79,70,229,0.25)] transition-all duration-300 hover:bg-indigo-500 hover:shadow-[0_15px_40px_rgba(79,70,229,0.35)] active:scale-[0.98]"
                  >
                    <span className="relative z-10 flex items-center gap-2 tracking-wide">
                      {t("login.login_button")}
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
                  </Button>

                  {/* Only Login allowed, no registration or contact admin */}
                  
                  <div className="pt-6 text-center">
                     <button 
                       type="button"
                       className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500/60 hover:text-indigo-400 transition-colors"
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

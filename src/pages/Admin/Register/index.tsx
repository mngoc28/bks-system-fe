import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { ROUTERS } from "@/constant";
import { useRegisterMutation } from "@/hooks/useAuthQuery";
import { registerFormSchema } from "@/shared/shema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building, Eye, EyeOff, Mail, MapPin, Phone, User, ShieldCheck, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LoadingScreen } from "@/components/ui/loading-screen"
import PasswordStrengthBarProps from "./components/PasswordStrengBarProps";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetWardsByProvinceId } from "@/hooks/useWardQuery";
import SearchableSelect from "@/components/ui/searchable-select";
import { ProvinceTypes } from "@/dataHelper/province.dataHelper";
import { Ward } from "@/dataHelper/ward.dataHelper";

/**
 * Partner Registration Page
 * A comprehensive multi-field form for new partners to join the BKS ecosystem, featuring real-time validation and location selection.
 */
export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(registerFormSchema(t)),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      province_id: 0,
      ward_id: 0,
      password: "",
      password_confirmation: "",
      company_name: "",
    },
    mode: "onChange",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [_avatarPreview, _setAvatarPreview] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState<string>('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const { mutate, status } = useRegisterMutation();

  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      roke: 'partner',
      avatar: null
    };
    mutate(payload, {
      onSuccess: () => {
        toastSuccess(t('register.register_success'));
        navigate(ROUTERS.LOGIN)
      },
      onError: () => {
        toastError(t("register.failed"))
      },
    }
    );
  };

  const { data: provincesData, isLoading: isLoadingProvinces } = useGetAllProvincesTypes();
  const { data: wardsData, isLoading: isLoadingWardsData } = useGetWardsByProvinceId(Number(form.watch("province_id")));
  const [showWard, setShowWard] = useState<boolean>(false);

  useEffect(() => {
    const provinceId = form.watch("province_id");
    if (provinceId) {
      setShowWard(true);
    } else {
      setShowWard(false);
      form.setValue("ward_id", 0);
    }
  }, [form.watch("province_id"), form])
  return (
    <>
      {status === 'pending' && <LoadingScreen text={t("common.processing")} />}
      
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f172a] p-4 lg:p-8">
        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Main Card with Glassmorphism */}
        <div className="relative z-10 flex w-full max-w-6xl flex-col items-stretch overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-2xl lg:flex-row">
          
          {/* Left Panel - Hero Section */}
          <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-10 lg:p-12 lg:flex">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.07]" 
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner">
                  <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="h-8 w-8 object-contain" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white uppercase italic">BKS System</span>
              </div>
            </div>

            <div className="relative z-10">
              <h2 className="mb-6 text-2xl lg:text-3xl font-extrabold leading-tight text-white">
                Tham gia <br />
                <span className="bg-gradient-to-r from-blue-200 to-indigo-100 bg-clip-text text-transparent">Hệ Sinh Thái BKS</span>
              </h2>
              <p className="max-w-md text-sm lg:text-base leading-relaxed text-blue-100/80 font-medium">
                Khởi tạo tài khoản đối tác để bắt đầu hành trình chuyển đổi số và tối ưu hóa quản lý vận hành tòa nhà cùng chúng tôi
              </p>
            </div>

            <div className="relative z-10 pt-8 border-t border-white/10">
              <div className="flex items-center gap-12">
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold text-white">1k+</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/60">Đối tác tin dùng</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold text-white">24/7</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/60">Hỗ trợ kỹ thuật</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="flex flex-1 flex-col overflow-y-auto max-h-[90vh] lg:max-h-none p-8 sm:p-12 lg:p-16 hide-scrollbar">
            <div className="mx-auto w-full max-w-lg">
              <div className="mb-10 lg:hidden text-center">
                <img src="/app/images/front/bks-icon.svg" alt="BKS Logo" className="mx-auto mb-4 h-16 w-16" />
                <h2 className="text-2xl font-bold text-white uppercase italic tracking-tighter">BKS System</h2>
              </div>

              <div className="mb-10">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-blue-400 border border-blue-500/10">
                  <Building className="h-3 w-3" />
                  Cổng Đăng Ký Đối Tác
                </span>
                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">{t("register.title")}</h1>
                <p className="text-slate-400 font-medium">{t("register.description")}</p>
              </div>

              <FormProvider {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <FormField
                      name="name"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t("register.full_name")}</FormLabel>
                          <FormControl>
                            <div className="group relative">
                              <Input 
                                type="text" 
                                placeholder={t("register.enter_full_name")} 
                                className="h-12 border-white/5 bg-white/[0.02] pl-10 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all group-hover:bg-white/[0.04] rounded-2xl"
                                {...field} 
                              />
                              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-blue-500" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500/80 font-medium" />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t("register.email")}</FormLabel>
                          <FormControl>
                            <div className="group relative">
                              <Input 
                                type="email" 
                                placeholder={t("register.enter_email")} 
                                className="h-12 border-white/5 bg-white/[0.02] pl-10 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all group-hover:bg-white/[0.04] rounded-2xl"
                                {...field} 
                              />
                              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-blue-500" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500/80 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone */}
                    <FormField
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t("register.phone")}</FormLabel>
                          <FormControl>
                            <div className="group relative">
                              <Input 
                                type="tel" 
                                placeholder={t("register.enter_phone")} 
                                className="h-12 border-white/5 bg-white/[0.02] pl-10 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all group-hover:bg-white/[0.04] rounded-2xl"
                                {...field} 
                              />
                              <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-blue-500" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500/80 font-medium" />
                        </FormItem>
                      )}
                    />

                    {/* Company */}
                    <FormField
                      name="company_name"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t("register.company_name")}</FormLabel>
                          <FormControl>
                            <div className="group relative">
                              <Input 
                                type="text" 
                                placeholder={t("register.enter_company_name")} 
                                className="h-12 border-white/5 bg-white/[0.02] pl-10 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all group-hover:bg-white/[0.04] rounded-2xl"
                                {...field} 
                              />
                              <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-blue-500" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500/80 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Province & Ward Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      name="province_id"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t("register.province_name")}</FormLabel>
                          <FormControl>
                            <SearchableSelect
                              value={field.value?.toString() || ""}
                              onValueChange={(value) => field.onChange(Number(value))}
                              options={provincesData?.data?.map((province: ProvinceTypes) => ({
                                value: province.id.toString(),
                                label: province.name,
                                name_en: province.name_en,
                              })) || []}
                              placeholder={t("register.province_name_placeholder")}
                              searchPlaceholder={t("register.province_name_search_placeholder")}
                              emptyMessage={t("register.province_name_empty_message")}
                              disabled={isLoadingProvinces}
                              loading={isLoadingProvinces}
                              icon={<MapPin className="h-4 w-4 text-slate-500" />}
                              showSearch={true}
                              triggerClassName="h-12 bg-white/[0.02] border-white/5 text-white rounded-2xl focus:ring-blue-500/20"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500/80 font-medium" />
                        </FormItem>
                      )}
                    />

                    {showWard && (
                      <FormField
                        name="ward_id"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t("register.ward_name")}</FormLabel>
                            <FormControl>
                              <SearchableSelect
                                value={field.value?.toString() || ""}
                                onValueChange={(value) => field.onChange(Number(value))}
                                options={wardsData?.data?.map((ward: Ward) => ({
                                  value: ward.id.toString(),
                                  label: ward.name,
                                })) || []}
                                placeholder={t("register.ward_name_placeholder")}
                                searchPlaceholder={t("register.ward_name_search_placeholder")}
                                emptyMessage={t("register.ward_name_empty_message")}
                                disabled={isLoadingWardsData}
                                loading={isLoadingWardsData}
                                icon={<MapPin className="h-4 w-4 text-slate-500" />}
                                showSearch={true}
                                triggerClassName="h-12 bg-white/[0.02] border-white/5 text-white rounded-2xl focus:ring-blue-500/20"
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-rose-500/80 font-medium" />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t("register.password")}</FormLabel>
                          <FormControl>
                            <div className="group relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder={t("register.enter_password")} 
                                className="h-12 border-white/5 bg-white/[0.02] pl-10 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all group-hover:bg-white/[0.04] rounded-2xl"
                                {...field}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setPasswordValue(e.target.value);
                                }}
                              />
                              <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                              <div className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600">
                                <ShieldCheck className="h-4 w-4" />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500/80 font-medium" />
                          {isPasswordFocused && <PasswordStrengthBarProps password={passwordValue} />}
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="password_confirmation"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t("register.confirm_password")}</FormLabel>
                          <FormControl>
                            <div className="group relative">
                              <Input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder={t("register.enter_confirm_password")} 
                                className="h-12 border-white/5 bg-white/[0.02] pl-10 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all group-hover:bg-white/[0.04] rounded-2xl"
                                {...field} 
                              />
                              <button 
                                type="button" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs text-rose-500/80 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="group relative flex w-full h-14 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 px-8 font-bold text-white shadow-[0_10px_30px_rgba(37,99,235,0.25)] transition-all duration-300 hover:bg-blue-500 hover:shadow-[0_15px_40px_rgba(37,99,235,0.35)] active:scale-[0.98] mt-4"
                  > 
                    <span className="relative z-10 flex items-center gap-2 tracking-wide">
                      {t("register.register_button")}
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
                  </Button>
                </form>
              </FormProvider>

              {/* Login Link */}
              <div className="mt-10 border-t border-white/5 pt-10 text-center">
                <p className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-600">{t("register.have_account")}</p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-white/5 bg-white/[0.02] text-slate-400 font-bold hover:bg-white/5 hover:text-white hover:border-white/10 transition-all"
                  onClick={() => navigate(ROUTERS.PARTNER_LOGIN)}
                >
                  {t("register.login_button")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}

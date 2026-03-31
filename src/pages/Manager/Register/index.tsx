import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { ROUTERS } from "@/constant";
import { useRegisterMutation } from "@/hooks/useAuthQuery";
import { registerFormSchema } from "@/shared/shema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building, Eye, EyeOff, Mail, MapPin, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LoadingCommet } from "@/components/ui/loading"
import PasswordStrengthBarProps from "./components/PasswordStrengBarProps";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetWardsByProvinceId } from "@/hooks/useWardQuery";
import SearchableSelect from "@/components/ui/searchable-select";
import { ProvinceTypes } from "@/dataHelper/province.dataHelper";
import { Ward } from "@/dataHelper/ward.dataHelper";

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
      {status === 'pending' ?
        <LoadingCommet color="#FFFFFF" size="medium" /> :
        <></>
      }
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 p-4">
        {/* Background shape */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-800"
          style={{
            clipPath: "polygon(0 0, 55% 0, 45% 100%, 0 100%)",
          }}
        ></div>

        {/* Container */}
        <div className="relative z-10 flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:flex-row">
          {/* Left Panel */}
          <div className="relative flex flex-1 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-8 lg:p-12">
            <div className="relative flex h-full w-full items-center justify-center rounded-lg bg-gray-300/50">
              <a href="/">
                <img src="/assets/images/Logo-goline.png" alt="Goline Logo" className="h-80 w-80 cursor-pointer object-contain" />
              </a>
            </div>
          </div>

          {/* Right Panel - Register Form */}
          <div className="flex flex-1 flex-col justify-center p-8 lg:p-12">
            <div className="mx-auto w-full max-w-md">
              <h1 className="mb-3 text-3xl font-bold text-gray-900 lg:text-4xl">{t("register.title")}</h1>
              <p className="mb-5 text-gray-600">{t("register.description")}</p>

              {/* Name */}
              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    name="name"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel className="mb-0">{t("register.full_name")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="text" placeholder={t("register.enter_full_name")} required {...field} />
                            <User className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/*Email */}
                  <FormField
                    name="email"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel className="mb-0 mt-[15px]">{t("register.email")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="email" placeholder={t("register.enter_email")} required {...field} />
                            <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/*Phone */}
                  <FormField
                    name="phone"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel className="mb-0 mt-[15px]">{t("register.phone")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="tel" placeholder={t("register.enter_phone")} required {...field} />
                            <Phone className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Company name */}
                  <FormField
                    name="company_name"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel className="mb-0 mt-[15px]">{t("register.company_name")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="text" placeholder={t("register.enter_company_name")} required {...field} />
                            <Building className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/*province name*/}
                  <FormField
                    name="province_id"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel className="mb-0 mt-[15px]">{t("register.province_name")}</FormLabel>
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
                            icon={<MapPin className="h-4 w-4" />}
                            showSearch={true}
                            triggerClassName="w-full"
                            contentClassName="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/*ward name*/}
                  {showWard && (
                    <FormField
                      name="ward_id"
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="mb-0 mt-[15px]">{t("register.ward_name")}</FormLabel>
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
                              icon={<MapPin className="h-4 w-4" />}
                              showSearch={true}
                              triggerClassName="w-full"
                              contentClassName="w-full"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />)}
                  {/* Password */}
                  <FormField
                    name="password"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel className="mb-0 mt-[15px]">{t("register.password")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showPassword ? "text" : "password"} placeholder={t("register.enter_password")} required {...field}
                              onFocus={() => setIsPasswordFocused(true)}
                              onBlur={() => setIsPasswordFocused(false)}
                              onChange={(e) => {
                                field.onChange(e);
                                setPasswordValue(e.target.value);
                              }}
                              className="pr-12"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600">
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {isPasswordFocused && <PasswordStrengthBarProps password={passwordValue} />}

                  {/* Confirm Password */}
                  <FormField
                    name="password_confirmation"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel className="mb-0 mt-[15px]">{t("register.confirm_password")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showConfirmPassword ? "text" : "password"} placeholder={t("register.enter_confirm_password")} required {...field}
                              className="pr-12"
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600">
                              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="mt-4 w-full rounded-lg bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-800 hover:to-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  > {
                      t("register.register_button")
                    }
                  </Button>
                </form>
              </FormProvider>

              {/* Login Link */}
              <div className="mt-6 text-left">
                <p className="mb-1 text-sm font-semibold text-gray-600">{t("register.have_account")}</p>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full rounded-lg border-2 border-blue-700 px-6 py-3 font-semibold text-blue-700 transition-all duration-300 hover:bg-blue-700 hover:text-white"
                  onClick={() => {
                    navigate(ROUTERS.LOGIN)
                  }}
                >
                  {t("register.login_button")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

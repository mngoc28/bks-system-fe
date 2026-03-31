import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingCommet } from "@/components/ui/loading";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { useLoginMutation } from "@/hooks/useAuthQuery";
import { loginFormSchema } from "@/shared/shema";
import { useUserStore } from "@/store/useUserStore";
import { setAccessToken, setUserEmail } from "@/utils/storage";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function Login() {
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
            const token = typeof res.data === "string" ? res.data : res.data.token;

            setAccessToken(token);
            setUserEmail(values.email);
            useUserStore.getState().login(token, values.email);
            toastSuccess(t("login.success"));
            navigate("/dashboard");
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
      {status === 'pending' ?
        <LoadingCommet color="#FFFFFF" size="medium" /> :
        <></>
      }
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 p-4">
        {/* Background decorative shape */}

        <div
          className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-800"
          style={{
            clipPath: "polygon(0 0, 55% 0, 45% 100%, 0 100%)",
          }}
        ></div>

        {/* Main container */}
        <div className="relative z-10 flex h-auto w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:h-[600px] lg:flex-row">
          {/* Left Panel - Decorative */}
          <div className="relative flex flex-1 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-8 lg:p-12">
            {/* Decorative circles */}
            <div className="absolute right-20 top-16 h-20 w-20 rounded-full border-2 border-blue-300 opacity-30"></div>
            <div className="absolute bottom-24 left-16 h-16 w-16 rounded-full border-2 border-blue-300 opacity-30"></div>
            <div className="absolute left-24 top-32 h-10 w-10 rounded-full border-2 border-blue-300 opacity-30"></div>

            {/* Central image placeholder */}

            <div className="relative flex h-full w-full items-center justify-center rounded-lg bg-gray-300/50">
              <a href="/">
                <img src="/assets/images/Logo-goline.png" alt="Goline Logo" className="h-80 w-80 cursor-pointer object-contain" />
              </a>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="flex flex-1 flex-col justify-center p-8 lg:p-12">
            <div className="mx-auto w-full max-w-md">
              {/* Header */}
              <div className="mb-8">
                <h1 className="mb-3 text-3xl font-bold text-gray-900 lg:text-4xl">{t("login.title")}</h1>
              </div>
              <FormProvider {...form}>
                {/* Form */}
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-900">{t("login.email")}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t("login.email_placeholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-900">{t("login.password")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showPassword ? "text" : "password"} placeholder={t("login.password_placeholder")} {...field} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600">
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Forgot Password */}
                  <div className="text-right">
                    <Button type="button" variant="ghost" size="sm" className="px-0 text-sm font-medium text-blue-700 transition-colors hover:text-blue-800" onClick={() => alert("Redirect to forgot password page")}>
                      {t("login.forgot_password")}
                    </Button>
                  </div>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    className="w-full transform rounded-lg bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-800 hover:to-blue-900 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
                  >
                    {t("login.login_button")}
                  </Button>

                  {/* Sign Up Link */}
                  <div className="mt-6 text-left">
                    <p className="mb-1 text-sm text-gray-600">{t("login.no_account")}</p>
                    <Button
                      type="button"
                      variant="secondary"
                      className="inline-block w-full rounded-lg border-2 border-blue-700 px-6 py-3 text-center font-semibold text-blue-700 transition-all duration-300 hover:bg-blue-700 hover:text-white"
                      onClick={() => navigate("/register")}
                    >
                      {t("login.register")}
                    </Button>
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

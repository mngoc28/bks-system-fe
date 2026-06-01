import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ROUTERS } from "@/constant";

/**
 * Reset Password Page
 * Allows users to set a new password after a successful recovery request, ensuring account security through re-authentication.
 */
const ResetPassword: React.FC = () => {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock reset password logic
    alert(t("auth.password_reset_success"));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t("auth.reset_password")}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">{t("auth.reset_password_description")}</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t("auth.new_password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
              placeholder={t("auth.new_password")}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              {t("auth.confirm_password")}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
              placeholder={t("auth.confirm_password")}
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {t("auth.reset_password")}
            </button>
          </div>

          <div className="text-center">
            <Link to={ROUTERS.LOGIN} className="font-medium text-primary hover:text-primary">
              {t("auth.back_to_login")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

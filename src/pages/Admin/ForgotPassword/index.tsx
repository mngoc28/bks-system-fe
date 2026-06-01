import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ROUTERS } from "@/constant";

/**
 * Forgot Password Page
 * Allows users to request a password reset link by providing their email address.
 */
const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock forgot password logic
    alert(t("auth.reset_password_sent"));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("auth.forgot_password")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("auth.forgot_password_description")}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t("auth.email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="relative mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
              placeholder={t("auth.email")}
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {t("auth.send_reset_link")}
            </button>
          </div>

          <div className="text-center">
            <Link
              to={ROUTERS.LOGIN}
              className="font-medium text-primary hover:text-primary"
            >
              {t("auth.back_to_login")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

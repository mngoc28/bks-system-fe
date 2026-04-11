import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ROUTERS } from "@/constant";

/**
 * 404 Not Found Page
 * A fallback page displayed when the requested route does not exist.
 */
const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-extrabold text-gray-900">404</h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t("common.page_not_found")}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t("common.page_not_found_description")}
          </p>
        </div>

        <div>
          <Link
            to={ROUTERS.CONTROL}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t("common.back_to_dashboard")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

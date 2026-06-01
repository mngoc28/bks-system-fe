import { Button } from "@/components/ui/button";
import { ROUTERS } from "@/constant";
import { useGetUserByIdQuery } from "@/hooks/useUserQuery";
import AdminContentLoader from "@/components/admin/AdminContentLoader";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { UserDetailView } from "./components";

/**
 * User Detail Page
 * A read-only profile view that fetches and displays comprehensive information for a specific user, including their account metrics and administrative status.
 */
const UserDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = id ? parseInt(id, 10) : 0;
  const location = useLocation();

  // Fetch user data
  const { data: userData, isLoading: isUserLoading, isError, error } = useGetUserByIdQuery(userId);

  // Memoize user data
  const user = useMemo(() => {
    if (!userData?.data) return undefined;
    return userData.data;
  }, [userData]);

  // Handle back button click
  const handleBack = () => {
    navigate(ROUTERS.USER_MANAGEMENT, { state: location.state });
  };

  // Render different states
  if (!userId || userId <= 0) {
    return (
      <div className="flex flex-col gap-6 p-3 sm:p-6">
        <div className="text-red-500">{t("user.invalid_user_id")}</div>
        <Button onClick={() => navigate(ROUTERS.USER_MANAGEMENT)} className="text-blue-500 hover:underline">
          {t("common.back")}
        </Button>
      </div>
    );
  }

  if (isUserLoading) {
    return <AdminContentLoader text={t("common.loading_data")} />;
  }

  // Error state
  if (isError || !user) {
    const errorMessage = error ? (error as any)?.response?.data?.message || t("user.error_getting_user") : t("user.error_getting_user");
    return (
      <div className="flex flex-col gap-6 p-3 sm:p-6">
        <div className="text-red-500">{errorMessage}</div>
        <button onClick={() => navigate(ROUTERS.USER_MANAGEMENT)} className="text-blue-500 hover:underline">
          {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 overflow-hidden p-3 sm:p-6">
      <UserDetailView
        user={user}
        onBack={handleBack}
      />
    </div>
  );
};

export default UserDetail;

import { ROUTERS } from "@/constant";
import { UpdateUserProfileRequest } from "@/dataHelper/user.dataHelper";
import { useGetUserByIdQuery, useUpdateUserMutation } from "@/hooks/useUserQuery";
import { Loader2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { UserEditForm } from "./components";

const UserEdit: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = id ? parseInt(id, 10) : 0;

  const { data, isLoading, isError } = useGetUserByIdQuery(userId);
  const updateUserMutation = useUpdateUserMutation();

  const user = React.useMemo(() => {
    if (!data) return undefined;
    return data.data;
  }, [data]);

  const handleSubmit = async (formData: UpdateUserProfileRequest & { role: string }) => {
    if (!user) return;
    try {
      const updateData: UpdateUserProfileRequest = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      };
      await updateUserMutation.mutateAsync({
        id: user.id,
        data: updateData,
      });
      navigate(ROUTERS.USER_MANAGEMENT);
    } catch (error) {}
  };

  const handleCancel = () => {
    navigate(ROUTERS.USER_MANAGEMENT);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-3 sm:p-6">
        <Loader2 className="size-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col gap-6 p-3 sm:p-6">
        <div className="text-red-500">{t("user.error_fetching_user")}</div>
        <button onClick={() => navigate(ROUTERS.USER_MANAGEMENT)} className="text-blue-500 hover:underline">
          {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-3 sm:p-6">
      <h2 className="text-2xl font-bold">{t("user.edit_user")}</h2>
      <UserEditForm user={user} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={updateUserMutation.isPending} />
    </div>
  );
};

export default UserEdit;

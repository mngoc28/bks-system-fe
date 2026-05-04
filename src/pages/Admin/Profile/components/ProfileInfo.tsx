import { CalendarCheck, CalendarClock, Mail, Phone, Shield, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/dateUtils";
import { ProfileInfoProps } from "@/dataHelper/user.dataHelper";
import { CLOUDINARY_HEADER_IMAGE_URL, IMAGE_MAX_SIZE } from "@/constant";
import { useMemo, useRef } from "react";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { FaPlus } from "react-icons/fa";
import { useUpdateUserProfileMutation} from "@/hooks/useUserQuery";
import { ThreeDot } from "react-loading-indicators";
import { useDeleteImageMutation, useUploadImageMutation } from "@/hooks/useCloudinariQuery";
import { resolveImageUrl } from "@/utils/imageUtils";

/**
 * Profile Info Component
 * Displays detailed user profile information, including contact details, role, and registration timestamps.
 */
const ProfileInfo = ({
  profile,
  onEditClick,
  onChangePasswordClick,
  onAvatarUploadSuccess,
}: ProfileInfoProps) => {
  const { t } = useTranslation();
  const uploadAvatarMutation = useUploadImageMutation();
  const updateUserProfileMutation = useUpdateUserProfileMutation();
  const deleteAvatarMutation = useDeleteImageMutation();

  // Get avatar URL from Cloudinary
  const avatarUrl = useMemo(() => {
    return resolveImageUrl(profile.avatar, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || "/assets/images/add-user.png";
  }, [profile.avatar]);

  // Local preview URL
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle click avatar
  const handleClickAvatar = () => {
    fileInputRef.current?.click();
  };

  // Handle select and upload avatar
  const handleSelectAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > IMAGE_MAX_SIZE) {
      toastError(t("validation.image.too_large"));
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toastError(t("validation.image.invalid_type"));
      return;
    }
 
    let uploadedAvatarId: string | null = null;
    let newAvatarUrl: string | null = null;
    const nowAvatarId: string | null | undefined = profile.id_avatar;

    // Upload avatar to cloudinary
    try {
      const uploadResponse = await uploadAvatarMutation.mutateAsync({
        image: file,
        folder: `avatars/${profile.id}`,
      });

      newAvatarUrl = uploadResponse.data?.url || '';
      uploadedAvatarId = uploadResponse.data?.public_id || '';
      // Update user profile
      try {
        await updateUserProfileMutation.mutateAsync({
          avatar: newAvatarUrl || '',
          id_avatar: uploadedAvatarId || '',
        });
        
        if (onAvatarUploadSuccess) {
          onAvatarUploadSuccess();
        }
      } catch {
        if (uploadedAvatarId) {
          try {
            await deleteAvatarMutation.mutateAsync(uploadedAvatarId);
          } catch {
            toastError(t("profile.delete_failed"));
            return;
          }
        }
      }
    } catch {
      toastError(t("profile.upload_failed"));
      return;
    }
    // Delete old avatar from cloudinary
    if (nowAvatarId) {
      try {
        await deleteAvatarMutation.mutateAsync(nowAvatarId);
      } catch {
        toastError(t("profile.delete_failed"));
        return;
      }
    }
    toastSuccess(t("profile.upload_success"));
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative size-24">
        <div className="relative size-24 overflow-hidden rounded-full border-4 border-blue-900 bg-blue-100">
          {uploadAvatarMutation.isPending ? (
            <div className="flex size-full items-center justify-center bg-blue-50">
              <ThreeDot variant="bounce" color="#064F80" size="small" />
            </div>
          ) : (
            <img
              src={avatarUrl}
              alt={profile.name}
              className="size-full rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/assets/images/add-user.png";
              }}
            />
          )}
        </div>
        <button
          type="button"
          onClick={handleClickAvatar}
          disabled={uploadAvatarMutation.isPending}
          className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={t("profile.upload_avatar")}
        >
          <FaPlus className="size-4" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleSelectAvatar}
        className="hidden"
        disabled={uploadAvatarMutation.isPending}
      />

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <User className="size-5 text-blue-900" />
            <div className="flex-1 text-center">
              <div className="text-xs font-semibold text-gray-500">{t("profile.name_label")}</div>
              <div className="text-base font-bold text-gray-900">{profile.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <Mail className="size-5 text-blue-900" />
            <div className="flex-1 text-center">
              <div className="text-xs font-semibold text-gray-500">{t("profile.email_label")}</div>
              <div className="break-all text-base text-gray-900">{profile.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <Phone className="size-5 text-blue-900" />
            <div className="flex-1 text-center">
              <div className="text-xs font-semibold text-gray-500">{t("profile.phone_label")}</div>
              <div className="text-base text-gray-900">{profile.phone}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <Shield className="size-5 text-blue-900" />
            <div className="flex-1 text-center">
              <div className="text-xs font-semibold text-gray-500">{t("profile.role_label", { defaultValue: t("profile.role") })}</div>
              <div className="text-base font-bold text-gray-900">{profile.role}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <CalendarCheck className="size-5 text-blue-900" />
            <div className="flex-1 text-center">
              <div className="text-xs font-semibold text-gray-500">{t("profile.created_at")}</div>
              <div className="text-base text-gray-900">
                {formatDate(profile.created_at || "", "DD/MM/YYYY")}{" "}
                {profile.created_at && new Date(profile.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <CalendarClock className="size-5 text-blue-900" />
            <div className="flex-1 text-center">
              <div className="text-xs font-semibold text-gray-500">{t("profile.updated_at")}</div>
              <div className="text-base text-gray-900">
                {formatDate(profile.updated_at || "", "DD/MM/YYYY")}{" "}
                {profile.updated_at && new Date(profile.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-xs flex-col gap-3">
        <Button className="w-full" onClick={onEditClick}>
          {t("profile.edit_button")}
        </Button>
        <Button variant="secondary" className="w-full" onClick={onChangePasswordClick}>
          {t("profile.change_password_button")}
        </Button>
      </div>
    </div>
  );
};

export default ProfileInfo;

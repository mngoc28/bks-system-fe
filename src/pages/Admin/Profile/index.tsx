import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { ProfileInfo, ChangeProfileDialog, ChangePasswordDialog } from "./components";
import { useGetUserProfileQuery } from "@/hooks/useUserQuery";
import { UserProfile } from "@/dataHelper/user.dataHelper";

type ProfileDialogProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Profile Dialog
 * A modal providing access to user profile information, avatar management, and account security settings.
 */
export default function ProfileDialog({ open, onClose }: ProfileDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const { data: profileResponse, isLoading: isProfileLoading, isError } = useGetUserProfileQuery();
  
  const profile: UserProfile | undefined = profileResponse?.data;

  // Refresh profile data
  const refreshProfile = () => {
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] w-[92vw] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("profile.title")}</DialogTitle>
        </DialogHeader>

        {isProfileLoading ? (
          <div className="py-16 text-center text-slate-600">{t("user.loading")}</div>
        ) : isError || !profile ? (
          <div className="py-16 text-center text-slate-600">{t("errors.error_fetching_profile")}</div>
        ) : (
          <ProfileInfo
            profile={profile}
            onEditClick={() => setShowUpdateDialog(true)}
            onChangePasswordClick={() => setShowPasswordDialog(true)}
            onAvatarUploadSuccess={refreshProfile}
          />
        )}

        {profile && (
          <>
            <ChangeProfileDialog
              open={showUpdateDialog}
              onClose={() => setShowUpdateDialog(false)}
              profile={{
                name: profile.name || "",
                email: profile.email || "",
                phone: profile.phone || "",
                avatar: profile.avatar || "",
                id_avatar: profile.id_avatar || "",
              }}
              onSuccess={refreshProfile}
            />

            <ChangePasswordDialog
              open={showPasswordDialog}
              onClose={() => setShowPasswordDialog(false)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
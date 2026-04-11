import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import { UserDetailViewProps } from "@/dataHelper/user.dataHelper";
import { useUpdateUserMutation, useUploadAvatarMutation } from "@/hooks/useUserQuery";
import { statusNumberToText } from "@/utils/utils";
import { avatarSchema } from "@/shared/shema";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, FileText, Upload, User, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

/**
 * User Detail View
 * A presentation component that renders a comprehensive profile for a user, including avatar management, role badges, and detailed account metadata.
 */
export const UserDetailView: React.FC<UserDetailViewProps> = ({ user, onEdit, onBack }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatarMutation = useUploadAvatarMutation();
  const updateUserMutation = useUpdateUserMutation();

  // Get role name based on role string
  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return t("user.role_admin");
      case "partner":
        return t("user.role_partner");
      case "user":
        return t("user.role_user");
      default:
        return role;
    }
  };

  // Get status badge based on status number
  const getStatusBadge = (status?: number | string) => {
    if (status === undefined) return null;
    
    const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
    const statusText = statusNumberToText(statusNum);
    switch (statusNum) {
      case 1:
        return <Badge variant="default" className="bg-green-500">{statusText}</Badge>;
      case 0:
        return <Badge variant="secondary">{statusText}</Badge>;
      case 2:
        return <Badge variant="destructive">{statusText}</Badge>;
      default:
        return <Badge variant="secondary">{statusText}</Badge>;
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate using schema
    const result = avatarSchema(t).safeParse({ file });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("folder", 'users');

      const uploadResponse = await uploadAvatarMutation.mutateAsync({
        id: user.id,
        data: formData,
      });

      if (uploadResponse.data?.url) {
        toast.success(t("user.avatar_updated_success"), {
          style: { 
            background: "#10B981",
            color: "#FFFFFF"
          },
        });

         // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["user", user.id] });
        queryClient.invalidateQueries({ queryKey: ["users"] });

        // Close dialog and reset
        setIsAvatarDialogOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        toast.error(t("user.avatar_update_failed"));
      }
    } catch (error) {
      toast.error(t("user.avatar_update_failed"), {
        style: {
          background: "#EF4444",
          color: "#FFFFFF",
        },
      });
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsAvatarDialogOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Get avatar URL
  const getAvatarUrl = () => {
    if (user.avatar) {
      // Check if it's already a full URL
      if (user.avatar.startsWith('http')) {
        return user.avatar;
      }
      // Otherwise prepend Cloudinary URL
      return `${CLOUDINARY_HEADER_IMAGE_URL}/${user.avatar}`;
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="size-4 mr-2" />
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-600">{t("user.user_details")}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
            <Edit className="size-4 mr-2 sm:mr-2" />
            <span className="hidden sm:inline">{t("user.edit_user_info")}</span>
          </Button>
        </div>
      </div>

      <Card className="shadow-lg border-0">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar Section - Left */}
            <div className="flex flex-col items-center justify-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 lg:min-w-[280px]">
              <div className="relative group flex items-center justify-center" onClick={() => setIsImageModalOpen(true)}>
                {getAvatarUrl() ? (
                  <img
                  src={getAvatarUrl()!}
                  alt={user.name}
                  className="w-56 h-56 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-blue-100 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-56 h-56 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-white shadow-xl ring-4 ring-gray-100">
                  <User className="size-32 text-gray-400" />
                  </div>
                )}
              </div>
              <Button
                onClick={() => setIsAvatarDialogOpen(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700 w-full transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Upload className="size-4 mr-2" />
                {t("user.change_avatar")}
              </Button>
            </div>

            {/* Information Section - Right */}
            <div className="flex-1">
              <div className="mb-8 pb-4 border-b-2 border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="size-5 text-blue-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">{t("user.basic_information")}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("user.table_id")}</label>
                  <p className="text-base font-semibold text-gray-900">#{user.id}</p>
                </div>
                <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("user.table_name")}</label>
                  <p className="text-base font-semibold text-gray-900">{user.name}</p>
                </div>
                <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("user.table_email")}</label>
                  <p className="text-base font-semibold text-gray-900 truncate" title={user.email}>{user.email}</p>
                </div>
                <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("user.table_phone")}</label>
                  <p className="text-base font-semibold text-gray-900">{user.phone || "-"}</p>
                </div>
                <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("user.table_role")}</label>
                  <p className="text-base font-semibold text-gray-900">{getRoleName(user.role)}</p>
                </div>
                <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("user.table_status")}</label>
                  <div className="mt-1">
                    {getStatusBadge(user.status)}
                  </div>
                </div>
                <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("user.table_email_verified")}</label>
                  <div className="mt-1">
                    <Badge variant={user.is_email_verified === 1 ? "default" : "secondary"} className={user.is_email_verified === 1 ? "bg-green-500" : ""}>
                      {user.is_email_verified === 1 ? t("user.verified") : t("user.unverified")}
                    </Badge>
                  </div>
                </div>
                {user.partner_id && (
                  <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("user.table_partner_id")}</label>
                    <p className="text-base font-semibold text-gray-900">#{user.partner_id}</p>
                  </div>
                )}
                {user.created_at && (
                  <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("user.table_created_at")}</label>
                    <p className="text-base font-semibold text-gray-900">
                      {new Date(user.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {user.updated_at && (
                  <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t("user.table_updated_at")}</label>
                    <p className="text-base font-semibold text-gray-900">
                      {new Date(user.updated_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avatar Upload Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="w-[600px] h-[600px] max-w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="size-5" />
              {t("user.change_avatar")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              {/* Preview */}
              <div className="w-full h-auto aspect-square rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center max-w-sm">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : getAvatarUrl() ? (
                  <img src={getAvatarUrl()!} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="size-56 text-gray-400" />
                )}
              </div>

              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  // variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t("user.select_image")}
                </Button>
                {selectedFile && (
                  <Button
                    type="button"
                    onClick={handleAvatarUpload}
                    disabled={uploadAvatarMutation.isPending || updateUserMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {uploadAvatarMutation.isPending || updateUserMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        {t("common.uploading")}
                      </>
                    ) : (
                      <>
                        <Upload className="size-4 mr-2" />
                        {t("common.upload")}
                      </>
                    )}
                  </Button>
                )}
              </div>

              {selectedFile && (
                <p className="text-sm text-gray-600">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="p-0 max-w-4xl max-h-[90vh]">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 p-0"
            onClick={() => setIsImageModalOpen(false)}
          >
            <X className="size-4" />
          </Button>
          {getAvatarUrl() && (
            <img src={getAvatarUrl()!}
            alt={user.name}
            className="w-full aspect-[4/3] object-cover rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

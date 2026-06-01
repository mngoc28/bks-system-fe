import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import { UpdateUserProfileRequest, UserDetailViewProps } from "@/dataHelper/user.dataHelper";
import { useUpdateUserMutation, useUploadAvatarMutation } from "@/hooks/useUserQuery";
import { avatarSchema } from "@/shared/shema";
import { resolveImageUrl } from "@/utils/imageUtils";
import { statusNumberToText } from "@/utils/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit3, FileText, RotateCcw, Save, Upload, User, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type EditableField = "name" | "email" | "phone" | "role";

type EditableUserForm = {
  name: string;
  email: string;
  phone: string;
  role: string;
};

const emptyEditState: Record<EditableField, boolean> = {
  name: false,
  email: false,
  phone: false,
  role: false,
};

/**
 * User Detail View
 * Inline editable user detail page with per-field rollback and save confirmation.
 */
export const UserDetailView: React.FC<UserDetailViewProps> = ({ user, onBack }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);

  const [formData, setFormData] = useState<EditableUserForm>({
    name: "",
    email: "",
    phone: "",
    role: "user",
  });
  const [originalData, setOriginalData] = useState<EditableUserForm>({
    name: "",
    email: "",
    phone: "",
    role: "user",
  });
  const [editingFields, setEditingFields] = useState<Record<EditableField, boolean>>(emptyEditState);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatarMutation = useUploadAvatarMutation();
  const updateUserMutation = useUpdateUserMutation();

  useEffect(() => {
    const nextValue: EditableUserForm = {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "user",
    };

    setFormData(nextValue);
    setOriginalData(nextValue);
    setEditingFields(emptyEditState);
  }, [user.id, user.name, user.email, user.phone, user.role]);

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

  const getStatusBadge = (status?: number | string) => {
    if (status === undefined) return null;

    const statusNum = typeof status === "string" ? parseInt(status, 10) : status;
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

  const getAvatarUrl = () => {
    return resolveImageUrl(user.avatar, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL });
  };

  const isFieldDirty = (field: EditableField) => formData[field] !== originalData[field];

  const hasChanges = useMemo(
    () => (Object.keys(formData) as EditableField[]).some((field) => isFieldDirty(field)),
    [formData, originalData],
  );

  const startEditField = (field: EditableField) => {
    setEditingFields((prev) => ({ ...prev, [field]: true }));
  };

  const stopEditField = (field: EditableField) => {
    setEditingFields((prev) => ({ ...prev, [field]: false }));
  };

  const rollbackField = (field: EditableField) => {
    setFormData((prev) => ({ ...prev, [field]: originalData[field] }));
    stopEditField(field);
  };

  const handleFieldChange = (field: EditableField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmSave = async () => {
    if (!hasChanges) {
      setIsConfirmSaveOpen(false);
      return;
    }

    const payload: UpdateUserProfileRequest = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
    };

    try {
      await updateUserMutation.mutateAsync({ id: user.id, data: payload });
      setOriginalData(formData);
      setEditingFields(emptyEditState);
      setIsConfirmSaveOpen(false);
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch {
      setIsConfirmSaveOpen(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", selectedFile);
      formDataUpload.append("folder", "users");

      const uploadResponse = await uploadAvatarMutation.mutateAsync({
        id: user.id,
        data: formDataUpload,
      });

      if (uploadResponse.data?.url) {
        toast.success(t("user.avatar_updated_success"), {
          style: {
            background: "#10B981",
            color: "#FFFFFF",
          },
        });

        queryClient.invalidateQueries({ queryKey: ["user", user.id] });
        queryClient.invalidateQueries({ queryKey: ["users"] });

        setIsAvatarDialogOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        toast.error(t("user.avatar_update_failed"));
      }
    } catch {
      toast.error(t("user.avatar_update_failed"), {
        style: {
          background: "#EF4444",
          color: "#FFFFFF",
        },
      });
    }
  };

  const handleDialogClose = () => {
    setIsAvatarDialogOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 size-4" />
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-600">{t("user.user_details")}</p>
          </div>
        </div>
        <Button
          onClick={() => setIsConfirmSaveOpen(true)}
          disabled={!hasChanges || updateUserMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="mr-2 size-4" />
          {t("common.save")}
        </Button>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-primary/10 p-6 lg:min-w-[280px]">
              <div
                className="group relative flex items-center justify-center"
                onClick={() => {
                  if (getAvatarUrl()) setIsImageModalOpen(true);
                }}
              >
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()!}
                    alt={user.name}
                    className="size-56 rounded-full border-4 border-white object-cover shadow-xl ring-4 ring-blue-100 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-56 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl ring-4 ring-gray-100">
                    <User className="size-32 text-gray-400" />
                  </div>
                )}
              </div>
              <Button
                onClick={() => setIsAvatarDialogOpen(true)}
                size="sm"
                className="w-full bg-green-600 shadow-md transition-all duration-200 hover:bg-green-700 hover:shadow-lg"
              >
                <Upload className="mr-2 size-4" />
                {t("user.change_avatar")}
              </Button>
            </div>

            <div className="flex-1">
              <div className="mb-8 flex items-center gap-3 border-b-2 border-gray-100 pb-4">
                <div className="rounded-lg bg-blue-100 p-2">
                  <FileText className="size-5 text-blue-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">{t("user.basic_information")}</span>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <label className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{t("user.table_id")}</label>
                  <p className="text-base font-semibold text-gray-900">#{user.id}</p>
                </div>

                <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{t("user.table_name")}</label>
                    <div className="flex items-center gap-1">
                      {isFieldDirty("name") && (
                        <Button variant="ghost" size="sm" onClick={() => rollbackField("name")}>
                          <RotateCcw className="size-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => startEditField("name")}>
                        <Edit3 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  {editingFields.name ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      onBlur={() => stopEditField("name")}
                    />
                  ) : (
                    <p className="text-base font-semibold text-gray-900">{formData.name || "-"}</p>
                  )}
                </div>

                <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{t("user.table_email")}</label>
                    <div className="flex items-center gap-1">
                      {isFieldDirty("email") && (
                        <Button variant="ghost" size="sm" onClick={() => rollbackField("email")}>
                          <RotateCcw className="size-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => startEditField("email")}>
                        <Edit3 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  {editingFields.email ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      onBlur={() => stopEditField("email")}
                    />
                  ) : (
                    <p className="truncate text-base font-semibold text-gray-900" title={formData.email}>{formData.email || "-"}</p>
                  )}
                </div>

                <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{t("user.table_phone")}</label>
                    <div className="flex items-center gap-1">
                      {isFieldDirty("phone") && (
                        <Button variant="ghost" size="sm" onClick={() => rollbackField("phone")}>
                          <RotateCcw className="size-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => startEditField("phone")}>
                        <Edit3 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  {editingFields.phone ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      onBlur={() => stopEditField("phone")}
                    />
                  ) : (
                    <p className="text-base font-semibold text-gray-900">{formData.phone || "-"}</p>
                  )}
                </div>

                <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{t("user.table_role")}</label>
                    <div className="flex items-center gap-1">
                      {isFieldDirty("role") && (
                        <Button variant="ghost" size="sm" onClick={() => rollbackField("role")}>
                          <RotateCcw className="size-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => startEditField("role")}>
                        <Edit3 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  {editingFields.role ? (
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleFieldChange("role", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{t("user.role_admin")}</SelectItem>
                        <SelectItem value="partner">{t("user.role_partner")}</SelectItem>
                        <SelectItem value="user">{t("user.role_user")}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-base font-semibold text-gray-900">{getRoleName(formData.role)}</p>
                  )}
                </div>

                <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <label className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{t("user.table_status")}</label>
                  <div className="mt-1">{getStatusBadge(user.status)}</div>
                </div>

                <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <label className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{t("user.table_email_verified")}</label>
                  <div className="mt-1">
                    <Badge variant={user.is_email_verified === 1 ? "default" : "secondary"} className={user.is_email_verified === 1 ? "bg-green-500" : ""}>
                      {user.is_email_verified === 1 ? t("user.verified") : t("user.unverified")}
                    </Badge>
                  </div>
                </div>

                {user.partner_id && (
                  <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <label className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{t("user.table_partner_id")}</label>
                    <p className="text-base font-semibold text-gray-900">#{user.partner_id}</p>
                  </div>
                )}

                {user.created_at && (
                  <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <label className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{t("user.table_created_at")}</label>
                    <p className="text-base font-semibold text-gray-900">{new Date(user.created_at).toLocaleString()}</p>
                  </div>
                )}

                {user.updated_at && (
                  <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <label className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{t("user.table_updated_at")}</label>
                    <p className="text-base font-semibold text-gray-900">{new Date(user.updated_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isConfirmSaveOpen} onOpenChange={setIsConfirmSaveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("common.confirm")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">{t("user.update_user_confirmation_message")}</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsConfirmSaveOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleConfirmSave} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAvatarDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="size-[600px] max-h-[95vh] max-w-[95vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="size-5" />
              {t("user.change_avatar")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="flex aspect-square h-auto w-full max-w-sm items-center justify-center overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="size-full object-cover" />
                ) : getAvatarUrl() ? (
                  <img src={getAvatarUrl()!} alt={user.name} className="size-full object-cover" />
                ) : (
                  <User className="size-56 text-gray-400" />
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex gap-2">
                <Button
                  type="button"
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
                        <div className="mr-2 size-4 animate-spin rounded-full border-b-2 border-white" />
                        {t("common.uploading")}
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 size-4" />
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
        <DialogContent className="max-h-[90vh] max-w-4xl p-0">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 z-10 size-8 rounded-full bg-black/50 p-0 text-white hover:bg-black/70"
            onClick={() => setIsImageModalOpen(false)}
          >
            <X className="size-4" />
          </Button>
          {getAvatarUrl() && (
            <img
              src={getAvatarUrl()!}
              alt={user.name}
              className="aspect-[4/3] w-full rounded-lg object-cover"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDetailView;

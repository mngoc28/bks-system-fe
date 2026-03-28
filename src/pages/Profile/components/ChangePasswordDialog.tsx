import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useChangePasswordMutation } from "@/hooks/useUserQuery";
import { toast } from "sonner";
import { ChangePasswordDialogProps } from "@/dataHelper/user.dataHelper";

const ChangePasswordDialog = ({ open, onClose }: ChangePasswordDialogProps) => {
  const { t } = useTranslation();
  const changePasswordMutation = useChangePasswordMutation();
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const form = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const current_password = formData.get("oldPassword") as string;
    const new_password = formData.get("newPassword") as string;
    const confirm_password = formData.get("confirmPassword") as string;

    if (new_password !== confirm_password) {
      toast.error(t("validation.password.confirmPassword"), {
        style: { background: "#EF4444", color: "#FFFFFF" },
        className: "border-red-500",
      });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        current_password,
        new_password,
        new_password_confirmation: confirm_password,
      });
      toast.success(t("user.change_password_success"), {
        style: { background: "#10B981", color: "#FFFFFF" },
        className: "border-green-500",
      });
      form.reset();
      onClose();
    } catch (err) {
      // Error is handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t("profile.change_password_title")}
          </DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <FormField
              name="oldPassword"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>{t("profile.old_password_label")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showOldPw ? "text" : "password"} required {...field} />
                      <button
                        type="button"
                        onClick={() => setShowOldPw((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        aria-label={showOldPw ? t("common.hide_password", { defaultValue: "Ẩn mật khẩu" }) : t("common.show_password", { defaultValue: "Hiện mật khẩu" })}
                      >
                        {showOldPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="newPassword"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>{t("profile.new_password_label")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showNewPw ? "text" : "password"} required {...field} />
                      <button
                        type="button"
                        onClick={() => setShowNewPw((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        aria-label={showNewPw ? t("common.hide_password", { defaultValue: "Ẩn mật khẩu" }) : t("common.show_password", { defaultValue: "Hiện mật khẩu" })}
                      >
                        {showNewPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="confirmPassword"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>{t("profile.confirm_password_label")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showConfirmPw ? "text" : "password"} required {...field} />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        aria-label={showConfirmPw ? t("common.hide_password", { defaultValue: "Ẩn mật khẩu" }) : t("common.show_password", { defaultValue: "Hiện mật khẩu" })}
                      >
                        {showConfirmPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-2 w-full">
              {t("profile.save_password_button")}
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;


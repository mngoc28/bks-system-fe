import { User } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { profileFormSchema } from "@/shared/shema";
import { userApi } from "@/api/userApi";
import { toast } from "sonner";
import { ChangeProfileDialogProps } from "@/dataHelper/user.dataHelper";

/**
 * Change Profile Dialog
 * A modal form allowing users to update their personal information, such as name, email, and phone number.
 */
const ChangeProfileDialog = ({
  open,
  onClose,
  profile,
  onSuccess,
}: ChangeProfileDialogProps) => {
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(profileFormSchema(t)),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      avatar: profile.avatar,
      id_avatar: profile.id_avatar,
    },
  });

  // Reset form when profile changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        avatar: profile.avatar,
        id_avatar: profile.id_avatar,
      });
    }
  }, [profile, open, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await userApi.updateProfile(values);
      toast.success(t("user.update_profile_success"), {
        style: { background: "#10B981", color: "#FFFFFF" },
        className: "border-green-500",
      });
      onClose();
      onSuccess();
    } catch {
      toast.error(t("user.profile_failed"), {
        style: { background: "#EF4444", color: "#FFFFFF" },
        className: "border-red-500",
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="size-5" />
            {t("profile.update_info_title")}
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FormProvider {...form}>
            <FormField
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>{t("profile.name_label")}</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>{t("profile.email_label")}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="phone"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>{t("profile.phone_label")}</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-2 w-full">
              {t("profile.save_button")}
            </Button>
          </FormProvider>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeProfileDialog;


import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ResetPasswordDialogProps } from "@/dataHelper/user.dataHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

/**
 * Reset Password Dialog
 * An administrative tool allowing managers to manually reset a user's password, featuring real-time validation for password strength and confirmation match.
 */
const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({ user, isOpen, isLoading, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  // Create schema inside component to ensure translations work
  const resetPasswordSchema = React.useMemo(() => 
    z.object({
      new_password: z.string().min(8, { message: t("user.new_password_min") }),
      new_password_confirmation: z.string().min(1, { message: t("user.new_password_confirmation_required") })
    }).refine((data) => data.new_password === data.new_password_confirmation, {
      message: t("user.new_password_confirmation_same"),
      path: ["new_password_confirmation"],
    })
  , [t]);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      new_password: "",
      new_password_confirmation: "",
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      form.reset();
      onClose();
    }
  };

  const handleSubmit = (data: z.infer<typeof resetPasswordSchema>) => {
    onConfirm(data.new_password);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <KeyRound className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">{t("user.reset_password")}</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                {t("user.reset_password_for_user", { name: user.name, email: user.email })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* New Password */}
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("user.new_password")} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={t("user.new_password_placeholder")}
                        {...field}
                        disabled={isLoading}
                        className="border-gray-300 focus:border-primary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Confirmation */}
            <FormField
              control={form.control}
              name="new_password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    {t("user.new_password_confirmation")} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPasswordConfirmation ? "text" : "password"}
                        placeholder={t("user.new_password_confirmation_placeholder")}
                        {...field}
                        disabled={isLoading}
                        className="border-gray-300 focus:border-primary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={isLoading}
                      >
                        {showPasswordConfirmation ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-row gap-3 sm:gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading} className="flex-1">
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary-hover">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {t("common.processing")}
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 size-4" />
                    {t("user.reset_password_confirm")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;

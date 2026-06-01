import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EditUserDialogProps } from "@/dataHelper/user.dataHelper";
import { userFormSchema } from "@/shared/shema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Spinner } from "@/components/ui/spinner";

/**
 * Edit User Dialog
 * A modification form pre-populated with existing user data, allowing administrators to update names, phone numbers, and roles while keeping the email fixed for record-keeping.
 */
const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, isOpen, isLoading = false, serverError, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const schema = userFormSchema(t);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "user",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "user",
      });
    }
  }, [user, form]);

  // Set server error to email field when received
  React.useEffect(() => {
    if (serverError) {
      form.setError("email", {
        type: "server",
        message: serverError,
      });
    }
  }, [serverError, form]);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      form.reset();
      onClose();
    }
  };

  const handleSubmit = (data: z.infer<typeof schema>) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Edit className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">{t("user.edit_user")}</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-gray-500">
                {t("user.edit_user_description")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t("common.name")} <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t("user.filter_name_placeholder")} {...field} disabled={isLoading} className="border-gray-300 focus:border-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t("common.email")} <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t("user.filter_email_placeholder")} {...field} disabled className="border-gray-300 bg-gray-50 focus:border-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t("common.phone")} <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t("user.filter_phone_placeholder")} {...field} disabled={isLoading} className="border-gray-300 focus:border-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      {t("user.table_role")} <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-primary">
                          <SelectValue placeholder={t("user.filter_role")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">{t("user.role_user")}</SelectItem>
                        <SelectItem value="partner">{t("user.role_partner")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex-row gap-3 pt-4 sm:gap-3">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading} className="flex-1">
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary-hover">
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
                    {t("common.updating")}
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 size-4" />
                    {t("common.update")}
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

export default EditUserDialog;

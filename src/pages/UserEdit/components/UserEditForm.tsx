import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserEditFormData, UserEditFormProps } from "@/dataHelper/user.dataHelper";
import { userFormSchema } from "@/shared/shema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Star } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const UserEditForm: React.FC<UserEditFormProps> = ({ user, onSubmit, onCancel, isLoading = false }) => {
  const { t } = useTranslation();

  const form = useForm<UserEditFormData>({
    resolver: zodResolver(userFormSchema(t)),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "",
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (values: UserEditFormData) => {
    await onSubmit(values);
  };

  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Card className="h-full w-full">
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-end gap-1">
                    <FormLabel className="text-sm font-normal text-slate-700">{t("user.table_name")}</FormLabel>
                    <Star fill="#EF4444" className="size-2 text-red-500" />
                  </div>
                  <FormControl>
                    <Input {...field} id="name" placeholder={t("user.filter_name_placeholder")} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-end gap-1">
                    <FormLabel className="text-sm font-normal text-slate-700">{t("user.table_email")}</FormLabel>
                    <Star fill="#EF4444" className="size-2 text-red-500" />
                  </div>
                  <FormControl>
                    <Input {...field} id="email" type="email" placeholder={t("user.filter_email_placeholder")} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-end gap-1">
                    <FormLabel className="text-sm font-normal text-slate-700">{t("user.table_phone")}</FormLabel>
                    <Star fill="#EF4444" className="size-2 text-red-500" />
                  </div>
                  <FormControl>
                    <Input {...field} id="phone" placeholder={t("user.filter_phone_placeholder")} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-end gap-1">
                    <FormLabel className="text-sm font-normal text-slate-700">{t("user.table_role")}</FormLabel>
                    <Star fill="#EF4444" className="size-2 text-red-500" />
                  </div>
                  <FormControl>
                    <select
                      className="flex h-12 w-full rounded border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 transition-colors"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      disabled={isLoading}
                    >
                      <option value="admin">admin</option>
                      <option value="staff">staff</option>
                      <option value="user">user</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading} className="flex-1 bg-red-500 text-white hover:bg-red-600">
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    {t("common.update")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  );
};

export default UserEditForm;

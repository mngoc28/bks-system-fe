import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EditAmenityDialogProps } from "@/dataHelper/amenity.dataHelper";
import { amenityFormSchema } from "@/shared/shema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

/**
 * Edit Amenity Dialog
 * Provides a form to update an existing amenity's name.
 */
const EditAmenityDialog: React.FC<EditAmenityDialogProps> = ({ amenity, isOpen, isLoading = false, serverError, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const schema = amenityFormSchema(t);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (amenity) {
      form.reset({
        name: amenity.name,
      });
    }
  }, [amenity, form]);

  useEffect(() => {
    if (serverError) {
      form.setError("name", {
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="size-5" />
            {t("amenities.edit_amenity")}
          </DialogTitle>
          <DialogDescription>{t("amenities.edit_amenity_description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("amenities.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("amenities.name_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAmenityDialog;
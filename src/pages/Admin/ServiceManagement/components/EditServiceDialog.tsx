import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import InputNumber from "@/components/ui/inputNumber"
import { EditServiceDialogProps } from "@/dataHelper/service.dataHelper"
import { editServiceSchema } from "@/shared/shema"
import { zodResolver } from "@hookform/resolvers/zod"
import { t } from "i18next"
import { Loader2, Plus, Star } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import z from "zod"

/**
 * Edit Service Dialog
 * A modification form pre-populated with existing service details, allowing managers to update names, descriptions, or pricing.
 */
const EditServiceDialog: React.FC<EditServiceDialogProps> = ({ service, isOpen, isLoading = false, editServerError, onClose, onSubmit }) => {
    const schema = editServiceSchema(t);
    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: {
            name: "",
            price: "",
            description: "",
        }
    })

    useEffect(() => {
        if (service) {
            form.reset({
                name: service.name,
                price: service.price ? Math.floor(Number(service.price)).toString() : "",
                description: service.description,
            });
        }
    }, [service, form]);

    useEffect(() => {
        if (editServerError) {
            form.setError("name", {
                type: "server",
                message: editServerError,
            });
        }
    }, [editServerError, form]);

    const handleOpenChange = (open: boolean) => {
        if (!open && !isLoading) {
            form.reset();
            onClose();
        }
    };

    const handleSubmit = (data: z.infer<typeof schema>) => {
        onSubmit(data);
        form.reset();
    };
    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="size-5" />
                        {t("serviceManagement.edit_service")}
                    </DialogTitle>
                    <DialogDescription>{t("serviceManagement.edit_service_description")}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="flex items-center justify-start gap-1">
                            <FormLabel className="text-sm font-normal text-slate-700">{t("serviceManagement.name")}</FormLabel>
                            <Star fill="#EF4444" className="size-2 text-red-500" />
                        </div>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-1">
                                    <FormControl>
                                        <Input placeholder={t("serviceManagement.name_placeholder")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center justify-start gap-1">
                            <FormLabel className="text-sm font-normal text-slate-700">{t("serviceManagement.price")}</FormLabel>
                            <Star fill="#EF4444" className="size-2 text-red-500" />
                        </div>
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-1">
                                    <FormControl>
                                        <InputNumber
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                            placeholder={t("serviceManagement.price_placeholder")}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center justify-start gap-1">
                            <FormLabel className="text-sm font-normal text-slate-700">{t("serviceManagement.description")}</FormLabel>
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder={t("serviceManagement.description_placeholder")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="flex-row gap-3 pt-4 sm:gap-3">
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

export default EditServiceDialog;
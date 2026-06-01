import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import InputNumber from "@/components/ui/inputNumber"
import { AddServiceDialogProps } from "@/dataHelper/service.dataHelper"
import { addServiceSchema } from "@/shared/shema"
import { zodResolver } from "@hookform/resolvers/zod"
import { t } from "i18next"
import { Plus, Star } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import z from "zod"
import { Spinner } from "@/components/ui/spinner"

/**
 * Add Service Dialog
 * A modal form for defining a new service offering, including validation to ensure service names are unique within the system.
 */
const AddServiceDialog: React.FC<AddServiceDialogProps> = ({ isOpen, isLoading = false, serverError, existingServices = [], onClose, onSubmit }) => {
    const schema = addServiceSchema(t, existingServices);
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
        form.reset();
    };
    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="size-5" />
                        {t("serviceManagement.add_service")}
                    </DialogTitle>
                    <DialogDescription>{t("serviceManagement.add_service_description")}</DialogDescription>
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
                                <FormItem className="flex flex-col gap-1" >
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
                            name="price"
                            control={form.control}
                            render={({ field }) => (
                                <InputNumber
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    placeholder={t("serviceManagement.price_placeholder")}
                                />
                            )}
                        />
                        <div className="flex items-center justify-start gap-1">
                            <FormLabel className="text-sm font-normal text-slate-700">{t("serviceManagement.description")}</FormLabel>
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem >
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
                                {isLoading && <Spinner size="sm" />}
                                {t("common.add")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AddServiceDialog;
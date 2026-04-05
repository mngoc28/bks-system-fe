import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlainTextarea } from "@/components/ui/textarea";
import { ROUTERS } from "@/constant";
import { PartnerUpdate } from "@/dataHelper/partner.dataHelper";
import { usePartnerQuery, useUpdatePartnerQuery } from "@/hooks/usePartnerQuery";
import { editPartnerSchema } from "@/shared/shema";
import { appendImageField } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, SaveIcon, XIcon } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

/**
 * Partner Edit Page
 * Provides a form interface for managers to update partner information, including company details and branding images.
 */
const PartnerEdit: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const VITE_IMAGES_URL = import.meta.env.VITE_IMAGES_URL;
    const { id } = useParams<{ id: string }>();
    const partnerId = id ? parseInt(id, 10) : 0;

    // ===== API =====
    const { data: partnerData } = usePartnerQuery(partnerId);
    const partner = partnerData?.data ?? null;
    const { mutateAsync: updatePartner } = useUpdatePartnerQuery();

    // ===== FORM =====
    const schema = editPartnerSchema(t);
    const form = useForm<PartnerUpdate>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: {
            company_name: partner?.company_name || "",
            phone: partner?.phone || "",
            address: partner?.address || "",
            website: partner?.website || "",
            description: partner?.description || "",
            image_1: null,
            image_2: null,
            image_3: null,
        },
    });

    // ===== RESET FORM WHEN DATA LOADED =====
    useEffect(() => {
        if (partner) {
            form.reset({
                company_name: partner.company_name ?? "",
                phone: partner.phone ?? "",
                address: partner.address ?? "",
                website: partner.website ?? "",
                description: partner.description ?? "",
                image_1: null,
                image_2: null,
                image_3: null,
            });
        }
    }, [partner]);

    // ===== SUBMIT =====
    const handleEditPartner = form.handleSubmit(async (data) => {
        const formData = new FormData();
        formData.append("company_name", data.company_name || "");
        formData.append("phone", data.phone || "");
        formData.append("address", data.address || "");
        formData.append("website", data.website || "");
        formData.append("description", data.description || "");
        appendImageField(formData, "image_1", data.image_1);
        appendImageField(formData, "image_2", data.image_2);
        appendImageField(formData, "image_3", data.image_3);

        await updatePartner({
            id: partnerId,
            data: formData as any,
        });
        navigate(`${ROUTERS.PARTNER_DETAIL}/${partnerId}`);
    });

    const handlePartners = () => {
        navigate(ROUTERS.PARTNER_MANAGEMENT);
    };

    return (
        <>
            <div className="flex flex-col pl-3 pr-3 sm:pl-6 sm:pr-6 gap-y-10 pt-5">
                {/* ===== HEADER ===== */}
                <div className="flex flex-row justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 py-3">
                        {t("partner.edit_partner_title")}
                    </h2>

                    <div className="flex flex-row gap-3">
                        <Button
                            variant="outline"
                            className="bg-blue-500 text-white hover:bg-blue-600 h-11"
                            onClick={handleEditPartner}
                        >
                            <SaveIcon className="size-5" />
                            <span className="hidden lg:block">
                                {t("common.save")}
                            </span>
                        </Button>

                        <Button
                            variant="outline"
                            className="bg-gray-600 text-white hover:bg-gray-700 h-11"
                            onClick={handlePartners}
                        >
                            <ArrowLeftIcon className="size-5" />
                            <span className="hidden lg:block">{t("common.back")}</span>
                        </Button>
                    </div>
                </div>

                {/* ===== FORM ===== */}
                {partner && <Form {...form}>
                    <form className="space-y-6">
                        {/* Read-only fields */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <FormLabel>{t("partner.user_name")}</FormLabel>
                                <div className="p-3 border rounded-md bg-slate-50 min-h-[48px]">{partner?.user_name || ""}</div>
                            </div>
                            <div className="space-y-2">
                                <FormLabel>{t("partner.province_name")}</FormLabel>
                                <div className="p-3 border rounded-md bg-slate-50 min-h-[48px]">{partner?.province_name || ""}</div>
                            </div>
                            <div className="space-y-1">
                                <FormLabel>{t("partner.ward_name")}</FormLabel>
                                <div className="p-3 border rounded-md bg-slate-50 min-h-[48px]">{partner?.ward_name || ""}</div>
                            </div>
                        </div>
                        {/* Editable fields */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="company_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("partner.company_name")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("partner.company_name_placeholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("partner.website")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("partner.website_placeholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("partner.phone")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("partner.phone_placeholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("partner.address")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("partner.address_placeholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("partner.description")}</FormLabel>
                                        <FormControl>
                                            <PlainTextarea placeholder={t("partner.description_placeholder")} {...field} rows={2} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Image uploads */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-6">
                            {[1, 2, 3].map((num) => {
                                const fieldName = `image_${num}` as any;
                                const existingImage = partner?.[fieldName as keyof typeof partner] as string | undefined;

                                return (
                                    <FormField
                                        key={num}
                                        control={form.control}
                                        name={fieldName}
                                        render={({ field: { onChange, value } }) => {
                                            const previewUrl = value instanceof File ? URL.createObjectURL(value) : null;
                                            const displayImage = previewUrl || (existingImage && value !== 'delete' ? `${VITE_IMAGES_URL}${existingImage}` : null);

                                            return (
                                                <FormItem>
                                                    <FormLabel>{t("partner.image")} {num}</FormLabel>
                                                    <FormControl>
                                                        <div className="relative border-2 border-dashed rounded-lg p-4 hover:border-gray-400 transition-colors">
                                                            {displayImage ? (
                                                                <div className="relative group">
                                                                    <img
                                                                        src={displayImage}
                                                                        alt={`Image ${num}`}
                                                                        onError={(e) => (e.currentTarget.src = "/assets/images/photo_error.png")}
                                                                        className="w-full aspect-square object-cover rounded cursor-pointer"
                                                                        onClick={() => document.getElementById(`file-${num}`)?.click()}
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        className="absolute top-2 right-2"
                                                                        onClick={() => onChange('delete')}
                                                                    >
                                                                        <XIcon className="size-4" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className="flex flex-col items-center justify-center aspect-square cursor-pointer"
                                                                    onClick={() => document.getElementById(`file-${num}`)?.click()}
                                                                >
                                                                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                    </svg>
                                                                    <span className="text-sm text-gray-500">{t('partner.seclect_image')}</span>
                                                                </div>
                                                            )}
                                                            <input
                                                                id={`file-${num}`}
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0] ?? "";
                                                                    if (file) onChange(file);
                                                                }}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            );
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </form>
                </Form>}
            </div>
        </>
    );
};

export default PartnerEdit;

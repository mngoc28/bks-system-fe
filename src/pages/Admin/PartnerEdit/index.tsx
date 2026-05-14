import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlainTextarea } from "@/components/ui/textarea";
import { CLOUDINARY_HEADER_IMAGE_URL, IMAGE_ALLOWED_TYPES, IMAGE_MAX_SIZE, ROUTERS } from "@/constant";
import { PartnerUpdate } from "@/dataHelper/partner.dataHelper";
import { usePartnerQuery, useUpdatePartnerQuery } from "@/hooks/usePartnerQuery";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetWardsByProvinceId } from "@/hooks/useWardQuery";
import { editPartnerSchema } from "@/shared/shema";
import { resolveImageUrl } from "@/utils/imageUtils";
import { appendImageField } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, SaveIcon, XIcon, Star } from "lucide-react";
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
    const { id } = useParams<{ id: string }>();
    const partnerId = id ? parseInt(id, 10) : 0;

    // ===== API =====
    const { data: partnerData } = usePartnerQuery(partnerId);
    const partner = partnerData?.data ?? null;
    const { mutateAsync: updatePartner } = useUpdatePartnerQuery();
    const { data: provincesData } = useGetAllProvincesTypes();
    const provinces = provincesData?.data || [];

    // ===== FORM =====
    const schema = editPartnerSchema(t);
    const form = useForm<PartnerUpdate>({
        resolver: zodResolver(schema),
        mode: "onSubmit",
        defaultValues: {
            company_name: partner?.company_name || "",
            province_id: partner?.province_id || 0,
            ward_id: partner?.ward_id || 0,
            phone: partner?.phone || "",
            address: partner?.address || "",
            website: partner?.website || "",
            description: partner?.description || "",
            image_1: null,
            image_2: null,
            image_3: null,
        },
    });
    const IMAGE_FIELDS = ["image_1", "image_2", "image_3"] as const;

    // Ward handling
    const provinceId = form.watch("province_id");
    const { data: wardsResponse, isFetching: isWardsLoading } = useGetWardsByProvinceId(Number(provinceId));
    const wards = wardsResponse?.data || [];

    // ===== RESET FORM WHEN DATA LOADED =====
    useEffect(() => {
        if (partner) {
            form.reset({
                company_name: partner.company_name ?? "",
                province_id: partner.province_id ?? 0,
                ward_id: partner.ward_id ?? 0,
                phone: partner.phone ?? "",
                address: partner.address ?? "",
                website: partner.website ?? "",
                description: partner.description ?? "",
                image_1: null,
                image_2: null,
                image_3: null,
            });
        }
    }, [partner, form]);

    // ===== SUBMIT =====
    const handleEditPartner = form.handleSubmit(async (data) => {
        const formData = new FormData();
        formData.append("company_name", data.company_name || "");
        formData.append("province_id", (data.province_id || 0).toString());
        formData.append("ward_id", (data.ward_id || 0).toString());
        formData.append("phone", data.phone || "");
        formData.append("address", data.address || "");
        formData.append("website", data.website || "");
        formData.append("description", data.description || "");
        appendImageField(formData, "image_1", data.image_1);
        appendImageField(formData, "image_2", data.image_2);
        appendImageField(formData, "image_3", data.image_3);

        await updatePartner({
            id: partnerId,
            data: formData,
        });
        navigate(`${ROUTERS.PARTNER_MANAGEMENT}/detail/${partnerId}`);
    });

    const handleSavePartner = async () => {
        const hasImageError = IMAGE_FIELDS.some((fieldName) => Boolean(form.getFieldState(fieldName).error));
        if (hasImageError) return;
        await handleEditPartner();
    };

    const handlePartners = () => {
        navigate(ROUTERS.PARTNER_MANAGEMENT);
    };

    return (
        <>
            <div className="flex flex-col gap-y-10 px-3 pb-10 pt-5 sm:px-6">
                {/* ===== HEADER ===== */}
                <div className="flex flex-row items-center justify-between">
                    <h2 className="py-3 text-2xl font-bold text-gray-900">
                        {t("partner.edit_partner_title")}
                    </h2>

                    <div className="flex flex-row gap-3">
                        <Button
                            variant="outline"
                            className="h-11 bg-blue-500 text-white hover:bg-blue-600"
                            onClick={() => void handleSavePartner()}
                        >
                            <SaveIcon className="size-5" />
                            <span className="hidden lg:block">
                                {t("common.save")}
                            </span>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-11 bg-gray-600 text-white hover:bg-gray-700"
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
                        {/* Information Grid */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {/* Read-only Agent */}
                            <div className="space-y-2">
                                <FormLabel>{t("partner.user_name")}</FormLabel>
                                <div className="flex min-h-[48px] items-center rounded-md border bg-slate-50 p-3">{partner?.user_name || ""}</div>
                            </div>

                            {/* Company Name */}
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
                        </div>

                        {/* Location Selects */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="province_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-1">
                                            <FormLabel>{t("partner.province_name")}</FormLabel>
                                            <Star fill="#EF4444" className="size-2 text-red-500" />
                                        </div>
                                        <Select 
                                            onValueChange={(val) => {
                                                const nextProvinceId = Number(val);
                                                const currentProvinceId = Number(form.getValues("province_id") || 0);
                                                field.onChange(nextProvinceId);
                                                if (currentProvinceId !== nextProvinceId) {
                                                    form.setValue("ward_id", 0);
                                                }
                                            }} 
                                            value={field.value?.toString() || ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("properties.province_name_placeholder")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {provinces.map((prov) => (
                                                    <SelectItem key={prov.id} value={prov.id.toString()}>
                                                        {prov.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ward_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-1">
                                            <FormLabel>{t("partner.ward_name")}</FormLabel>
                                            <Star fill="#EF4444" className="size-2 text-red-500" />
                                        </div>
                                        <Select 
                                            onValueChange={(val) => field.onChange(Number(val))} 
                                            value={field.value?.toString() || ""}
                                            disabled={!provinceId || isWardsLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue 
                                                        placeholder={
                                                            !provinceId 
                                                                ? "Chọn tỉnh thành trước" 
                                                                : (isWardsLoading ? t("common.loading") : t("properties.ward_name_placeholder"))
                                                        } 
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {wards.map((ward) => (
                                                    <SelectItem key={ward.id} value={ward.id.toString()}>
                                                        {ward.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {/* Phone */}
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

                            {/* Website */}
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

                        {/* Address Detail */}
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

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("partner.description")}</FormLabel>
                                    <FormControl>
                                        <PlainTextarea placeholder={t("partner.description_placeholder")} {...field} rows={3} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Image uploads */}
                        <div className="grid grid-cols-1 gap-4 pb-6 lg:grid-cols-3">
                            {[1, 2, 3].map((num) => {
                                const fieldName = `image_${num}` as "image_1" | "image_2" | "image_3";
                                const existingImage = partner?.[fieldName as keyof typeof partner] as string | undefined;

                                return (
                                    <FormField
                                        key={num}
                                        control={form.control}
                                        name={fieldName}
                                        render={({ field: { onChange: onFieldChange, value } }) => {
                                            const previewUrl = value instanceof File ? URL.createObjectURL(value) : null;
                                            const displayImage = previewUrl || (value !== 'delete'
                                                ? resolveImageUrl(existingImage, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL })
                                                : null);

                                            return (
                                                <FormItem>
                                                    <FormLabel>{t("partner.image")} {num}</FormLabel>
                                                    <FormControl>
                                                        <div className="relative rounded-lg border-2 border-dashed p-4 transition-colors hover:border-gray-400">
                                                            {displayImage ? (
                                                                <div className="group relative">
                                                                    <img
                                                                        src={displayImage}
                                                                        alt={`Image ${num}`}
                                                                        onError={(e) => (e.currentTarget.src = "/assets/images/photo_error2.png")}
                                                                        className="aspect-square w-full cursor-pointer rounded object-cover"
                                                                        onClick={() => document.getElementById(`file-${num}`)?.click()}
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        className="absolute right-2 top-2"
                                                                        onClick={() => onFieldChange('delete')}
                                                                    >
                                                                        <XIcon className="size-4" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className="flex aspect-square cursor-pointer flex-col items-center justify-center"
                                                                    onClick={() => document.getElementById(`file-${num}`)?.click()}
                                                                >
                                                                    <svg className="mb-2 size-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                                    const file = e.target.files?.[0] ?? null;
                                                                    if (!file) return;

                                                                    if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
                                                                        form.setError(fieldName, {
                                                                            type: "manual",
                                                                            message: t('partner.accepted_file_types'),
                                                                        });
                                                                        onFieldChange(null);
                                                                        e.currentTarget.value = "";
                                                                        return;
                                                                    }

                                                                    if (file.size > IMAGE_MAX_SIZE) {
                                                                        form.setError(fieldName, {
                                                                            type: "manual",
                                                                            message: t('partner.file_size_limit'),
                                                                        });
                                                                        onFieldChange(null);
                                                                        e.currentTarget.value = "";
                                                                        return;
                                                                    }

                                                                    form.clearErrors(fieldName);
                                                                    onFieldChange(file);
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


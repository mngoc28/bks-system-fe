import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProvinceDetailFormProps } from "@/dataHelper/province.dataHelper";
import React from "react";
import { useTranslation } from "react-i18next";
import { Hash, MapPinned, Upload, X, Edit, Save } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useUploadImageMutation, useDeleteImageMutation } from "@/hooks/useCloudinariQuery";
import { useUpdateProvinceMutation } from "@/hooks/useProvinceQuery";
import { toastError } from "@/components/ui/toast";
import { resolveCloudinaryUrl } from "@/utils/imageUtils";
import { CLOUDINARY_HEADER_IMAGE_URL, IMAGE_MAX_SIZE } from "@/constant";

/**
 * Province Detail Form
 * Renders the full details of a province and allows updating fields (name, name_en, image) with Cloudinary upload & rollback.
 */
const ProvinceDetailForm: React.FC<ProvinceDetailFormProps> = ({
    onCancel,
    isLoading: isProvinceLoading,
    province
}) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = React.useState(false);
    const [name, setName] = React.useState("");
    const [nameEn, setNameEn] = React.useState("");
    const [imageUrl, setImageUrl] = React.useState("");

    const [localImageFile, setLocalImageFile] = React.useState<File | null>(null);
    const [localImagePreview, setLocalImagePreview] = React.useState<string>("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [wardSearch, setWardSearch] = React.useState("");

    const uploadImageMutation = useUploadImageMutation();
    const deleteImageMutation = useDeleteImageMutation();
    const updateProvinceMutation = useUpdateProvinceMutation();

    React.useEffect(() => {
        if (province) {
            setName(province.name || "");
            setNameEn(province.name_en || "");
            setImageUrl(province.image || "");
            setLocalImageFile(null);
            setLocalImagePreview("");
        }
    }, [province]);

    React.useEffect(() => {
        return () => {
            if (localImagePreview) {
                URL.revokeObjectURL(localImagePreview);
            }
        };
    }, [localImagePreview]);

    if (isProvinceLoading) {
        return (
            <div className="flex flex-col gap-6 p-3 sm:p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{t("province.detail_province")}</h2>
                </div>
                <Card>
                    <CardContent className="flex min-h-[200px] items-center justify-center p-6">
                        <Spinner size="md" showText text={t("common.loading_data")} />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!province) {
        return (
            <div className="flex flex-col gap-6 p-3 sm:p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{t("province.detail_province")}</h2>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-slate-500">{t("province.province_not_found")}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleSelectImage = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toastError("Định dạng file không hợp lệ. Vui lòng chọn ảnh.");
                return;
            }
            if (file.size > IMAGE_MAX_SIZE) {
                toastError("Kích thước file quá lớn (tối đa 5MB).");
                return;
            }
            setLocalImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setLocalImagePreview(previewUrl);
        }
    };

    const handleRemoveImage = () => {
        setLocalImageFile(null);
        setLocalImagePreview("");
        setImageUrl("");
    };

    /**
     * Extract the Cloudinary public_id from the stored relative path.
     * Stored path example: "/v1748779123/provinces/danang.webp"
     * Resulting public_id:  "provinces/danang"
     */
    const extractCloudinaryPublicId = (storedPath: string): string | null => {
        try {
            let path = storedPath.startsWith("/") ? storedPath.slice(1) : storedPath;
            // Strip version prefix (e.g. "v1748779123/")
            path = path.replace(/^v\d+\//, "");
            // Strip file extension
            path = path.replace(/\.[^.]+$/, "");
            return path || null;
        } catch {
            return null;
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toastError("Tên tỉnh/thành phố không được để trống");
            return;
        }

        // Remember the existing Cloudinary path BEFORE upload so we can clean it up afterward
        const oldImagePath = province.image || null;

        let uploadedImageId: string | null = null;
        let finalImageUrl = imageUrl;

        try {
            if (localImageFile) {
                const uploadResult = await uploadImageMutation.mutateAsync({
                    image: localImageFile,
                    folder: "provinces",
                });
                finalImageUrl = uploadResult.data?.url || "";
                uploadedImageId = uploadResult.data?.public_id || null;
            }

            await updateProvinceMutation.mutateAsync({
                id: province.id,
                data: {
                    name: name.trim(),
                    name_en: nameEn.trim(),
                    image: finalImageUrl || null,
                },
            });

            // DB saved successfully — delete the OLD Cloudinary image to prevent orphaned assets
            if (localImageFile && oldImagePath) {
                const oldPublicId = extractCloudinaryPublicId(oldImagePath);
                if (oldPublicId) {
                    try {
                        await deleteImageMutation.mutateAsync(oldPublicId);
                    } catch (err) {
                        // Non-fatal: log but do not block the user
                        console.error("Failed to delete old province image from Cloudinary:", err);
                    }
                }
            }

            setIsEditing(false);
        } catch {
            // Rollback: delete the newly uploaded image from Cloudinary if database save failed
            if (uploadedImageId) {
                try {
                    await deleteImageMutation.mutateAsync(uploadedImageId);
                } catch (err) {
                    console.error("Rollback image failed:", err);
                }
            }
        }
    };


    const handleCancelEdit = () => {
        setName(province.name || "");
        setNameEn(province.name_en || "");
        setImageUrl(province.image || "");
        setLocalImageFile(null);
        setLocalImagePreview("");
        setIsEditing(false);
    };

    // imageUrl stored in DB is the path after the Cloudinary base URL (e.g. /v1.../provinces/abc.webp).
    // Use resolveCloudinaryUrl which correctly prepends the base regardless of leading slashes.
    const displayImageSrc = localImagePreview || resolveCloudinaryUrl(imageUrl, CLOUDINARY_HEADER_IMAGE_URL) || "";

    const isPending = uploadImageMutation.isPending || updateProvinceMutation.isPending;

    return (
        <div className="flex flex-col gap-6 p-3 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white pb-4">
                <h2 className="text-2xl font-bold text-slate-800">{t("province.detail_province")}</h2>
                <div className="flex items-center gap-3">
                    {!isEditing ? (
                        <>
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="h-[40px] rounded-md bg-blue-600 px-4 py-1 text-[15px] text-white hover:bg-blue-500 flex items-center gap-1.5"
                            >
                                <Edit className="size-4" />
                                {t("common.edit")}
                            </Button>
                            <Button
                                onClick={onCancel}
                                className="h-[40px] rounded-md bg-gray-600 px-4 py-1 text-[15px] text-white hover:bg-gray-500"
                            >
                                {t("province.back")}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={handleSave}
                                disabled={isPending}
                                className="h-[40px] rounded-md bg-emerald-600 px-4 py-1 text-[15px] text-white hover:bg-emerald-500 flex items-center gap-1.5"
                            >
                                {isPending ? (
                                    <Spinner size="sm" className="text-white" />
                                ) : (
                                    <Save className="size-4" />
                                )}
                                {t("common.save")}
                            </Button>
                            <Button
                                onClick={handleCancelEdit}
                                disabled={isPending}
                                className="h-[40px] rounded-md bg-gray-600 px-4 py-1 text-[15px] text-white hover:bg-gray-500"
                            >
                                {t("common.cancel")}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="grid grid-cols-10">
                    <div className="col-span-3 md:col-span-2 border-b border-slate-200 bg-slate-50 p-4 font-medium flex items-center">
                        {t("province.id")}
                    </div>
                    <div className="col-span-7 md:col-span-8 border-b border-slate-200 p-4 flex items-center">
                        {province.id}
                    </div>

                    <div className="col-span-3 md:col-span-2 border-b border-slate-200 bg-slate-50 p-4 font-medium flex items-center">
                        {t("province.name")}
                    </div>
                    <div className="col-span-7 md:col-span-8 border-b border-slate-200 p-4">
                        {isEditing ? (
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isPending}
                                className="max-w-md"
                            />
                        ) : (
                            province.name
                        )}
                    </div>

                    <div className="col-span-3 md:col-span-2 border-b border-slate-200 bg-slate-50 p-4 font-medium flex items-center">
                        {t("province.name_en")}
                    </div>
                    <div className="col-span-7 md:col-span-8 border-b border-slate-200 p-4">
                        {isEditing ? (
                            <Input
                                value={nameEn}
                                onChange={(e) => setNameEn(e.target.value)}
                                disabled={isPending}
                                className="max-w-md"
                            />
                        ) : (
                            province.name_en || "-"
                        )}
                    </div>

                    <div className="col-span-3 md:col-span-2 border-b border-slate-200 bg-slate-50 p-4 font-medium flex items-center">
                        {t("province.province_image")}
                    </div>
                    <div className="col-span-7 md:col-span-8 border-b border-slate-200 p-4">
                        <div className="flex flex-col gap-3">
                            {displayImageSrc ? (
                                <div className="relative w-72 h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                                    <img
                                        src={displayImageSrc}
                                        alt="Province Cover"
                                        className="size-full object-cover"
                                    />
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            disabled={isPending}
                                            className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-1.5 rounded-full transition-all"
                                            title={t("province.delete_image")}
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="w-72 h-44 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-slate-50 text-sm">
                                    <span>{t("province.no_image")}</span>
                                    <span className="text-xs text-slate-400 mt-1">{t("province.use_default_image")}</span>
                                </div>
                            )}

                            {isEditing && (
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        onClick={handleSelectImage}
                                        disabled={isPending}
                                        variant="outline"
                                        className="rounded-xl flex items-center gap-2"
                                    >
                                        <Upload className="size-4" />
                                        {t("province.upload_image")}
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-3 md:col-span-2 border-b border-slate-200 bg-slate-50 p-4 font-medium flex items-center">
                        {t("province.ward")}
                    </div>
                    <div className="col-span-7 md:col-span-8 border-b border-slate-200 p-4 flex items-center">
                        {province.ward_count || 0}
                    </div>

                    <div className="col-span-3 md:col-span-2 bg-slate-50 p-4 font-medium flex items-center">
                        {t("province.room")}
                    </div>
                    <div className="col-span-7 md:col-span-8 p-4 flex items-center">
                        {province.room_count || 0}
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                        <MapPinned className="size-5" />
                        {t("province.ward_list")}
                    </CardTitle>
                    <div className="w-full sm:w-72">
                        <Input
                            placeholder={t("province.search_ward_placeholder")}
                            value={wardSearch}
                            onChange={(e) => setWardSearch(e.target.value)}
                            className="h-9 rounded-xl"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                        {(() => {
                            const filteredWards = (province.wards || []).filter((ward) => {
                                const searchVal = wardSearch.toLowerCase().trim();
                                if (!searchVal) return true;
                                return (
                                    ward.id.toString().includes(searchVal) ||
                                    ward.name.toLowerCase().includes(searchVal)
                                );
                            });

                            return filteredWards.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredWards.map((ward) => (
                                        <div
                                            key={ward.id}
                                            className="rounded-lg border border-slate-200 p-3 transition-colors bg-white hover:bg-slate-50"
                                        >
                                            <div className="mb-1 flex items-center gap-2 text-slate-500">
                                                <Hash className="size-4" />
                                                <span className="text-sm font-medium">{ward.id}</span>
                                            </div>
                                            <p className="font-semibold text-slate-800">{ward.name}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <MapPinned className="mx-auto mb-2 size-12 text-slate-300" />
                                    <p className="text-sm text-slate-400">{t("province.no_wards")}</p>
                                </div>
                            );
                        })()}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default ProvinceDetailForm;
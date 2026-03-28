import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ImageLightbox from "@/components/ui/image-lightbox";
import { Input, ReactQuillEditor } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { CLOUDINARY_HEADER_IMAGE_URL, IMAGE_MAX_SIZE, ROUTERS } from "@/constant";
import { NewsFormCreate } from "@/dataHelper/news.dataHelper";
import { useCreateNewsMutation } from "@/hooks/useNewsQuery";
import { useUploadImageMutation } from "@/hooks/useCloudinariQuery";
import { DEFAULT_STATUS_NEWS } from "@/constant";
import { newsFormSchema } from "@/shared/shema";
import { formatDateTimeLocal, statusNewsArray } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, Star, Upload } from "lucide-react";
import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useGetUserProfileQuery } from "@/hooks/useUserQuery";
import { generateSlug } from "@/utils/stringUtils";

const NewsAdd: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: profileData } = useGetUserProfileQuery();
    const userId = profileData?.data?.id ?? 0;
    // form
    const form = useForm<NewsFormCreate>({
        resolver: zodResolver(newsFormSchema(t)),
        defaultValues: {
            title: "",
            summary: "",
            content: "",
            status: DEFAULT_STATUS_NEWS,
            published_at: new Date(),
            image_url: "",
            id_image_cloudinary: "",
        },
        mode: "onSubmit",
    });
    // back to news list
    const handleBack = () => {
        navigate(ROUTERS.NEWS);
    };

    const createNewsMutation = useCreateNewsMutation();
    const uploadImageMutation = useUploadImageMutation();
    // status array
    const status = statusNewsArray;

    // local image preview & file
    const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
    const [localImageFile, setLocalImageFile] = useState<File | null>(null);

    // file input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // image lightbox
    const [image, setImage] = useState<Array<{ src: string }>>([]);
    const [open, setOpen] = useState(false);

    // handle select image
    const handleSelectImage = () => {
        fileInputRef.current?.click();
    };

    // handle file change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        // Validate type
        if (!file.type.startsWith("image/")) {
            toastError(t("validation.image.invalid_type"));
            return;
        }

        // Validate size
        if (file.size > IMAGE_MAX_SIZE) {
            toastError(t("validation.image.too_large"));
            return;
        }

        setLocalImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setLocalImagePreview(previewUrl);
        setImage([{ src: previewUrl }]);

        // Set temporary values so zod validation passes; real values set after upload
        form.setValue("image_url", previewUrl);
        form.setValue("id_image_cloudinary", "local-temp-id");
    };

    // handle submit form
    const handleSubmit = async (data: NewsFormCreate) => {
        try {
            let imageUrl = data.image_url;
            let imageCloudinaryId = data.id_image_cloudinary;

            // Upload image to Cloudinary if selected
            if (localImageFile) {
                const uploadResult = await uploadImageMutation.mutateAsync({
                    image: localImageFile,
                    folder: "news/" + userId.toString(),
                });
                imageUrl = uploadResult.data?.url || "";
                imageCloudinaryId = uploadResult.data?.public_id || "";
            }

            // Call create news API with mapped data
            await createNewsMutation.mutateAsync({
                title: data.title.trim(),
                summary: data.summary?.trim() || "",
                content: data.content.trim(),
                status: data.status,
                published_at: data.published_at,
                image_url: imageUrl,
                id_image_cloudinary: imageCloudinaryId,
            });

            toastSuccess(t("news.create_success"));
            navigate(ROUTERS.NEWS);
        } catch (error) {
            toastError(t("news.create_failed"));
        }
    };

    console.log(form.getValues());
    return (
        <>
            <div className="flex flex-col gap-10 p-3 sm:p-6 pt-5">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">
                                {t("news_edit.title")}
                            </h2>
                            <Button onClick={handleBack} className="text-white bg-gray-600 hover:bg-gray-700">
                                <ArrowLeftIcon className="size-4" />
                                <span className="hidden lg:block">
                                    {t("news_edit.back")}

                                </span>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="col-span-2 flex flex-col gap-5">
                                        {/* news name */}
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2">
                                                        <FormLabel>{t("news_edit.news_name")}</FormLabel>
                                                        <Star fill="#EF4444" className="size-2 text-red-500" />
                                                    </div>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* slug */}
                                        <div>
                                                <FormLabel>{t("news_edit.slug")}</FormLabel>
                                                <p className="flex text-[14px] text-gray-500 border border-gray-300 rounded-md p-2 h-[50px] items-center justify-start">
                                                    {generateSlug(form.getValues("title").trim() || "")}
                                                </p>
                                            </div>
                                        {/* summary */}
                                        <FormField
                                            control={form.control}
                                            name="summary"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("news_edit.summary")}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {/* content */}
                                        <FormField
                                            control={form.control}
                                            name="content"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2">
                                                        <FormLabel>{t("news_edit.content")}</FormLabel>
                                                        <Star fill="#EF4444" className="size-2 text-red-500" />
                                                    </div>
                                                    <FormControl>
                                                        <ReactQuillEditor
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {/* status */}
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2">
                                                        <FormLabel>{t("news_edit.status")}</FormLabel>
                                                        <Star fill="#EF4444" className="size-2 text-red-500" />
                                                    </div>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                            defaultValue={field.value.toString()}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={t("news_edit.status")} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {status.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value.toString()}>
                                                                        {t(option.label as string)}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {/** published_at */}
                                        <FormField
                                            control={form.control}
                                            name="published_at"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t("news_edit.published_at")}</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="datetime-local"
                                                            value={field.value ? formatDateTimeLocal(field.value) : ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value) {
                                                                    field.onChange(new Date(value));
                                                                } else {
                                                                    field.onChange(null);
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {/** image */}
                                        <FormField
                                            control={form.control}
                                            name="image_url"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2">
                                                        <FormLabel>{t("news_edit.image_url")}</FormLabel>
                                                        <Star fill="#EF4444" className="size-2 text-red-500" />
                                                    </div>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <img
                                                                src={localImagePreview || (field.value ? (field.value.startsWith('blob:') ? field.value : CLOUDINARY_HEADER_IMAGE_URL + '/' + field.value) : "/assets/images/photo_error.png")}
                                                                alt="image"
                                                                onClick={() => {

                                                                }}
                                                                className="w-[200px] h-[200px] object-cover rounded-md border border-gray-300"
                                                                onError={(e) => (e.currentTarget.src = "/assets/images/photo_error.png")}
                                                            />
                                                            <Button
                                                                type="button"
                                                                onClick={handleSelectImage}
                                                                className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
                                                                aria-label={t("news_edit.upload_image")}
                                                            >
                                                                {t("news_edit.upload_image")}
                                                                <Upload className="size-[15px]" />
                                                            </Button>
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleFileChange}
                                                                className="hidden"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4 mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleBack}
                                        className="bg-gray-600 hover:bg-gray-700 text-white"
                                    >
                                        {t("news_edit.cancel")}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={createNewsMutation.isPending || uploadImageMutation.isPending}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {createNewsMutation.isPending || uploadImageMutation.isPending
                                            ? t("news.isSave")
                                            : t("news_edit.save")}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
                <ImageLightbox
                    open={open}
                    onClose={() => setOpen(false)}
                    index={0}
                    slides={image || []}
                />
            </div>
        </>
    );
}

export default NewsAdd;
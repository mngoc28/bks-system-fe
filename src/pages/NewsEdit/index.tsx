import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ImageLightbox from "@/components/ui/image-lightbox";
import { Input, ReactQuillEditor } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CLOUDINARY_HEADER_IMAGE_URL, IMAGE_MAX_SIZE, ROUTERS } from "@/constant";
import { NewsFormCreate } from "@/dataHelper/news.dataHelper";
import { useNewsByIdQuery, useUpdateNewsMutation } from "@/hooks/useNewsQuery";
import { useDeleteImageMutation, useUploadImageMutation } from "@/hooks/useCloudinariQuery";
import { toastSuccess, toastError } from "@/components/ui/toast";
import { newsFormSchema } from "@/shared/shema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, Star, Upload } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ThreeDot } from "react-loading-indicators";
import { useNavigate, useParams } from "react-router";
import { formatDateTimeLocal, statusNewsArray } from "@/utils/utils";
import { generateSlug } from "@/utils/stringUtils";




const NewsEdit: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const idNews = id ? parseInt(id, 10) : 0;
    const { data: newsData, isLoading: newsLoading, isError } = useNewsByIdQuery(idNews);
    const news = newsData?.data;

    // image lightbox
    const [open, setOpen] = React.useState(false);
    const [image, setImage] = React.useState<Array<{ src: string }>>([]);

    // handle update image locale
    const [localImageFile, setLocalImageFile] = React.useState<File | null>(null);
    const [localImagePreview, setLocalImagePreview] = React.useState<string>("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const uploadImageMutation = useUploadImageMutation();
    const updateNewsMutation = useUpdateNewsMutation();
    const deleteImageMutation = useDeleteImageMutation();


    // form data
    const [formData] = React.useState<NewsFormCreate>({
        title: "",
        summary: "",
        content: "",
        status: 0,
        published_at: new Date(),
        image_url: "",
        id_image_cloudinary: "",
    });

    // handle form 
    const form = useForm<NewsFormCreate>({
        resolver: zodResolver(newsFormSchema(t)),
        defaultValues: formData,
        mode: "onSubmit",
    });

    // handle reset form
    React.useEffect(() => {
        if (news) {
            form.reset({
                title: news.title || "",
                summary: news.summary || "",
                content: news.content || "",
                status: news.status || 0,
                published_at: news.published_at ? new Date(news.published_at) : new Date(),
                image_url: news.image_url || "",
                id_image_cloudinary: news.id_image_cloudinary || "",
            });
            // update image for lightbox
            if (news.image_url) {
                setImage([{ src: CLOUDINARY_HEADER_IMAGE_URL + '/' + news.image_url }]);
            } else {
                setImage([]);
            }
            // Reset local image state
            setLocalImageFile(null);
            setLocalImagePreview("");
        }
    }, [news, form]);

    // Cleanup preview URL on unmount
    React.useEffect(() => {
        return () => {
            if (localImagePreview) {
                URL.revokeObjectURL(localImagePreview);
            }
        };
    }, [localImagePreview]);

    // handle back 
    const handleBack = () => {
        navigate(ROUTERS.NEWS_DETAIL + "/" + news?.id);
    }

    // handle select image from local
    const handleSelectImage = () => {
        fileInputRef.current?.click();
    }

    // handle file change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toastError(t("validation.image.invalid_type"));
                return;
            }
            // Validate file size (5MB)
            if (file.size > IMAGE_MAX_SIZE) {
                toastError(t("validation.image.too_large"));
                return;
            }
            setLocalImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setLocalImagePreview(previewUrl);
            // Update form field with preview URL temporarily
            form.setValue("image_url", previewUrl);
        }
    }

    // handle form submit
    const handleSubmit = async (data: NewsFormCreate) => {
        let uploadedImageId: string | null = null;
        try {
            let imageUrl = data.image_url;
            let imageCloudinaryId = data.id_image_cloudinary;

            if (localImageFile) {
                try {
                    const uploadResult = await uploadImageMutation.mutateAsync({
                        image: localImageFile,
                        folder: "news/" + news?.user_id
                    });
                    imageUrl = uploadResult.data?.url || "";
                    imageCloudinaryId = uploadResult.data?.public_id || "";
                    uploadedImageId = imageCloudinaryId;
                } catch (uploadError) {
                    toastError(t("validation.image.upload_failed"));
                    return;
                }
            }

            // Update news with new data
            try {
                await updateNewsMutation.mutateAsync({
                    ...news!,
                    title: data.title.trim() || news!.title,
                    summary: data.summary?.trim() || null,
                    content: data.content.trim() || news!.content,
                    status: data.status,
                    published_at: data.published_at ? data.published_at.toISOString() : news!.published_at,
                    image_url: imageUrl || news!.image_url || "",
                    id_image_cloudinary: imageCloudinaryId || news!.id_image_cloudinary || ""
                });
            } catch (updateError) {
                if (uploadedImageId) {
                    try {
                        console.log(uploadedImageId);
                        await deleteImageMutation.mutateAsync(uploadedImageId);
                    } catch (deleteError) {
                        console.log(deleteError);
                    }
                }
                toastError(t("news_edit.update_failed"));
                return;
            }
            toastSuccess(t("news_edit.update_success"));
            navigate(ROUTERS.NEWS_DETAIL + "/" + news?.id);
        } catch (error) {
            if (uploadedImageId) {
                try {
                    await deleteImageMutation.mutateAsync(uploadedImageId);
                } catch (deleteError) {
                    return;
                }
            }
            toastError(t("news_edit.update_failed"));
        }
    }
    // get array status
    const status = statusNewsArray;
    return (
        <>
            {newsLoading && <div className="flex h-full items-center justify-center">
                <ThreeDot variant="bounce" color="#064F80" size="large" />
            </div>}
            {isError && <div>{t("news_edit.update_failed")}</div>}
            {news && <>
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
                                            disabled={updateNewsMutation.isPending || uploadImageMutation.isPending}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            {updateNewsMutation.isPending || uploadImageMutation.isPending
                                                ? t("news_edit.isSave")
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
            </>}
        </>
    )
}
export default NewsEdit;
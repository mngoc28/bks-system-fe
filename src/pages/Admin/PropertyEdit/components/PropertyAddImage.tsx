import React from "react";
import { useTranslation } from "react-i18next";
import { PROPERTY_IMAGE_TYPE, DEFAULT_IMAGE_TYPE, HEADER_PROPERTY_CLOUDINARY } from "@/constant";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyAddImageProps, RequestPropertyImage } from "@/dataHelper/propertyImage.dataHelper";
import { Button } from "@/components/ui/button";
import { Save, TrashIcon } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ImageLightbox from "@/components/ui/image-lightbox";
import { toastError, toastSuccess, toastWarning } from "@/components/ui/toast";
import { useDeleteImageMutation, useUploadImageMutation } from "@/hooks/useCloudinariQuery";
import { useCreatePropertyImageMutation } from "@/hooks/usePropertyImageQuery";
import { ApiResponse } from "@/api/types";
import { CloudinaryImage } from "@/dataHelper/cloudinary.dataHelper";
import { ThreeDot } from "react-loading-indicators";
import { X } from "lucide-react"; 

const PropertyAddImage: React.FC<PropertyAddImageProps> = ({ userId, propertyId, open, onClose }) => {
    const { t } = useTranslation();

    const [listImageLocal, setListImageLocal] = React.useState<{ id: number, file: File, type: number }[]>([]);
    const [listImageChecked, setListImageChecked] = React.useState<Set<number>>(new Set());
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const dropZoneRef = React.useRef<HTMLDivElement>(null);
    const [openZoom, setOpenZoom] = React.useState(false);
    const [indexZoom, setIndexZoom] = React.useState(0);
    const uploadImageMutation = useUploadImageMutation();
    const createPropertyImageMutation = useCreatePropertyImageMutation();
    const deleteImageMutation = useDeleteImageMutation();

    // click select image
    const handleClickSelectImage = () => {
        fileInputRef.current?.click();
    }

    // Handle multiple files selection and auto-add to list
    const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newImages = Array.from(files).map((file, index) => ({
                id: listImageLocal.length + index + 1,
                file: file,
                type: DEFAULT_IMAGE_TYPE
            }));
            setListImageLocal((prev) => [...prev, ...newImages]);
        }
        // Reset input to allow selecting same files again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
            if (imageFiles.length > 0) {
                const newImages = imageFiles.map((file, index) => ({
                    id: listImageLocal.length + index + 1,
                    file: file,
                    type: DEFAULT_IMAGE_TYPE
                }));
                setListImageLocal((prev) => [...prev, ...newImages]);
            } else {
                toastWarning(t("properties.warning.select_image"));
            }
        }
    }
    // toggle checked image
    const toggleCheckedImage = (id: number) => {
        setListImageChecked((prev) => {
            const newSet = new Set(prev);

            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }
    // delete images
    const handleDeleteImages = () => {
        if (listImageChecked.size === 0) {
            toastWarning(t("properties.warning.select_image_to_delete"));
            return;
        };
        setListImageLocal((prev) => prev.filter((image) => !listImageChecked.has(image.id)));
        setListImageChecked(new Set());
    }
    // upload images
    const handleUploadImages = async () => {
        if (listImageLocal.length === 0) {
            toastWarning(t("properties.warning.select_image"));
            return;
        }

        let uploadedCloudinaryImages: ApiResponse<CloudinaryImage>[] = [];

        try {
            // Upload images to Cloudinary
            uploadedCloudinaryImages = await Promise.all(
                listImageLocal.map((image) =>
                    uploadImageMutation.mutateAsync({
                        image: image.file,
                        folder: `${HEADER_PROPERTY_CLOUDINARY}/${userId}/${propertyId}`,
                    })
                )
            );

            // Format data to save DB
            const uploadedImages: RequestPropertyImage[] =
                uploadedCloudinaryImages.map((result, index) => ({
                    image_url: result.data?.url,
                    id_image_cloudinary: result.data?.public_id,
                    image_type: listImageLocal[index].type,
                }));

            // Save DB
            await Promise.all(
                uploadedImages.map((image) =>
                    createPropertyImageMutation.mutateAsync({
                        property_id: propertyId,
                        image_url: image.image_url ?? "",
                        id_image_cloudinary: image.id_image_cloudinary ?? "",
                        image_type: image.image_type,
                    })
                )
            );

            // Reset state
            setListImageLocal([]);
            setListImageChecked(new Set());
            if (fileInputRef.current) fileInputRef.current.value = "";

            toastSuccess(t("property-images.create_property_image_success"));
            onClose();

        } catch (error) {
            console.error("Upload or DB error:", error);
            toastError(t("properties.warning.upload_images_failed"));

            // If database error → rollback Cloudinary
            try {
                await Promise.all(
                    uploadedCloudinaryImages.map((img) =>
                        deleteImageMutation.mutateAsync(img.data?.public_id ?? "")
                    )
                );
            } catch (_rollbackError) {
                toastError(t("properties.warning.rollback_cloudinary_failed"));
            }
        }
    };

    if (!open) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                {/* Main Container - RESPONSIVE */}
                <div className="
                    flex max-h-[90vh] w-full
                    max-w-2xl flex-col
                    overflow-hidden
                    rounded-lg bg-white
                    shadow-2xl
                    duration-200 animate-in fade-in-0 zoom-in-95
                ">
                    {/* Header - FIXED */}
                    <div className="flex shrink-0 items-center justify-between border-b p-4 md:p-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 md:text-xl">
                                {t("common.add")} {t("properties.table_images")}
                            </h2>
                            <p className="mt-1 text-xs text-gray-500 md:text-sm">
                                {t("properties.drag_drop_or_click")}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 transition-colors hover:bg-gray-100"
                        >
                            <X className="size-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content - SCROLLABLE */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        {/* Drag and Drop Zone - RESPONSIVE */}
                        <div
                            ref={dropZoneRef}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={handleClickSelectImage}
                            className={`
                                mb-4 flex min-h-[150px] flex-col items-center 
                                justify-center gap-3 rounded-lg border-2 border-dashed
                                p-4 md:mb-6
                                md:min-h-[180px] md:p-8
                                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                                cursor-pointer transition-colors
                            `}
                        >
                            <img
                                src="/assets/images/camera.png"
                                alt="Upload"
                                className="size-[60px] object-contain md:size-[80px]"
                            />
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700 md:text-base">
                                    {t("property-images.upload_images")}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 md:text-sm">
                                    {t("properties.drag_drop_or_click")}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                    {t("properties.select_multiple_images")}
                                </p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleChangeImage}
                                accept="image/*"
                                multiple
                                className="hidden"
                            />
                        </div>

                        <div className="mb-4 rounded border border-blue-200 bg-blue-50 p-3 md:mb-6">
                            <p className="text-sm text-blue-800">{t('room_images.drag_drop_instruction')}</p>
                            <p className="mt-1 text-xs text-blue-700">{t('room_images.max_size_auto_compress')}</p>
                        </div>

                        {/* Delete Selected Button - RESPONSIVE */}
                        {listImageLocal.length > 0 && (
                            <div className="mb-4 md:mb-6">
                                <Button
                                    variant="outline"
                                    className="
                                        h-10 w-full bg-red-600 
                                        text-sm font-medium 
                                        text-white
                                        hover:bg-red-500 md:h-11
                                        md:text-base
                                    "
                                    onClick={handleDeleteImages}
                                    disabled={listImageChecked.size === 0}
                                >
                                    <TrashIcon className="mr-2 size-4 md:size-5" />
                                    {t("common.delete")} ({listImageChecked.size})
                                </Button>

                            </div>
                        )}

                        {/* Image List - RESPONSIVE */}
                        {listImageLocal.length > 0 && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium md:text-base">
                                    {t("properties.image_list")} ({listImageLocal.length})
                                </label>

                                {/* Swiper Container - RESPONSIVE */}
                                <div className="relative">
                                    <Swiper
                                        modules={[Navigation]}
                                        spaceBetween={12}
                                        slidesPerView="auto"
                                        navigation={{
                                            nextEl: '.swiper-button-next',
                                            prevEl: '.swiper-button-prev',
                                        }}
                                        breakpoints={{
                                            320: {
                                                slidesPerView: 1.2,
                                                spaceBetween: 8
                                            },
                                            480: {
                                                slidesPerView: 1.5,
                                                spaceBetween: 10
                                            },
                                            640: {
                                                slidesPerView: 2,
                                                spaceBetween: 12
                                            },
                                            768: {
                                                slidesPerView: 2.5,
                                                spaceBetween: 14
                                            },
                                            1024: {
                                                slidesPerView: 3,
                                                spaceBetween: 16
                                            }
                                        }}
                                        className="!overflow-visible"
                                    >
                                        {listImageLocal.map((image, index) => (
                                            <SwiperSlide key={image.id} className="!w-auto">
                                                <div className="
                                                    flex w-[160px] 
                                                    flex-col rounded-lg border border-gray-200 
                                                    bg-white p-2 shadow-sm 
                                                    transition-shadow 
                                                    hover:shadow-md sm:w-[180px] md:w-[200px]
                                                ">
                                                    {/* Image */}
                                                    <div
                                                        className="
                                                            group relative aspect-square 
                                                            cursor-pointer overflow-hidden
                                                            rounded-md
                                                        "
                                                        onClick={() => {
                                                            setOpenZoom(true);
                                                            setIndexZoom(index);
                                                        }}
                                                    >
                                                        <img
                                                            src={URL.createObjectURL(image.file)}
                                                            alt={image.file.name}
                                                            className="
                                                                size-full object-cover transition-transform
                                                                duration-300 group-hover:scale-105
                                                            "
                                                        />
                                                        <div className="
                                                            absolute inset-0 
                                                            bg-black bg-opacity-0 
                                                            transition-all 
                                                            duration-300 group-hover:bg-opacity-10
                                                        " />
                                                    </div>

                                                    {/* Controls */}
                                                    <div className="mt-3 flex flex-col gap-2 px-1">
                                                        {/* Select */}
                                                        <Select
                                                            value={image.type.toString()}
                                                            onValueChange={(value) => {
                                                                setListImageLocal((prev) =>
                                                                    prev.map((img) =>
                                                                        img.id === image.id
                                                                            ? { ...img, type: Number(value) }
                                                                            : img
                                                                    )
                                                                );
                                                            }}
                                                        >
                                                            <SelectTrigger className="
                                                                h-8 w-full 
                                                                bg-white
                                                                text-xs
                                                            ">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="max-h-60 w-full overflow-y-auto">
                                                                {Object.entries(PROPERTY_IMAGE_TYPE).map(([key, value]) => (
                                                                    <SelectItem
                                                                        key={key}
                                                                        value={key}
                                                                        className="py-2 text-xs"
                                                                    >
                                                                        {t(value)}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        {/* Checkbox & Filename */}
                                                        <div className="flex items-center justify-between">
                                                            <span className="
                                                                max-w-[100px] truncate 
                                                                text-xs text-gray-500
                                                            ">
                                                                {image.file.name.length > 15
                                                                    ? `${image.file.name.substring(0, 12)}...`
                                                                    : image.file.name}
                                                            </span>
                                                            <input
                                                                type="checkbox"
                                                                checked={listImageChecked.has(image.id)}
                                                                onChange={() => toggleCheckedImage(image.id)}
                                                                className="
                                                                    checkbox checkbox-info 
                                                                    size-4
                                                                "
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>

                                    {/* Custom Navigation Buttons */}
                                    {listImageLocal.length > 2 && (
                                        <>
                                            <button className="
                                                swiper-button-prev 
                                                absolute left-0 top-1/2 z-10 
                                                -ml-2 flex size-8 
                                                -translate-y-1/2 items-center justify-center 
                                                rounded-full border border-gray-300 bg-white/80 
                                                shadow-lg transition-all hover:bg-white md:-ml-3 
                                                md:size-10
                                            ">
                                                <svg className="size-4 text-gray-700 md:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <button className="
                                                swiper-button-next 
                                                absolute right-0 top-1/2 z-10 
                                                -mr-2 flex size-8 
                                                -translate-y-1/2 items-center justify-center 
                                                rounded-full border border-gray-300 bg-white/80 
                                                shadow-lg transition-all hover:bg-white md:-mr-3 
                                                md:size-10
                                            ">
                                                <svg className="size-4 text-gray-700 md:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer - FIXED */}
                    <div className="shrink-0 border-t bg-gray-50 p-4 md:p-6">
                        <Button
                            variant="outline"
                            className={`
                                h-12 w-full text-sm 
                                font-medium md:h-14 md:text-base
                                ${uploadImageMutation.isPending || createPropertyImageMutation.isPending
                                    ? "border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"}
                                flex
                                items-center justify-center gap-2 transition-all
                            `}
                            onClick={handleUploadImages}
                            disabled={uploadImageMutation.isPending || createPropertyImageMutation.isPending || listImageLocal.length === 0}
                        >
                            {uploadImageMutation.isPending || createPropertyImageMutation.isPending
                                ? (
                                    <>
                                        <ThreeDot variant="bounce" color="#1683FF" size="small" />
                                        <span>{t("common.uploading")}...</span>
                                    </>
                                )
                                : (
                                    <>
                                        <Save className="size-5 md:size-6" />
                                        <span>{t("common.save")}</span>
                                        <span className="
                                            rounded-full bg-white/20 px-2 py-1 
                                            text-xs md:text-sm
                                        ">
                                            ({listImageLocal.length})
                                        </span>
                                    </>
                                )
                            }
                        </Button>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {listImageLocal.length > 0 && (
                <ImageLightbox
                    open={openZoom}
                    onClose={() => setOpenZoom(false)}
                    index={indexZoom}
                    slides={listImageLocal.map((image) => ({ src: URL.createObjectURL(image.file) }))}
                />
            )}
        </>
    );
};

export default PropertyAddImage;

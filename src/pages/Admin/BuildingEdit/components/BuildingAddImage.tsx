import React from "react";
import { useTranslation } from "react-i18next";
import { BUILDING_IMAGE_TYPE, DEFAULT_IMAGE_TYPE, HEADER_BUILDING_CLOUDINARY } from "@/constant";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BuildingAddImageProps, RequestBuildingImage } from "@/dataHelper/buildingImage.dataHelper";
import { Button } from "@/components/ui/button";
import { Save, TrashIcon } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ImageLightbox from "@/components/ui/image-lightbox";
import { toastError, toastSuccess, toastWarning } from "@/components/ui/toast";
import { useDeleteImageMutation, useUploadImageMutation } from "@/hooks/useCloudinariQuery";
import { useCreateBuildingImageMutation } from "@/hooks/useBuildingImageQuery";
import { ApiResponse } from "@/api/types";
import { CloudinaryImage } from "@/dataHelper/cloudinary.dataHelper";
import { ThreeDot } from "react-loading-indicators";
import { X } from "lucide-react"; 

const BuildingAddImage: React.FC<BuildingAddImageProps> = ({ userId, buildingId, open, onClose }) => {
    const { t } = useTranslation();

    const [listImageLocal, setListImageLocal] = React.useState<{ id: number, file: File, type: number }[]>([]);
    const [listImageChecked, setListImageChecked] = React.useState<Set<number>>(new Set());
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const dropZoneRef = React.useRef<HTMLDivElement>(null);
    const [openZoom, setOpenZoom] = React.useState(false);
    const [indexZoom, setIndexZoom] = React.useState(0);
    const uploadImageMutation = useUploadImageMutation();
    const createBuildingImageMutation = useCreateBuildingImageMutation();
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
                toastWarning(t("buildings.warning.select_image"));
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
            toastWarning(t("buildings.warning.select_image_to_delete"));
            return;
        };
        setListImageLocal((prev) => prev.filter((image) => !listImageChecked.has(image.id)));
        setListImageChecked(new Set());
    }
    // upload images
    const handleUploadImages = async () => {
        if (listImageLocal.length === 0) {
            toastWarning(t("buildings.warning.select_image"));
            return;
        }

        let uploadedCloudinaryImages: ApiResponse<CloudinaryImage>[] = [];

        try {
            // Upload images to Cloudinary
            uploadedCloudinaryImages = await Promise.all(
                listImageLocal.map((image) =>
                    uploadImageMutation.mutateAsync({
                        image: image.file,
                        folder: `${HEADER_BUILDING_CLOUDINARY}/${userId}/${buildingId}`,
                    })
                )
            );

            // Format data to save DB
            const uploadedImages: RequestBuildingImage[] =
                uploadedCloudinaryImages.map((result, index) => ({
                    image_url: result.data?.url!,
                    id_image_cloudinary: result.data?.public_id!,
                    image_type: listImageLocal[index].type,
                }));

            // Save DB
            await Promise.all(
                uploadedImages.map((image) =>
                    createBuildingImageMutation.mutateAsync({
                        building_id: buildingId,
                        image_url: image.image_url,
                        id_image_cloudinary: image.id_image_cloudinary,
                        image_type: image.image_type,
                    })
                )
            );

            // Reset state
            setListImageLocal([]);
            setListImageChecked(new Set());
            if (fileInputRef.current) fileInputRef.current.value = "";

            toastSuccess(t("building-images.create_building_image_success"));
            onClose();

        } catch (error) {
            console.error("Upload or DB error:", error);
            toastError(t("buildings.warning.upload_images_failed"));

            // If database error → rollback Cloudinary
            try {
                await Promise.all(
                    uploadedCloudinaryImages.map((img) =>
                        deleteImageMutation.mutateAsync(img.data?.public_id!)
                    )
                );
            } catch (rollbackError) {
                toastError(t("buildings.warning.rollback_cloudinary_failed"));
            }
        }
    };

    if (!open) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                {/* Main Container - RESPONSIVE */}
                <div className="
                    bg-white rounded-lg shadow-2xl
                    w-full max-w-2xl
                    max-h-[90vh]
                    flex flex-col
                    overflow-hidden
                    animate-in fade-in-0 zoom-in-95 duration-200
                ">
                    {/* Header - FIXED */}
                    <div className="shrink-0 flex items-center justify-between p-4 md:p-6 border-b">
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900">
                                {t("common.add")} {t("buildings.table_images")}
                            </h2>
                            <p className="text-xs md:text-sm text-gray-500 mt-1">
                                {t("buildings.drag_drop_or_click")}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
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
                                flex flex-col justify-center items-center gap-3 
                                p-4 md:p-8 border-2 border-dashed rounded-lg
                                mb-4 md:mb-6
                                min-h-[150px] md:min-h-[180px]
                                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                                cursor-pointer transition-colors
                            `}
                        >
                            <img
                                src="/assets/images/camera.png"
                                alt="Upload"
                                className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] object-contain"
                            />
                            <div className="text-center">
                                <p className="text-sm md:text-base font-medium text-gray-700">
                                    {t("building-images.upload_images")}
                                </p>
                                <p className="text-xs md:text-sm text-gray-500 mt-1">
                                    {t("buildings.drag_drop_or_click")}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {t("buildings.select_multiple_images")}
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

                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 md:mb-6">
                            <p className="text-sm text-blue-800">{t('room_images.drag_drop_instruction')}</p>
                            <p className="text-xs text-blue-700 mt-1">{t('room_images.max_size_auto_compress')}</p>
                        </div>

                        {/* Delete Selected Button - RESPONSIVE */}
                        {listImageLocal.length > 0 && (
                            <div className="mb-4 md:mb-6">
                                <Button
                                    variant="outline"
                                    className="
                                        bg-red-600 text-white hover:bg-red-500 
                                        h-10 md:h-11 
                                        w-full
                                        text-sm md:text-base
                                        font-medium
                                    "
                                    onClick={handleDeleteImages}
                                    disabled={listImageChecked.size === 0}
                                >
                                    <TrashIcon className="size-4 md:size-5 mr-2" />
                                    {t("common.delete")} ({listImageChecked.size})
                                </Button>

                            </div>
                        )}

                        {/* Image List - RESPONSIVE */}
                        {listImageLocal.length > 0 && (
                            <div className="space-y-4">
                                <label className="text-sm md:text-base font-medium block">
                                    {t("buildings.image_list")} ({listImageLocal.length})
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
                                                    flex flex-col 
                                                    bg-white rounded-lg border border-gray-200 
                                                    shadow-sm hover:shadow-md transition-shadow 
                                                    p-2 
                                                    w-[160px] sm:w-[180px] md:w-[200px]
                                                ">
                                                    {/* Image */}
                                                    <div
                                                        className="
                                                            relative overflow-hidden rounded-md 
                                                            cursor-pointer group
                                                            aspect-square
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
                                                                w-full h-full object-cover
                                                                group-hover:scale-105 transition-transform duration-300
                                                            "
                                                        />
                                                        <div className="
                                                            absolute inset-0 
                                                            bg-black bg-opacity-0 
                                                            group-hover:bg-opacity-10 
                                                            transition-all duration-300
                                                        " />
                                                    </div>

                                                    {/* Controls */}
                                                    <div className="flex flex-col gap-2 mt-3 px-1">
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
                                                                w-full h-8 
                                                                text-xs
                                                                bg-white
                                                            ">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="w-full max-h-60 overflow-y-auto">
                                                                {Object.entries(BUILDING_IMAGE_TYPE).map(([key, value]) => (
                                                                    <SelectItem
                                                                        key={key}
                                                                        value={key}
                                                                        className="text-xs py-2"
                                                                    >
                                                                        {t(value)}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        {/* Checkbox & Filename */}
                                                        <div className="flex items-center justify-between">
                                                            <span className="
                                                                text-xs text-gray-500 
                                                                truncate max-w-[100px]
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
                                                absolute left-0 top-1/2 -translate-y-1/2 
                                                z-10 bg-white/80 hover:bg-white 
                                                border border-gray-300 rounded-full 
                                                w-8 h-8 md:w-10 md:h-10 
                                                flex items-center justify-center shadow-lg 
                                                transition-all -ml-2 md:-ml-3
                                            ">
                                                <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <button className="
                                                swiper-button-next 
                                                absolute right-0 top-1/2 -translate-y-1/2 
                                                z-10 bg-white/80 hover:bg-white 
                                                border border-gray-300 rounded-full 
                                                w-8 h-8 md:w-10 md:h-10 
                                                flex items-center justify-center shadow-lg 
                                                transition-all -mr-2 md:-mr-3
                                            ">
                                                <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="shrink-0 p-4 md:p-6 border-t bg-gray-50">
                        <Button
                            variant="outline"
                            className={`
                                w-full h-12 md:h-14 
                                text-sm md:text-base font-medium
                                ${uploadImageMutation.isPending || createBuildingImageMutation.isPending
                                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300"
                                    : "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"}
                                transition-all
                                flex items-center justify-center gap-2
                            `}
                            onClick={handleUploadImages}
                            disabled={uploadImageMutation.isPending || createBuildingImageMutation.isPending || listImageLocal.length === 0}
                        >
                            {uploadImageMutation.isPending || createBuildingImageMutation.isPending
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
                                            bg-white/20 px-2 py-1 rounded-full 
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

export default BuildingAddImage;
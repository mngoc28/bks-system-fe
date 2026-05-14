import React from "react";
import EmptyPage from "@/components/EmptyPage";
import { PropertyImageEditFormProps, PropertyImageEditFormRef, propertyImage } from "@/dataHelper/propertyImage.dataHelper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageIcon, Loader2, CheckSquare, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PROPERTY_IMAGE_TYPE, CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import Lottie from "lottie-react";
import loadingImage from "@/assets/json/loading_image.json";
import ImageLightbox from "@/components/ui/image-lightbox";
import { ThreeDot } from "react-loading-indicators";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { SortableImageItem } from "@/components/ui/sortableItem";
import { useUpdatePropertyImageSortMutation } from "@/hooks/usePropertyImageQuery";
import { resolveImageUrl } from "@/utils/imageUtils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";


const PropertyEditImages = React.forwardRef<PropertyImageEditFormRef, PropertyImageEditFormProps>(
    ({ images, isLoadingData, isErrorData, updatingImageIds = new Set(), onStateChange, onDeleteSelected, isBusy = false }, ref) => {
        const { t } = useTranslation();
        const [updatedImages, setUpdatedImages] = React.useState<propertyImage[]>(images || []);
        const [selectedImages, setSelectedImages] = React.useState<Set<number>>(new Set());
        const [open, setOpen] = React.useState(false);
        const [index, setIndex] = React.useState(0);
        const updatePropertyImageSortMutation = useUpdatePropertyImageSortMutation();
        const [_, setListIdsSort] = React.useState<number[]>([]);
        const imagesLightbox = updatedImages
            .filter((image): image is propertyImage & { image_url: string } => Boolean(image.image_url))
            .map((image) => ({
                src: resolveImageUrl(image.image_url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || "/assets/images/photo_error2.png"
            }));
        let indexImage = 1;

        // handle set updated images
        React.useEffect(() => {
            if (images) {
                setUpdatedImages(images);
            }
        }, [images]);

        // handle get updated images
        React.useImperativeHandle(ref, () => ({
            getUpdatedImages: () => updatedImages,
            getSelectedImages: () => Array.from(selectedImages),
            selectAllImages: () => {
                setSelectedImages(new Set(updatedImages.map((img) => img.id)));
            },
            clearSelectedImages: () => {
                setSelectedImages(new Set());
            },
            resetImages: () => {
                setUpdatedImages(images || []);
                setSelectedImages(new Set());
            }
        }));

        React.useEffect(() => {
            if (!onStateChange) return;

            const hasChanges = updatedImages.some((updatedImage) => {
                const originalImage = images.find((img) => img.id === updatedImage.id);
                if (!originalImage) return false;
                return (
                    originalImage.image_type !== updatedImage.image_type ||
                    originalImage.sort !== updatedImage.sort
                );
            });

            onStateChange({ hasChanges, selectedCount: selectedImages.size, totalCount: updatedImages.length });
        }, [images, onStateChange, selectedImages.size, updatedImages]);

        // handle image type change
        const handleImageTypeChange = (imageId: number, newImageType: string) => {
            setUpdatedImages((prev) =>
                prev.map((img) =>
                    img.id === imageId
                        ? { ...img, image_type: Number(newImageType) }
                        : img
                )
            );
        };

        // handle checkbox change
        const handleCheckboxChange = (imageId: number, checked: boolean) => {
            setSelectedImages((prev) => {
                const newSet = new Set(prev);
                if (checked) {
                    newSet.add(imageId);
                } else {
                    newSet.delete(imageId);
                }
                return newSet;
            });
        };

        // handle sensors
        const sensors = useSensors(
            useSensor(PointerSensor, {
                activationConstraint: { distance: 5 }
            })
        );
        // handle drag end + auto save sort
        const handleDragEnd = (event: any) => {
            const { active, over } = event;
            if (!over) return;

            if (active.id !== over.id) {
                setUpdatedImages((prev) => {
                    const oldIndex = prev.findIndex((img) => img.id === active.id);
                    const newIndex = prev.findIndex((img) => img.id === over.id);
                    const newImages = arrayMove(prev, oldIndex, newIndex);
                    const newIds = newImages.map((img) => img.id);
                    setListIdsSort(newIds);
                    const propertyIdForSort = newImages[0]?.property_id ?? 0;
                    if (propertyIdForSort && newIds.length > 0) {
                        updatePropertyImageSortMutation.mutate({
                            propertyId: propertyIdForSort,
                            ids: newIds,
                        });
                    }

                    return newImages;
                });
            }
        };

        return (
            <>
                {isErrorData && (
                    <EmptyPage
                        title="properties.empty_title_images"
                        description="properties.empty_description"
                        icon={<Loader2 className="size-10 animate-spin text-blue-500" />}
                        loading={false}
                    />
                )}
                {isLoadingData && <>
                    <div className="flex items-center justify-center">
                        <ThreeDot variant="bounce" color="#064F80" size="small" />
                    </div>
                </>}
                {updatedImages && !isErrorData && (
                    <>
                        <div className="mb-4 flex justify-end gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    if (updatedImages.length === selectedImages.size) {
                                        setSelectedImages(new Set());
                                        return;
                                    }
                                    setSelectedImages(new Set(updatedImages.map((img) => img.id)));
                                }}
                                title={updatedImages.length === selectedImages.size ? t("common.deselect_all") : t("common.select_all")}
                                className="bg-green-500 text-white hover:bg-green-600"
                                disabled={updatedImages.length === 0 || isBusy}
                            >
                                <CheckSquare className="size-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDeleteSelected?.()}
                                disabled={selectedImages.size === 0 || isBusy}
                                title={t("common.delete")}
                                className="bg-red-500 text-white hover:bg-red-600"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>

                        <div className="relative grid grid-cols-1 gap-2 lg:gap-4">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={updatedImages.map((img) => img.id)}>
                                    <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                        {updatedImages.map((image) => {
                                            const currentIndex = indexImage++;
                                            const imageTypeKey = (image.image_type || 1);
                                            const imageTypeValue = PROPERTY_IMAGE_TYPE[imageTypeKey as keyof typeof PROPERTY_IMAGE_TYPE];
                                            return (
                                                <SortableImageItem key={image.id} id={image.id}>
                                                    <div className="relative">
                                                        <div className={`relative overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-md ${selectedImages.has(image.id) ? "border-4 border-red-500" : "border border-gray-200"}`}>
                                                            <div className="absolute left-2 top-2 z-10 rounded bg-black bg-opacity-50 px-2 py-1 text-sm font-medium text-white">
                                                                <div className="text-center text-[14px] font-semibold leading-none text-white">
                                                                    {currentIndex}
                                                                </div>
                                                            </div>

                                                            <div className="absolute right-2 top-2 z-10">
                                                                <Checkbox
                                                                    checked={selectedImages.has(image.id)}
                                                                    onCheckedChange={(checked) => handleCheckboxChange(image.id, checked as boolean)}
                                                                    onPointerDown={(e) => e.stopPropagation()}
                                                                />
                                                            </div>

                                                            {image.image_url !== null && image.image_url !== "" ? (
                                                                <img
                                                                    src={resolveImageUrl(image.image_url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || "/assets/images/photo_error2.png"}
                                                                    alt={image.id_image_cloudinary}
                                                                    className="aspect-[4/3] w-full cursor-pointer object-cover transition-opacity hover:opacity-80"
                                                                    onError={(e) => (e.currentTarget.src = "/assets/images/photo_error2.png")}
                                                                    onClick={() => {
                                                                        const filteredImages = updatedImages.filter(
                                                                            (img): img is propertyImage & { image_url: string } => Boolean(img.image_url)
                                                                        );
                                                                        const imageIndex = filteredImages.findIndex((img) => img.id === image.id);
                                                                        if (imageIndex !== -1) {
                                                                            setIndex(imageIndex);
                                                                            setOpen(true);
                                                                        }
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="flex aspect-[4/3] w-full flex-col items-center justify-center bg-gray-200 p-4 text-center">
                                                                    <ImageIcon className="mx-auto mb-4 size-10 text-gray-400" />
                                                                    <p className="text-sm text-gray-500">{t("rooms.no_images_yet")}</p>
                                                                </div>
                                                            )
                                                            }

                                                            <div className="bg-white p-2">
                                                                <label className="mb-2 block text-sm font-medium">
                                                                    {t("properties.image_type")}
                                                                </label>
                                                                <Select
                                                                    value={image.image_type?.toString() || "1"}
                                                                    onValueChange={(value) => handleImageTypeChange(image.id, value)}
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue>{t(imageTypeValue)}</SelectValue>
                                                                    </SelectTrigger>
                                                                    <SelectContent className="w-full text-black">
                                                                        {Object.entries(PROPERTY_IMAGE_TYPE).map(([key, value]) => (
                                                                            <SelectItem key={key} value={key}>{t(value)}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        {updatingImageIds.has(image.id) && (
                                                            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-black/40">
                                                                <div style={{ filter: 'brightness(0.3)' }}>
                                                                    <Lottie animationData={loadingImage} loop className="size-[100px]" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </SortableImageItem>
                                            );
                                        })}
                                    </div>
                                </SortableContext>
                            </DndContext>

                        </div>
                        <ImageLightbox
                            open={open}
                            onClose={() => setOpen(false)}
                            index={index}
                            slides={imagesLightbox}
                        />
                    </>
                )}
            </>
        );
    }
);

export default PropertyEditImages;

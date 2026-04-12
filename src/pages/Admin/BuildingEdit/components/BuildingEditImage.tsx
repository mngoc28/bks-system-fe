import React from "react";
import EmptyPage from "@/components/EmptyPage";
import { BuildingImageEditFormProps, BuildingImageEditFormRef, buildingImage } from "@/dataHelper/buildingImage.dataHelper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageIcon, Loader2, CheckSquare, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BUILDING_IMAGE_TYPE, CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import Lottie from "lottie-react";
import loadingImage from "@/assets/json/loading_image.json";
import ImageLightbox from "@/components/ui/image-lightbox";
import { ThreeDot } from "react-loading-indicators";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { SortableImageItem } from "@/components/ui/sortableItem";
import { useUpdateBuildingImageSortMutation } from "@/hooks/useBuildingImageQuery";
import { resolveImageUrl } from "@/utils/imageUtils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";


const BuildingEditImages = React.forwardRef<BuildingImageEditFormRef, BuildingImageEditFormProps>(
    ({ images, isLoadingData, isErrorData, updatingImageIds = new Set(), onStateChange, onDeleteSelected, isBusy = false }, ref) => {
        const { t } = useTranslation();
        const [updatedImages, setUpdatedImages] = React.useState<buildingImage[]>(images || []);
        const [selectedImages, setSelectedImages] = React.useState<Set<number>>(new Set());
        const [open, setOpen] = React.useState(false);
        const [index, setIndex] = React.useState(0);
        const updateBuildingImageSortMutation = useUpdateBuildingImageSortMutation();
        const [_, setListIdsSort] = React.useState<number[]>([]);
        const imagesLightbox = updatedImages
            .filter((image): image is buildingImage & { image_url: string } => Boolean(image.image_url))
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
                    const buildingId = newImages[0]?.building_id ?? 0;
                    if (buildingId && newIds.length > 0) {
                        updateBuildingImageSortMutation.mutate({
                            buildingId,
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
                        title="buildings.empty_title_images"
                        description="buildings.empty_description"
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
                        <div className="flex gap-2 mb-4 justify-end">
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
                                className="bg-green-500 hover:bg-green-600 text-white"
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
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-2 lg:gap-4 relative">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={updatedImages.map((img) => img.id)}>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 relative">
                                        {updatedImages.map((image) => {
                                            const currentIndex = indexImage++;
                                            const imageTypeKey = (image.image_type || 1);
                                            const imageTypeValue = BUILDING_IMAGE_TYPE[imageTypeKey as keyof typeof BUILDING_IMAGE_TYPE];
                                            return (
                                                <SortableImageItem key={image.id} id={image.id}>
                                                    <div className="relative">
                                                        <div className={`relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${selectedImages.has(image.id) ? "border-4 border-red-500" : "border border-gray-200"}`}>
                                                            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm font-medium z-10">
                                                                <div className="text-[14px] text-center font-semibold text-white leading-none">
                                                                    {currentIndex}
                                                                </div>
                                                            </div>

                                                            <div className="absolute top-2 right-2 z-10">
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
                                                                    className="w-full aspect-[4/3] object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                                    onError={(e) => (e.currentTarget.src = "/assets/images/photo_error2.png")}
                                                                    onClick={() => {
                                                                        const filteredImages = updatedImages.filter(
                                                                            (img): img is buildingImage & { image_url: string } => Boolean(img.image_url)
                                                                        );
                                                                        const imageIndex = filteredImages.findIndex((img) => img.id === image.id);
                                                                        if (imageIndex !== -1) {
                                                                            setIndex(imageIndex);
                                                                            setOpen(true);
                                                                        }
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full aspect-[4/3] text-center flex flex-col items-center justify-center bg-gray-200 p-4">
                                                                    <ImageIcon className="size-10 mx-auto mb-4 text-gray-400" />
                                                                    <p className="text-gray-500 text-sm">{t("rooms.no_images_yet")}</p>
                                                                </div>
                                                            )
                                                            }

                                                            <div className="p-2 bg-white">
                                                                <label className="text-sm font-medium block mb-2">
                                                                    {t("buildings.image_type")}
                                                                </label>
                                                                <Select
                                                                    value={image.image_type?.toString() || "1"}
                                                                    onValueChange={(value) => handleImageTypeChange(image.id, value)}
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue>{t(imageTypeValue)}</SelectValue>
                                                                    </SelectTrigger>
                                                                    <SelectContent className="w-full text-black">
                                                                        {Object.entries(BUILDING_IMAGE_TYPE).map(([key, value]) => (
                                                                            <SelectItem key={key} value={key}>{t(value)}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        {updatingImageIds.has(image.id) && (
                                                            <div className="absolute inset-0 bg-black/40 rounded-md flex items-center justify-center z-10">
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

export default BuildingEditImages;
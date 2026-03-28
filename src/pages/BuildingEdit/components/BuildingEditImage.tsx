import React from "react";
import EmptyPage from "@/components/EmptyPage";
import { BuildingImageEditFormProps, BuildingImageEditFormRef, buildingImage } from "@/dataHelper/buildingImage.dataHelper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageIcon, Loader2 } from "lucide-react";
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


const BuildingEditImages = React.forwardRef<BuildingImageEditFormRef, BuildingImageEditFormProps>(
    ({ images, isLoadingData, isErrorData, updatingImageIds = new Set() }, ref) => {
        const { t } = useTranslation();
        const [updatedImages, setUpdatedImages] = React.useState<buildingImage[]>(images || []);
        const [selectedImages, setSelectedImages] = React.useState<Set<number>>(new Set());
        const [open, setOpen] = React.useState(false);
        const [index, setIndex] = React.useState(0);
        const updateBuildingImageSortMutation = useUpdateBuildingImageSortMutation();
        const [_, setListIdsSort] = React.useState<number[]>([]);
        const imagesLightbox = updatedImages
            .filter((image): image is buildingImage & { image_url: string } => Boolean(image.image_url))
            .map((image) => ({ src: CLOUDINARY_HEADER_IMAGE_URL + '/' + image.image_url }));
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
            resetImages: () => {
                setUpdatedImages([]);
                setSelectedImages(new Set());
            }
        }));

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
                        <div className="grid grid-cols-1 gap-2 lg:gap-4 relative">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={updatedImages.map((img) => img.id)}>
                                    <div className="flex flex-wrap justify-start items-center gap-2 lg:gap-4 relative">
                                        {updatedImages.map((image) => {
                                            const currentIndex = indexImage++;
                                            const imageTypeKey = (image.image_type || 1);
                                            const imageTypeValue = BUILDING_IMAGE_TYPE[imageTypeKey as keyof typeof BUILDING_IMAGE_TYPE];
                                            return (
                                                <SortableImageItem key={image.id} id={image.id}>
                                                    <div className="relative">
                                                        <div className="grid grid-rows border border-gray-500 rounded-md relative">
                                                            <div className="absolute size-6 bg-black opacity-75 rounded-full flex items-center justify-center mt-2 ml-2">
                                                                <div className="text-[14px] text-center font-semibold text-white">
                                                                    {currentIndex}
                                                                </div>
                                                            </div>
                                                            {image.image_url !== null && image.image_url !== "" ? (
                                                                <img
                                                                    src={CLOUDINARY_HEADER_IMAGE_URL + '/' + image.image_url}
                                                                    alt={image.id_image_cloudinary}
                                                                    className="md:w-[250px] md:h-[200px] w-[100px] h-[100px] object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                                    onError={(e) => (e.currentTarget.src = "/assets/images/photo_error.png")}
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
                                                                <div className="md:w-[250px] md:h-[200px] w-[100px] h-[100px] text-center flex flex-col items-center justify-center bg-gray-200 p-4">
                                                                    <ImageIcon className="size-10 mx-auto mb-4 text-gray-400" />
                                                                    <p className="text-gray-500 text-sm">{t("rooms.no_images_yet")}</p>
                                                                </div>
                                                            )
                                                            }
                                                            {/* Info Panel */}
                                                            <div>
                                                                <div className="flex flex-col justify-between items-start w-full p-2">
                                                                    <div className="flex flex-row justify-between items-start gap-3 w-full">
                                                                        <div className="w-full">
                                                                            <div className="flex flex-row justify-between items-center mb-2">
                                                                                <label className="text-sm font-medium">
                                                                                    {t("buildings.image_type")}
                                                                                </label>

                                                                                <div className="flex flex-row justify-end">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={selectedImages.has(image.id)}
                                                                                        onChange={(e) => handleCheckboxChange(image.id, e.target.checked)}
                                                                                        className="checkbox checkbox-info size-6"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <Select
                                                                                value={image.image_type?.toString() || "1"}
                                                                                onValueChange={(value) => handleImageTypeChange(image.id, value)}
                                                                            >
                                                                                <SelectTrigger className="w-full h-auto">
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

                                                                </div>
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
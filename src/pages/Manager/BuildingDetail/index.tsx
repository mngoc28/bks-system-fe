import EmptyPage from "@/components/EmptyPage";
import { Button } from "@/components/ui/button";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS } from "@/constant";
import { useImagesByBuildingIdQuery } from "@/hooks/useBuildingImageQuery";
import { useBuildingQuery, useBuildingTypesQuery } from "@/hooks/useBuildingQuery";
import { safeFormatDateTime } from "@/utils/dateUtils";
import { ArrowLeftIcon, EditIcon, ImageIcon, Loader2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { ThreeDot } from "react-loading-indicators";
import { useNavigate, useParams } from "react-router";
import ImageLightbox from "@/components/ui/image-lightbox";
import DOMPurify from 'dompurify';

/**
 * Building Detail Page
 * Displays comprehensive information about a specific building, including specs and a gallery of images.
 */
const BuildingDetail: React.FC = () => {
    const { t } = useTranslation();
    const { user_id, building_id } = useParams<{ user_id: string, building_id: string }>();
    const buildingId = building_id ? parseInt(building_id, 10) : 0;
    const userId = user_id ? parseInt(user_id, 10) : 0;
    const { data: buildingData, isLoading: buildingLoading, isError: buildingError } = useBuildingQuery(buildingId);
    const { data: imagesData, isLoading: imagesLoading, isError: imagesError } = useImagesByBuildingIdQuery(buildingId);
    let indexImage = 1;
    const { data: buildingTypes } = useBuildingTypesQuery();
    const navigate = useNavigate();
    const building = buildingData?.data || null;
    const [open, setOpen] = React.useState(false);
    const [index, setIndex] = React.useState(0);
    const imagesLightbox = imagesData?.data
        ?.filter((image) => image.image_url)
        ?.map((image) => ({ src: CLOUDINARY_HEADER_IMAGE_URL + '/' + image.image_url })) || [];

    const handleEditImages = () => {
        navigate(`${ROUTERS.BUILDINGS_EDIT_IMAGES}/edit-images/${userId}/${buildingId}`);
    }
    const handleEditBuilding = () => {
        navigate(`${ROUTERS.BUILDINGS_EDIT}/edit-building/${userId}/${buildingId}`);
    }
    const handleBuildings = () => {
        navigate(ROUTERS.BUILDINGS);
    }
    return (
        <>
            {<div className="flex flex-col pl-3 pr-3 sm:pl-6 sm:pr-6 gap-y-10 pt-5">
                {/** Building */}
                <div className="flex flex-row justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 py-3 whitespace-nowrap">{t("buildings.detail_building")}</h2>
                    <div className="flex flex-row gap-3 items-start justify-center">
                        <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700 h-11 w-[80%] xl:w-full text-[14px] xl:text-[16px]" onClick={handleEditImages}>
                            <ImageIcon className="size-5" />

                            <span className="hidden lg:block">
                                {t("buildings.edit_images")}
                            </span>
                        </Button>
                        <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-700 h-11 w-[80%] xl:w-full text-[14px] xl:text-[16px]" onClick={handleEditBuilding}>
                            <EditIcon className="size-5" />

                            <span className="hidden lg:block ">
                                {t("buildings.edit_building")}
                            </span>
                        </Button>
                        <Button variant="outline" className="bg-gray-600 text-white hover:bg-gray-700 h-11 w-[80%] xl:w-full text-[14px] xl:text-[16px]" onClick={handleBuildings}>
                            <ArrowLeftIcon className="size-5" />
                            <span className="hidden lg:block">
                                {t("common.back")}
                            </span>
                        </Button>
                    </div>
                </div>
                {buildingError && <EmptyPage title="buildings.empty_title_building" description="buildings.empty_description" icon={<Loader2 className="size-10 animate-spin text-blue-500" />} loading={false} />}
                {buildingLoading && <>
                    <div className="flex items-center justify-center">
                        <ThreeDot variant="bounce" color="#064F80" size="small" />
                    </div>
                </>}
                {building && !buildingError && <div className="flex flex-col gap-2 md:gap-1">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-1">
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("buildings.building_name")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{building?.name || ""}</div>
                        </div>
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("buildings.user_name")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{building?.user?.name || ""}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-1">
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("buildings.address")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{building?.address_detail || ""}</div>
                        </div>
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("buildings.area")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{building?.area || ""}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-1">
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("buildings.number_of_floors")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{building?.number_of_floors || ""}</div>
                        </div>
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("buildings.number_of_units")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{building?.number_of_units || ""}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-1">
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("buildings.year_built")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{building?.year_built || ""}</div>
                        </div>
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("buildings.building_type_name")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">
                                {building?.property_type_id ? (buildingTypes?.data?.find(t => t.id === building.property_type_id)?.name || building.property_type_id) : "-"}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-1">
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("buildings.rent_category")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">
                                {building?.rent_category ? t(`RENT_CATEGORY.${building.rent_category}`) : "-"}
                            </div>
                        </div>
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("buildings.ward_name")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{building?.ward?.name || ""}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-1">
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("buildings.province_name")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{building?.province?.name || ""}</div>
                        </div>
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("buildings.created_at")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{safeFormatDateTime((building as any)?.created_at)}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("buildings.description")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">
                                <div
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(building?.description || "") }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                }

                {/** Images */}
                <h2 className="text-2xl font-bold text-gray-900 py-3 whitespace-nowrap">{t("buildings.image_list")}</h2>
                {imagesError && <EmptyPage title="buildings.empty_title_images" description="buildings.empty_description" />}
                {imagesLoading && <>
                    <div className="flex items-center justify-center">
                        <ThreeDot variant="bounce" color="#064F80" size="small" />
                    </div>
                </>}
                {imagesData && !imagesError && <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {imagesData?.data?.map((image) => {
                        const validImages = imagesData?.data?.filter((img) => img.image_url) || [];
                        const lightboxIndex = validImages.findIndex((img) => img.id === image.id);
                        
                        if (!image.image_url) {
                            return (
                                <div key={image.id} className="w-full relative overflow-hidden bg-gray-100 border rounded-xs">
                                    <div className="absolute top-2 left-2 w-5 h-5 bg-black opacity-80 rounded-full flex items-center justify-center z-10">
                                        <div className="text-[14px] text-white text-center font-semibold whitespace-nowrap">{indexImage++}</div>
                                    </div>
                                    <div className="w-full h-full min-h-[200px] text-center flex flex-col items-center justify-center bg-gray-200 p-4">
                                        <ImageIcon className="size-10 mx-auto mb-4 text-gray-400" />
                                        <p className="text-gray-500 text-sm">{t("rooms.no_images_yet")}</p>
                                    </div>
                                </div>
                            );
                        }
                        
                        return (
                            <div key={image.id} className="w-full relative overflow-hidden bg-gray-100">
                                <div className="absolute top-2 left-2 w-5 h-5 bg-black opacity-80 rounded-full flex items-center justify-center z-10">
                                    <div className="text-[14px] text-white text-center font-semibold whitespace-nowrap">{indexImage++}</div>
                                </div>
                                <img
                                    src={CLOUDINARY_HEADER_IMAGE_URL + '/' + image.image_url}
                                    alt={image.id_image_cloudinary || `image-${image.id}`}
                                    onClick={() => {
                                        if (lightboxIndex !== -1) {
                                            setIndex(lightboxIndex);
                                            setOpen(true);
                                        }
                                    }}
                                    className="w-full h-full min-h-[200px] object-cover border rounded-xs cursor-pointer hover:opacity-80 transition-opacity"
                                    onError={(e) => (e.currentTarget.src = "/assets/images/photo_error.png")}
                                />
                            </div>
                        );
                    })}
                </div>
                }
            </div>
            }
            <ImageLightbox
                open={open}
                onClose={() => setOpen(false)}
                index={index}
                slides={imagesLightbox || []}
            />

        </>
    )
}

export default BuildingDetail;
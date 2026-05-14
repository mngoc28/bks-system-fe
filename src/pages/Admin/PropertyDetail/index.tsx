import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS } from "@/constant";
import { useImagesByPropertyIdQuery } from "@/hooks/usePropertyImageQuery";
import { usePropertyQuery, usePropertyTypesQuery } from "@/hooks/usePropertyQuery";
import { safeFormatDateTime } from "@/utils/dateUtils";
import {
    ArrowLeft,
    Building2,
    Calendar,
    Edit,
    FileText,
    Home,
    ImageIcon,
    Layers,
    Loader2,
    MapPin,
    Ruler,
    User,
} from "lucide-react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import ImageLightbox from "@/components/ui/image-lightbox";
import DOMPurify from 'dompurify';
import { resolveImageUrl } from "@/utils/imageUtils";

/**
 * Property Detail Page
 * Displays comprehensive information about a specific property, including specs and a gallery of images.
 */
const PropertyDetail: React.FC = () => {
    const { t } = useTranslation();
    const { property_id } = useParams<{ property_id: string }>();
    const propertyId = property_id ? parseInt(property_id, 10) : 0;
    const navigate = useNavigate();
    const { data: propertyData, isLoading: propertyLoading, isError: propertyError } = usePropertyQuery(propertyId);
    const { data: imagesData, isLoading: imagesLoading, isError: imagesError } = useImagesByPropertyIdQuery(propertyId);
    const { data: propertyTypes } = usePropertyTypesQuery();
    const [open, setOpen] = React.useState(false);
    const [index, setIndex] = React.useState(0);

    const property = propertyData?.data || null;
    const propertyImages = imagesData?.data || [];

    const imagesLightbox = useMemo(
        () =>
            propertyImages
                .filter((image) => image.image_url)
                .map((image) => ({
                    src: resolveImageUrl(image.image_url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || "/assets/images/photo_error2.png"
                })),
        [propertyImages]
    );

    const propertyTypeName = useMemo(() => {
        if (!property?.property_type_id) return "-";
        return propertyTypes?.data?.find((type) => type.id === property.property_type_id)?.name || String(property.property_type_id);
    }, [property?.property_type_id, propertyTypes?.data]);

    const rentCategoryName = property?.rent_category ? t(`RENT_CATEGORY.${property.rent_category}`) : "-";

    const handleEditImages = () => navigate(`${ROUTERS.PROPERTIES_DETAIL}/${propertyId}/images`);
    const handleEditProperty = () => navigate(`${ROUTERS.PROPERTIES_EDIT}/edit-property/${propertyId}`);
    const handleBack = () => navigate(ROUTERS.PROPERTIES);

    if (propertyLoading) {
        return (
            <div className="flex items-center justify-center p-3 sm:p-6">
                <Loader2 className="size-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (propertyError || !property) {
        return (
            <div className="flex flex-col gap-4 p-3 sm:p-6">
                <p className="text-red-500">{t("properties.empty_description")}</p>
                <Button variant="outline" className="w-fit" onClick={handleBack}>
                    <ArrowLeft className="mr-2 size-4" />
                    {t("common.back")}
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-6 overflow-hidden p-3 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={handleBack}>
                            <ArrowLeft className="mr-2 size-4" />
                            {t("common.back")}
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
                            <p className="text-sm text-gray-600">{t("properties.detail_property")}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={handleEditProperty} className="bg-blue-600 hover:bg-blue-700">
                            <Edit className="mr-2 size-4" />
                            {t("properties.edit_property")}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <Building2 className="size-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{t("properties.property_name")}</p>
                                    <p className="font-semibold">{property.name || "-"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-100 p-2">
                                    <User className="size-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{t("properties.user_name")}</p>
                                    <p className="font-semibold">{property.user?.name || "-"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-100 p-2">
                                    <Ruler className="size-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{t("properties.area")}</p>
                                    <p className="font-semibold">{property.area || 0} m2</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-100 p-2">
                                    <Layers className="size-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{t("properties.number_of_units")}</p>
                                    <p className="font-semibold">{property.number_of_units || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Home className="size-5" />
                                {t("properties.detail_property")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">{t("properties.property_type_name")}</label>
                                    <p className="mt-1 text-sm text-gray-900">{propertyTypeName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">{t("properties.rent_category")}</label>
                                    <p className="mt-1 text-sm text-gray-900">{rentCategoryName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">{t("properties.number_of_floors")}</label>
                                    <p className="mt-1 text-sm text-gray-900">{property.number_of_floors || 0}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">{t("properties.year_built")}</label>
                                    <p className="mt-1 text-sm text-gray-900">{property.year_built || "-"}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">{t("properties.province_name")}</label>
                                    <p className="mt-1 text-sm text-gray-900">{property.province?.name || "-"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">{t("properties.ward_name")}</label>
                                    <p className="mt-1 text-sm text-gray-900">{property.ward?.name || "-"}</p>
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <MapPin className="size-4" />
                                    {t("properties.address")}
                                </label>
                                <p className="mt-1 text-sm text-gray-900">{property.address_detail || "-"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="size-5" />
                                {t("rooms.basic_information")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">{t("properties.created_at")}</label>
                                <p className="mt-1 text-sm text-gray-900">{safeFormatDateTime((property as any)?.created_at)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">{t("rooms.updated_at")}</label>
                                <p className="mt-1 text-sm text-gray-900">{safeFormatDateTime((property as any)?.updated_at)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">{t("properties.rent_category")}</label>
                                <div className="mt-1">
                                    <Badge variant="outline">{rentCategoryName}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {property.description && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="size-5" />
                                {t("properties.description")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="rounded-lg bg-gray-50 p-3 text-sm text-gray-900"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(property.description || "") }}
                            />
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <div className="flex w-full items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="size-5" />
                                {t("properties.image_list")}
                            </CardTitle>
                            <Button onClick={handleEditImages} className="bg-green-600 hover:bg-green-700">
                                <ImageIcon className="mr-2 size-4" />
                                {t("properties.edit_images")}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {imagesLoading ? (
                            <div className="py-8 text-center">
                                <Loader2 className="mx-auto size-8 animate-spin text-blue-500" />
                                <p className="mt-2 text-gray-600">{t("common.loading")}</p>
                            </div>
                        ) : imagesError ? (
                            <div className="py-8 text-center text-red-500">{t("properties.empty_description")}</div>
                        ) : propertyImages.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {propertyImages.map((image, idx) => {
                                    const validImages = propertyImages.filter((img) => img.image_url);
                                    const lightboxIndex = validImages.findIndex((img) => img.id === image.id);

                                    return (
                                        <div key={image.id} className="group relative aspect-[4/3]">
                                            {image.image_url ? (
                                                <img
                                                    src={resolveImageUrl(image.image_url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || "/assets/images/photo_error2.png"}
                                                    alt={image.id_image_cloudinary || `image-${image.id}`}
                                                    className="size-full cursor-pointer rounded-lg border object-cover shadow-sm transition-all hover:shadow-md"
                                                    onClick={() => {
                                                        if (lightboxIndex !== -1) {
                                                            setIndex(lightboxIndex);
                                                            setOpen(true);
                                                        }
                                                    }}
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/assets/images/photo_error2.png";
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex size-full flex-col items-center justify-center rounded-lg border bg-gray-100 p-4">
                                                    <ImageIcon className="size-8 text-gray-400" />
                                                    <p className="mt-2 text-xs text-gray-500">{t("rooms.no_images_yet")}</p>
                                                </div>
                                            )}
                                            <div className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">
                                                #{image.sort && image.sort > 0 ? image.sort : idx + 1}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <ImageIcon className="mx-auto mb-4 size-12 text-gray-400" />
                                <p className="text-gray-500">{t("rooms.no_images_yet")}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <ImageLightbox open={open} onClose={() => setOpen(false)} index={index} slides={imagesLightbox} />
        </>
    );
};

export default PropertyDetail;

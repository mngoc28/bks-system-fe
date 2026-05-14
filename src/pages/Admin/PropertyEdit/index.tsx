import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { PropertyAddImage, PropertyEditForm } from "./components";
import { usePropertyQuery, useUpdatePropertyMutation } from "@/hooks/usePropertyQuery";
import { UpdatePropertyRequest } from "@/dataHelper/property.dataHelper";
import { ROUTERS } from "@/constant";
import PropertyEditImages from "./components/PropertyEditImage";
import { useImagesByPropertyIdQuery, useUpdatePropertyImageMutation, useDeletePropertyImageMutation } from "@/hooks/usePropertyImageQuery";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ImageIcon, Save, TrashIcon } from "lucide-react";
import { propertyImage, PropertyImageEditFormRef } from "@/dataHelper/propertyImage.dataHelper";
import { toastError, toastSuccess } from "@/components/ui/toast";

/**
 * Property Edit Page
 * A multi-mode page for editing property details or managing its image gallery.
 */
const PropertyEdit: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { property_id, action } = useParams<{ property_id: string; action: string }>();
  const propertyId = property_id ? Number(property_id) : 0;
  const actionType = action ? action : "edit-property";
  const { data: propertyData, isLoading: propertyLoading, isError: propertyError } = usePropertyQuery(propertyId);
  const { data: imagesData, isLoading: imagesLoading, isError: imagesError } = useImagesByPropertyIdQuery(propertyId);
  const updatePropertyMutation = useUpdatePropertyMutation();
  const updatePropertyImageMutation = useUpdatePropertyImageMutation();
  const deletePropertyImageMutation = useDeletePropertyImageMutation();
  const originalImages = imagesData?.data || [];
  const imagesUpdateRef = React.useRef<PropertyImageEditFormRef | null>(null);
  const [updatingImageIds, setUpdatingImageIds] = React.useState<Set<number>>(new Set());
  const [isAddImageOpen, setIsAddImageOpen] = React.useState(false);
  const resolvedUserId = Number(propertyData?.data?.user_id ?? 0);

  const navigateToPropertyDetail = () => {
    if (propertyId > 0) {
      navigate(`${ROUTERS.PROPERTIES_DETAIL}/${propertyId}`);
      return;
    }
    navigate(ROUTERS.PROPERTIES);
  };

  // handle submit property
  const handleSubmitProperty = async (formData: UpdatePropertyRequest) => {
    try {
      await updatePropertyMutation.mutateAsync({
        id: propertyId,
        data: formData,
      });
      toastSuccess(t("properties.update_property_success"));
    } catch (error) {
      toastError(t("properties.update_property_failed"));
      throw error;
    }
    navigateToPropertyDetail();
  };

  // handle cancel property
  const handleCancel = () => {
    navigateToPropertyDetail();
  };

  // check images
  const checkImages = ({ updatedImages }: { updatedImages: propertyImage[] }): propertyImage[] | undefined => {
    return updatedImages.filter((updatedImage) => {
      const originalImage = originalImages.find((img) => img.id === updatedImage.id);
      if (!originalImage) return false;
      return (
        originalImage.image_type !== updatedImage.image_type ||
        originalImage.sort !== updatedImage.sort
      );
    });
  }
  /**
  * Save images
  */
  const handleSaveImages = async () => {
    if (!imagesUpdateRef.current) return;
    const updatedImages = imagesUpdateRef.current.getUpdatedImages();

    const imagesToUpdate = checkImages({ updatedImages });
    if (!imagesToUpdate || imagesToUpdate.length === 0) return;

    setUpdatingImageIds(new Set(imagesToUpdate.map((img) => img.id)));

    try {
      const updatePromises = imagesToUpdate.map((updatedImage) =>
        updatePropertyImageMutation.mutateAsync({
          id: updatedImage.id,
          data: {
            image_type: updatedImage.image_type,
            id_image_cloudinary: updatedImage.id_image_cloudinary,
            image_url: updatedImage.image_url,
            sort: updatedImage.sort,
          },
        })
      );

      await Promise.all(updatePromises);
      imagesUpdateRef.current.resetImages();
      toastSuccess(t("property-images.update_property_image_success"));
    } catch (error) {
      toastError(t("property-images.update_property_image_failed"));
      throw error;
    }
    finally {
      setUpdatingImageIds(new Set());
    }
  };

  /**
   * Delete images
   */
  const handleDeleteImages = async () => {
    if (!imagesUpdateRef.current) return;

    const selectedImageIds = imagesUpdateRef.current.getSelectedImages();
    if (selectedImageIds.length === 0) return;

    setUpdatingImageIds(new Set(selectedImageIds.map((imageId) => imageId)));
    try {
      const deletePromises = selectedImageIds.map((imageId) =>
        deletePropertyImageMutation.mutateAsync(imageId)
      );
      await Promise.all(deletePromises);
      imagesUpdateRef.current.resetImages();
      toastSuccess(t("property-images.delete_property_image_success"));
    }
    catch (error) {
      toastError(t("property-images.delete_property_image_failed"));
      throw error;
    }
    finally {
      setUpdatingImageIds(new Set());
    }
  };

  /**
   * Add images
   */
  const handleAddImages = () => {
    setIsAddImageOpen(true);
  };

  const property = propertyData?.data || null;
  const images = imagesData?.data || null;
  return (
    <div className="flex flex-col gap-10 p-3 pt-5 sm:p-6">
      <div className="flex flex-row items-center justify-between gap-3">
        {actionType === "edit-property" ? (
          <div className="flex items-center gap-4">
            <Button variant="outline" className="w-fit" onClick={handleCancel}>
              <ArrowLeftIcon className="size-4" />
              {t("common.back")}
            </Button>
            <h2 className="whitespace-nowrap py-3 text-2xl font-bold text-gray-900">{t("properties.edit_property")}</h2>
          </div>
        ) : (
          <h2 className="whitespace-nowrap py-3 text-2xl font-bold text-gray-900">{t("properties.edit_images")}</h2>
        )}
        <div className="flex flex-row items-start justify-center gap-3">
          {action === "edit-images" && images && <>
            <div className="grid grid-cols-2 items-start justify-center gap-3 lg:grid-cols-4 lg:grid-rows-1">
              <Button variant="outline" className="h-11 w-[90%] bg-blue-600 text-[14px] text-white hover:bg-blue-500 md:w-full md:text-[16px]" onClick={handleAddImages}>
                <ImageIcon className="size-5" />
                <span className="hidden lg:block">
                  {t("common.add")}
                </span>
              </Button>
              <Button variant="outline" className="h-11 w-[90%] bg-blue-600 text-[14px] text-white hover:bg-blue-500 md:w-full md:text-[16px]" onClick={handleSaveImages} >
                <Save className="mr-2 size-4" />
                <span className="hidden lg:block">
                  {t("common.save")}
                </span>
              </Button>
              <Button variant="outline" className="h-11 w-[90%] bg-red-600 text-[14px] text-white hover:bg-red-500 hover:text-white md:w-full md:text-[16px]" onClick={handleDeleteImages}>
                <TrashIcon className="size-5" />
                <span className="hidden lg:block">
                  {t("common.delete")}
                </span>
              </Button>
              <Button variant="outline" className="h-11 w-[90%] bg-gray-600 text-[14px] text-white hover:bg-gray-500 md:w-full md:text-[16px]" onClick={handleCancel}>
                <ArrowLeftIcon className="size-5" />
                <span className="hidden lg:block">
                  {t("common.back")}
                </span>
              </Button>
            </div>
          </>}
        </div>
      </div>
      <div className="flex flex-col">
        {actionType === "edit-property" && property &&
          <PropertyEditForm
            userId={resolvedUserId}
            propertyId={propertyId}
            property={property}
            onSubmit={handleSubmitProperty}
            onCancel={handleCancel}
            isLoading={propertyLoading}
            isError={propertyError} />}
        {actionType === "edit-images" && images &&
          <PropertyEditImages ref={imagesUpdateRef}
            userId={resolvedUserId}
            propertyId={propertyId}
            images={images} isLoadingData={imagesLoading} isErrorData={imagesError}
            updatingImageIds={updatingImageIds}
            isErrorUpdate={updatePropertyImageMutation.isError} isErrorDelete={deletePropertyImageMutation.isError}
          />}
      </div>
      {actionType === "edit-images" && (
        <PropertyAddImage
          userId={resolvedUserId}
          propertyId={propertyId}
          open={isAddImageOpen}
          onClose={() => setIsAddImageOpen(false)}
        />
      )}
    </div>
  );
};

export default PropertyEdit;


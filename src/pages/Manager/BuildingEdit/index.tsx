import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { BuildingAddImage, BuildingEditForm } from "./components";
import { useBuildingQuery, useUpdateBuildingMutation } from "@/hooks/useBuildingQuery";
import { BuildingEditFormRef } from "@/dataHelper/building.dataHelper";
import { ROUTERS } from "@/constant";
import BuildingEditImages from "./components/BuildingEditImage";
import { useImagesByBuildingIdQuery, useUpdateBuildingImageMutation, useDeleteBuildingImageMutation } from "@/hooks/useBuildingImageQuery";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ImageIcon, Save, TrashIcon } from "lucide-react";
import { buildingImage, BuildingImageEditFormRef } from "@/dataHelper/buildingImage.dataHelper";
import { toastError, toastSuccess } from "@/components/ui/toast";

/**
 * Building Edit Page
 * A multi-mode page for editing building details or managing its image gallery.
 */
const BuildingEdit: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user_id, building_id, action } = useParams<{ user_id: string, building_id: string, action: string }>();
  const buildingId = building_id ? Number(building_id) : 0;
  const userId = user_id ? Number(user_id) : 0;
  const actionType = action ? action : "edit-building";
  const { data: buildingData, isLoading: buildingLoading, isError: buildingError } = useBuildingQuery(buildingId);
  const { data: imagesData, isLoading: imagesLoading, isError: imagesError } = useImagesByBuildingIdQuery(buildingId);
  const updateBuildingMutation = useUpdateBuildingMutation();
  const updateBuildingImageMutation = useUpdateBuildingImageMutation();
  const deleteBuildingImageMutation = useDeleteBuildingImageMutation();
  const originalImages = imagesData?.data || [];
  const imagesUpdateRef = React.useRef<BuildingImageEditFormRef | null>(null);
  const buildingEditFormRef = React.useRef<BuildingEditFormRef | null>(null);
  const [updatingImageIds, setUpdatingImageIds] = React.useState<Set<number>>(new Set());
  const [isAddImageOpen, setIsAddImageOpen] = React.useState(false);

  // handle submit building
  const handleSubmitBuilding = async () => {
    if (!buildingEditFormRef.current) return;
    const formData = buildingEditFormRef.current.getFormData();
    try {
      await updateBuildingMutation.mutateAsync({
        id: buildingId,
        data: formData,
      });
      toastSuccess(t("buildings.update_building_success"));
    } catch (error) {
      toastError(t("buildings.update_building_failed"));
      throw error;
    }
    navigate(`${ROUTERS.BUILDINGS_DETAIL}/${userId}/${buildingId}`);
  };

  // handle cancel building
  const handleCancel = () => {
    navigate(`${ROUTERS.BUILDINGS_DETAIL}/${userId}/${buildingId}`);
  };

  // check images
  const checkImages = ({ updatedImages }: { updatedImages: buildingImage[] }): buildingImage[] | undefined => {
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
        updateBuildingImageMutation.mutateAsync({
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
      toastSuccess(t("building-images.update_building_image_success"));
    } catch (error) {
      toastError(t("building-images.update_building_image_failed"));
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
        deleteBuildingImageMutation.mutateAsync(imageId)
      );
      await Promise.all(deletePromises);
      imagesUpdateRef.current.resetImages();
      toastSuccess(t("building-images.delete_building_image_success"));
    }
    catch (error) {
      toastError(t("building-images.delete_building_image_failed"));
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

  const building = buildingData?.data || null;
  const images = imagesData?.data || null;
  return (
    <div className="flex flex-col gap-10 p-3 sm:p-6 pt-5">
      <div className="flex flex-row justify-between items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-900 py-3 whitespace-nowrap">{actionType === "edit-building" ? t("buildings.edit_building") : t("buildings.edit_images")}</h2>
        <div className="flex flex-row gap-3 items-start justify-center">
          {action === "edit-images" && images && <>
            <div className="grid grid-cols-2 lg:grid-rows-1 lg:grid-cols-4 gap-3 items-start justify-center">
              <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-500 h-11 w-[90%] md:w-full text-[14px] md:text-[16px]" onClick={handleAddImages}>
                <ImageIcon className="size-5" />
                <span className="hidden lg:block">
                  {t("common.add")}
                </span>
              </Button>
              <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-500 h-11 w-[90%] md:w-full text-[14px] md:text-[16px]" onClick={handleSaveImages} >
                <Save className="mr-2 size-4" />
                <span className="hidden lg:block">
                  {t("common.save")}
                </span>
              </Button>
              <Button variant="outline" className="bg-red-600 text-white hover:bg-red-500 hover:text-white h-11 w-[90%] md:w-full text-[14px] md:text-[16px]" onClick={handleDeleteImages}>
                <TrashIcon className="size-5" />
                <span className="hidden lg:block">
                  {t("common.delete")}
                </span>
              </Button>
              <Button variant="outline" className="bg-gray-600 text-white hover:bg-gray-500 h-11 w-[90%] md:w-full text-[14px] md:text-[16px]" onClick={handleCancel}>
                <ArrowLeftIcon className="size-5" />
                <span className="hidden lg:block">
                  {t("common.back")}
                </span>
              </Button>
            </div>
          </>}
          {actionType === "edit-building" && building && (
            <div className="flex flex-row gap-3 items-start justify-center">
              <Button variant="outline" className="bg-blue-600 text-white hover:bg-blue-500 h-11 w-[90%] md:w-full text-[14px] md:text-[16px]" onClick={handleSubmitBuilding}>
                <Save className="size-5" />
                <span className="hidden lg:block">
                  {t("common.save")}
                </span>
              </Button>
              <Button variant="outline" className="bg-gray-600 text-white hover:bg-gray-500 h-11 w-[90%] md:w-full text-[14px] md:text-[16px]" onClick={handleCancel}>
                <ArrowLeftIcon className="size-5" />
                <span className="hidden lg:block">
                  {t("common.back")}
                </span>
              </Button>
              
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        {actionType === "edit-building" && building &&
          <BuildingEditForm ref={buildingEditFormRef}
            userId={userId}
            buildingId={buildingId}
            building={building}
            isLoading={buildingLoading}
            isError={buildingError} />}
        {actionType === "edit-images" && images &&
          <BuildingEditImages ref={imagesUpdateRef}
            userId={userId}
            buildingId={buildingId}
            images={images} isLoadingData={imagesLoading} isErrorData={imagesError}
            updatingImageIds={updatingImageIds}
            isErrorUpdate={updateBuildingImageMutation.isError} isErrorDelete={deleteBuildingImageMutation.isError}
          />}
      </div>
      {actionType === "edit-images" && (
        <BuildingAddImage
          userId={userId}
          buildingId={buildingId}
          open={isAddImageOpen}
          onClose={() => setIsAddImageOpen(false)}
        />
      )}
    </div>
  );
};

export default BuildingEdit;

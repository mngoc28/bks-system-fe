import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { BuildingAddImage, BuildingEditForm } from "./components";
import { useBuildingQuery, useUpdateBuildingMutation } from "@/hooks/useBuildingQuery";
import { UpdateBuildingRequest } from "@/dataHelper/building.dataHelper";
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
  const { building_id, action } = useParams<{ building_id: string, action: string }>();
  const buildingId = building_id ? Number(building_id) : 0;
  const actionType = action ? action : "edit-building";
  const { data: buildingData, isLoading: buildingLoading, isError: buildingError } = useBuildingQuery(buildingId);
  const { data: imagesData, isLoading: imagesLoading, isError: imagesError } = useImagesByBuildingIdQuery(buildingId);
  const updateBuildingMutation = useUpdateBuildingMutation();
  const updateBuildingImageMutation = useUpdateBuildingImageMutation();
  const deleteBuildingImageMutation = useDeleteBuildingImageMutation();
  const originalImages = imagesData?.data || [];
  const imagesUpdateRef = React.useRef<BuildingImageEditFormRef | null>(null);
  const [updatingImageIds, setUpdatingImageIds] = React.useState<Set<number>>(new Set());
  const [isAddImageOpen, setIsAddImageOpen] = React.useState(false);
  const resolvedUserId = Number(buildingData?.data?.user_id ?? 0);

  const navigateToBuildingDetail = () => {
    if (buildingId > 0) {
      navigate(`${ROUTERS.BUILDINGS_DETAIL}/${buildingId}`);
      return;
    }
    navigate(ROUTERS.BUILDINGS);
  };

  // handle submit building
  const handleSubmitBuilding = async (formData: UpdateBuildingRequest) => {
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
    navigateToBuildingDetail();
  };

  // handle cancel building
  const handleCancel = () => {
    navigateToBuildingDetail();
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
    <div className="flex flex-col gap-10 p-3 pt-5 sm:p-6">
      <div className="flex flex-row items-center justify-between gap-3">
        {actionType === "edit-building" ? (
          <div className="flex items-center gap-4">
            <Button variant="outline" className="w-fit" onClick={handleCancel}>
              <ArrowLeftIcon className="size-4" />
              {t("common.back")}
            </Button>
            <h2 className="whitespace-nowrap py-3 text-2xl font-bold text-gray-900">{t("buildings.edit_building")}</h2>
          </div>
        ) : (
          <h2 className="whitespace-nowrap py-3 text-2xl font-bold text-gray-900">{t("buildings.edit_images")}</h2>
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
        {actionType === "edit-building" && building &&
          <BuildingEditForm
            userId={resolvedUserId}
            buildingId={buildingId}
            building={building}
            onSubmit={handleSubmitBuilding}
            onCancel={handleCancel}
            isLoading={buildingLoading}
            isError={buildingError} />}
        {actionType === "edit-images" && images &&
          <BuildingEditImages ref={imagesUpdateRef}
            userId={resolvedUserId}
            buildingId={buildingId}
            images={images} isLoadingData={imagesLoading} isErrorData={imagesError}
            updatingImageIds={updatingImageIds}
            isErrorUpdate={updateBuildingImageMutation.isError} isErrorDelete={deleteBuildingImageMutation.isError}
          />}
      </div>
      {actionType === "edit-images" && (
        <BuildingAddImage
          userId={resolvedUserId}
          buildingId={buildingId}
          open={isAddImageOpen}
          onClose={() => setIsAddImageOpen(false)}
        />
      )}
    </div>
  );
};

export default BuildingEdit;

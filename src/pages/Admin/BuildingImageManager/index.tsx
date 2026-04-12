import { Button } from "@/components/ui/button";
import { ArrowLeft, ImageIcon, Save } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { toastError, toastSuccess } from "@/components/ui/toast";
import { buildingImage, BuildingImageEditFormRef } from "@/dataHelper/buildingImage.dataHelper";
import {
  useDeleteBuildingImageMutation,
  useImagesByBuildingIdQuery,
  useUpdateBuildingImageMutation,
} from "@/hooks/useBuildingImageQuery";
import { useBuildingQuery } from "@/hooks/useBuildingQuery";
import BuildingAddImage from "@/pages/Admin/BuildingEdit/components/BuildingAddImage";
import BuildingEditImages from "@/pages/Admin/BuildingEdit/components/BuildingEditImage";

const BuildingImageManager: React.FC = () => {
  const { t } = useTranslation();
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();

  const parsedBuildingId = Number(buildingId || 0);
  const isValidBuildingId = Number.isFinite(parsedBuildingId) && parsedBuildingId > 0;

  const { data: imagesData, isLoading: imagesLoading, isError: imagesError } =
    useImagesByBuildingIdQuery(parsedBuildingId, { enabled: isValidBuildingId });
  const { data: buildingData } = useBuildingQuery(parsedBuildingId);

  const originalImages = imagesData?.data || [];
  const resolvedUserId = Number(buildingData?.data?.user_id ?? 0);

  const updateBuildingImageMutation = useUpdateBuildingImageMutation();
  const deleteBuildingImageMutation = useDeleteBuildingImageMutation();

  const imagesRef = useRef<BuildingImageEditFormRef | null>(null);
  const [isAddImageOpen, setIsAddImageOpen] = useState(false);
  const [updatingImageIds, setUpdatingImageIds] = useState<Set<number>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  const checkImages = ({ updatedImages }: { updatedImages: buildingImage[] }): buildingImage[] => {
    return updatedImages.filter((updatedImage) => {
      const originalImage = originalImages.find((img) => img.id === updatedImage.id);
      if (!originalImage) return false;
      return (
        originalImage.image_type !== updatedImage.image_type ||
        originalImage.sort !== updatedImage.sort
      );
    });
  };

  const isBusy =
    updateBuildingImageMutation.isPending ||
    deleteBuildingImageMutation.isPending ||
    updatingImageIds.size > 0;

  const canDelete = useMemo(() => selectedCount > 0 && !isBusy, [selectedCount, isBusy]);
  const canUpload = resolvedUserId > 0 && !isBusy;

  const handleSave = async () => {
    if (!imagesRef.current) return;

    const updatedImages = imagesRef.current.getUpdatedImages();
    const imagesToUpdate = checkImages({ updatedImages });

    if (imagesToUpdate.length === 0) return;

    setUpdatingImageIds(new Set(imagesToUpdate.map((img) => img.id)));

    try {
      await Promise.all(
        imagesToUpdate.map((image) =>
          updateBuildingImageMutation.mutateAsync({
            id: image.id,
            data: {
              image_type: image.image_type,
              id_image_cloudinary: image.id_image_cloudinary,
              image_url: image.image_url,
              sort: image.sort,
            },
          })
        )
      );
      toastSuccess(t("building-images.update_building_image_success"));
    } catch {
      toastError(t("building-images.update_building_image_failed"));
    } finally {
      setUpdatingImageIds(new Set());
    }
  };

  const handleDelete = async () => {
    if (!imagesRef.current) return;
    const selectedImageIds = imagesRef.current.getSelectedImages();
    if (selectedImageIds.length === 0) return;

    setUpdatingImageIds(new Set(selectedImageIds));
    try {
      await Promise.all(selectedImageIds.map((imageId) => deleteBuildingImageMutation.mutateAsync(imageId)));
      toastSuccess(t("building-images.delete_building_image_success"));
    } catch {
      toastError(t("building-images.delete_building_image_failed"));
    } finally {
      setUpdatingImageIds(new Set());
    }
  };

  if (!isValidBuildingId) {
    return <div className="p-6">{t("buildings.empty_description")}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 size-4" />
          {t("common.back")}
        </Button>
        <h1 className="text-2xl font-bold">{t("buildings.edit_images")}</h1>
        <div className="ml-auto flex gap-2">
          <Button disabled={!canUpload} onClick={() => setIsAddImageOpen(true)}>
            <ImageIcon className="mr-2 size-4" />
            {t("common.upload")}
          </Button>
          <Button disabled={!hasChanges || isBusy} onClick={handleSave}>
            <Save className="mr-2 size-4" />
            {t("common.save")}
          </Button>
        </div>
      </div>

      <BuildingEditImages
        ref={imagesRef}
        images={originalImages}
        isLoadingData={imagesLoading}
        isErrorData={imagesError}
        updatingImageIds={updatingImageIds}
        onDeleteSelected={handleDelete}
        isBusy={isBusy}
        onStateChange={(state) => {
          setHasChanges(state.hasChanges);
          setSelectedCount(state.selectedCount);
        }}
      />

      <BuildingAddImage
        userId={resolvedUserId}
        buildingId={parsedBuildingId}
        open={isAddImageOpen}
        onClose={() => setIsAddImageOpen(false)}
      />
    </div>
  );
};

export default BuildingImageManager;
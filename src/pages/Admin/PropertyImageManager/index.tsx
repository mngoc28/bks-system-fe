import { Button } from "@/components/ui/button";
import { ArrowLeft, ImageIcon, Save } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { toastError, toastSuccess } from "@/components/ui/toast";
import { propertyImage, PropertyImageEditFormRef } from "@/dataHelper/propertyImage.dataHelper";
import {
  useDeletePropertyImageMutation,
  useImagesByPropertyIdQuery,
  useUpdatePropertyImageMutation,
} from "@/hooks/usePropertyImageQuery";
import { usePropertyQuery } from "@/hooks/usePropertyQuery";
import PropertyAddImage from "@/pages/Admin/PropertyEdit/components/PropertyAddImage";
import PropertyEditImages from "@/pages/Admin/PropertyEdit/components/PropertyEditImage";

const PropertyImageManager: React.FC = () => {
  const { t } = useTranslation();
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();

  const parsedPropertyId = Number(propertyId || 0);
  const isValidPropertyId = Number.isFinite(parsedPropertyId) && parsedPropertyId > 0;

  const { data: imagesData, isLoading: imagesLoading, isError: imagesError } =
    useImagesByPropertyIdQuery(parsedPropertyId, { enabled: isValidPropertyId });
  const { data: propertyData } = usePropertyQuery(parsedPropertyId);

  const originalImages = imagesData?.data || [];
  const resolvedUserId = Number(propertyData?.data?.user_id ?? 0);

  const updatePropertyImageMutation = useUpdatePropertyImageMutation();
  const deletePropertyImageMutation = useDeletePropertyImageMutation();

  const imagesRef = useRef<PropertyImageEditFormRef | null>(null);
  const [isAddImageOpen, setIsAddImageOpen] = useState(false);
  const [updatingImageIds, setUpdatingImageIds] = useState<Set<number>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const checkImages = ({ updatedImages }: { updatedImages: propertyImage[] }): propertyImage[] => {
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
    updatePropertyImageMutation.isPending ||
    deletePropertyImageMutation.isPending ||
    updatingImageIds.size > 0;


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
          updatePropertyImageMutation.mutateAsync({
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
      toastSuccess(t("property-images.update_property_image_success"));
    } catch {
      toastError(t("property-images.update_property_image_failed"));
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
      await Promise.all(selectedImageIds.map((imageId) => deletePropertyImageMutation.mutateAsync(imageId)));
      toastSuccess(t("property-images.delete_property_image_success"));
    } catch {
      toastError(t("property-images.delete_property_image_failed"));
    } finally {
      setUpdatingImageIds(new Set());
    }
  };

  if (!isValidPropertyId) {
    return <div className="p-6">{t("properties.empty_description")}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 size-4" />
          {t("common.back")}
        </Button>
        <h1 className="text-2xl font-bold">{t("properties.edit_images")}</h1>
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

      <PropertyEditImages
        ref={imagesRef}
        images={originalImages}
        isLoadingData={imagesLoading}
        isErrorData={imagesError}
        updatingImageIds={updatingImageIds}
        onDeleteSelected={handleDelete}
        isBusy={isBusy}
        onStateChange={(state) => {
          setHasChanges(state.hasChanges);
        }}
      />

      <PropertyAddImage
        userId={resolvedUserId}
        propertyId={parsedPropertyId}
        open={isAddImageOpen}
        onClose={() => setIsAddImageOpen(false)}
      />
    </div>
  );
};

export default PropertyImageManager;

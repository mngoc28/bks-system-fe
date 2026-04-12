// import loadingImage from "@/assets/json/loading_image.json";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
// import Lottie from "lottie-react";
// import Lottie from "lottie-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { resolveImageUrl } from "@/utils/imageUtils";
import { ImageIcon, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BuildingImagesCellProps {
  buildingId: number;
  coverImageUrl?: string | null;
}

const BuildingImagesCell = React.memo(({ buildingId, coverImageUrl }: BuildingImagesCellProps) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const previewUrl = resolveImageUrl(coverImageUrl, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL });
  const fallbackImage = '/assets/images/photo_error2.png';

  const handlePreviewClick = () => {
    if (previewUrl) {
      setSelectedImage(previewUrl);
    }
  };

  return (
    <>
      <button
        type="button"
        className="relative"
        onClick={handlePreviewClick}
        title="Xem ảnh tòa nhà"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`building-${buildingId}-cover`}
            className="h-[150px] w-[150px] cursor-pointer rounded object-cover transition-opacity hover:opacity-80"
            onError={(e) => {
              if (e.currentTarget.src !== fallbackImage) {
                e.currentTarget.src = fallbackImage;
              }
            }}
          />
        ) : (
          <div className="h-[150px] w-[150px] flex flex-col items-center justify-center rounded bg-gray-200 p-2 text-center">
            <ImageIcon className="size-8 text-gray-400" />
            <p className="mt-1 text-xs text-gray-500">{t("rooms.no_images_yet")}</p>
          </div>
        )}
      </button>

      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 p-0"
                onClick={() => setSelectedImage(null)}
              >
                <X className="size-4" />
              </Button>
              <img
                src={selectedImage}
                alt="Building image enlarged"
                className="w-full aspect-[4/3] object-cover rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
});

BuildingImagesCell.displayName = "BuildingImagesCell";

export default BuildingImagesCell;


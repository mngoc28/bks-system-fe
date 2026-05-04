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
            className="size-[150px] cursor-pointer rounded object-cover transition-opacity hover:opacity-80"
            onError={(e) => {
              if (e.currentTarget.src !== fallbackImage) {
                e.currentTarget.src = fallbackImage;
              }
            }}
          />
        ) : (
          <div className="flex size-[150px] flex-col items-center justify-center rounded bg-gray-200 p-2 text-center">
            <ImageIcon className="size-8 text-gray-400" />
            <p className="mt-1 text-xs text-gray-500">{t("rooms.no_images_yet")}</p>
          </div>
        )}
      </button>

      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-h-[90vh] max-w-4xl p-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 z-10 size-8 rounded-full bg-black/50 p-0 text-white hover:bg-black/70"
                onClick={() => setSelectedImage(null)}
              >
                <X className="size-4" />
              </Button>
              <img
                src={selectedImage}
                alt="Building image enlarged"
                className="aspect-[4/3] w-full rounded-lg object-cover"
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


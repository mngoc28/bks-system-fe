// import loadingImage from "@/assets/json/loading_image.json";
import ImageLightbox from "@/components/ui/image-lightbox";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import { buildingImage } from "@/dataHelper/buildingImage.dataHelper";
import { useImagesByBuildingIdQuery } from "@/hooks/useBuildingImageQuery";
// import Lottie from "lottie-react";
import { ImageIcon } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";

const BuildingImagesCell = React.memo(({ buildingId }: { buildingId: number }) => {
  const { t } = useTranslation();
  const { data: imagesData, isLoading: isLoadingImages, error: errorImages } = useImagesByBuildingIdQuery(buildingId);
  const allImages = imagesData?.data ?? [];
  const images = allImages.filter((image: buildingImage) => image.sort === 1);
  const [openZoom, setOpenZoom] = React.useState(false);
  const [indexZoom, setIndexZoom] = React.useState(0);

  const imagesLightbox = images
    .filter((image): image is buildingImage & { image_url: string } => Boolean(image.image_url))
    .map((image) => ({ src: CLOUDINARY_HEADER_IMAGE_URL + '/' + image.image_url }));
  return (
    <>
      {isLoadingImages && (
        <div className="flex w-[150px] h-[150px] items-center justify-center rounded-sm border bg-gray-50/50 p-4 font-medium text-slate-500">
          <Spinner size="sm" showText text={t("common.loading_data")} />
        </div>
      )}
      {errorImages && (
        <div className="text-center flex flex-col items-center justify-center bg-gray-200  border rounded-sm p-4 w-[150px] h-[150px]">
          <ImageIcon className="size-10 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">{t("rooms.no_images_yet")}</p>
        </div>
      )}
      {!errorImages && (
        <div className="flex items-center gap-1 flex-wrap justify-center">
          {images.map((image: buildingImage, index: number) => {
            if (!image.image_url) {
              return (
                <div
                  key={image.id}
                  className="w-[150px] h-[150px] text-center flex flex-col items-center justify-center bg-gray-200 border rounded-sm p-4"
                >
                  <ImageIcon className="size-10 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 text-xs">{t("rooms.no_images_yet")}</p>
                </div>
              );
            }
            return (
              <img
                key={image.id}
                src={CLOUDINARY_HEADER_IMAGE_URL + '/' + image.image_url}
                alt={image.id_image_cloudinary || `image-${image.id}`}
                className="w-[150px] h-[150px] object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                onError={(e) => (e.currentTarget.src = "/assets/images/photo_error.png")}
                onClick={() => {
                  setOpenZoom(true);
                  setIndexZoom(index);
                }}
              />
            );
          })}
        </div>
      )}
      {!isLoadingImages && !errorImages && images.length === 0 && (
        <div className="text-center flex flex-col items-center justify-center bg-gray-200  border rounded-sm p-4 w-[150px] h-[150px]" >
          <ImageIcon className="size-10 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">{t("rooms.no_images_yet")}</p>
        </div>
      )}
      {images.length > 0 && (
        <ImageLightbox
          open={openZoom}
          onClose={() => setOpenZoom(false)}
          index={indexZoom}
          slides={imagesLightbox}
        />
      )}
    </>
  )
});

BuildingImagesCell.displayName = "BuildingImagesCell";

export default BuildingImagesCell;


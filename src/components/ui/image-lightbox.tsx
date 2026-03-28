import React from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { LIGHTBOX_DOUBLE_CLICK_DELAY, LIGHTBOX_DOUBLE_CLICK_MAX_STOPS, LIGHTBOX_DOUBLE_TAP_DELAY, LIGHTBOX_MAX_ZOOM_PIXEL_RATIO, LIGHTBOX_PINCH_ZOOM_DISTANCE_FACTOR, LIGHTBOX_ZOOM_IN_MULTIPLIER } from "@/constant";

export interface ImageLightboxProps {
    open: boolean;
    onClose: () => void;
    index: number;
    slides: Array<{ src: string }>;
    maxZoomPixelRatio?: number;
    zoomInMultiplier?: number;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
    open,
    onClose,
    index,
    slides,
    maxZoomPixelRatio = LIGHTBOX_MAX_ZOOM_PIXEL_RATIO,
    zoomInMultiplier = LIGHTBOX_ZOOM_IN_MULTIPLIER,
}) => {
    return (
        <Lightbox
            open={open}
            close={onClose}
            index={index}
            slides={slides}
            plugins={[Zoom, Thumbnails]}
            zoom={{
                maxZoomPixelRatio,
                zoomInMultiplier,
                doubleTapDelay: LIGHTBOX_DOUBLE_TAP_DELAY,
                doubleClickDelay: LIGHTBOX_DOUBLE_CLICK_DELAY,
                doubleClickMaxStops: LIGHTBOX_DOUBLE_CLICK_MAX_STOPS,
                pinchZoomDistanceFactor: LIGHTBOX_PINCH_ZOOM_DISTANCE_FACTOR,
                scrollToZoom: true,
            }}
            controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
            styles={{
                container: {
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    zIndex: 9999,
                },
                slide: {
                    cursor: "zoom-in",
                },
                thumbnail: {
                    backgroundColor: "rgba(0,0,0,0.5)",
                },
            }}
        />
    );
};

export default ImageLightbox;


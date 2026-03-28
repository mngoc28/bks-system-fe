import { RoomCarouselContainerProps } from "../type";
import RoomCarouselContainer from "./RoomCarouselContainer";

export type FeaturedRoomCarouselProps = RoomCarouselContainerProps;

const FeaturedRoomCarousel = (props: FeaturedRoomCarouselProps) => {
  return <RoomCarouselContainer {...props} />;
};

export default FeaturedRoomCarousel;

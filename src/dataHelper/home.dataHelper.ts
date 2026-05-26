export interface RoomCard {
  id: number | string;
  name: string;
  address: string;
  price: string;
  image: string;
  area: string;
  beds: number | string;
  tourist_summary?: {
    has_tourist_mapping: boolean;
    tourist_spot_name?: string | null;
    travel_time_label?: string | null;
    distance_label?: string | null;
  } | null;
  reviews_count?: number;
  reviews_avg_rating?: number | string;
  room_type?: number | string;
  property_type_name?: string;
}

export interface Room {
    id: number;
    province_id?: number;
    title: string;
    room_type: string;
    people: number;
    description?: string;
    province_name: string;
    property_address: string;
    property_type_name?: string;
    property_type_id?: number;
    cheapest_daily_price: number;
    cheapest_monthly_price?: number;
    all_prices?: string;
    amenities?: string;
    room_image?: string;
    area?: number | string;
    tourist_summary?: {
        has_tourist_mapping: boolean;
        tourist_spot_name?: string | null;
        travel_time_label?: string | null;
        distance_label?: string | null;
    } | null;
    reviews_count?: number;
    reviews_avg_rating?: number | string;
}

export interface SuggestedRoomsByProvinceGroup {
    province_id: number | null;
    province_name: string;
    province_name_en?: string | null;
    rooms: Room[];
}

export interface SuggestedRoomsByProvinceParams {
    province_ids?: number[];
    limit?: number;
}

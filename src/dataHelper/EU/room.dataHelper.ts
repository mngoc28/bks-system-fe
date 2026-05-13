export interface Room {
    id: number;
    province_id?: number;
    title: string;
    room_type: string;
    people: number;
    description?: string;
    province_name: string;
    building_address: string;
    property_type_name?: string;
    property_type_id?: number;
    cheapest_daily_price: number;
    cheapest_monthly_price?: number;
    all_prices?: string;
    amenities?: string;
    room_image?: string;
    area?: number | string;
}
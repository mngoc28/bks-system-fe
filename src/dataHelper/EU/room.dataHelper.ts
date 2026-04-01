export interface Room {
    id: number;
    province_id?: number;
    title: string;
    room_type: string;
    people: number;
    description?: string;
    province_name: string;
    building_address: string;
    cheapest_daily_price: number;
    amenities?: string;
    room_image?: string;
}
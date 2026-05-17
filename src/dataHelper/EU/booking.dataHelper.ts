export interface CreateBookingRequest {
    partner_id: number;
    room_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    check_in: string;
    check_out: string;
    number_of_guests: number;
    special_requests?: string;
}

export interface CreateBookingUserRequest {
    name: string;
    email: string;
    phone: string;
    start_date: string;
    end_date: string;
    note?: string;
    service_ids?: number[];
}

/** Payload returned after POST bookings/:roomId/user-create (and public lookup). */
export interface PublicBookingSummary {
    booking_id: number;
    booking_code: string;
    user_id?: number;
    status: number;
    start_date: string;
    end_date: string;
    room_id: number;
    /** `room_prices.id` when BE includes it (T6 sync). */
    price_id?: number;
    total_amount: number;
    room_title: string;
    property_address: string;
}

/** Một dòng lưu trong `publicMyBookings` (localStorage) trước khi sync sau đăng nhập Stay. */
export interface LocalPublicBookingRow {
    local_id: string;
    room_id: number;
    start_date: string;
    end_date: string;
    email: string;
    price_id?: number;
}

export interface PublicBookingLookupRequest {
    email: string;
    booking_code: string;
}

export interface ServiceItem {
    id: number;
    name: string;
    price: string;
}

export interface BookingResponse {
    id: number;
    partner_id: number;
    room_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    check_in: string;
    check_out: string;
    number_of_guests: number;
    special_requests?: string;
    status: 'pending' | 'confirmed' | 'canceled';
    created_at: string;
    updated_at: string;
}
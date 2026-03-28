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
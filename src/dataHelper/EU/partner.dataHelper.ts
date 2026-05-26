export interface Partner {
    id: number;
    user_id: number;
    province_id: number;
    ward_id: number;
    address?: string;
    company_name: string;
    phone?: string;
    user_email?: string;
    website?: string;
    description?: string;
    image_1?: string;
    province_name: string;
    reviews_count?: number;
    reviews_avg_rating?: number | string;
}

export interface PartnerDetail extends Partner {
    image_2?: string;
    image_3?: string;
}
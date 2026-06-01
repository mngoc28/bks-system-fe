import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constant";


export interface PartnerInfor {
    id: number;
    user_id: number;
    province_id: number;
    ward_id: number;
    user_name: string;
    province_name: string;
    ward_name: string;
    address: string | null;
    company_name: string;
    phone: string | null;
    website: string | null;
    description: string | null;
    image_1: string | null;
    image_2: string | null;
    image_3: string | null;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
}

export interface PartnerFilter {
    user_name?: string;
    company_name?: string;
    status?: string;
    province_name?: string;
    ward_name?: string;
    phone?: string;
    website?: string;
    address?: string;
    page?: number | typeof DEFAULT_PAGE;
    per_page?: number | typeof DEFAULT_LIMIT;
    sort_field?: string;
    sort_direction?: string;
}

export interface PartnerResponse {
    current_page: number;
    data: PartnerInfor[];
    first_page_url: string | null;
    from: number;
    last_page: number;
    last_page_url: string | null;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PartnerDetailResponse {
    status: string;
    data: PartnerDetail;
    message: string;
}

export interface PartnerUpdateResponse {
    status: string;
    data: PartnerDetail;
    message: string;
}

export interface PartnerUpdate {
    company_name?: string;
    province_id?: number;
    ward_id?: number;
    phone?: string;
    address?: string;
    website?: string;
    description?: string;
    image_1?: File | null | 'delete';
    image_2?: File | null | 'delete';
    image_3?: File | null | 'delete';
}

export interface PartnerDetail {
    id: number;
    user_id: number;
    province_id: number;
    ward_id: number;
    user_name: string;
    province_name: string;
    ward_name: string;
    address?: string;
    company_name?: string;
    phone?: string;
    website?: string;
    image_1?: string;
    image_2?: string;
    image_3?: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface PartnerSearchSectionProps {
    open: boolean;
    value:{
        user_name?: string;
        company_name?: string;
        status?: string;
        province_name?: string;
        ward_name?: string;
        phone?: string;
        website?: string;
        address?: string;
    };
    onChange: (newValue: {
        user_name?: string;
        company_name?: string;
        status?: string;
        province_name?: string;
        ward_name?: string;
        phone?: string;
        website?: string;
        address?: string;
    }) => void;
    onReset: () => void;
    onClose: () => void;
}

export interface PartnerTableProps {
    filtered: Partner[];
    onSort: (key: "id" | "company_name" | "user_name" | "province_name" | "ward_name") => void;
    filters: PartnerFilter;
}

export interface Partner {
    id: number;
    user_id: number;
    company_name: string;
    user_name: string;
    province_name: string;
    ward_name: string;
    address: string | null;
    phone: string | null;
    image_1: string | null;
}

export interface PartnerCard {
  id: number | string;
  name: string;
  address: string;
  image: string;
  reviews_count?: number;
  reviews_avg_rating?: number | string;
}

export interface PartnerGridProps {
  partners: PartnerCard[];
  className?: string;
  heading?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  loading?: boolean;
}
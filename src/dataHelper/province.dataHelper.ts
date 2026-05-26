
export interface ProvinceResponse {
    status: string;
    message: string | null;
    data: Provinces;
}

export interface Province {
    id: number;
    name: string;
    name_en: string;
    created_at: string;
    updated_at: string;
    updated_by: number;
    created_by: number;
}
export interface ProvinceDetail {
    id: number;
    name: string;
    name_en: string;
    ward_count: number;
    room_count: number;
    rooms: room[];
    wards: ward[];
    created_at: string;
    updated_at: string;
}

export interface room {
    id: number;
    room_number: string;
    title: string;
}

export interface ward {
    id: number;
    name: string;
    room_number: number;
}

export interface Provinces {
    id: number;
    name: string;
    name_en: string;
    ward_count: number;
    room_count: number;
}

export interface ProvinceFilter {
    name?: string;
    page?: number;
    per_page?: number;
    sort_field?: "id" | "name";
    sort_direction?: "asc" | "desc";
}

export interface ProvinceFilters{
    name?: string;
    page?: number;
    per_page?: number;
}

export interface ProvinceDetailFormProps {
    province:   ProvinceDetail;
    onCancel: () => void;
    isLoading?: boolean;
}
export interface ProvinceDetailApiResponse {
    status: string;
    message: string | null;
    data: ProvinceDetail;
}

export interface ProvinceTypes {
    id: number;
    name: string;
    name_en: string;
}

export interface ProvinceCard extends ProvinceTypes {
  image: string;
}

export interface ProvinceCarouselProps {
  provinces: ProvinceCard[];
  className?: string;
  heading?: string;
  description?: string;
    ctaLabel?: string;
    ctaHref?: string;
}

export interface ProvinceTableProps {
  filtered: Provinces[];
  onView: (id: number) => void;
  onSort: (field: string) => void;
  filters: ProvinceFilter;
}
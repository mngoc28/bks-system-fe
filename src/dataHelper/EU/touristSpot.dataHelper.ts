export interface TouristSpotSuggestion {
  id: number;
  name: string;
  slug: string;
  region_label: string | null;
  is_featured: boolean;
  category?: string | null;
}

export interface TouristSpotListParams {
  keyword?: string;
  featured_only?: boolean;
  limit?: number;
  province_id?: number;
}

import { PartnerPropertySortOption } from '@/pages/Partner/components/PartnerPropertyAdvancedFilters';

export type PartnerOccupancyFilter = '' | 'vacant' | 'occupied' | 'maintenance';
export type PartnerRatingFilter = '' | '0' | '3' | '4';
export type PartnerHasRoomsFilter = '' | '0' | '1';

export interface PartnerPropertiesUrlState {
  keyword: string;
  type: number | string;
  rent: number | string;
  provinceId: string;
  wardId: string;
  sort: PartnerPropertySortOption;
  page: number;
  perPage: number;
  occupancy: PartnerOccupancyFilter;
  rating: PartnerRatingFilter;
  hasRooms: PartnerHasRoomsFilter;
}

const SORT_OPTIONS: PartnerPropertySortOption[] = [
  'id_desc',
  'name_asc',
  'rooms_count_desc',
  'reviews_avg_rating_desc',
];

const isSortOption = (value: string | null): value is PartnerPropertySortOption =>
  !!value && SORT_OPTIONS.includes(value as PartnerPropertySortOption);

const isOccupancyFilter = (value: string | null): value is PartnerOccupancyFilter =>
  value === '' || value === 'vacant' || value === 'occupied' || value === 'maintenance';

const isRatingFilter = (value: string | null): value is PartnerRatingFilter =>
  value === '' || value === '0' || value === '3' || value === '4';

const isHasRoomsFilter = (value: string | null): value is PartnerHasRoomsFilter =>
  value === '' || value === '0' || value === '1';

export const parsePartnerPropertiesUrl = (params: URLSearchParams): PartnerPropertiesUrlState => {
  const typeRaw = params.get('type');
  const rentRaw = params.get('rent');
  const pageRaw = params.get('page');
  const perPageRaw = params.get('per_page');
  const sortRaw = params.get('sort');

  const occupancyRaw = params.get('occupancy');
  const ratingRaw = params.get('min_rating');
  const hasRoomsRaw = params.get('has_rooms');

  return {
    keyword: params.get('keyword') ?? '',
    type: typeRaw && typeRaw !== '0' ? Number(typeRaw) : 0,
    rent: rentRaw && rentRaw !== '0' ? Number(rentRaw) : 0,
    provinceId: params.get('province') ?? '',
    wardId: params.get('ward') ?? '',
    sort: isSortOption(sortRaw) ? sortRaw : 'id_desc',
    page: pageRaw ? Math.max(1, Number(pageRaw) || 1) : 1,
    perPage: perPageRaw ? Math.max(1, Number(perPageRaw) || 5) : 5,
    occupancy: isOccupancyFilter(occupancyRaw) ? occupancyRaw : '',
    rating: isRatingFilter(ratingRaw) ? ratingRaw : '',
    hasRooms: isHasRoomsFilter(hasRoomsRaw) ? hasRoomsRaw : '',
  };
};

export const buildPartnerPropertiesUrlParams = (state: PartnerPropertiesUrlState): URLSearchParams => {
  const params = new URLSearchParams();

  if (state.keyword.trim()) {
    params.set('keyword', state.keyword.trim());
  }
  if (Number(state.type) !== 0) {
    params.set('type', String(state.type));
  }
  if (Number(state.rent) !== 0) {
    params.set('rent', String(state.rent));
  }
  if (state.provinceId) {
    params.set('province', state.provinceId);
  }
  if (state.wardId) {
    params.set('ward', state.wardId);
  }
  if (state.sort !== 'id_desc') {
    params.set('sort', state.sort);
  }
  if (state.page > 1) {
    params.set('page', String(state.page));
  }
  if (state.perPage !== 5) {
    params.set('per_page', String(state.perPage));
  }
  if (state.occupancy) {
    params.set('occupancy', state.occupancy);
  }
  if (state.rating) {
    params.set('min_rating', state.rating);
  }
  if (state.hasRooms) {
    params.set('has_rooms', state.hasRooms);
  }

  return params;
};

export const ratingFilterToMinRating = (rating: PartnerRatingFilter): number | undefined => {
  if (!rating) return undefined;
  return Number(rating);
};

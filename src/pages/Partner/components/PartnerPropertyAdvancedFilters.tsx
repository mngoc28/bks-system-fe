import React from 'react';
import AdvancedFilterPanel, {
  FilterField,
  FilterSelect,
} from '@/components/common/AdvancedFilterPanel';
import SearchableSelect from '@/components/ui/searchable-select';
import { filterSelectTriggerClassName } from '@/components/common/AdvancedFilterPanel';
import {
  PartnerHasRoomsFilter,
  PartnerOccupancyFilter,
  PartnerRatingFilter,
} from '@/utils/partnerPropertiesUrlParams';

export type PartnerPropertySortOption =
  | 'id_desc'
  | 'name_asc'
  | 'rooms_count_desc'
  | 'reviews_avg_rating_desc';

export const PARTNER_PROPERTY_SORT_PRESETS: Record<
  PartnerPropertySortOption,
  { field: string; order: 'asc' | 'desc' }
> = {
  id_desc: { field: 'id', order: 'desc' },
  name_asc: { field: 'name', order: 'asc' },
  rooms_count_desc: { field: 'rooms_count', order: 'desc' },
  reviews_avg_rating_desc: { field: 'reviews_avg_rating', order: 'desc' },
};

const SORT_OPTIONS: { value: PartnerPropertySortOption; label: string }[] = [
  { value: 'id_desc', label: 'Mới nhất' },
  { value: 'name_asc', label: 'Tên A → Z' },
  { value: 'rooms_count_desc', label: 'Nhiều phòng nhất' },
  { value: 'reviews_avg_rating_desc', label: 'Đánh giá cao nhất' },
];

const OCCUPANCY_OPTIONS: { value: PartnerOccupancyFilter; label: string }[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'vacant', label: 'Có phòng trống' },
  { value: 'occupied', label: 'Có phòng đang thuê' },
  { value: 'maintenance', label: 'Có phòng bảo trì' },
];

const RATING_OPTIONS: { value: PartnerRatingFilter; label: string }[] = [
  { value: '', label: 'Tất cả đánh giá' },
  { value: '4', label: 'Từ 4 sao trở lên' },
  { value: '3', label: 'Từ 3 sao trở lên' },
  { value: '0', label: 'Chưa có đánh giá' },
];

const HAS_ROOMS_OPTIONS: { value: PartnerHasRoomsFilter; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: '1', label: 'Có phòng' },
  { value: '0', label: 'Chưa có phòng' },
];

type PartnerPropertyAdvancedFiltersProps = {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  provinceId: string;
  wardId: string;
  sortOption: PartnerPropertySortOption;
  occupancyFilter: PartnerOccupancyFilter;
  ratingFilter: PartnerRatingFilter;
  hasRoomsFilter: PartnerHasRoomsFilter;
  provinces: Array<{ id: number | string; name: string }>;
  wards: Array<{ id: number | string; name: string }>;
  onProvinceChange: (provinceId: string) => void;
  onWardChange: (wardId: string) => void;
  onSortChange: (sort: PartnerPropertySortOption) => void;
  onOccupancyChange: (value: PartnerOccupancyFilter) => void;
  onRatingChange: (value: PartnerRatingFilter) => void;
  onHasRoomsChange: (value: PartnerHasRoomsFilter) => void;
};

const PartnerPropertyAdvancedFilters: React.FC<PartnerPropertyAdvancedFiltersProps> = ({
  open,
  onClose,
  onReset,
  provinceId,
  wardId,
  sortOption,
  occupancyFilter,
  ratingFilter,
  hasRoomsFilter,
  provinces,
  wards,
  onProvinceChange,
  onWardChange,
  onSortChange,
  onOccupancyChange,
  onRatingChange,
  onHasRoomsChange,
}) => (
  <AdvancedFilterPanel open={open} onClose={onClose} onReset={onReset}>
    <FilterField label="Tỉnh/Thành phố">
      <SearchableSelect
        value={provinceId}
        onValueChange={(next) => {
          onProvinceChange(next);
          onWardChange('');
        }}
        options={provinces.map((province) => ({
          value: String(province.id),
          label: province.name,
        }))}
        placeholder="Tất cả tỉnh/thành"
        searchPlaceholder="Tìm tỉnh/thành..."
        emptyMessage="Không tìm thấy"
        triggerClassName={filterSelectTriggerClassName}
      />
    </FilterField>

    <FilterField label="Phường/Xã">
      <SearchableSelect
        value={wardId}
        onValueChange={onWardChange}
        options={wards.map((ward) => ({
          value: String(ward.id),
          label: ward.name,
        }))}
        placeholder="Tất cả phường/xã"
        searchPlaceholder="Tìm phường/xã..."
        emptyMessage="Không tìm thấy"
        disabled={!provinceId}
        triggerClassName={filterSelectTriggerClassName}
      />
    </FilterField>

    <FilterField label="Sắp xếp">
      <FilterSelect
        value={sortOption}
        onValueChange={(next) => onSortChange(next as PartnerPropertySortOption)}
        placeholder="Mới nhất"
        options={SORT_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
      />
    </FilterField>

    <FilterField label="Trạng thái phòng">
      <FilterSelect
        value={occupancyFilter || 'all'}
        onValueChange={(next) => onOccupancyChange(next === 'all' ? '' : (next as PartnerOccupancyFilter))}
        placeholder="Tất cả trạng thái"
        options={OCCUPANCY_OPTIONS.map((option) => ({
          value: option.value || 'all',
          label: option.label,
        }))}
      />
    </FilterField>

    <FilterField label="Đánh giá">
      <FilterSelect
        value={ratingFilter || 'all'}
        onValueChange={(next) => onRatingChange(next === 'all' ? '' : (next as PartnerRatingFilter))}
        placeholder="Tất cả đánh giá"
        options={RATING_OPTIONS.map((option) => ({
          value: option.value || 'all',
          label: option.label,
        }))}
      />
    </FilterField>

    <FilterField label="Số phòng">
      <FilterSelect
        value={hasRoomsFilter || 'all'}
        onValueChange={(next) => onHasRoomsChange(next === 'all' ? '' : (next as PartnerHasRoomsFilter))}
        placeholder="Tất cả"
        options={HAS_ROOMS_OPTIONS.map((option) => ({
          value: option.value || 'all',
          label: option.label,
        }))}
      />
    </FilterField>
  </AdvancedFilterPanel>
);

export default PartnerPropertyAdvancedFilters;

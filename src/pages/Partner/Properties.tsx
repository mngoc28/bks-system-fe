import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  DoorOpen,
  Edit,
  Image as ImageIcon,
  Layers,
  Loader2,
  MapPin,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { PlainTextarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SearchableSelect from '@/components/ui/searchable-select';
import Pagination from '@/components/Pagination';
import { MASTER_DATA_QUERY_OPTIONS } from '@/lib/queryCache';
import { getCurrentUserIdFromToken } from '@/lib/echoClient';
import {
  useInvalidatePartnerPropertyQueries,
  usePartnerPropertiesQuery,
} from '@/hooks/Partner/usePartnerPropertiesQuery';
import { usePartnerStatsQuery } from '@/hooks/usePartnerDashboardQuery';
import { usePartnerPropertyTypesQuery } from '@/hooks/usePropertyQuery';
import { partnerService } from '@/services/partnerService';
import { RENT_CATEGORY } from '@/constant';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { normalizeStayPropertyTypeLabel } from '@/utils/stayPropertyType';
import {
  buildPartnerPropertiesUrlParams,
  parsePartnerPropertiesUrl,
  PartnerHasRoomsFilter,
  PartnerOccupancyFilter,
  PartnerRatingFilter,
  ratingFilterToMinRating,
} from '@/utils/partnerPropertiesUrlParams';
import { Property } from './types';
import InlineSheet from './components/InlineSheet';
import PartnerImageManager from './components/PartnerImageManager';
import PartnerPropertyAdvancedFilters, {
  PARTNER_PROPERTY_SORT_PRESETS,
  PartnerPropertySortOption,
} from './components/PartnerPropertyAdvancedFilters';
import { PartnerSectionCard, PartnerSectionHeader } from './components/ResponsiveBlocks';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

const formatPropertyLocation = (property: Property): string => {
  const parts = [property.ward_name, property.province_name].filter(Boolean);
  if (parts.length > 0) return parts.join(', ');
  return property.address || '—';
};

const getPropertyTypeBadgeClass = (typeName: string): string => {
  const normalized = typeName.toLowerCase();
  if (normalized.includes('villa') || normalized.includes('biệt thự')) {
    return 'bg-violet-100 text-violet-800';
  }
  if (normalized.includes('căn hộ') || normalized.includes('apartment')) {
    return 'bg-indigo-100 text-indigo-800';
  }
  return 'bg-[#C4E7FF] text-[#004C69]';
};

const VacancyCell: React.FC<{ property: Property }> = ({ property }) => {
  const totalRooms = property.totalRooms || property.rooms_count || 0;
  const vacantCount = property.vacant_rooms_count;
  const vacancyRate = property.vacancy_rate;

  if (vacantCount == null && vacancyRate == null) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  const rate = vacancyRate ?? (totalRooms > 0 && vacantCount != null
    ? Math.round((vacantCount / totalRooms) * 100)
    : 0);
  const count = vacantCount ?? Math.round((rate / 100) * totalRooms);
  const barColor = rate >= 30 ? 'bg-emerald-500' : rate >= 15 ? 'bg-[#00A2DA]' : 'bg-amber-500';
  const textColor = rate >= 30 ? 'text-emerald-600' : rate >= 15 ? 'text-[#00668A]' : 'text-amber-600';
  const roomLabel = totalRooms > 0 ? `${count}/${totalRooms} phòng` : `${count} phòng`;

  return (
    <div className="flex min-w-[120px] flex-col gap-1">
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span className={textColor}>{rate}%</span>
        <span className="text-slate-400">{roomLabel}</span>
      </div>
      <div className="h-1.5 w-full max-w-[128px] overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(rate, 100)}%` }} />
      </div>
    </div>
  );
};

const PropertyRatingStars: React.FC<{ rating: number; count?: number }> = ({ rating, count = 0 }) => {
  if (rating <= 0) {
    return <span className="text-xs text-slate-400">Chưa có</span>;
  }

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < fullStars || (index === fullStars && hasHalf);
        return (
          <Star
            key={index}
            className={`size-3.5 ${filled ? 'fill-amber-400 text-amber-400' : 'text-amber-200'}`}
          />
        );
      })}
      {count > 0 ? (
        <span className="ml-1 text-[10px] font-normal text-slate-400">({count})</span>
      ) : null}
    </div>
  );
};

const Properties: React.FC = () => {
  const navigate = useNavigate();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const initialUrlState = useMemo(() => parsePartnerPropertiesUrl(urlSearchParams), []);
  const { t } = useTranslation();
  const { invalidateList } = useInvalidatePartnerPropertyQueries();
  const [canLoadPropertyTypes, setCanLoadPropertyTypes] = useState(false);

  const [currentPage, setCurrentPage] = useState(initialUrlState.page);
  const [searchKeyword, setSearchKeyword] = useState(initialUrlState.keyword);
  const [selectedType, setSelectedType] = useState<number | string>(initialUrlState.type);
  const [selectedRentCategory, setSelectedRentCategory] = useState<number | string>(initialUrlState.rent);
  const [selectedProvinceId, setSelectedProvinceId] = useState(initialUrlState.provinceId);
  const [selectedWardId, setSelectedWardId] = useState(initialUrlState.wardId);
  const [sortOption, setSortOption] = useState<PartnerPropertySortOption>(initialUrlState.sort);
  const [occupancyFilter, setOccupancyFilter] = useState<PartnerOccupancyFilter>(initialUrlState.occupancy);
  const [ratingFilter, setRatingFilter] = useState<PartnerRatingFilter>(initialUrlState.rating);
  const [hasRoomsFilter, setHasRoomsFilter] = useState<PartnerHasRoomsFilter>(initialUrlState.hasRooms);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [perPage, setPerPage] = useState(initialUrlState.perPage);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<Set<string>>(new Set());

  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteTargetProperty, setDeleteTargetProperty] = useState<Property | null>(null);
  const [isSingleDeleting, setIsSingleDeleting] = useState(false);

  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [imageManagerTarget, setImageManagerTarget] = useState<{ id: string; name: string } | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const debouncedSearchKeyword = useDebouncedValue(searchKeyword, 500);
  const prevFiltersRef = useRef({
    debounced: debouncedSearchKeyword,
    type: Number(selectedType),
    rent: Number(selectedRentCategory),
    provinceId: selectedProvinceId,
    wardId: selectedWardId,
    sort: sortOption,
    occupancy: occupancyFilter,
    rating: ratingFilter,
    hasRooms: hasRoomsFilter,
  });

  const { data: stats, isLoading: statsLoading } = usePartnerStatsQuery();

  const { data: provincesRes } = useQuery({
    queryKey: ['partner', 'provinces', 'all'],
    queryFn: () => partnerService.getProvinces(),
    ...MASTER_DATA_QUERY_OPTIONS,
  });

  const provinces = useMemo(() => {
    const raw = (provincesRes as { data?: unknown })?.data ?? provincesRes;
    return Array.isArray(raw) ? raw : [];
  }, [provincesRes]);

  const { data: wardsRes } = useQuery({
    queryKey: ['partner', 'wards', selectedProvinceId],
    queryFn: () => partnerService.getWardsByProvince(Number(selectedProvinceId)),
    enabled: !!selectedProvinceId,
    ...MASTER_DATA_QUERY_OPTIONS,
  });

  const wards = useMemo(() => {
    const raw = (wardsRes as { data?: unknown })?.data ?? wardsRes;
    return Array.isArray(raw) ? raw : [];
  }, [wardsRes]);

  const selectedProvinceName = useMemo(
    () => provinces.find((item: { id: number | string }) => String(item.id) === selectedProvinceId)?.name as string | undefined,
    [provinces, selectedProvinceId],
  );

  const selectedWardName = useMemo(
    () => wards.find((item: { id: number | string }) => String(item.id) === selectedWardId)?.name as string | undefined,
    [wards, selectedWardId],
  );

  const typeNum = Number(selectedType);
  const rentNum = Number(selectedRentCategory);
  const minRatingValue = ratingFilterToMinRating(ratingFilter);
  const hasAdvancedFilters =
    !!selectedProvinceId
    || !!selectedWardId
    || sortOption !== 'id_desc'
    || !!occupancyFilter
    || !!ratingFilter
    || !!hasRoomsFilter;
  const hasActiveFilters =
    Boolean(searchKeyword) || typeNum !== 0 || rentNum !== 0 || hasAdvancedFilters;

  const listFilters = useMemo(
    () => ({
      page: currentPage,
      perPage,
      keyword: debouncedSearchKeyword || undefined,
      propertyTypeId: typeNum && typeNum !== 0 ? typeNum : undefined,
      rentCategory: rentNum && rentNum !== 0 ? rentNum : undefined,
      provinceName: selectedProvinceName || undefined,
      wardName: selectedWardName || undefined,
      sort: PARTNER_PROPERTY_SORT_PRESETS[sortOption],
      includeCover: true,
      occupancyFilter: occupancyFilter || undefined,
      minRating: minRatingValue,
      hasRooms: hasRoomsFilter !== '' ? (Number(hasRoomsFilter) as 0 | 1) : undefined,
    }),
    [
      currentPage,
      perPage,
      debouncedSearchKeyword,
      typeNum,
      rentNum,
      selectedProvinceName,
      selectedWardName,
      sortOption,
      occupancyFilter,
      minRatingValue,
      hasRoomsFilter,
    ],
  );

  const { data: listData, isLoading, isFetching } = usePartnerPropertiesQuery(listFilters);
  const { data: propertyTypes } = usePartnerPropertyTypesQuery(canLoadPropertyTypes);

  const properties = listData?.items ?? [];
  const totalPages = listData?.lastPage ?? 1;
  const totalItems = listData?.total ?? 0;
  const loading = isLoading && properties.length === 0;

  const propertyTypeNameById = useMemo(() => {
    const map: Record<string, string> = {};
    (propertyTypes?.data ?? []).forEach((type: { id: number | string; name: string }) => {
      map[String(type.id)] = normalizeStayPropertyTypeLabel(type.name);
    });
    return map;
  }, [propertyTypes?.data]);

  useEffect(() => {
    if (!isLoading) {
      setCanLoadPropertyTypes(true);
      return;
    }
    const id = window.setTimeout(() => setCanLoadPropertyTypes(true), 2500);
    return () => window.clearTimeout(id);
  }, [isLoading]);

  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.debounced !== debouncedSearchKeyword
      || prevFiltersRef.current.type !== typeNum
      || prevFiltersRef.current.rent !== rentNum
      || prevFiltersRef.current.provinceId !== selectedProvinceId
      || prevFiltersRef.current.wardId !== selectedWardId
      || prevFiltersRef.current.sort !== sortOption
      || prevFiltersRef.current.occupancy !== occupancyFilter
      || prevFiltersRef.current.rating !== ratingFilter
      || prevFiltersRef.current.hasRooms !== hasRoomsFilter;

    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    prevFiltersRef.current = {
      debounced: debouncedSearchKeyword,
      type: typeNum,
      rent: rentNum,
      provinceId: selectedProvinceId,
      wardId: selectedWardId,
      sort: sortOption,
      occupancy: occupancyFilter,
      rating: ratingFilter,
      hasRooms: hasRoomsFilter,
    };
  }, [
    debouncedSearchKeyword,
    typeNum,
    rentNum,
    selectedProvinceId,
    selectedWardId,
    sortOption,
    occupancyFilter,
    ratingFilter,
    hasRoomsFilter,
    currentPage,
  ]);

  useEffect(() => {
    const nextParams = buildPartnerPropertiesUrlParams({
      keyword: debouncedSearchKeyword,
      type: selectedType,
      rent: selectedRentCategory,
      provinceId: selectedProvinceId,
      wardId: selectedWardId,
      sort: sortOption,
      page: currentPage,
      perPage,
      occupancy: occupancyFilter,
      rating: ratingFilter,
      hasRooms: hasRoomsFilter,
    });

    if (nextParams.toString() !== urlSearchParams.toString()) {
      setUrlSearchParams(nextParams, { replace: true });
    }
  }, [
    debouncedSearchKeyword,
    selectedType,
    selectedRentCategory,
    selectedProvinceId,
    selectedWardId,
    sortOption,
    currentPage,
    perPage,
    occupancyFilter,
    ratingFilter,
    hasRoomsFilter,
    setUrlSearchParams,
    urlSearchParams,
  ]);

  useEffect(() => {
    setSelectedPropertyIds(new Set());
  }, [
    debouncedSearchKeyword,
    typeNum,
    rentNum,
    selectedProvinceId,
    selectedWardId,
    sortOption,
    occupancyFilter,
    ratingFilter,
    hasRoomsFilter,
    currentPage,
    perPage,
  ]);

  const reloadPropertyList = () => {
    void invalidateList();
  };

  const handleClearFilters = () => {
    setSearchKeyword('');
    setSelectedType(0);
    setSelectedRentCategory(0);
    setSelectedProvinceId('');
    setSelectedWardId('');
    setSortOption('id_desc');
    setOccupancyFilter('');
    setRatingFilter('');
    setHasRoomsFilter('');
  };

  const handleResetAdvancedFilters = () => {
    setSelectedProvinceId('');
    setSelectedWardId('');
    setSortOption('id_desc');
    setOccupancyFilter('');
    setRatingFilter('');
    setHasRoomsFilter('');
  };

  const toggleSelectProperty = (id: string, checked: boolean) => {
    setSelectedPropertyIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleSelectAllProperties = (checked: boolean) => {
    if (checked) {
      setSelectedPropertyIds(new Set(properties.map((p) => String(p.id))));
    } else {
      setSelectedPropertyIds(new Set());
    }
  };

  const isAllPropertiesSelected = properties.length > 0 && selectedPropertyIds.size === properties.length;

  const handleBulkDeleteProperties = () => {
    if (selectedPropertyIds.size === 0) return;
    setIsBulkDeleteOpen(true);
    setDeleteConfirmText('');
  };

  const executeBulkDelete = async () => {
    if (deleteConfirmText !== 'XÁC NHẬN XÓA') return;
    try {
      setIsBulkDeleting(true);
      await Promise.all(Array.from(selectedPropertyIds).map((id) => partnerService.deleteProperty(id)));
      toastSuccess(`Đã xóa ${selectedPropertyIds.size} bất động sản.`);
      setSelectedPropertyIds(new Set());
      setIsBulkDeleteOpen(false);
      reloadPropertyList();
    } catch (error) {
      toastError('Có lỗi xảy ra khi xóa hàng loạt.');
      console.error(error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    setIsPropertyModalOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsPropertyModalOpen(true);
  };

  const handleRequestDeleteProperty = (property: Property) => {
    setDeleteTargetProperty(property);
  };

  const executeSingleDelete = async () => {
    if (!deleteTargetProperty) return;
    try {
      setIsSingleDeleting(true);
      await partnerService.deleteProperty(String(deleteTargetProperty.id));
      toastSuccess('Đã xóa bất động sản.');
      setDeleteTargetProperty(null);
      reloadPropertyList();
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toastError(typeof msg === 'string' ? msg : 'Không thể xóa bất động sản này.');
    } finally {
      setIsSingleDeleting(false);
    }
  };

  const openImageManager = (property: Property) => {
    setImageManagerTarget({ id: String(property.id), name: property.name });
    setIsImageManagerOpen(true);
  };

  const handleRowNavigate = (propertyId: string | number) => {
    navigate(`/partner/properties/${propertyId}/rooms`);
  };

  const occupancyPercent = stats?.occupancyRate != null
    ? Math.round(stats.occupancyRate)
    : null;

  return (
    <div className="space-y-8">
      <PartnerSectionCard className="border-gray-100">
        <PartnerSectionHeader
          title="Quản lý Cơ sở"
          description="Danh sách và quản lý thông tin các cơ sở lưu trú trong hệ thống."
          actions={(
            <Button
              type="button"
              onClick={handleAddProperty}
              className="flex items-center gap-2 bg-[#00A2DA] text-white shadow-sm hover:brightness-110"
            >
              <Plus size={18} />
              Thêm Bất động sản
            </Button>
          )}
        />
      </PartnerSectionCard>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col flex-wrap items-end gap-3 lg:flex-row lg:items-end">
          <div className="w-full flex-1 space-y-1.5 lg:min-w-[280px]">
            <Label htmlFor="search-property" className="text-xs font-semibold uppercase tracking-tighter text-gray-400">
              Tìm kiếm
            </Label>
            <div className="group relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#00A2DA]" size={18} />
              <Input
                id="search-property"
                placeholder="Tìm tên cơ sở hoặc địa chỉ..."
                className="h-11 rounded-xl border-gray-200 pl-10"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              {searchKeyword ? (
                <button
                  type="button"
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  aria-label="Xóa tìm kiếm"
                >
                  <RotateCcw size={14} />
                </button>
              ) : null}
            </div>
          </div>

          <div className="w-full space-y-1.5 md:w-48">
            <Label htmlFor="type-filter" className="text-xs font-semibold uppercase tracking-tighter text-gray-400">
              Loại hình
            </Label>
            <Select
              value={String(selectedType)}
              onValueChange={(val: string) => setSelectedType(val === '0' ? 0 : Number(val))}
            >
              <SelectTrigger id="type-filter" className="h-11 rounded-xl border-gray-200">
                <SelectValue placeholder="Tất cả loại hình" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Tất cả loại hình</SelectItem>
                {Array.isArray(propertyTypes?.data) && propertyTypes.data.map((type: { id: number | string; name: string }) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {normalizeStayPropertyTypeLabel(type.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full space-y-1.5 md:w-48">
            <Label htmlFor="rent-filter" className="text-xs font-semibold uppercase tracking-tighter text-gray-400">
              Hình thức thuê
            </Label>
            <Select
              value={String(selectedRentCategory)}
              onValueChange={(val: string) => setSelectedRentCategory(val === '0' ? 0 : Number(val))}
            >
              <SelectTrigger id="rent-filter" className="h-11 rounded-xl border-gray-200">
                <SelectValue placeholder="Tất cả hình thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Tất cả hình thức</SelectItem>
                {Object.entries(RENT_CATEGORY).map(([value, labelKey]) => (
                  <SelectItem key={value} value={value}>
                    {t(labelKey as string)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClearFilters}
              className="flex h-11 items-center gap-2 rounded-xl px-4 text-gray-500 hover:bg-red-50 hover:text-red-600"
            >
              <RotateCcw size={16} />
              <span className="text-sm font-semibold">Xóa lọc</span>
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAdvancedFiltersOpen((open) => !open)}
            className={`flex h-11 items-center gap-2 rounded-xl px-4 ${hasAdvancedFilters ? 'border-[#00A2DA]/30 bg-[#EFF6FF] text-[#00668A]' : 'border-gray-200 text-gray-600'}`}
            aria-expanded={isAdvancedFiltersOpen}
            aria-controls="partner-property-advanced-filters"
          >
            <SlidersHorizontal size={16} />
            <span className="text-sm font-semibold">Bộ lọc nâng cao</span>
            {hasAdvancedFilters ? (
              <span className="rounded-full bg-[#00A2DA] px-1.5 py-0.5 text-[10px] font-bold text-white">!</span>
            ) : null}
          </Button>
        </div>
      </div>

      <div id="partner-property-advanced-filters">
        <PartnerPropertyAdvancedFilters
          open={isAdvancedFiltersOpen}
          onClose={() => setIsAdvancedFiltersOpen(false)}
          onReset={handleResetAdvancedFilters}
          provinceId={selectedProvinceId}
          wardId={selectedWardId}
          sortOption={sortOption}
          occupancyFilter={occupancyFilter}
          ratingFilter={ratingFilter}
          hasRoomsFilter={hasRoomsFilter}
          provinces={provinces}
          wards={wards}
          onProvinceChange={setSelectedProvinceId}
          onWardChange={setSelectedWardId}
          onSortChange={setSortOption}
          onOccupancyChange={setOccupancyFilter}
          onRatingChange={setRatingFilter}
          onHasRoomsChange={setHasRoomsFilter}
        />
      </div>

      {selectedPropertyIds.size > 0 ? (
        <div className="flex animate-in fade-in slide-in-from-top-2 flex-col items-start justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/80 p-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 pl-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-md">
              {selectedPropertyIds.size}
            </div>
            <p className="text-sm font-bold text-blue-900">Cơ sở đã chọn</p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPropertyIds(new Set())}
              className="text-xs font-semibold text-slate-500 hover:bg-white"
            >
              Hủy chọn
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDeleteProperties}
              className="h-8 gap-1.5 px-3 text-xs font-bold shadow-sm"
            >
              <Trash2 size={14} />
              Xóa hàng loạt
            </Button>
          </div>
        </div>
      ) : null}

      {isFetching && properties.length > 0 ? (
        <div className="flex justify-start py-1">
          <Spinner size="sm" showText text="Đang cập nhật danh sách..." className="flex-row items-center gap-2" />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="h-16 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="w-10 px-4 py-3">
                    <Checkbox
                      checked={isAllPropertiesSelected}
                      onCheckedChange={(val) => toggleSelectAllProperties(Boolean(val))}
                      aria-label="Chọn tất cả cơ sở"
                    />
                  </th>
                  <th className="min-w-[240px] px-4 py-3">Cơ sở</th>
                  <th className="w-[120px] px-4 py-3">Loại hình</th>
                  <th className="w-[140px] px-4 py-3">Hình thức thuê</th>
                  <th className="w-[90px] px-4 py-3 text-center">Số phòng</th>
                  <th className="w-[150px] px-4 py-3">Trống hôm nay</th>
                  <th className="w-[120px] px-4 py-3">Đánh giá</th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((property) => {
                  const propertyId = String(property.id);
                  const typeName = propertyTypeNameById[String(property.property_type_id)] || property.property_type_name || '—';
                  const rating = Number(property.reviews_avg_rating ?? 0);

                  return (
                    <tr
                      key={propertyId}
                      className="cursor-pointer transition-colors hover:bg-[#00A2DA]/5"
                      onClick={() => handleRowNavigate(property.id)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedPropertyIds.has(propertyId)}
                          onCheckedChange={(val) => toggleSelectProperty(propertyId, Boolean(val))}
                          aria-label={`Chọn ${property.name}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4">
                          {property.coverImageUrl ? (
                            <img
                              src={property.coverImageUrl}
                              alt=""
                              className="size-14 shrink-0 rounded-xl border border-slate-200 object-cover shadow-sm"
                            />
                          ) : (
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[#00668A]">
                              <Building2 size={22} aria-hidden />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">{property.name}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                              <MapPin size={12} className="shrink-0 text-slate-400" />
                              <span className="truncate">{formatPropertyLocation(property)}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPropertyTypeBadgeClass(typeName)}`}>
                          {typeName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {property.rent_category
                          ? t(`RENT_CATEGORY.${property.rent_category}`)
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-900">
                        {property.totalRooms || property.rooms_count || 0}
                      </td>
                      <td className="px-4 py-3">
                        <VacancyCell property={property} />
                      </td>
                      <td className="px-4 py-3">
                        <PropertyRatingStars rating={rating} count={Number(property.reviews_count ?? 0)} />
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9 text-slate-500 hover:text-[#00668A]"
                              aria-label="Thao tác cơ sở"
                            >
                              <MoreHorizontal size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => handleRowNavigate(property.id)}>
                              <DoorOpen size={14} className="mr-2" />
                              Quản lý phòng
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProperty(property)}>
                              <Edit size={14} className="mr-2" />
                              Sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openImageManager(property)}>
                              <ImageIcon size={14} className="mr-2" />
                              Ảnh
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleRequestDeleteProperty(property)}
                            >
                              <Trash2 size={14} className="mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            {!hasActiveFilters ? (
              <>
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#EFF6FF] text-[#00668A]">
                  <Building2 size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Bạn chưa có cơ sở nào</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Bắt đầu bằng việc thêm khách sạn, nhà nghỉ, căn hộ dịch vụ hoặc homestay đầu tiên.
                </p>
                <Button type="button" onClick={handleAddProperty} className="mt-6 bg-[#00A2DA] text-white hover:brightness-110">
                  <Plus size={16} className="mr-1.5" />
                  Thêm Bất động sản
                </Button>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  <Search size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Không tìm thấy kết quả</h3>
                <p className="mt-2 text-sm text-slate-500">Thử đổi từ khóa hoặc xóa bộ lọc.</p>
                <Button type="button" variant="outline" onClick={handleClearFilters} className="mt-6">
                  Xóa bộ lọc
                </Button>
              </>
            )}
          </div>
        )}

        {totalPages > 1 || totalItems > 0 ? (
          <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              perPage={perPage}
              onPerPageChange={(val) => {
                setPerPage(val);
                setCurrentPage(1);
              }}
              totalItems={totalItems}
              perPageOptions={[5, 10, 20, 50]}
              resultsText={
                totalItems > 0
                  ? `Hiển thị ${Math.min((currentPage - 1) * perPage + 1, totalItems)} - ${Math.min(currentPage * perPage, totalItems)} trong số ${totalItems} cơ sở`
                  : undefined
              }
            />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryStatCard
          label="Tổng số cơ sở"
          value={stats?.totalProperties ?? totalItems}
          icon={<Building2 size={20} className="text-[#00668A]" />}
          iconWrapClass="bg-[#00668A]/10"
          isLoading={statsLoading}
        />
        <SummaryStatCard
          label="Tổng số phòng"
          value={stats?.totalRooms ?? 0}
          icon={<Layers size={20} className="text-emerald-600" />}
          iconWrapClass="bg-emerald-100"
          isLoading={statsLoading}
        />
        <SummaryStatCard
          label="Công suất trung bình"
          value={occupancyPercent != null ? `${occupancyPercent}%` : '—'}
          icon={<TrendingUp size={20} className="text-amber-600" />}
          iconWrapClass="bg-amber-100"
          isLoading={statsLoading}
        />
      </div>

      <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <Trash2 size={22} />
              Xác nhận xóa tài sản hàng loạt
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
              <p className="font-bold">Cảnh báo hành động nguy hiểm!</p>
              <p className="mt-1 opacity-90">
                Bạn đang thực hiện xóa <span className="font-bold">{selectedPropertyIds.size}</span> bất động sản.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-gray-500">
                Nhập <span className="text-rose-600">&quot;XÁC NHẬN XÓA&quot;</span> để tiếp tục
              </Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Nhập mã xác nhận..."
                className="h-11 border-rose-200 focus:border-rose-500 focus:ring-rose-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="ghost" onClick={() => setIsBulkDeleteOpen(false)}>Hủy</Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== 'XÁC NHẬN XÓA' || isBulkDeleting}
              onClick={executeBulkDelete}
              className="bg-rose-600 font-bold hover:bg-rose-700 disabled:opacity-30"
            >
              {isBulkDeleting ? <Loader2 className="mr-2 animate-spin" size={16} /> : null}
              Xác nhận xóa vĩnh viễn
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTargetProperty} onOpenChange={(open) => { if (!open) setDeleteTargetProperty(null); }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <Trash2 size={22} />
              Xác nhận xóa bất động sản
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
              <p className="font-bold">Cảnh báo hành động không thể hoàn tác!</p>
              <p className="mt-1 opacity-90">
                Bạn sắp xóa <span className="font-bold">{deleteTargetProperty?.name}</span>
                {deleteTargetProperty?.totalRooms != null && Number(deleteTargetProperty.totalRooms) > 0 ? (
                  <> — gồm <span className="font-bold">{deleteTargetProperty.totalRooms}</span> phòng liên quan</>
                ) : null}
                .
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="ghost" onClick={() => setDeleteTargetProperty(null)}>Hủy</Button>
            <Button
              variant="destructive"
              disabled={isSingleDeleting}
              onClick={executeSingleDelete}
              className="bg-rose-600 font-bold hover:bg-rose-700"
            >
              {isSingleDeleting ? <Loader2 className="mr-2 animate-spin" size={16} /> : null}
              Xác nhận xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isPropertyModalOpen ? (
        <PropertyModal
          isOpen={isPropertyModalOpen}
          onClose={() => setIsPropertyModalOpen(false)}
          property={editingProperty}
          propertyTypes={propertyTypes?.data || []}
          onSave={async (data) => {
            try {
              const { address, ...rest } = data as Property & { address?: string };
              const mappedData = { ...rest, address_detail: address };
              if (editingProperty) {
                await partnerService.updateProperty(String(editingProperty.id), mappedData);
              } else {
                await partnerService.createProperty({
                  ...mappedData,
                  user_id: getCurrentUserIdFromToken() || 0,
                });
              }
              reloadPropertyList();
              setIsPropertyModalOpen(false);
            } catch (error) {
              console.error('Save error:', error);
              toastError('Lỗi khi lưu thông tin bất động sản.');
            }
          }}
        />
      ) : null}

      {imageManagerTarget ? (
        <PartnerImageManager
          isOpen={isImageManagerOpen}
          onClose={() => setIsImageManagerOpen(false)}
          type="property"
          targetId={imageManagerTarget.id}
          targetName={imageManagerTarget.name}
        />
      ) : null}
    </div>
  );
};

type SummaryStatCardProps = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconWrapClass: string;
  isLoading?: boolean;
};

const SummaryStatCard: React.FC<SummaryStatCardProps> = ({
  label,
  value,
  icon,
  iconWrapClass,
  isLoading = false,
}) => (
  <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className={`flex size-12 items-center justify-center rounded-full ${iconWrapClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      {isLoading ? (
        <Loader2 className="mt-2 size-6 animate-spin text-slate-400" />
      ) : (
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      )}
    </div>
  </div>
);

const PropertyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  propertyTypes: Array<{ id: number | string; name: string }>;
  onSave: (data: Partial<Property>) => void;
}> = ({ isOpen, onClose, property, propertyTypes, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Property>>({
    name: property?.name || '',
    address: property?.address || '',
    province_id: property?.province_id || 0,
    ward_id: property?.ward_id || 0,
    property_type_id: property?.property_type_id || 0,
    rent_category: property?.rent_category || 0,
    description: property?.description || '',
  });

  const [provinces, setProvinces] = useState<Array<{ id: number | string; name: string }>>([]);
  const [wards, setWards] = useState<Array<{ id: number | string; name: string }>>([]);

  useEffect(() => {
    partnerService.getProvinces()
      .then((res: { data?: unknown }) => {
        const data = res?.data || [];
        setProvinces(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        address: property.address,
        province_id: property.province_id,
        ward_id: property.ward_id,
        property_type_id: property.property_type_id,
        rent_category: property.rent_category,
        description: property.description,
      });
    } else {
      setFormData({
        name: '',
        address: '',
        province_id: 0,
        ward_id: 0,
        property_type_id: 0,
        rent_category: 0,
        description: '',
      });
    }
  }, [property, isOpen]);

  useEffect(() => {
    if (!formData.province_id) {
      setWards([]);
      return;
    }
    partnerService.getWardsByProvince(Number(formData.province_id))
      .then((res: { data?: unknown }) => {
        const data = res?.data || [];
        setWards(Array.isArray(data) ? data : []);
      })
      .catch(() => setWards([]));
  }, [formData.province_id]);

  return (
    <InlineSheet
      open={isOpen}
      onClose={onClose}
      title={property ? 'Cập nhật Bất động sản' : 'Thêm Bất động sản mới'}
      widthClassName="w-full md:max-w-xl"
      footer={(
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button
            onClick={() => onSave(formData)}
            disabled={!formData.name || !formData.province_id || !formData.ward_id || !formData.property_type_id || !formData.rent_category}
          >
            Lưu thay đổi
          </Button>
        </div>
      )}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Tên bất động sản</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="VD: Khách sạn BKS Central" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="province">Tỉnh/Thành phố</Label>
            <SearchableSelect
              value={formData.province_id ? String(formData.province_id) : ''}
              onValueChange={(v) => setFormData({ ...formData, province_id: Number(v), ward_id: 0 })}
              options={provinces.map((p) => ({ value: String(p.id), label: p.name }))}
              placeholder="Chọn Tỉnh/Thành"
              searchPlaceholder="Tìm tỉnh/thành..."
              emptyMessage="Không tìm thấy"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ward">Phường/Xã</Label>
            <SearchableSelect
              value={formData.ward_id ? String(formData.ward_id) : ''}
              onValueChange={(v) => setFormData({ ...formData, ward_id: Number(v) })}
              options={wards.map((w) => ({ value: String(w.id), label: w.name }))}
              placeholder="Chọn Phường/Xã"
              searchPlaceholder="Tìm phường/xã..."
              emptyMessage="Không tìm thấy"
              disabled={!formData.province_id}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="address">Địa chỉ chi tiết</Label>
          <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="VD: 123 Nguyễn Văn Linh..." />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="type">Loại hình</Label>
            <SearchableSelect
              value={formData.property_type_id ? String(formData.property_type_id) : ''}
              onValueChange={(v) => setFormData({ ...formData, property_type_id: Number(v) })}
              options={propertyTypes.map((type) => ({
                value: String(type.id),
                label: normalizeStayPropertyTypeLabel(type.name),
              }))}
              placeholder="Chọn loại hình"
              searchPlaceholder="Tìm loại hình..."
              emptyMessage="Không tìm thấy"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rent_category">Hình thức cho thuê</Label>
            <SearchableSelect
              value={formData.rent_category ? String(formData.rent_category) : ''}
              onValueChange={(v) => setFormData({ ...formData, rent_category: Number(v) })}
              options={Object.entries(RENT_CATEGORY).map(([value, labelKey]) => ({
                value,
                label: t(labelKey as string),
              }))}
              placeholder="Chọn hình thức"
              searchPlaceholder="Tìm hình thức..."
              emptyMessage="Không tìm thấy"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="desc">Mô tả ngắn</Label>
          <PlainTextarea id="desc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>
      </div>
    </InlineSheet>
  );
};

export default Properties;

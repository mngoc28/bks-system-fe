import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { PlainTextarea } from "@/components/ui/textarea";
import { usePartnerPropertyTypesQuery } from '@/hooks/usePropertyQuery';
import { useGetUserProfileQuery } from '@/hooks/useUserQuery';
import {
  fetchPartnerPropertyRoomPreview,
  partnerPropertyRoomPreviewQueryKey,
  useInvalidatePartnerPropertyQueries,
  usePartnerPropertiesQuery,
} from '@/hooks/Partner/usePartnerPropertiesQuery';
import { partnerService } from '@/services/partnerService';
import { AirVent, ChevronDown, Edit, Eye, Image as ImageIcon, Layers, Loader2, MapPin, Maximize, Plus, Star, Trash2, Wallet, X, Zap } from 'lucide-react';
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Property, Room } from './types';

import Pagination from '@/components/Pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toastError, toastSuccess } from '@/components/ui/toast';
import { RENT_CATEGORY } from '@/constant';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { normalizeStayPropertyTypeLabel } from '@/utils/stayPropertyType';
import InlineSheet from './components/InlineSheet';
import PartnerImageManager from './components/PartnerImageManager';
import PropertySkeleton from './components/PropertySkeleton';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

const Properties: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: propertyTypes } = usePartnerPropertyTypesQuery();
  const { data: profileRes } = useGetUserProfileQuery();
  const userProfile = (profileRes as any)?.data || profileRes;
  const { invalidateList, invalidatePreview } = useInvalidatePartnerPropertyQueries();

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [selectedType, setSelectedType] = useState<number | string>(0);
  const [perPage, setPerPage] = useState(5);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [expandedPropertyIds, setExpandedPropertyIds] = useState<Set<string>>(new Set());
  const debouncedSearchName = useDebouncedValue(searchName, 500);
  const prevFiltersRef = useRef<{ debounced: string; type: number }>({
    debounced: debouncedSearchName,
    type: Number(selectedType),
  });

  const typeNum = Number(selectedType);
  const listFilters = useMemo(
    () => ({
      page: currentPage,
      perPage,
      name: debouncedSearchName || undefined,
      propertyTypeId: typeNum && typeNum !== 0 ? typeNum : undefined,
    }),
    [currentPage, perPage, debouncedSearchName, typeNum],
  );

  const { data: listData, isLoading, isFetching } = usePartnerPropertiesQuery(listFilters);
  const properties = listData?.items ?? [];
  const totalPages = listData?.lastPage ?? 1;
  const totalItems = listData?.total ?? 0;
  const loading = isLoading && properties.length === 0;

  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.debounced !== debouncedSearchName ||
      prevFiltersRef.current.type !== typeNum;

    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    prevFiltersRef.current = { debounced: debouncedSearchName, type: typeNum };
  }, [debouncedSearchName, typeNum, currentPage]);

  useEffect(() => {
    setExpandedPropertyIds(new Set());
  }, [debouncedSearchName, typeNum, currentPage, perPage]);

  const propertyNameById = useMemo(() => {
    const map: Record<string, string> = {};
    properties.forEach((property) => {
      map[String(property.id)] = property.name;
    });
    return map;
  }, [properties]);

  const expandedArray = useMemo(() => Array.from(expandedPropertyIds), [expandedPropertyIds]);

  const previewQueries = useQueries({
    queries: expandedArray.map((propertyId) => ({
      queryKey: partnerPropertyRoomPreviewQueryKey(propertyId),
      queryFn: ({ signal }: { signal?: AbortSignal }) =>
        fetchPartnerPropertyRoomPreview(propertyId, propertyNameById[propertyId] ?? '', 6, signal),
      staleTime: 60_000,
      enabled: !!propertyId,
    })),
  });

  const roomsByPropertyId = useMemo(() => {
    const map: Record<string, Room[]> = {};
    expandedArray.forEach((propertyId, index) => {
      map[propertyId] = previewQueries[index]?.data?.rooms ?? [];
    });
    return map;
  }, [expandedArray, previewQueries]);

  const loadingRoomsFor = useMemo(() => {
    const set = new Set<string>();
    expandedArray.forEach((propertyId, index) => {
      const query = previewQueries[index];
      if (query?.isLoading || (query?.isFetching && !query?.data)) {
        set.add(propertyId);
      }
    });
    return set;
  }, [expandedArray, previewQueries]);

  const reloadPropertyList = () => {
    void invalidateList();
  };

  // Modal States
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [imageManagerTarget, setImageManagerTarget] = useState<{ type: 'property' | 'room', id: string, name: string } | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [targetPropertyId, setTargetPropertyId] = useState<string | null>(null);

  const togglePropertyExpand = (id: string) => {
    const key = String(id);
    setExpandedPropertyIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const isPropertyExpanded = (id: string) => expandedPropertyIds.has(String(id));

  const toggleSelectProperty = (id: string, checked: boolean) => {
    setSelectedPropertyIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleSelectAllProperties = (checked: boolean) => {
    if (checked) {
      setSelectedPropertyIds(new Set(properties.map(p => String(p.id))));
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
      await Promise.all(Array.from(selectedPropertyIds).map(id => partnerService.deleteProperty(id)));
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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Trống': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Đang thuê': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Đang bảo trì': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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

  const handleDeleteProperty = async (id: string) => {
    try {
      await partnerService.deleteProperty(String(id));
      toastSuccess('Đã xóa bất động sản.');
      reloadPropertyList();
    } catch {
      toastError('Không thể xóa bất động sản này.');
    }
  };

  const handleAddRoom = (propertyId: string) => {
    setTargetPropertyId(propertyId);
    setEditingRoom(null);
    setIsRoomModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setTargetPropertyId(String(room.propertyId));
    setIsRoomModalOpen(true);
  };

  const handleDeleteRoom = async (id: string, propertyId: string) => {
    try {
      await partnerService.deleteRoom(String(id));
      toastSuccess('Đã xóa phòng.');
      void invalidatePreview(propertyId);
      reloadPropertyList();
    } catch {
      toastError('Không thể xóa phòng này.');
    }
  };

  const openImageManager = (type: 'property' | 'room', id: string, name: string) => {
    setImageManagerTarget({ type, id, name });
    setIsImageManagerOpen(true);
  };

  if (loading && properties.length === 0) {
    return (
      <div className="space-y-6">
        <div className="mb-8 flex items-center justify-between">
           <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
           </div>
           <Skeleton className="h-10 w-40" />
        </div>
        <PropertySkeleton />
        <PropertySkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
             Quản lý Dữ liệu Tài sản
          </h1>
          <p className="mt-1 text-gray-500">Quản lý cơ sở lưu trú, căn hộ và phòng dịch vụ của bạn.</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" onClick={handleAddProperty} className="flex items-center gap-2 bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700">
            <Plus size={18} />
            Thêm Bất động sản
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col items-end gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row">
        <div className="w-full flex-1 space-y-1.5">
          <Label htmlFor="search-property" className="text-xs font-semibold uppercase tracking-tighter text-gray-400">Tìm kiếm</Label>
          <div className="group relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" size={18} />
            <Input 
              id="search-property"
              placeholder="Nhập tên bất động sản, khách sạn..." 
              className="h-11 rounded-lg border-gray-200 px-10 transition-all focus:border-blue-500"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            {searchName && (
              <button 
                onClick={() => setSearchName('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 transition-colors hover:text-gray-600"
                title="Xóa tìm kiếm"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="w-full space-y-1.5 md:w-64">
           <Label htmlFor="type-filter" className="text-xs font-semibold uppercase tracking-tighter text-gray-400">Loại hình</Label>
           <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Select 
                 value={String(selectedType)} 
                 onValueChange={(val: string) => {
                   setSelectedType(val === '0' ? 0 : Number(val));
                 }}
               >
                 <SelectTrigger id="type-filter" className="h-11 rounded-lg border-gray-200 pl-9">
                   <SelectValue placeholder="Tất cả loại hình" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="0">Tất cả loại hình</SelectItem>
                   {Array.isArray(propertyTypes?.data) && propertyTypes.data.map((type: any) => (
                     <SelectItem key={type.id} value={String(type.id)}>
                      {normalizeStayPropertyTypeLabel(type.name)}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
           </div>
        </div>
         {(searchName || selectedType !== 0) && (
           <Button 
             variant="ghost" 
             onClick={() => { setSearchName(''); setSelectedType(0); }}
             className="flex h-11 items-center gap-2 rounded-lg border border-transparent px-4 text-gray-500 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-600"
             title="Xóa tất cả bộ lọc"
           >
             <RotateCcw size={16} />
             <span className="text-sm font-semibold">Xóa lọc</span>
           </Button>
         )}
         <div className="flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-slate-50/50 px-4">
            <Checkbox 
              id="select-all-properties"
              checked={isAllPropertiesSelected}
              onCheckedChange={(val: boolean) => toggleSelectAllProperties(val)}
            />
            <Label htmlFor="select-all-properties" className="cursor-pointer text-xs font-bold uppercase tracking-tight text-gray-500">Chọn tất cả</Label>
         </div>
      </div>

      {selectedPropertyIds.size > 0 && (
        <div className="flex animate-in fade-in slide-in-from-top-2 items-center justify-between rounded-xl border border-blue-100 bg-blue-50/80 p-3 shadow-sm backdrop-blur-sm">
           <div className="flex items-center gap-3 pl-2">
             <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-md">
               {selectedPropertyIds.size}
             </div>
             <p className="text-sm font-bold text-blue-900">Bất động sản đã chọn</p>
           </div>
           <div className="flex items-center gap-2">
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
               <Trash2 size={14} /> Xóa hàng loạt
             </Button>
           </div>
        </div>
      )}

      {isFetching && properties.length > 0 && (
         <div className="flex justify-start py-2">
            <Spinner size="sm" showText text="Đang cập nhật danh sách..." className="flex-row items-center gap-2" />
         </div>
      )}

      {properties.length > 0 ? properties.map(property => {
        const propertyId = String(property.id);
        const propertyRooms = roomsByPropertyId[propertyId] ?? [];
        const previewRooms = propertyRooms.slice(0, 6);
        const isRoomPreviewLoading = loadingRoomsFor.has(propertyId);
        
        return (
          <div key={property.id} className="group/property overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 bg-white p-5 sm:flex-row sm:items-center">
              <div 
                className="flex flex-1 cursor-pointer items-start gap-4 transition-all hover:opacity-80"
                onClick={() => togglePropertyExpand(String(property.id))}
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={selectedPropertyIds.has(String(property.id))}
                    onCheckedChange={(val: boolean) => toggleSelectProperty(String(property.id), val)}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  />
                  <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition-transform duration-300 ${isPropertyExpanded(String(property.id)) ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">{property.name}</h2>
                    <div className="flex gap-1.5">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 ring-1 ring-blue-100">
                        {property.rent_category ? t(`RENT_CATEGORY.${property.rent_category}`) : t("common.property")}
                      </span>
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 ring-1 ring-indigo-100">
                        {normalizeStayPropertyTypeLabel(
                          propertyTypes?.data?.find(type => type.id === property.property_type_id)?.name
                        ) || property.property_type_id}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-blue-500" />
                      <span>{property.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers size={14} className="text-slate-400" />
                      <span><span className="font-bold text-gray-700">{property.totalRooms || 0}</span> đơn vị</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {property.reviews_avg_rating && Number(property.reviews_avg_rating) > 0 ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="size-3.5 fill-amber-500 text-amber-500 shrink-0" />
                          <span>{property.reviews_avg_rating}</span>
                          <span className="font-normal text-slate-400">({property.reviews_count} đánh giá)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Star className="size-3.5 text-slate-300 shrink-0" />
                          <span className="font-normal text-slate-400">Chưa có đánh giá</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="mr-2 flex items-center gap-1 rounded-xl border border-slate-100 bg-slate-50/50 p-1">
                  <Button 
                    type="button" 
                    onClick={() => handleAddRoom(String(property.id))} 
                    size="sm" 
                    className="h-8 gap-1.5 bg-blue-600 px-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                  >
                    <Plus size={14} /> Thêm Phòng
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => navigate(`/partner/properties/${property.id}/rooms`)} 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs font-bold text-slate-600 hover:bg-white hover:text-blue-600"
                  >
                    Quản lý phòng
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button 
                    type="button" 
                    onClick={() => handleEditProperty(property)} 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-200 hover:text-blue-600"
                    title="Chỉnh sửa thông tin cơ bản"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => openImageManager('property', String(property.id), property.name)} 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-orange-200 hover:text-orange-600"
                    title="Quản lý hình ảnh"
                  >
                    <ImageIcon size={16} />
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => handleDeleteProperty(String(property.id))} 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 border border-slate-200 bg-white text-red-400 shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    title="Xóa tài sản"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isPropertyExpanded(String(property.id)) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-6">
              {isRoomPreviewLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Spinner size="sm" showText text="Đang tải phòng..." className="flex-row items-center gap-2" />
                </div>
              ) : propertyRooms.length > 0 ? (
                <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {previewRooms.map(room => (
                    <div 
                      key={room.id} 
                      className="group/room relative flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                      onClick={() => navigate(`/partner/rooms/${room.id}`)}
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="max-w-[70%]">
                          <h3 className="text-lg font-bold text-gray-800 transition-colors group-hover/room:text-blue-600">
                            {room.name}
                          </h3>
                          {room.reviews_avg_rating && Number(room.reviews_avg_rating) > 0 ? (
                            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-500">
                              <Star className="size-3.5 fill-amber-500 text-amber-500" />
                              <span>{room.reviews_avg_rating}</span>
                              <span className="text-slate-400 font-normal">({room.reviews_count} đánh giá)</span>
                            </div>
                          ) : (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                              <Star className="size-3.5 text-slate-300" />
                              <span className="font-normal text-slate-400">Chưa có đánh giá</span>
                            </div>
                          )}
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusColor(room.status)}`}>
                          {room.status}
                        </span>
                      </div>
                      
                      <div className="mb-5 flex-1 space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2.5">
                          <div className="rounded-md bg-slate-100 p-1.5 text-slate-500 transition-colors group-hover/room:bg-blue-50 group-hover/room:text-blue-500">
                            <Maximize size={14} />
                          </div>
                          <span className="font-medium">Diện tích: <span className="text-gray-900">{room.area} m²</span></span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0 rounded-md bg-slate-100 p-1.5 text-slate-500 transition-colors group-hover/room:bg-blue-50 group-hover/room:text-blue-500">
                            <AirVent size={14} />
                          </div>
                          <p className="leading-snug">
                             <span className="font-medium text-gray-500">Tiện ích:</span> {Array.isArray(room.amenities) ? room.amenities.slice(0, 5).join(', ') : 'Trống'}
                             {room.amenities.length > 5 && (
                               <span 
                                 className="ml-1 cursor-pointer text-blue-500 hover:underline"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   navigate(`/partner/rooms/${room.id}`, { state: { activeTab: 'amenities' } });
                                 }}
                               >
                                 ...xem thêm
                               </span>
                             )}
                          </p>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0 rounded-md bg-slate-100 p-1.5 text-slate-500 transition-colors group-hover/room:bg-blue-50 group-hover/room:text-blue-500">
                            <Zap size={14} />
                          </div>
                          <p className="leading-snug">
                             <span className="font-medium text-gray-500">Dịch vụ:</span> {Array.isArray(room.services) ? room.services.slice(0, 5).join(', ') : 'Trống'}
                             {room.services.length > 5 && (
                               <span 
                                 className="ml-1 cursor-pointer text-blue-500 hover:underline"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   navigate(`/partner/rooms/${room.id}`, { state: { activeTab: 'amenities' } });
                                 }}
                               >
                                 ...xem thêm
                               </span>
                             )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto space-y-2.5 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all group-hover/room:border-blue-100 group-hover/room:bg-white">
                        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400">
                          <Wallet size={12} className="text-blue-500" />
                          Bảng giá gói ưu đãi
                        </div>
                        {room.prices && room.prices.length > 0 ? room.prices.map((price, idx) => (
                          <div key={price.id} className="flex items-center justify-between border-b border-slate-200/50 py-1 text-xs first:pt-0 last:border-0 last:pb-0">
                            <span className="font-medium text-gray-500">{price.packageName}:</span>
                            <span className={`font-bold ${idx === 0 ? 'text-gray-900' : 'text-emerald-600'}`}>
                              {price.price.toLocaleString('vi-VN')} ₫{price.duration > 1 && '/th'}
                            </span>
                          </div>
                        )) : <div className="text-[10px] italic text-gray-400">Chưa cài đặt giá</div>}
                      </div>

                      <div className="mt-5 flex gap-1.5 border-t border-gray-100 pt-4">
                        <Button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/partner/rooms/${room.id}`);
                          }} 
                          size="sm" 
                          className="h-9 flex-1 bg-blue-600 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700"
                        >
                           <Eye size={14} className="mr-1" /> Chi tiết
                        </Button>
                        <Button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditRoom(room);
                          }} 
                          size="sm" 
                          className="h-9 flex-1 border border-blue-200 bg-blue-50 text-xs font-bold text-blue-600 shadow-sm transition-all hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                           <Edit size={14} className="mr-1" /> Sửa
                        </Button>
                        <Button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            openImageManager('room', String(room.id), room.name);
                          }} 
                          variant="outline" 
                          size="sm" 
                          className="h-9 border-orange-200 text-xs font-bold text-orange-600 shadow-sm transition-all hover:bg-orange-600 hover:text-white px-2.5"
                          title="Quản lý ảnh phòng"
                        >
                           <ImageIcon size={14} />
                        </Button>
                        <Button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(String(room.id), propertyId);
                          }} 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 px-2.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Xóa phòng"
                        >
                           <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {(property.rooms_count ?? propertyRooms.length) > 6 ? (
                  <div className="mt-4 flex flex-col gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 shadow-sm animate-in fade-in slide-in-from-bottom-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-blue-100 p-1.5">
                        <Plus size={16} className="text-blue-700" />
                      </div>
                      <p className="text-sm text-blue-800">
                        Tài sản này có <span className="font-bold text-blue-900">{property.rooms_count ?? propertyRooms.length}</span> phòng. Đang hiển thị các phòng gần nhất.
                      </p>
                    </div>
                    <Button 
                      type="button" 
                      size="sm" 
                      className="bg-blue-600 font-medium text-white shadow-sm transition-all hover:translate-x-1 hover:bg-blue-700" 
                      onClick={() => navigate(`/partner/properties/${property.id}/rooms`)}
                    >
                      Xem toàn bộ & quản lý chi tiết
                    </Button>
                  </div>
                ) : null}
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-slate-50/50 py-10 text-center">
                  <p className="italic text-gray-500">Chưa có thông tin phòng cho bất động sản này.</p>
                  <Button type="button" variant="ghost" onClick={() => handleAddRoom(String(property.id))} className="mt-2 text-blue-600 hover:bg-blue-50">+ Thêm phòng đầu tiên</Button>
                </div>
              )}
            </div>
            </div>
          </div>
        );
      }) : (
        <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-sm">
           {!searchName && selectedType == 0 ? (
             <>
               <div className="mx-auto mb-4 w-fit rounded-full bg-blue-50 p-4 text-blue-600">
                  <Plus size={32} />
               </div>
               <h3 className="text-xl font-bold text-gray-800">Bạn chưa có tài sản nào</h3>
              <p className="mt-2 text-gray-500">Bắt đầu bằng việc thêm khách sạn, nhà nghỉ, căn hộ / căn hộ dịch vụ hoặc homestay đầu tiên của bạn.</p>
               <Button type="button" onClick={handleAddProperty} className="mt-6 h-10 bg-blue-600 px-6 font-bold text-white hover:bg-blue-700">Thêm ngay Bất động sản</Button>
             </>
           ) : (
             <>
               <div className="mx-auto mb-4 w-fit rounded-full bg-gray-50 p-4 text-gray-400">
                  <Search size={32} />
               </div>
               <h3 className="text-xl font-bold text-gray-800">Không tìm thấy kết quả</h3>
               <p className="mt-2 text-gray-500">Thử thay đổi từ khóa hoặc loại hình tìm kiếm khác.</p>
               <Button type="button" variant="outline" onClick={() => { setSearchName(''); setSelectedType(0); }} className="mt-6">Xóa bộ lọc</Button>
             </>
           )}
        </div>
      )}

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center pb-8">
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
           />
        </div>
      )}

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
                Bạn đang thực hiện xóa <span className="font-bold">{selectedPropertyIds.size}</span> bất động sản. Hành động này sẽ:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 opacity-80">
                <li>Xóa vĩnh viễn thông tin tài sản</li>
                <li>Xóa tất cả các loại phòng liên quan</li>
                <li>Ảnh hưởng đến lịch sử booking (nếu có)</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase">
                Nhập <span className="text-rose-600">"XÁC NHẬN XÓA"</span> để tiếp tục
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
            <Button variant="ghost" onClick={() => setIsBulkDeleteOpen(false)}>
              Hủy
            </Button>
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

      {isPropertyModalOpen && (
        <PropertyModal 
          isOpen={isPropertyModalOpen} 
          onClose={() => setIsPropertyModalOpen(false)} 
          property={editingProperty}
          propertyTypes={propertyTypes?.data || []}
          onSave={async (data) => {
            try {
              // Map address -> address_detail (backend field name)
              const { address, ...rest } = data as any;
              const mappedData = { ...rest, address_detail: address };
              if (editingProperty) {
                await partnerService.updateProperty(String(editingProperty.id), mappedData);
              } else {
                const submitData = {
                  ...mappedData,
                  user_id: userProfile?.id || 0,
                };
                await partnerService.createProperty(submitData);
              }
              reloadPropertyList();
              setIsPropertyModalOpen(false);
            } catch (error) {
              console.error('Save error:', error);
              toastError('Lỗi khi lưu thông tin bất động sản.');
            }
          }}
        />
      )}

      {isRoomModalOpen && (
        <RoomModal
          isOpen={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          room={editingRoom}
          propertyId={targetPropertyId || ''}
          onSave={async (data) => {
            try {
              if (editingRoom) {
                await partnerService.updateRoom(String(editingRoom.id), data);
              } else {
                await partnerService.createRoom(data);
              }
              if (targetPropertyId) {
                void invalidatePreview(targetPropertyId);
              }
              reloadPropertyList();
              setIsRoomModalOpen(false);
            } catch {
              toastError('Lỗi khi lưu thông tin phòng.');
            }
          }}
        />
      )}

      {/* Image Manager Modal */}
      {imageManagerTarget && (
        <PartnerImageManager
          isOpen={isImageManagerOpen}
          onClose={() => setIsImageManagerOpen(false)}
          type={imageManagerTarget.type}
          targetId={imageManagerTarget.id}
          targetName={imageManagerTarget.name}
        />
      )}
    </div>
  );
};

const PropertyModal: React.FC<{ 
  isOpen: boolean, 
  onClose: () => void, 
  property: Property | null, 
  propertyTypes: any[],
  onSave: (data: Partial<Property>) => void 
}> = ({ isOpen, onClose, property, propertyTypes, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Property>>({
    name: property?.name || '',
    address: property?.address || '',
    province_id: property?.province_id || 0,
    ward_id: property?.ward_id || 0,
    property_type_id: property?.property_type_id || 0,
    rent_category: property?.rent_category || 0,
    description: property?.description || ''
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // Fetch all provinces once on mount using partner endpoint
  React.useEffect(() => {
    partnerService.getProvinces()
      .then((res: any) => {
        // getAllProvincesTypes returns: { success, data: [...], message }
        const data = res?.data || [];
        setProvinces(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        address: property.address,
        province_id: property.province_id,
        ward_id: property.ward_id,
        property_type_id: property.property_type_id,
        rent_category: property.rent_category,
        description: property.description
      });
    } else {
      setFormData({ name: '', address: '', province_id: 0, ward_id: 0, property_type_id: 0, rent_category: 0, description: '' });
    }
  }, [property, isOpen]);

  // Fetch wards when province changes
  React.useEffect(() => {
    if (!formData.province_id) {
      setWards([]);
      return;
    }
    partnerService.getWardsByProvince(Number(formData.province_id))
      .then((res: any) => {
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
      widthClassName="max-w-xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={() => onSave(formData)} disabled={!formData.name || !formData.province_id || !formData.ward_id || !formData.property_type_id || !formData.rent_category}>Lưu thay đổi</Button>
        </div>
      }
    >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Tên bất động sản</Label>
            <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Khách sạn BKS Central" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="province">Tỉnh/Thành phố</Label>
              <select 
                id="province" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus-visible:outline-none"
                value={formData.province_id}
                onChange={e => setFormData({...formData, province_id: Number(e.target.value), ward_id: 0})}
              >
                <option value={0}>Chọn Tỉnh/Thành</option>
                {provinces.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ward">Phường/Xã</Label>
              <select 
                id="ward" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus-visible:outline-none"
                value={formData.ward_id}
                onChange={e => setFormData({...formData, ward_id: Number(e.target.value)})}
                disabled={!formData.province_id}
              >
                <option value={0}>Chọn Phường/Xã</option>
                {wards.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Địa chỉ chi tiết</Label>
            <Input id="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="VD: 123 Nguyễn Văn Linh..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Loại hình</Label>
              <select 
                id="type" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus-visible:outline-none"
                value={formData.property_type_id}
                onChange={e => setFormData({...formData, property_type_id: Number(e.target.value)})}
              >
                <option value={0}>Chọn loại hình</option>
                {propertyTypes.map(type => (
                  <option key={type.id} value={type.id}>{normalizeStayPropertyTypeLabel(type.name)}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rent_category">Hình thức cho thuê</Label>
              <select 
                id="rent_category" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus-visible:outline-none"
                value={formData.rent_category}
                onChange={e => setFormData({...formData, rent_category: Number(e.target.value)})}
              >
                <option value={0}>Chọn hình thức</option>
                {Object.entries(RENT_CATEGORY).map(([value, labelKey]) => (
                  <option key={value} value={value}>{t(labelKey as string)}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="desc">Mô tả ngắn</Label>
            <PlainTextarea id="desc" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
        </div>
    </InlineSheet>
  );
};

const RoomModal: React.FC<{ isOpen: boolean, onClose: () => void, room: Room | null, propertyId: string, onSave: (data: Partial<Room>) => void }> = ({ isOpen, onClose, room, propertyId, onSave }) => {
  const [formData, setFormData] = useState<Partial<Room>>({
    name: room?.name || '',
    area: room?.area || 0,
    amenities: room?.amenities || [],
    services: room?.services || [],
    propertyId: propertyId,
    prices: room?.prices || [{ id: 'p' + Date.now(), packageName: 'Gói chuẩn', price: 0, duration: 1 }]
  });

  React.useEffect(() => {
    if (room) {
      setFormData({...room});
    } else {
      setFormData({
        name: '', 
        area: 0, 
        propertyId, 
        amenities: [], 
        services: [], 
        prices: [{ id: 'p' + Date.now(), packageName: 'Gói chuẩn', price: 0, duration: 1 }]
      });
    }
  }, [room, propertyId, isOpen]);

  const addPrice = () => {
    setFormData({
      ...formData,
      prices: [...(formData.prices || []), { id: 'p' + Date.now(), packageName: '', price: 0, duration: 1 }]
    });
  };

  return (
    <InlineSheet
      open={isOpen}
      onClose={onClose}
      title={room ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
      widthClassName="max-w-3xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={() => onSave(formData)}>Hoàn tất</Button>
        </div>
      }
    >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tên phòng/Số phòng</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: P.101" />
            </div>
            <div className="grid gap-2">
              <Label>Diện tích (m²)</Label>
              <Input type="number" value={formData.area} onChange={e => setFormData({...formData, area: Number(e.target.value)})} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Tiện nghi (Ngăn cách bằng dấu phẩy)</Label>
            <Input 
              value={formData.amenities?.join(', ')} 
              onChange={e => setFormData({...formData, amenities: e.target.value.split(',').map(s => s.trim())})} 
              placeholder="VD: Wifi, Máy lạnh, Giường..."
            />
          </div>

          <div className="grid gap-2 border-t pt-4">
            <div className="flex items-center justify-between rounded bg-slate-50 p-2">
               <Label className="flex items-center gap-2 font-bold"><Wallet size={16} /> Thiết lập giá thuê</Label>
               <Button variant="outline" size="sm" onClick={addPrice}>+ Thêm gói</Button>
            </div>
            <div className="space-y-3">
              {formData.prices?.map((p, idx) => (
                <div key={p.id} className="relative grid grid-cols-12 items-end gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="col-span-12 mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-blue-600">Gói #{idx + 1}</span>
                    {idx > 0 && (
                      <button onClick={() => setFormData({...formData, prices: formData.prices?.filter(pr => pr.id !== p.id)})} className="text-red-400 hover:text-red-600">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="col-span-5 grid gap-1">
                    <span className="text-[10px] text-gray-500">Tên gói</span>
                    <Input value={p.packageName} onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const newPrices = [...(formData.prices || [])];
                        newPrices[idx].packageName = e.target.value;
                        setFormData({...formData, prices: newPrices});
                    }} placeholder="VD: Gói 6 tháng" className="h-8 text-xs" />
                  </div>
                  <div className="col-span-4 grid gap-1">
                    <span className="text-[10px] text-gray-500">Giá (VNĐ)</span>
                    <Input type="number" value={p.price} onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const newPrices = [...(formData.prices || [])];
                        newPrices[idx].price = Number(e.target.value);
                        setFormData({...formData, prices: newPrices});
                    }} className="h-8 text-xs font-bold" />
                  </div>
                  <div className="col-span-3 grid gap-1">
                    <span className="text-[10px] text-gray-500">Tháng</span>
                    <Input type="number" value={p.duration} onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const newPrices = [...(formData.prices || [])];
                        newPrices[idx].duration = Number(e.target.value);
                        setFormData({...formData, prices: newPrices});
                    }} className="h-8 text-xs" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </InlineSheet>
  );
};

export default Properties;


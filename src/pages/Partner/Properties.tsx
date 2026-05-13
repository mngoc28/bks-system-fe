import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { Plus, MapPin, Maximize, AirVent, Zap, Wallet, Edit, Trash2, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Building, Room } from './types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlainTextarea } from "@/components/ui/textarea";
import { partnerService } from '@/services/partnerService';
import { usePartnerBuildingTypesQuery } from '@/hooks/useBuildingQuery';
import { useGetUserProfileQuery } from '@/hooks/useUserQuery';

import { RENT_CATEGORY } from '@/constant';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import InlineSheet from './components/InlineSheet';
import PropertySkeleton from './components/PropertySkeleton';
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { Search, Filter, RotateCcw } from 'lucide-react';
import PartnerImageManager from './components/PartnerImageManager';
import { toastError, toastSuccess } from '@/components/ui/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [buildings, setBuildings] = useState<Building[]>([]);
  const { data: buildingTypes } = usePartnerBuildingTypesQuery();
  const { data: profileRes } = useGetUserProfileQuery();
  const userProfile = (profileRes as any)?.data || profileRes;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [selectedType, setSelectedType] = useState<number | string>(0);
  const [perPage] = useState(5);
  const debouncedSearchName = useDebouncedValue(searchName, 500);
  const [refetchToken, setRefetchToken] = useState(0);
  const prevFiltersRef = useRef<{ debounced: string; type: number }>({
    debounced: debouncedSearchName,
    type: Number(selectedType),
  });

  const reloadPropertyList = () => setRefetchToken((n) => n + 1);

  // Modal States
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [imageManagerTarget, setImageManagerTarget] = useState<{ type: 'building' | 'room', id: string, name: string } | null>(null);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [targetBuildingId, setTargetBuildingId] = useState<string | null>(null);

  const normalizeRoomStatus = (status: unknown): Room['status'] => {
    if (typeof status === 'string') {
      if (status === 'Trống' || status === 'Đang thuê' || status === 'Đang bảo trì') {
        return status;
      }
      return 'Đang thuê';
    }
    if (typeof status === 'boolean') {
      return status ? 'Trống' : 'Đang bảo trì';
    }
    return 'Đang thuê';
  };

  const normalizeRooms = (rawRooms: any[]): Room[] => {
    return (rawRooms || []).map((room: any) => ({
      id: room.id,
      buildingId: room.building_id ?? room.buildingId ?? '',
      buildingName: room.building_name ?? room.buildingName ?? '',
      name: room.title ?? room.name ?? '',
      area: Number(room.area ?? 0),
      amenities: Array.isArray(room.amenities)
        ? room.amenities.map((a: any) => (typeof a === 'string' ? a : a?.name)).filter(Boolean)
        : [],
      services: Array.isArray(room.services)
        ? room.services.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
        : [],
      prices: Array.isArray(room.prices)
        ? room.prices.map((p: any) => ({
            id: p.id,
            packageName: p.packageName ?? p.unit ?? `Goi ${p.price_package_id ?? ''}`,
            price: Number(p.price ?? 0),
            duration: p.unit === 'month' ? 2 : 1,
          }))
        : [],
      status: normalizeRoomStatus(room.status),
    }));
  };

  const normalizeBuildings = (rawBuildings: any[], normalizedRooms: Room[]): Building[] => {
    const roomCountByBuildingId = new Map<string, number>();
    const roomCountByBuildingName = new Map<string, number>();

    normalizedRooms.forEach((room) => {
      const key = String(room.buildingId);
      if (key) {
        roomCountByBuildingId.set(key, (roomCountByBuildingId.get(key) || 0) + 1);
      }
      if (room.buildingName) {
        roomCountByBuildingName.set(room.buildingName, (roomCountByBuildingName.get(room.buildingName) || 0) + 1);
      }
    });

    return (rawBuildings || []).map((building: any) => ({
      id: building.id,
      name: building.name ?? '',
      address: building.address_detail ?? building.address ?? '',
      totalRooms:
        roomCountByBuildingId.get(String(building.id)) ||
        roomCountByBuildingName.get(String(building.name ?? '')) ||
        0,
      property_type_id: building.property_type_id,
      rent_category: building.rent_category,
      province_id: building.province_id,
      ward_id: building.ward_id,
      description: building.description,
      property_type_name: building.property_type_name,
      type: building.type,
      rooms_count: building.rooms_count,
    }));
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const typeNum = Number(selectedType);
      const filtersChanged =
        prevFiltersRef.current.debounced !== debouncedSearchName ||
        prevFiltersRef.current.type !== typeNum;

      if (filtersChanged && currentPage !== 1) {
        setCurrentPage(1);
        return;
      }

      const pageForBuildings = filtersChanged ? 1 : currentPage;

      try {
        setLoading(true);

        const buildingsParams: Record<string, unknown> = {
          page: pageForBuildings,
          per_page: perPage,
        };
        if (debouncedSearchName) buildingsParams.name = debouncedSearchName;
        if (typeNum && typeNum !== 0) buildingsParams.property_type_id = typeNum;

        const buildingsRes: any = await partnerService.getBuildings(buildingsParams);
        if (cancelled) {
          return;
        }

        const buildingData = buildingsRes?.data || {};
        const rawBuildings = Array.isArray(buildingData) ? buildingData : (buildingData.data || []);
        const buildingIds = (rawBuildings as { id?: string | number }[])
          .map((b) => b.id)
          .filter((id) => id !== undefined && id !== null && String(id) !== '');

        let rawRooms: any[] = [];
        if (buildingIds.length > 0) {
          const roomsRes: any = await partnerService.getRooms({
            building_ids: buildingIds,
            per_page: 1000,
            page: 1,
          });
          if (cancelled) {
            return;
          }
          const roomPayload = roomsRes?.data;
          if (Array.isArray(roomPayload)) {
            rawRooms = roomPayload;
          } else if (roomPayload?.data && Array.isArray(roomPayload.data)) {
            rawRooms = roomPayload.data;
          }
        }

        const normalizedRooms = normalizeRooms(rawRooms);
        const normalizedBuildings = normalizeBuildings(rawBuildings, normalizedRooms);

        if (cancelled) {
          return;
        }

        setBuildings(normalizedBuildings);
        setRooms(normalizedRooms);
        setTotalPages((buildingData as { last_page?: number }).last_page || 1);
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching properties:', error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          prevFiltersRef.current = { debounced: debouncedSearchName, type: typeNum };
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [currentPage, selectedType, debouncedSearchName, perPage, refetchToken]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Trống': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Đang thuê': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Đang bảo trì': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleAddBuilding = () => {
    setEditingBuilding(null);
    setIsBuildingModalOpen(true);
  };

  const handleEditBuilding = (building: Building) => {
    setEditingBuilding(building);
    setIsBuildingModalOpen(true);
  };

  const handleDeleteBuilding = async (id: string) => {
    try {
      await partnerService.deleteBuilding(String(id));
      toastSuccess('Đã xóa bất động sản.');
      reloadPropertyList();
    } catch {
      toastError('Không thể xóa bất động sản này.');
    }
  };

  const handleAddRoom = (buildingId: string) => {
    setTargetBuildingId(buildingId);
    setEditingRoom(null);
    setIsRoomModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setTargetBuildingId(String(room.buildingId));
    setIsRoomModalOpen(true);
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      await partnerService.deleteRoom(String(id));
      toastSuccess('Đã xóa phòng.');
      reloadPropertyList();
    } catch {
      toastError('Không thể xóa phòng này.');
    }
  };

  const openImageManager = (type: 'building' | 'room', id: string, name: string) => {
    setImageManagerTarget({ type, id, name });
    setIsImageManagerOpen(true);
  };

  if (loading && buildings.length === 0) {
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
          <Button type="button" onClick={handleAddBuilding} className="flex items-center gap-2 bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700">
            <Plus size={18} />
            Thêm Bất động sản
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col items-end gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row">
        <div className="w-full flex-1 space-y-1.5">
          <Label htmlFor="search-building" className="text-xs font-semibold uppercase tracking-tighter text-gray-400">Tìm kiếm</Label>
          <div className="group relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" size={18} />
            <Input 
              id="search-building"
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
                   {Array.isArray(buildingTypes?.data) && buildingTypes.data.map((type: any) => (
                     <SelectItem key={type.id} value={String(type.id)}>
                       {type.name}
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
      </div>

      {loading && buildings.length > 0 && (
         <div className="flex animate-pulse items-center gap-2 font-medium text-blue-600">
            <Loader2 className="animate-spin" size={18} />
            <span>Đang cập nhật danh sách...</span>
         </div>
      )}

      {buildings.length > 0 ? buildings.map(building => {
        const buildingRooms = rooms.filter(
          r => String(r.buildingId) === String(building.id) || r.buildingName === building.name
        );
        const previewRooms = buildingRooms.slice(0, 6);
        
        return (
          <div key={building.id} className="group/building overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 bg-slate-50 p-6 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                    {building.rent_category ? t(`RENT_CATEGORY.${building.rent_category}`) : t("common.property")}
                  </span>
                  <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
                    {buildingTypes?.data?.find(type => type.id === building.property_type_id)?.name || building.property_type_id}
                  </span>
                  <h2 className="text-xl font-bold text-gray-800">{building.name}</h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={16} />
                  <span>{building.address}</span>
                  <span className="mx-2">•</span>
                  <span>Tổng: <span className="font-semibold text-gray-700">{building.totalRooms || 0} đơn vị</span></span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={() => handleAddRoom(String(building.id))} size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                  <Plus size={16} className="mr-1" /> Thêm Phòng
                </Button>
                <Button type="button" onClick={() => navigate(`/partner/properties/${building.id}/rooms`)} variant="outline" size="sm" className="text-xs">
                  Quản lý tất cả phòng
                </Button>
                    <Button type="button" onClick={() => handleEditBuilding(building)} variant="ghost" size="sm" className="h-9 border border-gray-200 bg-white/90 px-3 font-semibold text-gray-700 shadow-sm hover:bg-white">
                      <Edit size={16} className="mr-1.5 text-blue-500" /> Chỉnh sửa
                    </Button>
                    <Button type="button" onClick={() => openImageManager('building', String(building.id), building.name)} variant="ghost" size="sm" className="h-9 border border-gray-200 bg-white/90 px-3 font-semibold text-gray-700 shadow-sm hover:bg-white">
                      <ImageIcon size={16} className="mr-1.5 text-orange-500" /> Hình ảnh
                    </Button>
                    <Button type="button" onClick={() => handleDeleteBuilding(String(building.id))} variant="ghost" size="sm" className="h-9 border border-gray-200 bg-white/90 px-3 text-red-500 shadow-sm hover:bg-white hover:text-red-700">
                      <Trash2 size={16} />
                    </Button>
              </div>
            </div>

            <div className="p-6">
              {buildingRooms.length > 0 ? (
                <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {previewRooms.map(room => (
                    <div key={room.id} className="group/room relative flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="mb-4 flex items-start justify-between">
                        <h3 className="text-lg font-bold text-gray-800 transition-colors group-hover/room:text-blue-600">{room.name}</h3>
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
                             {room.amenities.length > 5 && <span className="ml-1 cursor-pointer text-blue-500 hover:underline">...xem thêm</span>}
                          </p>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0 rounded-md bg-slate-100 p-1.5 text-slate-500 transition-colors group-hover/room:bg-blue-50 group-hover/room:text-blue-500">
                            <Zap size={14} />
                          </div>
                          <p className="leading-snug">
                             <span className="font-medium text-gray-500">Dịch vụ:</span> {Array.isArray(room.services) ? room.services.slice(0, 5).join(', ') : 'Trống'}
                             {room.services.length > 5 && <span className="ml-1 cursor-pointer text-blue-500 hover:underline">...xem thêm</span>}
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

                      <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                        <Button type="button" onClick={() => handleEditRoom(room)} size="sm" className="h-9 flex-1 border border-blue-200 bg-blue-50 text-xs font-bold text-blue-600 shadow-sm transition-all hover:border-blue-600 hover:bg-blue-600 hover:text-white">
                           <Edit size={14} className="mr-1.5" /> Chỉnh sửa
                        </Button>
                        <Button type="button" onClick={() => openImageManager('room', String(room.id), room.name)} variant="outline" size="sm" className="h-9 border-orange-200 text-xs font-bold text-orange-600 shadow-sm transition-all hover:bg-orange-600 hover:text-white">
                           <ImageIcon size={14} className="mr-1.5" /> Ảnh
                        </Button>
                        <Button type="button" onClick={() => handleDeleteRoom(String(room.id))} variant="ghost" size="sm" className="h-9 px-2.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600">
                           <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {(building.rooms_count ?? buildingRooms.length) > 6 ? (
                  <div className="mt-4 flex flex-col gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 shadow-sm animate-in fade-in slide-in-from-bottom-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-blue-100 p-1.5">
                        <Plus size={16} className="text-blue-700" />
                      </div>
                      <p className="text-sm text-blue-800">
                        Tài sản này có <span className="font-bold text-blue-900">{building.rooms_count ?? buildingRooms.length}</span> phòng. Đang hiển thị các phòng gần nhất.
                      </p>
                    </div>
                    <Button 
                      type="button" 
                      size="sm" 
                      className="bg-blue-600 font-medium text-white shadow-sm transition-all hover:translate-x-1 hover:bg-blue-700" 
                      onClick={() => navigate(`/partner/properties/${building.id}/rooms`)}
                    >
                      Xem toàn bộ & quản lý chi tiết
                    </Button>
                  </div>
                ) : null}
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-slate-50/50 py-10 text-center">
                  <p className="italic text-gray-500">Chưa có thông tin phòng cho bất động sản này.</p>
                  <Button type="button" variant="ghost" onClick={() => handleAddRoom(String(building.id))} className="mt-2 text-blue-600 hover:bg-blue-50">+ Thêm phòng đầu tiên</Button>
                </div>
              )}
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
               <p className="mt-2 text-gray-500">Bắt đầu bằng việc thêm khách sạn, nhà nghỉ, căn hộ dịch vụ hoặc homestay đầu tiên của bạn.</p>
               <Button type="button" onClick={handleAddBuilding} className="mt-6 h-10 bg-blue-600 px-6 font-bold text-white hover:bg-blue-700">Thêm ngay Bất động sản</Button>
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
        <div className="mt-12 flex justify-center pb-8">
           <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer transition-colors hover:bg-blue-50 hover:text-blue-600'}`}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Basic logic to show limited page numbers
                if (totalPages > 7) {
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <PaginationItem key={pageNum}>
                          <PaginationLink 
                            isActive={currentPage === pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`cursor-pointer transition-all ${currentPage === pageNum ? 'scale-110 bg-blue-600 text-white shadow-md hover:bg-blue-700 active:scale-95' : 'hover:bg-blue-50'}`}
                          >
                            {pageNum}
                          </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <PaginationItem key={pageNum}><PaginationEllipsis /></PaginationItem>;
                  }
                  return null;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      isActive={currentPage === pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`cursor-pointer transition-all ${currentPage === pageNum ? 'scale-110 bg-blue-600 text-white shadow-md hover:bg-blue-700 active:scale-95' : 'hover:bg-blue-50'}`}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext 
                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                   className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer transition-colors hover:bg-blue-50 hover:text-blue-600'}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <BuildingModal 
          key={isBuildingModalOpen ? 'building-open' : 'building-closed'}
        isOpen={isBuildingModalOpen} 
        onClose={() => setIsBuildingModalOpen(false)} 
        building={editingBuilding}
        buildingTypes={buildingTypes?.data || []}
        onSave={async (data) => {
          try {
            // Map address -> address_detail (backend field name)
            const { address, ...rest } = data as any;
            const mappedData = { ...rest, address_detail: address };
            if (editingBuilding) {
              await partnerService.updateBuilding(String(editingBuilding.id), mappedData);
            } else {
              const submitData = {
                ...mappedData,
                user_id: userProfile?.id || 0,
              };
              await partnerService.createBuilding(submitData);
            }
            reloadPropertyList();
            setIsBuildingModalOpen(false);
          } catch (error) {
            console.error('Save error:', error);
            toastError('Lỗi khi lưu thông tin bất động sản.');
          }
        }}
      />

      <RoomModal
        key={isRoomModalOpen ? 'room-open' : 'room-closed'}
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        room={editingRoom}
        buildingId={targetBuildingId || ''}
        onSave={async (data) => {
          try {
            if (editingRoom) {
              await partnerService.updateRoom(String(editingRoom.id), data);
            } else {
              await partnerService.createRoom(data);
            }
            reloadPropertyList();
            setIsRoomModalOpen(false);
          } catch {
            toastError('Lỗi khi lưu thông tin phòng.');
          }
        }}
      />

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

const BuildingModal: React.FC<{ 
  isOpen: boolean, 
  onClose: () => void, 
  building: Building | null, 
  buildingTypes: any[],
  onSave: (data: Partial<Building>) => void 
}> = ({ isOpen, onClose, building, buildingTypes, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Building>>({
    name: building?.name || '',
    address: building?.address || '',
    province_id: building?.province_id || 0,
    ward_id: building?.ward_id || 0,
    property_type_id: building?.property_type_id || 0,
    rent_category: building?.rent_category || 0,
    description: building?.description || ''
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
    if (building) {
      setFormData({
        name: building.name,
        address: building.address,
        province_id: building.province_id,
        ward_id: building.ward_id,
        property_type_id: building.property_type_id,
        rent_category: building.rent_category,
        description: building.description
      });
    } else {
      setFormData({ name: '', address: '', province_id: 0, ward_id: 0, property_type_id: 0, rent_category: 0, description: '' });
    }
  }, [building, isOpen]);

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
      title={building ? 'Cập nhật Bất động sản' : 'Thêm Bất động sản mới'}
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
                {buildingTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
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

const RoomModal: React.FC<{ isOpen: boolean, onClose: () => void, room: Room | null, buildingId: string, onSave: (data: Partial<Room>) => void }> = ({ isOpen, onClose, room, buildingId, onSave }) => {
  const [formData, setFormData] = useState<Partial<Room>>({
    name: room?.name || '',
    area: room?.area || 0,
    amenities: room?.amenities || [],
    services: room?.services || [],
    buildingId: buildingId,
    prices: room?.prices || [{ id: 'p' + Date.now(), packageName: 'Gói chuẩn', price: 0, duration: 1 }]
  });

  React.useEffect(() => {
    if (room) {
      setFormData({...room});
    } else {
      setFormData({
        name: '', 
        area: 0, 
        buildingId, 
        amenities: [], 
        services: [], 
        prices: [{ id: 'p' + Date.now(), packageName: 'Gói chuẩn', price: 0, duration: 1 }]
      });
    }
  }, [room, buildingId, isOpen]);

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

import React, { useState, useEffect, ChangeEvent } from 'react';
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

  // Modal States
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [imageManagerTarget, setImageManagerTarget] = useState<{ type: 'building' | 'room', id: string, name: string } | null>(null);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [targetBuildingId, setTargetBuildingId] = useState<string | null>(null);

  // --- Filtering & Pagination Logic ---
  // 1. Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchData(1, searchName, selectedType as number);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchName]);

  // 2. Immediate type filter effect
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchData(1, searchName, selectedType as number);
    }
  }, [selectedType]);

  // 3. Page change effect
  useEffect(() => {
    fetchData(currentPage, searchName, selectedType as number);
  }, [currentPage]);

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

  const fetchData = async (page: number = 1, forceSearchName?: string, forceType?: number) => {
    try {
      setLoading(true);
      
      const buildingsParams: any = {
        page: page,
        per_page: perPage,
      };
      
      const currentSearch = forceSearchName !== undefined ? forceSearchName : searchName;
      if (currentSearch) buildingsParams.name = currentSearch;
      
      const currentType = forceType !== undefined ? forceType : (selectedType as number);
      if (currentType && currentType !== 0) buildingsParams.property_type_id = currentType;

      const buildingsRes: any = await partnerService.getBuildings(buildingsParams);
      const roomsRes: any = await partnerService.getRooms();

      const buildingData = buildingsRes?.data || {};
      const rawBuildings = Array.isArray(buildingData) ? buildingData : (buildingData.data || []);
      const rawRooms = roomsRes?.data?.data || roomsRes?.data || [];

      const normalizedRooms = normalizeRooms(rawRooms);
      const normalizedBuildings = normalizeBuildings(rawBuildings, normalizedRooms);

      setBuildings(normalizedBuildings);
      setRooms(normalizedRooms);
      
      setTotalPages(buildingData.last_page || 1);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
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
      fetchData();
    } catch (error) {
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
      fetchData();
    } catch (error) {
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
        <div className="flex justify-between items-center mb-8">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             Quản lý Dữ liệu Tài sản
          </h1>
          <p className="text-gray-500 mt-1">Quản lý cơ sở lưu trú, căn hộ và phòng dịch vụ của bạn.</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" onClick={handleAddBuilding} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-lg shadow-blue-200">
            <Plus size={18} />
            Thêm Bất động sản
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-1.5">
          <Label htmlFor="search-building" className="text-xs font-semibold text-gray-400 uppercase tracking-tighter">Tìm kiếm</Label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <Input 
              id="search-building"
              placeholder="Nhập tên bất động sản, khách sạn..." 
              className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 transition-all rounded-lg"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            {searchName && (
              <button 
                onClick={() => setSearchName('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Xóa tìm kiếm"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="w-full md:w-64 space-y-1.5">
           <Label htmlFor="type-filter" className="text-xs font-semibold text-gray-400 uppercase tracking-tighter">Loại hình</Label>
           <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Select 
                 value={String(selectedType)} 
                 onValueChange={(val: string) => {
                   setSelectedType(val === '0' ? 0 : Number(val));
                 }}
               >
                 <SelectTrigger id="type-filter" className="pl-9 h-11 rounded-lg border-gray-200">
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
             className="h-11 px-4 text-gray-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-2 transition-all rounded-lg border border-transparent hover:border-red-100"
             title="Xóa tất cả bộ lọc"
           >
             <RotateCcw size={16} />
             <span className="font-semibold text-sm">Xóa lọc</span>
           </Button>
         )}
      </div>

      {loading && buildings.length > 0 && (
         <div className="flex items-center gap-2 text-blue-600 font-medium animate-pulse">
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
          <div key={building.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group/building">
            <div className="bg-slate-50 border-b border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase tracking-wider">
                    {building.rent_category ? t(`RENT_CATEGORY.${building.rent_category}`) : t("common.property")}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded uppercase tracking-wider">
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
                <Button type="button" onClick={() => handleAddRoom(String(building.id))} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus size={16} className="mr-1" /> Thêm Phòng
                </Button>
                <Button type="button" onClick={() => navigate(`/partner/properties/${building.id}/rooms`)} variant="outline" size="sm" className="text-xs">
                  Quản lý tất cả phòng
                </Button>
                    <Button type="button" onClick={() => handleEditBuilding(building)} variant="ghost" size="sm" className="bg-white/90 hover:bg-white text-gray-700 shadow-sm border border-gray-200 h-9 px-3 font-semibold">
                      <Edit size={16} className="mr-1.5 text-blue-500" /> Chỉnh sửa
                    </Button>
                    <Button type="button" onClick={() => openImageManager('building', String(building.id), building.name)} variant="ghost" size="sm" className="bg-white/90 hover:bg-white text-gray-700 shadow-sm border border-gray-200 h-9 px-3 font-semibold">
                      <ImageIcon size={16} className="mr-1.5 text-orange-500" /> Hình ảnh
                    </Button>
                    <Button type="button" onClick={() => handleDeleteBuilding(String(building.id))} variant="ghost" size="sm" className="bg-white/90 hover:bg-white text-red-500 hover:text-red-700 shadow-sm border border-gray-200 h-9 px-3">
                      <Trash2 size={16} />
                    </Button>
              </div>
            </div>

            <div className="p-6">
              {buildingRooms.length > 0 ? (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {previewRooms.map(room => (
                    <div key={room.id} className="group/room border border-gray-200 rounded-xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col h-full relative ring-1 ring-black/5">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-800 group-hover/room:text-blue-600 transition-colors">{room.name}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm uppercase tracking-wider ${getStatusColor(room.status)}`}>
                          {room.status}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-5 flex-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-slate-100 rounded-md text-slate-500 group-hover/room:bg-blue-50 group-hover/room:text-blue-500 transition-colors">
                            <Maximize size={14} />
                          </div>
                          <span className="font-medium">Diện tích: <span className="text-gray-900">{room.area} m²</span></span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 bg-slate-100 rounded-md text-slate-500 mt-0.5 group-hover/room:bg-blue-50 group-hover/room:text-blue-500 transition-colors shrink-0">
                            <AirVent size={14} />
                          </div>
                          <p className="leading-snug">
                             <span className="font-medium text-gray-500">Tiện ích:</span> {Array.isArray(room.amenities) ? room.amenities.slice(0, 5).join(', ') : 'Trống'}
                             {room.amenities.length > 5 && <span className="text-blue-500 cursor-pointer hover:underline ml-1">...xem thêm</span>}
                          </p>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 bg-slate-100 rounded-md text-slate-500 mt-0.5 group-hover/room:bg-blue-50 group-hover/room:text-blue-500 transition-colors shrink-0">
                            <Zap size={14} />
                          </div>
                          <p className="leading-snug">
                             <span className="font-medium text-gray-500">Dịch vụ:</span> {Array.isArray(room.services) ? room.services.slice(0, 5).join(', ') : 'Trống'}
                             {room.services.length > 5 && <span className="text-blue-500 cursor-pointer hover:underline ml-1">...xem thêm</span>}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5 mt-auto group-hover/room:bg-white group-hover/room:border-blue-100 transition-all">
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                          <Wallet size={12} className="text-blue-500" />
                          Bảng giá gói ưu đãi
                        </div>
                        {room.prices && room.prices.length > 0 ? room.prices.map((price, idx) => (
                          <div key={price.id} className="flex items-center justify-between text-xs py-1 first:pt-0 last:pb-0 border-b last:border-0 border-slate-200/50">
                            <span className="text-gray-500 font-medium">{price.packageName}:</span>
                            <span className={`font-bold ${idx === 0 ? 'text-gray-900' : 'text-emerald-600'}`}>
                              {price.price.toLocaleString('vi-VN')} ₫{price.duration > 1 && '/th'}
                            </span>
                          </div>
                        )) : <div className="text-[10px] text-gray-400 italic">Chưa cài đặt giá</div>}
                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
                        <Button type="button" onClick={() => handleEditRoom(room)} size="sm" className="flex-1 text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all h-9 shadow-sm">
                           <Edit size={14} className="mr-1.5" /> Chỉnh sửa
                        </Button>
                        <Button type="button" onClick={() => openImageManager('room', String(room.id), room.name)} variant="outline" size="sm" className="text-xs font-bold border-orange-200 text-orange-600 hover:bg-orange-600 hover:text-white transition-all h-9 shadow-sm">
                           <ImageIcon size={14} className="mr-1.5" /> Ảnh
                        </Button>
                        <Button type="button" onClick={() => handleDeleteRoom(String(room.id))} variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2.5 h-9 transition-colors">
                           <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {(building.rooms_count ?? buildingRooms.length) > 6 ? (
                  <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 p-1.5 rounded-md">
                        <Plus size={16} className="text-blue-700" />
                      </div>
                      <p className="text-sm text-blue-800">
                        Tài sản này có <span className="font-bold text-blue-900">{building.rooms_count ?? buildingRooms.length}</span> phòng. Đang hiển thị các phòng gần nhất.
                      </p>
                    </div>
                    <Button 
                      type="button" 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all hover:translate-x-1" 
                      onClick={() => navigate(`/partner/properties/${building.id}/rooms`)}
                    >
                      Xem toàn bộ & quản lý chi tiết
                    </Button>
                  </div>
                ) : null}
                </>
              ) : (
                <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 italic">Chưa có thông tin phòng cho bất động sản này.</p>
                  <Button type="button" variant="ghost" onClick={() => handleAddRoom(String(building.id))} className="mt-2 text-blue-600 hover:bg-blue-50">+ Thêm phòng đầu tiên</Button>
                </div>
              )}
            </div>
          </div>
        );
      }) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
           {!searchName && selectedType == 0 ? (
             <>
               <div className="p-4 bg-blue-50 text-blue-600 rounded-full w-fit mx-auto mb-4">
                  <Plus size={32} />
               </div>
               <h3 className="text-xl font-bold text-gray-800">Bạn chưa có tài sản nào</h3>
               <p className="text-gray-500 mt-2">Bắt đầu bằng việc thêm khách sạn, nhà nghỉ, căn hộ dịch vụ hoặc homestay đầu tiên của bạn.</p>
               <Button type="button" onClick={handleAddBuilding} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6">Thêm ngay Bất động sản</Button>
             </>
           ) : (
             <>
               <div className="p-4 bg-gray-50 text-gray-400 rounded-full w-fit mx-auto mb-4">
                  <Search size={32} />
               </div>
               <h3 className="text-xl font-bold text-gray-800">Không tìm thấy kết quả</h3>
               <p className="text-gray-500 mt-2">Thử thay đổi từ khóa hoặc loại hình tìm kiếm khác.</p>
               <Button type="button" variant="outline" onClick={() => { setSearchName(''); setSelectedType(0); }} className="mt-6">Xóa bộ lọc</Button>
             </>
           )}
        </div>
      )}

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12 pb-8">
           <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors'}`}
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
                            className={`cursor-pointer transition-all ${currentPage === pageNum ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform scale-110 active:scale-95' : 'hover:bg-blue-50'}`}
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
                      className={`cursor-pointer transition-all ${currentPage === pageNum ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform scale-110 active:scale-95' : 'hover:bg-blue-50'}`}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext 
                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                   className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors'}`}
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
            fetchData();
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
            fetchData();
            setIsRoomModalOpen(false);
          } catch (error) {
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus:ring-2 focus:ring-ring"
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus:ring-2 focus:ring-ring"
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus:ring-2 focus:ring-ring"
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus:ring-2 focus:ring-ring"
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
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
               <Label className="font-bold flex items-center gap-2"><Wallet size={16} /> Thiết lập giá thuê</Label>
               <Button variant="outline" size="sm" onClick={addPrice}>+ Thêm gói</Button>
            </div>
            <div className="space-y-3">
              {formData.prices?.map((p, idx) => (
                <div key={p.id} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-100 relative">
                  <div className="col-span-12 items-center flex justify-between mb-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Gói #{idx + 1}</span>
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

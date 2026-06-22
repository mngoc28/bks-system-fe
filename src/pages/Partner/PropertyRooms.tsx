import React, { useEffect, useMemo, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Plus, 
  LayoutGrid, Activity, Wrench, Camera, 
  ChevronDown, Phone, Calendar, Trash, Eye, Search,
  Building2, X, LayoutDashboard, Filter, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { partnerService } from '@/services/partnerService';
import { Room } from './types';
import InlineSheet from './components/InlineSheet';
import { MaintenanceCreateDialog } from './components/MaintenanceCreateDialog';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';
import { normalizeStayPropertyTypeLabel } from '@/utils/stayPropertyType';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import PartnerImageManager from './components/PartnerImageManager';
import PartnerRoomFormSheet from './components/PartnerRoomFormSheet';
import {
  useInvalidatePartnerPropertyRooms,
  usePartnerPropertyMetaQuery,
  usePartnerPropertyOccupancyQuery,
  usePartnerPropertyRoomsQuery,
} from '@/hooks/Partner/usePartnerPropertyRoomsQuery';

const PropertyRooms: React.FC = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const invalidatePropertyRooms = useInvalidatePartnerPropertyRooms();

  const [viewMode, setViewMode] = useState<'grid' | 'occupancy'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const prevFiltersRef = React.useRef({
    status: statusFilter,
    search: '',
    propertyId: propertyId,
  });

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals
  const [isRoomPanelOpen, setIsRoomPanelOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  // Image Manager
  const [imageManagerTarget, setImageManagerTarget] = useState<{id: number, name: string} | null>(null);

  // Quick Detail
  const [quickDetailRoom, setQuickDetailRoom] = useState<any>(null);

  // Maintenance Modal
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [maintenanceRoom, setMaintenanceRoom] = useState<any>(null);

  const [isBulkMode, setIsBulkMode] = useState(false);

  // Debounce search keyword
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchKeyword(searchKeyword), 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.status !== statusFilter ||
      prevFiltersRef.current.search !== debouncedSearchKeyword ||
      prevFiltersRef.current.propertyId !== propertyId;

    prevFiltersRef.current = {
      status: statusFilter,
      search: debouncedSearchKeyword,
      propertyId: propertyId,
    };

    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, statusFilter, debouncedSearchKeyword, propertyId]);

  const { data: propertyMeta } = usePartnerPropertyMetaQuery(propertyId);
  const propertyName = propertyMeta?.name ?? 'Bất động sản';
  const propertyType = propertyMeta
    ? normalizeStayPropertyTypeLabel(propertyMeta.property_type_name)
    : '';

  const normalizedKeyword = debouncedSearchKeyword.trim();
  const mappedStatus = statusFilter === 'all' ? undefined : statusFilter === 'visible' ? 1 : 0;

  const skipRoomsListQuery =
    Number(propertyMeta?.rooms_count ?? 0) === 0 &&
    !normalizedKeyword &&
    mappedStatus === undefined;

  const listParams = useMemo(
    () => ({
      propertyId: propertyId ?? '',
      page: currentPage,
      per_page: pageSize,
      room_number: normalizedKeyword || undefined,
      status: mappedStatus,
    }),
    [propertyId, currentPage, pageSize, normalizedKeyword, mappedStatus],
  );

  const {
    data: listData,
    isLoading: listLoading,
    isError: listError,
  } = usePartnerPropertyRoomsQuery(listParams, !skipRoomsListQuery && viewMode === 'grid');

  const rooms = (skipRoomsListQuery ? [] : (listData?.rooms ?? [])) as Room[];
  const totalItems = skipRoomsListQuery ? 0 : (listData?.totalItems ?? 0);
  const totalPages = skipRoomsListQuery ? 1 : (listData?.totalPages ?? 1);
  const loading = listLoading && rooms.length === 0 && !skipRoomsListQuery;

  const {
    data: occupancyResult,
    isLoading: loadingOccupancy,
  } = usePartnerPropertyOccupancyQuery(propertyId, viewMode === 'occupancy');

  const occupancyData = occupancyResult?.rooms ?? [];
  const occupancyStats = occupancyResult?.stats ?? null;

  useEffect(() => {
    if (listError) {
      toastError('Không thể tải danh sách phòng.');
    }
  }, [listError]);

  useEffect(() => {
    if (occupancyResult?.errorMessage) {
      toastError(occupancyResult.errorMessage || 'Không thể tải sơ đồ phòng.');
    }
  }, [occupancyResult?.errorMessage]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => rooms.some((r) => Number(r.id) === id)));
  }, [listParams, rooms]);

  const handleRefreshRooms = async () => {
    await invalidatePropertyRooms();
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const currentPageIds = useMemo(() => rooms.map((r) => Number(r.id)), [rooms]);
  const allCurrentPageSelected = useMemo(
    () => currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id)),
    [currentPageIds, selectedIds]
  );

  const handleToggleSelectAllCurrentPage = () => {
    setSelectedIds((prev) => {
      if (allCurrentPageSelected) {
        return prev.filter((id) => !currentPageIds.includes(id));
      }

      return Array.from(new Set([...prev, ...currentPageIds]));
    });
  };

  const handleBulkHide = async () => {
    if (selectedIds.length === 0) return;
    try {
      await partnerService.bulkUpdateRoomStatus(selectedIds, 0);
      toastSuccess(`Đã ẩn ${selectedIds.length} phòng.`);
      setSelectedIds([]);
      await handleRefreshRooms();
    } catch {
      toastError('Lỗi khi cập nhật trạng thái.');
    }
  };

  const handleBulkShow = async () => {
    if (selectedIds.length === 0) return;
    try {
      await partnerService.bulkUpdateRoomStatus(selectedIds, 1);
      toastSuccess(`Đã hiển thị ${selectedIds.length} phòng.`);
      setSelectedIds([]);
      await handleRefreshRooms();
    } catch {
      toastError('Lỗi khi cập nhật trạng thái.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.length} phòng đã chọn?`)) return;
    try {
      await partnerService.bulkDeleteRooms(selectedIds);
      toastSuccess(`Đã xóa ${selectedIds.length} phòng.`);
      setSelectedIds([]);
      setCurrentPage(1);
      await handleRefreshRooms();
    } catch {
      toastError('Lỗi khi xóa hàng loạt.');
    }
  };

  const openCreatePanel = () => {
    setEditingRoom(null);
    setIsRoomPanelOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('create') !== '1') return;
    openCreatePanel();

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('create');
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const getOccupancyColor = (status: string) => {
    switch (status) {
      case 'vacant': return 'bg-emerald-500 hover:bg-emerald-600 text-white';
      case 'occupied': return 'bg-rose-500 hover:bg-rose-600 text-white';
      case 'maintenance': return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'hidden': return 'bg-slate-400 hover:bg-slate-500 text-white';
      default: return 'bg-slate-200';
    }
  };

  // Group occupancy by floor
  const roomsByFloor = useMemo(() => {
    const floors: Record<number, any[]> = {};
    occupancyData.forEach((r: { floor_number?: number }) => {
      const f = r.floor_number || 1;
      if (!floors[f]) floors[f] = [];
      floors[f].push(r);
    });
    return Object.entries(floors).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [occupancyData]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-1 sm:px-0">
      {/* Header Section */}
      <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="absolute right-0 top-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
          <Building2 size={120} />
        </div>
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <button
              onClick={() => navigate('/partner/properties')}
              className="group/back mb-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
            >
              <ArrowLeft size={16} className="transition-transform group-hover/back:-translate-x-1" /> 
              Quay lại danh sách tài sản
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{propertyName}</h1>
              {propertyType && (
                <Badge variant="outline" className="border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-blue-600 shadow-sm">
                  {propertyType}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-500" />
                {totalItems} phòng tổng cộng
              </div>
              {occupancyStats && (
                <>
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    {occupancyStats.vacant} trống
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-rose-500">
                    <span className="size-2 rounded-full bg-rose-500" />
                    {occupancyStats.occupied} đang ở
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200/50 bg-slate-100 p-1 shadow-inner [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('grid')}
                className={`h-9 gap-2 rounded-lg px-4 font-semibold transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <LayoutGrid size={16} /> Danh sách
              </Button>
              <Button 
                variant={viewMode === 'occupancy' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('occupancy')}
                className={`h-9 gap-2 rounded-lg px-4 font-semibold transition-all ${viewMode === 'occupancy' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <Activity size={16} /> Trạng thái & Lịch
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={isBulkMode ? "secondary" : "outline"} 
                onClick={() => {
                  setIsBulkMode(!isBulkMode);
                  if (isBulkMode) setSelectedIds([]);
                }}
                className={`h-11 gap-2 rounded-xl px-4 font-semibold transition-all ${isBulkMode ? 'border-blue-200 bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-600'}`}
              >
                {isBulkMode ? <X size={18} /> : <Edit size={18} />} {isBulkMode ? 'Hủy' : 'Sửa'}
              </Button>
              <Button onClick={openCreatePanel} className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] hover:bg-blue-700 active:scale-95">
                <Plus size={20} /> Thêm phòng
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'grid' ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-[320px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm theo số phòng..."
                  className="pl-9"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400" size={16} />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" className="h-11 rounded-lg border-gray-200 pl-9">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="visible">Đang hiển thị</SelectItem>
                    <SelectItem value="hidden">Đã ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[220px] animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
              ))}
            </div>
          ) : rooms.length > 0 ? (
            <>
          {isBulkMode && (
            <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 duration-300 animate-in fade-in slide-in-from-top-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-blue-700">
                <input
                  type="checkbox"
                  checked={allCurrentPageSelected}
                  onChange={handleToggleSelectAllCurrentPage}
                  className="size-5 rounded border-blue-300 text-blue-600 focus:ring-0"
                />
                Chọn tất cả phòng của trang này ({rooms.length})
              </label>

              <div className="rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-tight text-blue-600 shadow-sm">
                Đã chọn: {selectedIds.length}
              </div>
            </div>
          )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {rooms.map((room) => (
                  <div 
                    key={room.id} 
                    className={`rounded-xl border bg-white ${selectedIds.includes(Number(room.id)) ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-200'} group relative flex flex-col p-5 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                  >
                    <div className="relative mb-4 flex items-start justify-between">
                      <div className="max-w-[80%] pl-1">
                        <h3 className="truncate text-lg font-semibold uppercase text-slate-800" title={room.title || room.name}>
                          {room.title || room.name}
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
                      <div className="absolute right-0 top-0 flex items-center gap-2">
                        <Badge variant="outline" className={`border text-[10px] font-semibold shadow-sm transition-all duration-300 ${isBulkMode ? 'mr-10' : ''} ${
                          (room.status === 'Trống' || String(room.status) === 'true' || String(room.status) === '1') ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 
                          (room.status === 'Đang thuê') ? 'border-blue-100 bg-blue-50 text-blue-600' : 
                          'border-amber-100 bg-amber-50 text-amber-600'
                        }`}>
                          {String(room.status) === 'true' || String(room.status) === '1' ? 'Công khai' : 
                           String(room.status) === 'false' || String(room.status) === '0' ? 'Đã ẩn' : 
                           room.status}
                        </Badge>
                        <div className={`z-20 flex size-5 items-center justify-center transition-all duration-300 ${isBulkMode ? 'scale-110 opacity-100' : 'pointer-events-none scale-0 opacity-0'}`}>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(Number(room.id))}
                            onChange={() => toggleSelect(Number(room.id))}
                            className="size-5 cursor-pointer border-slate-300 text-blue-600 outline-none focus:ring-0 focus:ring-offset-0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 flex-1 space-y-3">
                       <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                          <div className="flex items-center gap-1"><LayoutGrid size={14} className="text-slate-400" /> {room.area}m²</div>
                          <div className="flex items-center gap-1"><ChevronDown size={14} className="text-slate-400" /> Tầng {room.floor_number || 1}</div>
                          {(room.bedrooms_count !== undefined || room.beds_count !== undefined) && (
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {room.bedrooms_count || 1} PN • {room.beds_count || 1} giường
                            </div>
                          )}
                       </div>
                       
                       <div className="mt-4 border-t border-slate-50 pt-3">
                          <div className="flex items-center justify-between">
                             <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Giá thuê</span>
                             <span className="text-sm font-bold text-blue-600">
                                {room.prices && room.prices.length > 0 
                                  ? room.prices[0].price.toLocaleString('vi-VN') + ' ₫/th'
                                  : 'Chưa cài đặt'}
                             </span>
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-2 border-t border-slate-50 pt-3">
                       <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/partner/rooms/${room.id}`)}
                          className="size-9 rounded-lg border-slate-200 bg-blue-50/10 p-0 transition-colors hover:border-blue-600 hover:text-blue-600"
                          title="Xem chi tiết"
                       >
                         <LayoutDashboard size={14} />
                       </Button>
                       <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { setEditingRoom(room); setIsRoomPanelOpen(true); }}
                          className="h-9 flex-1 rounded-lg border-slate-200 text-[11px] font-semibold transition-colors hover:border-blue-600 hover:text-blue-600"
                       >
                         <Edit size={14} /> Sửa
                       </Button>
                       <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setImageManagerTarget({ id: Number(room.id), name: room.title || room.name })}
                          className="size-9 rounded-lg border-slate-200 p-0 transition-colors hover:border-violet-600 hover:text-violet-600"
                       >
                         <Camera size={16} />
                       </Button>
                       <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setMaintenanceRoom(room);
                            setIsMaintenanceOpen(true);
                          }}
                          className="size-9 rounded-lg border-slate-200 p-0 transition-colors hover:border-amber-600 hover:text-amber-600"
                       >
                         <Wrench size={16} />
                       </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <span className="whitespace-nowrap text-sm text-gray-500">Hiển thị mỗi trang:</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(val) => {
                      setPageSize(Number(val));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-24 rounded-lg">
                      <SelectValue placeholder={String(pageSize)} />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 12, 20, 50].map(size => (
                        <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {totalPages > 1 && (
                <div className="flex justify-center md:justify-end">
                   <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink 
                              isActive={currentPage === i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                           <PaginationNext 
                             onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                             className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                           />
                        </PaginationItem>
                      </PaginationContent>
                   </Pagination>
                </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-20 text-center shadow-sm">
               <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-slate-100 bg-slate-50">
                  <LayoutGrid size={32} className="text-slate-300" />
               </div>
               <h3 className="text-lg font-semibold text-slate-800">Không có phòng nào</h3>
               <p className="mb-6 text-slate-500">Bất động sản này hiện chưa có thông tin phòng.</p>
               <Button onClick={openCreatePanel} className="h-11 rounded-xl bg-blue-600 px-8 font-semibold hover:bg-blue-700">
                  <Plus size={20} className="mr-2" /> Thêm phòng ngay
               </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          {loadingOccupancy ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="lg" showText text="Đang tải sơ đồ lấp đầy..." />
            </div>
          ) : occupancyData.length > 0 ? (
            <div className="space-y-10">
               {roomsByFloor.map(([floor, floorRooms]) => (
                 <div key={floor} className="space-y-4">
                    <div className="flex items-center gap-4">
                       <h3 className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1 text-sm font-semibold uppercase tracking-widest text-slate-400">Tầng {floor}</h3>
                       <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 xl:grid-cols-12">
                       {floorRooms.map(room => (
                         <div 
                           key={room.id}
                           onClick={() => {
                             if (room.occupancy_status === 'occupied') {
                               setQuickDetailRoom(room);
                             } else {
                               // Open edit room
                               const r = rooms.find(it => it.id === room.id);
                              if (r) { setEditingRoom(r); setIsRoomPanelOpen(true); }
                             }
                           }}
                           className={`${getOccupancyColor(room.occupancy_status)} group relative flex h-16 cursor-pointer flex-col items-center justify-center rounded-xl border border-black/5 shadow-sm transition-all hover:scale-105 active:scale-95`}
                         >
                            <span className="text-sm font-black uppercase tracking-tighter">{room.room_number || room.title}</span>
                            {room.occupancy_status === 'occupied' && <span className="text-[9px] font-semibold opacity-80">Có khách</span>}
                            {room.occupancy_status === 'maintenance' && <Wrench size={10} className="mt-1 opacity-80" />}
                            
                            {/* Hover info */}
                            <div className="pointer-events-none absolute -top-12 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                               {room.title} • {room.occupancy_status === 'vacant' ? 'Trống' : room.occupancy_status === 'occupied' ? 'Đang thuê' : 'Bảo trì'}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               ))}

               {/* Legend */}
               <div className="flex flex-wrap items-center gap-6 border-t border-slate-100 pt-8 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <div className="flex items-center gap-2"><div className="size-3 rounded bg-emerald-500" /> Trống</div>
                  <div className="flex items-center gap-2"><div className="size-3 rounded bg-rose-500" /> Đang ở</div>
                  <div className="flex items-center gap-2"><div className="size-3 rounded bg-amber-500" /> Bảo trì</div>
                  <div className="flex items-center gap-2"><div className="size-3 rounded bg-slate-400" /> Đã ẩn</div>
               </div>
            </div>
          ) : (
            <div className="py-20 text-center italic text-slate-400">Vui lòng chọn bất động sản để xem sơ đồ.</div>
          )}
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-1rem)] -translate-x-1/2 animate-in slide-in-from-bottom-10 sm:bottom-8 sm:w-auto">
           <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-white shadow-2xl ring-4 ring-slate-900/10 backdrop-blur-md sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
                 <div className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black">{selectedIds.length}</div>
                 <span className="text-sm font-semibold tracking-tight">đã chọn</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                 <Button onClick={handleBulkShow} variant="ghost" className="h-10 gap-2 rounded-xl px-4 font-semibold text-emerald-300 transition-all hover:bg-emerald-500/10">
                   <Eye size={16} /> Hiện phòng
                 </Button>
                 <Button onClick={handleBulkHide} variant="ghost" className="h-10 gap-2 rounded-xl px-4 font-semibold text-white transition-all hover:bg-slate-800">
                   <Eye size={16} /> Ẩn phòng
                 </Button>
                 <Button onClick={handleBulkDelete} variant="ghost" className="h-10 gap-2 rounded-xl px-4 font-semibold text-rose-400 transition-all hover:bg-rose-500/10">
                   <Trash size={16} /> Xóa hàng loạt
                 </Button>
                 <Button onClick={() => setSelectedIds([])} variant="ghost" className="px-3 font-semibold text-slate-400 hover:text-white">
                   Hủy
                 </Button>
              </div>
           </div>
        </div>
      )}

      {/* Modals & Panels */}
      
      <PartnerRoomFormSheet
        open={isRoomPanelOpen}
        onClose={() => setIsRoomPanelOpen(false)}
        propertyId={propertyId || ''}
        room={editingRoom}
        onSaved={handleRefreshRooms}
      />

      {maintenanceRoom && (
        <MaintenanceCreateDialog
          open={isMaintenanceOpen}
          onOpenChange={setIsMaintenanceOpen}
          variant="sheet"
          roomId={maintenanceRoom.id}
          propertyId={propertyId}
          roomLabel={maintenanceRoom.title || maintenanceRoom.name}
          initialTitle={`Bảo trì phòng ${maintenanceRoom.title || maintenanceRoom.name || maintenanceRoom.room_number || ''}`}
          onCreated={handleRefreshRooms}
        />
      )}

      {/* Quick Status Detail Sheet */}
      <InlineSheet
        open={!!quickDetailRoom}
        onClose={() => setQuickDetailRoom(null)}
        title="Thông tin chi tiết cư dân"
        footer={<Button onClick={() => setQuickDetailRoom(null)} className="w-full">Đóng</Button>}
        widthClassName="w-full md:max-w-md"
      >
        {quickDetailRoom && (
           <div className="space-y-8 duration-300 animate-in fade-in slide-in-from-right-10">
              <div className="flex flex-col items-center space-y-4 text-center">
                 <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-black text-white shadow-xl shadow-blue-200">
                    {quickDetailRoom.customer_name?.split(' ').pop()?.[0] || 'U'}
                 </div>
                 <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">{quickDetailRoom.customer_name || 'Khách thuê'}</h2>
                    <p className="flex items-center justify-center gap-1 font-semibold text-blue-600"><Phone size={14} /> {quickDetailRoom.customer_phone || 'N/A'}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                 <div className="flex flex-col items-center space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Phòng</span>
                    <span className="text-lg font-black text-slate-900">{quickDetailRoom.title}</span>
                 </div>
                 <div className="flex flex-col items-center space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Tầng</span>
                    <span className="text-lg font-black text-slate-900">{quickDetailRoom.floor_number}</span>
                 </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-4">
                 <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-semibold uppercase tracking-tight text-slate-400"><Calendar size={14} /> Tiến độ thuê</span>
                    <span className="font-black text-blue-600">75% hoàn thành</span>
                 </div>
                 <div className="h-3 overflow-hidden rounded-full border border-slate-200 bg-slate-100 p-0.5 shadow-inner">
                    <div className="h-full rounded-full bg-blue-500 shadow-sm" style={{width: '75%'}} />
                 </div>
                 <div className="flex justify-between text-[11px] font-semibold italic text-slate-500">
                    <div className="flex flex-col"><span>NHẬN PHÒNG</span><span className="not-italic text-slate-900">{new Date(quickDetailRoom.check_in_date).toLocaleDateString('vi-VN')}</span></div>
                    <div className="flex flex-col text-right"><span>TRẢ PHÒNG</span><span className="not-italic text-slate-900">{new Date(quickDetailRoom.check_out_date).toLocaleDateString('vi-VN')}</span></div>
                 </div>
              </div>

              <div className="flex flex-col gap-3 pt-6">
                 <Button 
                    className="h-11 w-full gap-2 rounded-xl bg-slate-900 font-semibold text-white shadow-lg shadow-slate-200 hover:bg-slate-800"
                    onClick={() => navigate(`/partner/rooms/${quickDetailRoom.id}`)}
                 >
                    <Eye size={16} /> Xem bản đầy đủ
                 </Button>
                 <Button 
                    variant="outline" 
                    className="h-11 w-full gap-2 rounded-xl border-2 border-slate-100 font-semibold text-slate-500 hover:bg-blue-50/30 hover:text-blue-600"
                    onClick={() => {
                       const r = rooms.find(it => it.id === quickDetailRoom.id);
                       if (r) { setEditingRoom(r); setIsRoomPanelOpen(true); setQuickDetailRoom(null); }
                    }}
                 >
                    <Edit size={16} /> Chỉnh sửa thông số phòng
                 </Button>
              </div>
           </div>
        )}
      </InlineSheet>

      {/* Image Manager Dialog */}
      {imageManagerTarget && (
        <PartnerImageManager 
          isOpen={!!imageManagerTarget}
          onClose={() => setImageManagerTarget(null)}
          targetName={imageManagerTarget.name}
          type="room"
          targetId={String(imageManagerTarget.id)}
        />
      )}
    </div>
  );
};

export default PropertyRooms;

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Loader2, Plus, Wallet, 
  LayoutGrid, Activity, Wrench, Camera, CheckSquare, 
  ChevronDown, Phone, Calendar, Trash, Eye, Search,
  Building2, X, LayoutDashboard, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { toastError, toastSuccess } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { PlainTextarea } from '@/components/ui/textarea';
import PartnerImageManager from './components/PartnerImageManager';

const PropertyRooms: React.FC = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  // buildings state removed as it is not used in this component
  const [loading, setLoading] = useState(true);
  const [propertyName, setPropertyName] = useState('Bất động sản');
  const [propertyType, setPropertyType] = useState('');
  
  const [viewMode, setViewMode] = useState<'grid' | 'occupancy'>('grid');
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [occupancyStats, setOccupancyStats] = useState<any>(null);
  const [loadingOccupancy, setLoadingOccupancy] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals
  const [isRoomPanelOpen, setIsRoomPanelOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isBulkEntry, setIsBulkEntry] = useState(false);
  
  // Image Manager
  const [imageManagerTarget, setImageManagerTarget] = useState<{id: number, name: string} | null>(null);

  // Quick Detail
  const [quickDetailRoom, setQuickDetailRoom] = useState<any>(null);

  // Maintenance Modal
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [maintenanceRoom, setMaintenanceRoom] = useState<any>(null);
  const [maintenanceForm, setMaintenanceForm] = useState({
    title: '',
    description: '',
    type: 'scheduled',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  const [formData, setFormData] = useState<any>({
    name: '',
    area: 0,
    floor_number: 1,
    people: 1,
    room_type: 1,
    status: true,
    amenities: [],
    services: [],
    buildingId: propertyId || '',
    prices: [{ id: 'p' + Date.now(), packageName: 'Gói tháng', price: 0, duration: 1 }],
  });

  const [availableAmenities, setAvailableAmenities] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);

  const [bulkConfig, setBulkConfig] = useState({
    namingStyle: 'floor-index' as 'floor-index' | 'prefix-index',
    floorNumber: 1,
    prefix: 'P',
    startIndex: 1,
    count: 10,
    step: 1,
    padLength: 2,
  });

  const [isBulkMode, setIsBulkMode] = useState(false);

  const bulkRoomNames = useMemo(() => {
    if (!isBulkEntry) {
      return [] as string[];
    }

    const names: string[] = [];
    const count = Math.max(0, Number(bulkConfig.count) || 0);
    const startIndex = Math.max(0, Number(bulkConfig.startIndex) || 0);
    const step = Math.max(1, Number(bulkConfig.step) || 1);
    const padLength = Math.max(1, Number(bulkConfig.padLength) || 1);
    const floorNumber = Math.max(0, Number(bulkConfig.floorNumber) || 0);
    const prefix = String(bulkConfig.prefix || '').trim();

    for (let i = 0; i < count; i++) {
      const index = startIndex + i * step;
      const indexText = String(index).padStart(padLength, '0');

      if (bulkConfig.namingStyle === 'floor-index') {
        names.push(`${floorNumber}${indexText}`);
      } else {
        names.push(`${prefix}${indexText}`);
      }
    }

    return names;
  }, [isBulkEntry, bulkConfig]);

  const duplicateBulkRoomNames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const name of bulkRoomNames) {
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    return Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([name]) => name);
  }, [bulkRoomNames]);

  useEffect(() => {
    fetchData(1);
    fetchOptions();
  }, [propertyId]);

  // Real-time filter: status
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchData(1, searchKeyword, statusFilter);
    }
  }, [statusFilter]);

  // Real-time search: debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchData(1, searchKeyword, statusFilter);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Pagination effect
  useEffect(() => {
    fetchData(currentPage, searchKeyword, statusFilter);
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (viewMode === 'occupancy') {
      fetchOccupancy();
    }
  }, [viewMode, propertyId]);

  const fetchOptions = async () => {
    try {
      const [ams, svs]: any = await Promise.all([
        partnerService.getAllAmenities(),
        partnerService.getAllServices()
      ]);
      setAvailableAmenities(ams?.data || []);
      setAvailableServices(svs?.data || []);
    } catch (e) {}
  };

  const fetchOccupancy = async () => {
    try {
      setLoadingOccupancy(true);
      const res: any = await partnerService.getRoomsOccupancy({ building_id: propertyId });
      if (res?.status === 'success' && res?.data) {
        setOccupancyData(res.data.rooms || []);
        setOccupancyStats(res.data.stats || null);
      } else {
        setOccupancyData([]);
        setOccupancyStats(null);
        toastError(res?.message || 'Không thể tải sơ đồ phòng.');
      }
    } catch (error) {
      toastError('Không thể tải sơ đồ phòng.');
    } finally {
      setLoadingOccupancy(false);
    }
  };

  const fetchData = async (page: number = 1, keyword: string = searchKeyword, visibility: string = statusFilter, size: number = pageSize) => {
    try {
      setLoading(true);
      setCurrentPage(page);

      const normalizedKeyword = keyword.trim();
      const mappedStatus = visibility === 'all' ? undefined : visibility === 'visible' ? 1 : 0;

      const roomsRes: any = await partnerService.getRooms({
        building_id: propertyId,
        page: page,
        per_page: size,
        room_number: normalizedKeyword || undefined,
        status: mappedStatus,
      });

      const roomData = roomsRes?.data || {};
      const rawRooms = roomData.data || (Array.isArray(roomData) ? roomData : []);
      
      setRooms(rawRooms);
      setTotalItems(roomData.total || rawRooms.length);
      setTotalPages(roomData.last_page || 1);
      setSelectedIds(prev => prev.filter(id => rawRooms.some((r: any) => Number(r.id) === id)));

      if (propertyName === 'Bất động sản') {
        const buildingsRes: any = await partnerService.getBuildings({ id: propertyId });
        const selectedBuilding = (buildingsRes?.data?.data || buildingsRes?.data || []).find((b: any) => String(b.id) === String(propertyId));
        if (selectedBuilding) {
          setPropertyName(selectedBuilding.name);
          setPropertyType(selectedBuilding.property_type_name || '');
        }
      }
    } catch (error) {
      toastError('Không thể tải danh sách phòng.');
    } finally {
      setLoading(false);
    }
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
      fetchData(currentPage);
    } catch (e) {
      toastError('Lỗi khi cập nhật trạng thái.');
    }
  };

  const handleBulkShow = async () => {
    if (selectedIds.length === 0) return;
    try {
      await partnerService.bulkUpdateRoomStatus(selectedIds, 1);
      toastSuccess(`Đã hiển thị ${selectedIds.length} phòng.`);
      setSelectedIds([]);
      fetchData(currentPage);
    } catch (e) {
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
      fetchData(1);
    } catch (e) {
      toastError('Lỗi khi xóa hàng loạt.');
    }
  };

  const openCreatePanel = () => {
    setEditingRoom(null);
    setIsBulkEntry(false);
    setBulkConfig({
      namingStyle: 'floor-index',
      floorNumber: 1,
      prefix: 'P',
      startIndex: 1,
      count: 10,
      step: 1,
      padLength: 2,
    });
    setFormData({
      name: '',
      area: 25,
      floor_number: 1,
      people: 2,
      room_type: 1,
      status: true,
      buildingId: propertyId || '',
      amenities: [],
      services: [],
      prices: [{ id: 'p' + Date.now(), packageName: 'Gói tháng', price: 0, duration: 1 }],
    });
    setIsRoomPanelOpen(true);
  };

  const handleSaveRoom = async () => {
    try {
      if (isBulkEntry) {
        const roomNames = bulkRoomNames;
        if (roomNames.length === 0) return toastError('Vui lòng nhập danh sách tên phòng.');
        if (new Set(roomNames).size !== roomNames.length) return toastError('Danh sách phòng có mã bị trùng, vui lòng kiểm tra lại.');
        
        await partnerService.bulkCreateRoom({
          building_id: propertyId,
          rooms: roomNames.map((name: string) => ({ name, area: formData.area })),
          area: formData.area,
          floor_number: formData.floor_number,
          people: formData.people,
          room_type: formData.room_type,
          status: formData.status ? 1 : 0,
          amenities: formData.amenities,
          services: formData.services,
          prices: (formData.prices || []).map((p: any) => ({
            packageName: p.packageName,
            unit: 'month',
            unit_price: Number(p.price || 0),
          })),
        });
        toastSuccess(`Đã tạo ${roomNames.length} phòng thành công.`);
      } else {
        if (editingRoom) {
          await partnerService.updateRoom(String(editingRoom.id), formData);
          toastSuccess('Đã cập nhật phòng.');
        } else {
          await partnerService.createRoom(formData);
          toastSuccess('Đã thêm phòng mới.');
        }
      }
      setIsRoomPanelOpen(false);
      fetchData(currentPage);
      if (viewMode === 'occupancy') fetchOccupancy();
    } catch (error) {
      toastError('Lỗi khi lưu dữ liệu.');
    }
  };



  const handleRegisterMaintenance = async () => {
    if (!maintenanceForm.title) return toastError('Vui lòng nhập tiêu đề bảo trì.');
    try {
      await partnerService.createMaintenance({
        room_id: maintenanceRoom.id,
        property_id: propertyId,
        title: maintenanceForm.title,
        description: maintenanceForm.description,
        maintenance_type: maintenanceForm.type,
        start_time: maintenanceForm.start_date,
        end_time: maintenanceForm.end_date || null,
      });
      toastSuccess('Đã đăng ký lịch bảo trì.');
      setIsMaintenanceOpen(false);
      if (viewMode === 'occupancy') fetchOccupancy();
    } catch (e) {
      toastError('Lỗi khi đăng ký bảo trì.');
    }
  };

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
    occupancyData.forEach(r => {
      const f = r.floor_number || 1;
      if (!floors[f]) floors[f] = [];
      floors[f].push(r);
    });
    return Object.entries(floors).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [occupancyData]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Building2 size={120} />
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <button
              onClick={() => navigate('/partner/properties')}
              className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors mb-2 group/back"
            >
              <ArrowLeft size={16} className="group-hover/back:-translate-x-1 transition-transform" /> 
              Quay lại danh sách tài sản
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{propertyName}</h1>
              {propertyType && (
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 uppercase text-[10px] font-semibold tracking-widest px-2 py-0.5 shadow-sm">
                  {propertyType}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-slate-500 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {totalItems} phòng tổng cộng
              </div>
              {occupancyStats && (
                <>
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {occupancyStats.vacant} trống
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-rose-500 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    {occupancyStats.occupied} đang ở
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 shadow-inner border border-slate-200/50">
              <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('grid')}
                className={`rounded-lg h-9 px-4 gap-2 font-semibold transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <LayoutGrid size={16} /> Danh sách
              </Button>
              <Button 
                variant={viewMode === 'occupancy' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('occupancy')}
                className={`rounded-lg h-9 px-4 gap-2 font-semibold transition-all ${viewMode === 'occupancy' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <Activity size={16} /> Trạng thái & Lịch
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={isBulkMode ? "secondary" : "outline"} 
                onClick={() => {
                  setIsBulkMode(!isBulkMode);
                  if (isBulkMode) setSelectedIds([]);
                }}
                className={`h-11 rounded-xl px-4 gap-2 font-semibold transition-all ${isBulkMode ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' : 'text-slate-600'}`}
              >
                {isBulkMode ? <X size={18} /> : <Edit size={18} />} {isBulkMode ? 'Hủy' : 'Sửa'}
              </Button>
              <Button onClick={openCreatePanel} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 px-6 h-11 rounded-xl flex items-center gap-2 font-semibold transition-all hover:scale-[1.02] active:scale-95">
                <Plus size={20} /> Thêm phòng
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'grid' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
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
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={16} />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" className="pl-9 h-11 rounded-lg border-gray-200">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[220px] rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : rooms.length > 0 ? (
            <>
          {isBulkMode && (
            <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="flex items-center gap-2 text-sm font-semibold text-blue-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allCurrentPageSelected}
                  onChange={handleToggleSelectAllCurrentPage}
                  className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-0"
                />
                Chọn tất cả phòng của trang này ({rooms.length})
              </label>

              <div className="text-xs text-blue-600 font-bold bg-white px-3 py-1 rounded-full border border-blue-100 shadow-sm uppercase tracking-tight">
                Đã chọn: {selectedIds.length}
              </div>
            </div>
          )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rooms.map((room) => (
                  <div 
                    key={room.id} 
                    className={`bg-white rounded-xl border ${selectedIds.includes(Number(room.id)) ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-200'} p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative ring-1 ring-black/5 flex flex-col`}
                  >
                    <div className="flex justify-between items-start mb-4 relative">
                      <h3 className="text-lg font-semibold text-slate-800 uppercase pl-1 pr-16 truncate max-w-[80%]" title={room.title || room.name}>
                        {room.title || room.name}
                      </h3>
                      <div className="flex items-center gap-2 absolute top-0 right-0">
                        <Badge variant="outline" className={`text-[10px] font-semibold border shadow-sm transition-all duration-300 ${isBulkMode ? 'mr-10' : ''} ${
                          (room.status === 'Trống' || String(room.status) === 'true' || String(room.status) === '1') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          (room.status === 'Đang thuê') ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {String(room.status) === 'true' || String(room.status) === '1' ? 'Công khai' : 
                           String(room.status) === 'false' || String(room.status) === '0' ? 'Đã ẩn' : 
                           room.status}
                        </Badge>
                        <div className={`z-20 transition-all duration-300 flex items-center justify-center w-5 h-5 ${isBulkMode ? 'opacity-100 scale-110' : 'opacity-0 scale-0 pointer-events-none'}`}>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(Number(room.id))}
                            onChange={() => toggleSelect(Number(room.id))}
                            className="w-5 h-5 border-slate-300 text-blue-600 focus:ring-0 focus:ring-offset-0 outline-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 mb-6">
                       <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                          <div className="flex items-center gap-1"><LayoutGrid size={14} className="text-slate-400" /> {room.area}m²</div>
                          <div className="flex items-center gap-1"><ChevronDown size={14} className="text-slate-400" /> Tầng {room.floor_number || 1}</div>
                       </div>
                       
                       <div className="mt-4 pt-3 border-t border-slate-50">
                          <div className="flex items-center justify-between">
                             <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Giá thuê</span>
                             <span className="text-sm font-bold text-blue-600">
                                {room.prices && room.prices.length > 0 
                                  ? room.prices[0].price.toLocaleString('vi-VN') + ' ₫/th'
                                  : 'Chưa cài đặt'}
                             </span>
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-slate-50">
                       <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/partner/rooms/${room.id}`)}
                          className="h-9 w-9 p-0 rounded-lg border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-colors bg-blue-50/10"
                          title="Xem chi tiết"
                       >
                         <LayoutDashboard size={14} />
                       </Button>
                       <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { setEditingRoom(room); setFormData(room); setIsRoomPanelOpen(true); }}
                          className="flex-1 h-9 rounded-lg text-[11px] font-semibold border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-colors"
                       >
                         <Edit size={14} /> Sửa
                       </Button>
                       <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setImageManagerTarget({ id: Number(room.id), name: room.title || room.name })}
                          className="h-9 w-9 p-0 rounded-lg border-slate-200 hover:border-violet-600 hover:text-violet-600 transition-colors"
                       >
                         <Camera size={16} />
                       </Button>
                       <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setMaintenanceRoom(room);
                            setMaintenanceForm((prev) => ({
                              ...prev,
                              title: `Bảo trì phòng ${room.title || room.name}`,
                            }));
                            setIsMaintenanceOpen(true);
                          }}
                          className="h-9 w-9 p-0 rounded-lg border-slate-200 hover:border-amber-600 hover:text-amber-600 transition-colors"
                       >
                         <Wrench size={16} />
                       </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 whitespace-nowrap">Hiển thị mỗi trang:</span>
                  <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
                    <SelectTrigger className="w-[70px] h-9 rounded-lg">
                      <SelectValue placeholder={pageSize} />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 20, 50].map(size => (
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
                            onClick={() => currentPage > 1 && fetchData(currentPage - 1)}
                            className={currentPage === 1 ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink 
                              isActive={currentPage === i + 1}
                              onClick={() => fetchData(i + 1)}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                           <PaginationNext 
                             onClick={() => currentPage < totalPages && fetchData(currentPage + 1)}
                             className={currentPage === totalPages ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
                           />
                        </PaginationItem>
                      </PaginationContent>
                   </Pagination>
                </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-20 shadow-sm text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <LayoutGrid size={32} className="text-slate-300" />
               </div>
               <h3 className="text-lg font-semibold text-slate-800">Không có phòng nào</h3>
               <p className="text-slate-500 mb-6">Bất động sản này hiện chưa có thông tin phòng.</p>
               <Button onClick={openCreatePanel} className="bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold h-11 px-8">
                  <Plus size={20} className="mr-2" /> Thêm phòng ngay
               </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          {loadingOccupancy ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-slate-400 italic">Đang tải sơ đồ lấp đầy...</p>
            </div>
          ) : occupancyData.length > 0 ? (
            <div className="space-y-10">
               {roomsByFloor.map(([floor, floorRooms]) => (
                 <div key={floor} className="space-y-4">
                    <div className="flex items-center gap-4">
                       <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">Tầng {floor}</h3>
                       <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                       {floorRooms.map(room => (
                         <div 
                           key={room.id}
                           onClick={() => {
                             if (room.occupancy_status === 'occupied') {
                               setQuickDetailRoom(room);
                             } else {
                               // Open edit room
                               const r = rooms.find(it => it.id === room.id);
                               if (r) { setEditingRoom(r); setFormData(r); setIsRoomPanelOpen(true); }
                             }
                           }}
                           className={`${getOccupancyColor(room.occupancy_status)} h-16 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm border border-black/5 relative group`}
                         >
                            <span className="text-sm font-black uppercase tracking-tighter">{room.room_number || room.title}</span>
                            {room.occupancy_status === 'occupied' && <span className="text-[9px] font-semibold opacity-80">Có khách</span>}
                            {room.occupancy_status === 'maintenance' && <Wrench size={10} className="mt-1 opacity-80" />}
                            
                            {/* Hover info */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-xl">
                               {room.title} • {room.occupancy_status === 'vacant' ? 'Trống' : room.occupancy_status === 'occupied' ? 'Đang thuê' : 'Bảo trì'}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               ))}

               {/* Legend */}
               <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500" /> Trống</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-rose-500" /> Đang ở</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500" /> Bảo trì</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-400" /> Đã ẩn</div>
               </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 italic">Vui lòng chọn bất động sản để xem sơ đồ.</div>
          )}
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10">
           <div className="bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-6 ring-4 ring-slate-900/10 backdrop-blur-md">
              <div className="flex items-center gap-3 pr-6 border-r border-slate-800">
                 <div className="bg-blue-600 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">{selectedIds.length}</div>
                 <span className="text-sm font-semibold tracking-tight">đã chọn</span>
              </div>
              <div className="flex items-center gap-2">
                 <Button onClick={handleBulkShow} variant="ghost" className="text-emerald-300 hover:bg-emerald-500/10 gap-2 font-semibold h-10 px-4 rounded-xl transition-all">
                   <Eye size={16} /> Hiện phòng
                 </Button>
                 <Button onClick={handleBulkHide} variant="ghost" className="text-white hover:bg-slate-800 gap-2 font-semibold h-10 px-4 rounded-xl transition-all">
                   <Eye size={16} /> Ẩn phòng
                 </Button>
                 <Button onClick={handleBulkDelete} variant="ghost" className="text-rose-400 hover:bg-rose-500/10 gap-2 font-semibold h-10 px-4 rounded-xl transition-all">
                   <Trash size={16} /> Xóa hàng loạt
                 </Button>
                 <Button onClick={() => setSelectedIds([])} variant="ghost" className="text-slate-400 hover:text-white px-3 font-semibold">
                   Hủy
                 </Button>
              </div>
           </div>
        </div>
      )}

      {/* Modals & Panels */}
      
      {/* Create/Edit Room Panel */}
      <InlineSheet
        open={isRoomPanelOpen}
        onClose={() => setIsRoomPanelOpen(false)}
        title={editingRoom ? 'Cập nhật phòng' : 'Thêm phòng mới'}
        footer={
           <div className="flex items-center justify-end w-full gap-2">
              <Button variant="outline" onClick={() => setIsRoomPanelOpen(false)}>Hủy</Button>
              <Button onClick={handleSaveRoom} className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
           </div>
        }
      >
        <div className="space-y-6">
           {!editingRoom && (
             <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
               <label htmlFor="bulk-mode" className="flex items-center gap-2 cursor-pointer">
                 <input
                   type="checkbox"
                   id="bulk-mode"
                   checked={isBulkEntry}
                   onChange={e => setIsBulkEntry(e.target.checked)}
                   className="w-4 h-4 rounded border-slate-300 text-blue-600"
                 />
                 <span className="text-sm font-semibold text-slate-700">Chế độ tạo hàng loạt</span>
               </label>
             </div>
           )}

           <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                 <CheckSquare size={20} />
              </div>
              <div className="space-y-1">
                 <p className="text-sm font-semibold text-blue-900">{isBulkEntry ? 'Tạo danh sách phòng nhanh' : 'Thông tin chi tiết phòng'}</p>
                 <p className="text-xs text-blue-600/70">{isBulkEntry ? 'Nhập tên các phòng cách nhau bởi dấu phẩy hoặc xuống dòng.' : 'Cung cấp đầy đủ thông số để thu hút cư dân tiềm năng.'}</p>
              </div>
           </div>

           <div className="space-y-4">
              {isBulkEntry ? (
                <div className="grid gap-3">
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs text-blue-800 space-y-1">
                    <p className="font-semibold">Hướng dẫn tạo hàng loạt</p>
                    <p>- Dùng cấu hình số và kiểu mã để hệ thống tự sinh danh sách phòng.</p>
                    <p>- Toàn bộ thông số bên dưới (diện tích, tầng, sức chứa, tiện nghi, dịch vụ, giá) sẽ áp dụng cho tất cả phòng.</p>
                    <p>- Bạn xem trước danh sách sinh tự động trước khi bấm lưu.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="grid gap-2">
                      <Label className="font-semibold">Kiểu mã phòng</Label>
                      <select
                        value={bulkConfig.namingStyle}
                        onChange={(e) => setBulkConfig((prev) => ({ ...prev, namingStyle: e.target.value as 'floor-index' | 'prefix-index' }))}
                        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
                      >
                        <option value="floor-index">Tầng + số thứ tự (VD: 201, 202)</option>
                        <option value="prefix-index">Tiền tố + số thứ tự (VD: P01, P02)</option>
                      </select>
                    </div>

                    {bulkConfig.namingStyle === 'floor-index' ? (
                      <div className="grid gap-2">
                        <Label className="font-semibold">Tầng dùng để sinh mã</Label>
                        <Input
                          type="number"
                          value={bulkConfig.floorNumber}
                          onChange={(e) => setBulkConfig((prev) => ({ ...prev, floorNumber: Number(e.target.value) || 0 }))}
                          className="rounded-xl h-11"
                        />
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        <Label className="font-semibold">Tiền tố mã phòng</Label>
                        <Input
                          value={bulkConfig.prefix}
                          onChange={(e) => setBulkConfig((prev) => ({ ...prev, prefix: e.target.value }))}
                          placeholder="VD: P, A, VIP-"
                          className="rounded-xl h-11"
                        />
                      </div>
                    )}

                    <div className="grid gap-2">
                      <Label className="font-semibold">Số bắt đầu</Label>
                      <Input
                        type="number"
                        value={bulkConfig.startIndex}
                        onChange={(e) => setBulkConfig((prev) => ({ ...prev, startIndex: Number(e.target.value) || 0 }))}
                        className="rounded-xl h-11"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label className="font-semibold">Số lượng phòng</Label>
                      <Input
                        type="number"
                        min={1}
                        value={bulkConfig.count}
                        onChange={(e) => setBulkConfig((prev) => ({ ...prev, count: Number(e.target.value) || 0 }))}
                        className="rounded-xl h-11"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label className="font-semibold">Bước nhảy</Label>
                      <Input
                        type="number"
                        min={1}
                        value={bulkConfig.step}
                        onChange={(e) => setBulkConfig((prev) => ({ ...prev, step: Number(e.target.value) || 1 }))}
                        className="rounded-xl h-11"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label className="font-semibold">Độ dài số (padding)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={bulkConfig.padLength}
                        onChange={(e) => setBulkConfig((prev) => ({ ...prev, padLength: Number(e.target.value) || 1 }))}
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Xem trước phòng sẽ tạo</p>
                      <span className="text-xs font-semibold text-blue-700">{bulkRoomNames.length} phòng</span>
                    </div>

                    {duplicateBulkRoomNames.length > 0 && (
                      <div className="text-xs text-rose-600 font-semibold">
                        Trùng tên phòng: {duplicateBulkRoomNames.join(', ')}
                      </div>
                    )}

                    {bulkRoomNames.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-28 overflow-auto pr-1">
                        {bulkRoomNames.map((name, index) => (
                          <span
                            key={`${name}-${index}`}
                            className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Chưa có dữ liệu xem trước.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                   <div className="grid gap-2">
                     <Label className="font-semibold">Số phòng / Tên phòng</Label>
                     <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: P.101" className="rounded-xl h-11" />
                   </div>
                   <div className="grid gap-2">
                     <Label className="font-semibold">Tầng</Label>
                     <Input type="number" value={formData.floor_number} onChange={e => setFormData({...formData, floor_number: Number(e.target.value)})} className="rounded-xl h-11" />
                   </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label className="font-semibold">Diện tích (m²)</Label>
                    <Input type="number" value={formData.area} onChange={e => setFormData({...formData, area: Number(e.target.value)})} className="rounded-xl h-11" />
                 </div>
                 <div className="grid gap-2">
                    <Label className="font-semibold">Sức chứa (người)</Label>
                    <Input type="number" value={formData.people} onChange={e => setFormData({...formData, people: Number(e.target.value)})} className="rounded-xl h-11" />
                 </div>
              </div>

              <div className="grid gap-2">
                <Label className="font-semibold">Tiện nghi (Amenities)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                   {availableAmenities.map(am => (
                     <label key={am.id} className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                        <input 
                           type="checkbox" 
                           checked={formData.amenities.includes(am.id)}
                           onChange={e => {
                             const next = e.target.checked 
                               ? [...formData.amenities, am.id]
                               : formData.amenities.filter((id: number) => id !== am.id);
                             setFormData({...formData, amenities: next});
                           }}
                           className="w-4 h-4 rounded border-slate-300 text-blue-600"
                        />
                        <span className="text-xs font-medium text-slate-700">{am.name}</span>
                     </label>
                   ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="font-semibold">Dịch vụ (Services)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                   {availableServices.map((sv) => (
                     <label key={sv.id} className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                        <input
                           type="checkbox"
                           checked={formData.services.includes(sv.id)}
                           onChange={(e) => {
                             const next = e.target.checked
                               ? [...formData.services, sv.id]
                               : formData.services.filter((id: number) => id !== sv.id);
                             setFormData({ ...formData, services: next });
                           }}
                           className="w-4 h-4 rounded border-slate-300 text-blue-600"
                        />
                        <span className="text-xs font-medium text-slate-700">{sv.name}</span>
                     </label>
                   ))}
                </div>
              </div>

              <div className="grid gap-2 border-t pt-4">
                 <div className="flex justify-between items-center mb-2">
                   <Label className="font-bold flex items-center gap-2 uppercase tracking-wider text-xs text-slate-500">
                      <Wallet size={14} className="text-blue-500" /> Bảng giá thuê phòng
                   </Label>
                   <Button variant="ghost" size="sm" onClick={() => setFormData({...formData, prices: [...formData.prices, { id: 'p' + Date.now(), packageName: 'Gói mới', price: 0, duration: 1 }]})} className="text-blue-600 font-semibold hover:bg-blue-50 text-[11px]">+ Thêm gói</Button>
                 </div>
                 <div className="space-y-2">
                    {formData.prices.map((p: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 items-center animate-in fade-in zoom-in-95 duration-200">
                         <div className="col-span-5"><Input value={p.packageName} onChange={e => {
                            const n = [...formData.prices]; n[idx].packageName = e.target.value; setFormData({...formData, prices: n});
                         }} placeholder="Tên gói" className="h-9 text-xs font-semibold rounded-lg" /></div>
                         <div className="col-span-4"><Input type="number" value={p.price} onChange={e => {
                            const n = [...formData.prices]; n[idx].price = Number(e.target.value); setFormData({...formData, prices: n});
                         }} placeholder="Đơn giá" className="h-9 text-xs font-semibold rounded-lg" /></div>
                         <div className="col-span-2"><Input type="number" value={p.duration} onChange={e => {
                            const n = [...formData.prices]; n[idx].duration = Number(e.target.value); setFormData({...formData, prices: n});
                         }} placeholder="T.hạn" className="h-9 text-xs font-semibold rounded-lg" /></div>
                         <div className="col-span-1 flex justify-center"><Button variant="ghost" size="sm" onClick={() => setFormData({...formData, prices: formData.prices.filter((_:any, i:number) => i !== idx)})} className="text-slate-400 hover:text-rose-500 p-0 h-8 w-8"><X size={14} /></Button></div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </InlineSheet>

      {/* Maintenance Panel */}
      <InlineSheet
        open={isMaintenanceOpen}
        onClose={() => setIsMaintenanceOpen(false)}
        title="Đăng ký bảo trì / báo hỏng"
        footer={
           <div className="flex gap-2 justify-end w-full">
              <Button variant="outline" onClick={() => setIsMaintenanceOpen(false)}>Hủy</Button>
              <Button onClick={handleRegisterMaintenance} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">Xác nhận đăng ký</Button>
           </div>
        }
      >
        <div className="space-y-6">
           <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-sm italic">
              Việc đăng ký bảo trì sẽ tự động cập nhật trạng thái phòng sang <strong>"Bảo trì"</strong> trên sơ đồ và tạm khóa việc đặt phòng trực tuyến.
           </div>
           <div className="grid gap-4">
              <div className="grid gap-1">
                 <Label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Tiêu đề sự cố</Label>
                 <Input value={maintenanceForm.title} onChange={e => setMaintenanceForm({...maintenanceForm, title: e.target.value})} placeholder="VD: Hỏng vòi nước, kiểm tra điều hòa..." className="rounded-xl h-12" />
              </div>
              <div className="grid gap-1">
                 <Label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Mô tả chi tiết</Label>
                 <PlainTextarea value={maintenanceForm.description} onChange={e => setMaintenanceForm({...maintenanceForm, description: e.target.value})} placeholder="Mô tả cụ thể tình trạng hoặc yêu cầu kỹ thuật..." className="rounded-xl min-h-[100px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-1">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Ngày bắt đầu</Label>
                    <Input type="date" value={maintenanceForm.start_date} onChange={e => setMaintenanceForm({...maintenanceForm, start_date: e.target.value})} className="rounded-xl" />
                 </div>
                 <div className="grid gap-1">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Dự kiến hoàn thành</Label>
                    <Input type="date" value={maintenanceForm.end_date} onChange={e => setMaintenanceForm({...maintenanceForm, end_date: e.target.value})} className="rounded-xl" />
                 </div>
              </div>
           </div>
        </div>
      </InlineSheet>

      {/* Quick Status Detail Sheet */}
      <InlineSheet
        open={!!quickDetailRoom}
        onClose={() => setQuickDetailRoom(null)}
        title="Thông tin chi tiết cư dân"
        footer={<Button onClick={() => setQuickDetailRoom(null)} className="w-full">Đóng</Button>}
        widthClassName="max-w-md"
      >
        {quickDetailRoom && (
           <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-300">
              <div className="flex flex-col items-center text-center space-y-4">
                 <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-200">
                    {quickDetailRoom.customer_name?.split(' ').pop()?.[0] || 'U'}
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{quickDetailRoom.customer_name || 'Khách thuê'}</h2>
                    <p className="text-blue-600 font-semibold flex items-center justify-center gap-1"><Phone size={14} /> {quickDetailRoom.customer_phone || 'N/A'}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Phòng</span>
                    <span className="text-lg font-black text-slate-900">{quickDetailRoom.title}</span>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Tầng</span>
                    <span className="text-lg font-black text-slate-900">{quickDetailRoom.floor_number}</span>
                 </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-semibold uppercase tracking-tight flex items-center gap-1.5"><Calendar size={14} /> Tiến độ thuê</span>
                    <span className="text-blue-600 font-black">75% hoàn thành</span>
                 </div>
                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner p-0.5">
                    <div className="h-full bg-blue-500 rounded-full shadow-sm" style={{width: '75%'}} />
                 </div>
                 <div className="flex justify-between text-[11px] font-semibold text-slate-500 italic">
                    <div className="flex flex-col"><span>NHẬN PHÒNG</span><span className="text-slate-900 not-italic">{new Date(quickDetailRoom.check_in_date).toLocaleDateString('vi-VN')}</span></div>
                    <div className="flex flex-col text-right"><span>TRẢ PHÒNG</span><span className="text-slate-900 not-italic">{new Date(quickDetailRoom.check_out_date).toLocaleDateString('vi-VN')}</span></div>
                 </div>
              </div>

              <div className="pt-6 flex flex-col gap-3">
                 <Button 
                    className="w-full h-11 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold gap-2 shadow-lg shadow-slate-200"
                    onClick={() => navigate(`/partner/rooms/${quickDetailRoom.id}`)}
                 >
                    <Eye size={16} /> Xem bản đầy đủ
                 </Button>
                 <Button 
                    variant="outline" 
                    className="w-full h-11 rounded-xl border-2 border-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50/30 font-semibold gap-2"
                    onClick={() => {
                       const r = rooms.find(it => it.id === quickDetailRoom.id);
                       if (r) { setEditingRoom(r); setFormData(r); setIsRoomPanelOpen(true); setQuickDetailRoom(null); }
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

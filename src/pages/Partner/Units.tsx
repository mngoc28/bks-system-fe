import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  BedDouble,
  CheckCircle2,
  DoorOpen,
  Edit,
  EyeOff,
  Image as ImageIcon,
  List,
  Loader2,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Star,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
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
import Pagination from '@/components/Pagination';
import { partnerService } from '@/services/partnerService';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { usePartnerHeadlineKpisQuery, usePartnerStatsQuery, usePartnerUrgentMaintenancesQuery } from '@/hooks/usePartnerDashboardQuery';
import {
  getPartnerRoomMinPrice,
  getPartnerRoomTypeLabel,
  getPartnerUnitDisplayStatus,
  normalizePartnerRooms,
  parsePartnerPropertyNamesResponse,
  parsePartnerRoomsListResponse,
  UNIT_STATUS_BADGE_CLASS,
} from '@/utils/partnerPropertyData';
import { Room } from './types';
import { PartnerSectionCard, PartnerSectionHeader, HorizontalChipScroller } from './components/ResponsiveBlocks';
import PartnerRoomFormSheet from './components/PartnerRoomFormSheet';
import PartnerImageManager from './components/PartnerImageManager';
import { MaintenanceCreateDialog } from './components/MaintenanceCreateDialog';

type OccupancyChip = 'all' | 'vacant' | 'occupied' | 'maintenance' | 'hidden';

const OCCUPANCY_CHIPS: Array<{
  id: OccupancyChip;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
}> = [
  { id: 'all', label: 'Tất cả', icon: <List size={16} />, activeClass: 'border-[#00668A] bg-[#C4E7FF] text-[#003348]' },
  { id: 'vacant', label: 'Trống', icon: <CheckCircle2 size={16} className="text-emerald-600" />, activeClass: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  { id: 'occupied', label: 'Đang thuê', icon: <Users size={16} className="text-[#00668A]" />, activeClass: 'border-[#00668A]/30 bg-[#EFF6FF] text-[#00668A]' },
  { id: 'maintenance', label: 'Bảo trì', icon: <Wrench size={16} className="text-amber-600" />, activeClass: 'border-amber-300 bg-amber-50 text-amber-800' },
  { id: 'hidden', label: 'Ẩn', icon: <EyeOff size={16} className="text-slate-500" />, activeClass: 'border-slate-300 bg-slate-100 text-slate-600' },
];

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

const Units: React.FC = () => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [occupancyChip, setOccupancyChip] = useState<OccupancyChip>('all');
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(new Set());

  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formPropertyId, setFormPropertyId] = useState('');

  const [imageManagerTarget, setImageManagerTarget] = useState<{ id: string; name: string } | null>(null);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);

  const [maintenanceRoom, setMaintenanceRoom] = useState<{ id: string | number; propertyId?: string | number; label: string } | null>(null);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);

  const debouncedKeyword = useDebouncedValue(searchKeyword, 500);
  const prevFiltersRef = useRef({
    keyword: debouncedKeyword,
    propertyId: selectedPropertyId,
    chip: occupancyChip,
  });

  const propertyScope = selectedPropertyId ? Number(selectedPropertyId) : undefined;
  const { data: stats, isLoading: statsLoading } = usePartnerStatsQuery(propertyScope);
  const { data: headlineKpis, isLoading: headlineLoading } = usePartnerHeadlineKpisQuery(propertyScope);
  const { data: urgentMaintenances } = usePartnerUrgentMaintenancesQuery();

  const { data: propertiesRes } = useQuery({
    queryKey: ['partner', 'properties', 'names'],
    queryFn: ({ signal }) => partnerService.getPropertyNames({ signal }),
    staleTime: 5 * 60 * 1000,
  });

  const properties = useMemo(
    () => parsePartnerPropertyNamesResponse(propertiesRes),
    [propertiesRes],
  );

  const listParams = useMemo(() => {
    const trimmed = debouncedKeyword.trim();
    const isNumeric = /^\d+$/.test(trimmed);

    return {
      page: currentPage,
      per_page: perPage,
      ...(trimmed
        ? isNumeric
          ? { room_number: trimmed }
          : { title: trimmed }
        : {}),
      ...(selectedPropertyId ? { property_id: selectedPropertyId } : {}),
      ...(occupancyChip === 'hidden' ? { status: 0 } : {}),
      ...(occupancyChip === 'vacant' || occupancyChip === 'occupied' || occupancyChip === 'maintenance'
        ? { occupancy: occupancyChip }
        : {}),
    };
  }, [currentPage, perPage, debouncedKeyword, selectedPropertyId, occupancyChip]);

  const {
    data: listData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['partner', 'units', listParams],
    queryFn: async ({ signal }) => {
      const res = await partnerService.getRooms(listParams, { signal });
      return parsePartnerRoomsListResponse(res);
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const rawRooms = listData?.rooms ?? [];
  const normalizedRooms = useMemo(() => normalizePartnerRooms(rawRooms), [rawRooms]);
  const displayedRooms = rawRooms;

  const totalPages = listData?.lastPage ?? 1;
  const totalItems = listData?.total ?? 0;
  const loading = isLoading && rawRooms.length === 0;

  const hasActiveFilters =
    Boolean(searchKeyword) || Boolean(selectedPropertyId) || occupancyChip !== 'all';

  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.keyword !== debouncedKeyword
      || prevFiltersRef.current.propertyId !== selectedPropertyId
      || prevFiltersRef.current.chip !== occupancyChip;

    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1);
    }

    prevFiltersRef.current = {
      keyword: debouncedKeyword,
      propertyId: selectedPropertyId,
      chip: occupancyChip,
    };
  }, [debouncedKeyword, selectedPropertyId, occupancyChip, currentPage]);

  useEffect(() => {
    setSelectedRoomIds(new Set());
  }, [currentPage, perPage, debouncedKeyword, selectedPropertyId, occupancyChip]);

  const maintenanceCount = urgentMaintenances?.length ?? 0;
  const occupiedCount = headlineKpis?.occupiedRooms ?? Math.max(0, (stats?.totalRooms ?? 0) - (stats?.vacantRooms ?? 0));

  const toggleSelectRoom = (id: string, checked: boolean) => {
    setSelectedRoomIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const displayedIds = displayedRooms.map((room) => String(room.id));
  const isAllDisplayedSelected =
    displayedIds.length > 0 && displayedIds.every((id) => selectedRoomIds.has(id));

  const handleToggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedRoomIds(new Set());
      return;
    }
    setSelectedRoomIds(new Set(displayedIds));
  };

  const handleClearFilters = () => {
    setSearchKeyword('');
    setSelectedPropertyId('');
    setOccupancyChip('all');
  };

  const handleAddUnit = () => {
    const propertyId = selectedPropertyId || (properties.length === 1 ? String(properties[0].id) : '');
    if (!propertyId) {
      toastError('Vui lòng chọn cơ sở trong bộ lọc trước khi thêm phòng.');
      return;
    }
    setEditingRoom(null);
    setFormPropertyId(propertyId);
    setIsRoomFormOpen(true);
  };

  const handleEditRoom = (room: any) => {
    const normalized = normalizedRooms.find((item) => String(item.id) === String(room.id)) ?? null;
    setEditingRoom(normalized);
    setFormPropertyId(String(room.property_id ?? normalized?.propertyId ?? ''));
    setIsRoomFormOpen(true);
  };

  const handleHideRoom = async (roomId: string | number) => {
    try {
      await partnerService.bulkUpdateRoomStatus([roomId], 0);
      toastSuccess('Đã ẩn phòng.');
      void refetch();
    } catch {
      toastError('Không thể ẩn phòng.');
    }
  };

  const handleShowRoom = async (roomId: string | number) => {
    try {
      await partnerService.bulkUpdateRoomStatus([roomId], 1);
      toastSuccess('Đã hiển thị phòng.');
      void refetch();
    } catch {
      toastError('Không thể hiển thị phòng.');
    }
  };

  const openImageManager = (room: any) => {
    setImageManagerTarget({
      id: String(room.id),
      name: room.title ?? room.name ?? room.room_number ?? 'Phòng',
    });
    setIsImageManagerOpen(true);
  };

  const openMaintenance = (room: any) => {
    setMaintenanceRoom({
      id: room.id,
      propertyId: room.property_id,
      label: room.title ?? room.room_number ?? '',
    });
    setIsMaintenanceOpen(true);
  };

  const handleViewRoomBookings = (room: { id: number | string; room_number?: string | null }) => {
    const params = new URLSearchParams({
      room_id: String(room.id),
      status: 'in_stay',
    });
    if (room.room_number) {
      params.set('room_number', String(room.room_number));
    }
    navigate(`/partner/bookings?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <PartnerSectionCard className="border-gray-100">
        <PartnerSectionHeader
          title="Phòng & Đơn vị"
          description="Quản lý kho phòng, tình trạng lưu trú và thông tin tài sản xuyên portfolio."
          actions={(
            <Button
              type="button"
              onClick={handleAddUnit}
              className="flex items-center gap-2 bg-[#00A2DA] text-white shadow-sm hover:brightness-110"
            >
              <Plus size={18} />
              Thêm phòng mới
            </Button>
          )}
        />
      </PartnerSectionCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Tổng phòng"
          value={stats?.totalRooms ?? 0}
          icon={<DoorOpen size={18} className="text-emerald-700" />}
          iconWrapClass="bg-emerald-100"
          isLoading={statsLoading}
        />
        <KpiCard
          label="Trống hôm nay"
          value={stats?.vacantRooms ?? 0}
          icon={<CheckCircle2 size={18} className="text-emerald-700" />}
          iconWrapClass="bg-emerald-100"
          isLoading={statsLoading}
        />
        <KpiCard
          label="Đang thuê"
          value={occupiedCount}
          icon={<BedDouble size={18} className="text-[#00668A]" />}
          iconWrapClass="bg-[#EFF6FF]"
          isLoading={statsLoading || headlineLoading}
        />
        <KpiCard
          label="Bảo trì"
          value={maintenanceCount}
          icon={<Wrench size={18} className="text-amber-700" />}
          iconWrapClass="bg-amber-100"
          isLoading={statsLoading}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="w-full flex-1 space-y-1.5">
            <Label htmlFor="units-search" className="text-xs font-semibold uppercase tracking-tighter text-gray-400">
              Tìm kiếm
            </Label>
            <div className="group relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#00A2DA]" size={18} />
              <Input
                id="units-search"
                placeholder="Tìm số phòng, tên listing, tên cơ sở…"
                className="h-11 rounded-lg border-gray-200 pl-10"
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
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </div>

          <div className="w-full space-y-1.5 lg:w-64">
            <Label htmlFor="units-property-filter" className="text-xs font-semibold uppercase tracking-tighter text-gray-400">
              Cơ sở
            </Label>
            <Select
              value={selectedPropertyId || 'all'}
              onValueChange={(value) => setSelectedPropertyId(value === 'all' ? '' : value)}
            >
              <SelectTrigger id="units-property-filter" className="h-11 rounded-lg border-gray-200">
                <SelectValue placeholder="Tất cả cơ sở" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cơ sở</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={String(property.id)}>
                    {property.name}
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
              className="flex h-11 items-center gap-2 rounded-lg px-4 text-gray-500 hover:bg-red-50 hover:text-red-600"
            >
              <RotateCcw size={16} />
              <span className="text-sm font-semibold">Xóa lọc</span>
            </Button>
          ) : null}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <HorizontalChipScroller>
            {OCCUPANCY_CHIPS.map((chip) => {
              const isActive = occupancyChip === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setOccupancyChip(chip.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? chip.activeClass
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                  aria-pressed={isActive}
                >
                  {chip.icon}
                  {chip.label}
                </button>
              );
            })}
          </HorizontalChipScroller>
        </div>
      </div>

      {selectedRoomIds.size > 0 ? (
        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/80 p-3 sm:flex-row sm:items-center">
          <p className="text-sm font-bold text-blue-900">
            Đã chọn {selectedRoomIds.size} phòng
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRoomIds(new Set())}
            className="text-xs font-semibold text-slate-500"
          >
            Hủy chọn
          </Button>
        </div>
      ) : null}

      {isFetching && rawRooms.length > 0 ? (
        <div className="flex justify-start py-1">
          <Spinner size="sm" showText text="Đang cập nhật danh sách..." className="flex-row items-center gap-2" />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="h-14 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : displayedRooms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="w-10 px-4 py-3">
                    <Checkbox
                      checked={isAllDisplayedSelected}
                      onCheckedChange={(val) => handleToggleSelectAll(Boolean(val))}
                      aria-label="Chọn tất cả phòng trên trang"
                    />
                  </th>
                  <th className="w-[100px] px-4 py-3">Số phòng</th>
                  <th className="px-4 py-3">Tên listing</th>
                  <th className="min-w-[220px] px-4 py-3">Cơ sở</th>
                  <th className="w-[120px] px-4 py-3">Trạng thái</th>
                  <th className="w-[140px] px-4 py-3">Giá từ</th>
                  <th className="w-[100px] px-4 py-3 text-center">Rating</th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedRooms.map((room) => {
                  const roomId = String(room.id);
                  const displayStatus = getPartnerUnitDisplayStatus(room);
                  const minPrice = getPartnerRoomMinPrice(room);
                  const rating = Number(room.reviews_avg_rating ?? 0);
                  const reviewCount = Number(room.reviews_count ?? 0);
                  const roomTypeLabel = getPartnerRoomTypeLabel(room.room_type);

                  return (
                    <tr
                      key={roomId}
                      className="cursor-pointer transition-colors hover:bg-[#00A2DA]/5"
                      onClick={() => navigate(`/partner/rooms/${room.id}`)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRoomIds.has(roomId)}
                          onCheckedChange={(val) => toggleSelectRoom(roomId, Boolean(val))}
                          aria-label={`Chọn phòng ${room.room_number ?? room.title}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {room.room_number || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{room.title || room.name || '—'}</p>
                        {roomTypeLabel ? (
                          <p className="text-xs text-slate-500">{roomTypeLabel}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <button
                          type="button"
                          className="w-full whitespace-normal break-words text-left font-medium text-[#00668A] hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/partner/properties/${room.property_id}/rooms`);
                          }}
                        >
                          {room.property_name || '—'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${UNIT_STATUS_BADGE_CLASS[displayStatus]}`}
                        >
                          <span className="size-1.5 rounded-full bg-current opacity-70" />
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {minPrice
                          ? `${minPrice.amount.toLocaleString('vi-VN')} ₫${minPrice.unit}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {rating > 0 ? (
                          <div className="inline-flex items-center gap-1 text-amber-500">
                            <Star className="size-3.5 fill-amber-500 text-amber-500" />
                            <span className="text-xs font-bold">{rating}</span>
                            <span className="text-[10px] font-normal text-slate-400">({reviewCount})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-slate-500 hover:text-[#00668A]"
                              aria-label="Thao tác phòng"
                            >
                              <MoreHorizontal size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => handleEditRoom(room)}>
                              <Edit size={14} className="mr-2" />
                              Sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openImageManager(room)}>
                              <ImageIcon size={14} className="mr-2" />
                              Ảnh
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openMaintenance(room)}>
                              <Wrench size={14} className="mr-2" />
                              Bảo trì
                            </DropdownMenuItem>
                            {displayStatus === 'Đang thuê' ? (
                              <DropdownMenuItem onClick={() => handleViewRoomBookings(room)}>
                                <ShoppingBag size={14} className="mr-2" />
                                Xem booking
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            {displayStatus === 'Ẩn' ? (
                              <DropdownMenuItem onClick={() => handleShowRoom(room.id)}>
                                <EyeOff size={14} className="mr-2" />
                                Hiển thị
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleHideRoom(room.id)}>
                                <EyeOff size={14} className="mr-2" />
                                Ẩn
                              </DropdownMenuItem>
                            )}
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
                  <DoorOpen size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Chưa có phòng nào</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Thêm phòng mới hoặc tạo cơ sở trước trong mục Quản lý Cơ sở.
                </p>
                <Button type="button" onClick={handleAddUnit} className="mt-6 bg-[#00A2DA] text-white hover:brightness-110">
                  <Plus size={16} className="mr-1.5" />
                  Thêm phòng mới
                </Button>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  <Search size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Không tìm thấy kết quả</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Thử đổi từ khóa hoặc xóa bộ lọc để xem thêm phòng.
                </p>
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
              onPerPageChange={(value) => {
                setPerPage(value);
                setCurrentPage(1);
              }}
              totalItems={totalItems}
              perPageOptions={[10, 20, 50]}
              resultsText={
                totalItems > 0
                  ? `Hiển thị ${Math.min((currentPage - 1) * perPage + 1, totalItems)} - ${Math.min(currentPage * perPage, totalItems)} trên tổng số ${totalItems} phòng`
                  : undefined
              }
            />
          </div>
        ) : null}
      </div>

      <PartnerRoomFormSheet
        open={isRoomFormOpen}
        onClose={() => {
          setIsRoomFormOpen(false);
          setEditingRoom(null);
        }}
        propertyId={formPropertyId}
        room={editingRoom}
        onSaved={() => {
          void refetch();
          setIsRoomFormOpen(false);
          setEditingRoom(null);
        }}
      />

      {imageManagerTarget ? (
        <PartnerImageManager
          isOpen={isImageManagerOpen}
          onClose={() => setIsImageManagerOpen(false)}
          type="room"
          targetId={imageManagerTarget.id}
          targetName={imageManagerTarget.name}
        />
      ) : null}

      {maintenanceRoom ? (
        <MaintenanceCreateDialog
          open={isMaintenanceOpen}
          onOpenChange={setIsMaintenanceOpen}
          roomId={maintenanceRoom.id}
          propertyId={maintenanceRoom.propertyId}
          roomLabel={maintenanceRoom.label}
          onCreated={() => {
            void refetch();
            setIsMaintenanceOpen(false);
            setMaintenanceRoom(null);
          }}
        />
      ) : null}
    </div>
  );
};

type KpiCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconWrapClass: string;
  isLoading?: boolean;
};

const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon, iconWrapClass, isLoading = false }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-3 flex items-start justify-between">
      <span className={`rounded-lg p-2 ${iconWrapClass}`}>{icon}</span>
    </div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
    {isLoading ? (
      <Loader2 className="mt-2 size-6 animate-spin text-slate-400" />
    ) : (
      <h3 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
    )}
  </div>
);

export default Units;

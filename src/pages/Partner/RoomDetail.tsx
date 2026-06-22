import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Home, Square, Users, MapPin, 
  Wallet, Shield, Wrench, Star, Trash2, Edit
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { partnerService } from '@/services/partnerService';
import { useRoomReviewsQuery } from '@/hooks/useReviewQuery';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import {
  useRoomTouristSpotMapsQuery,
  useCreateRoomTouristSpotMapMutation,
  useUpdateRoomTouristSpotMapMutation,
  useDeleteRoomTouristSpotMapMutation
} from '@/hooks/useRoomTouristSpotMapQuery';
import { RoomTouristSpotDialog } from './components/RoomTouristSpotDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { MaintenanceCancelDialog } from './components/MaintenanceCancelDialog';
import { MaintenanceCreateDialog } from './components/MaintenanceCreateDialog';
import { extractMaintenanceApiError } from '@/utils/partnerMaintenanceDisplay';
import { formatRoomDisplayTitle } from '@/utils/partnerRoomDisplay';
import { HousekeepingStatusControl } from './components/HousekeepingStatusControl';
import PartnerRoomFormSheet from './components/PartnerRoomFormSheet';
import PartnerImageManager from './components/PartnerImageManager';

// Hooks
import { 
  useRoomDetailQuery, 
  useRoomBookingsQuery, 
  useRoomMaintenancesQuery, 
  useRoomImagesQuery 
} from './RoomDetail/hooks/useRoomDetailQueries';

// Tabs
import { OverviewTab } from './RoomDetail/tabs/OverviewTab';
import { AmenitiesTab } from './RoomDetail/tabs/AmenitiesTab';
import { TenantsTab } from './RoomDetail/tabs/TenantsTab';
import { MaintenanceTab } from './RoomDetail/tabs/MaintenanceTab';
import { GalleryTab } from './RoomDetail/tabs/GalleryTab';
import { TouristSpotsTab } from './RoomDetail/tabs/TouristSpotsTab';
import { ReviewsTab } from './RoomDetail/tabs/ReviewsTab';
import { MaintenanceRequest } from './types';

const RoomDetail: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tabId: string) => {
    setSearchParams({ tab: tabId }, { replace: true });
  };

  // Queries
  const { data: room, isLoading: isLoadingRoom, error: roomError } = useRoomDetailQuery(roomId || '');
  
  const { data: bookings = [], isLoading: isLoadingBookings } = useRoomBookingsQuery(
    roomId || '',
    activeTab === 'tenants'
  );

  const { data: rawMaintenances = [], isLoading: isLoadingMaintenances } = useRoomMaintenancesQuery(
    roomId || '',
    activeTab === 'maintenance'
  );

  const { data: images = [], isLoading: isLoadingImages } = useRoomImagesQuery(
    roomId || '',
    activeTab === 'gallery'
  );

  const { data: reviewsData, isLoading: isLoadingReviews } = useRoomReviewsQuery(Number(roomId || 0), {
    enabled: !!roomId && activeTab === 'reviews',
  });

  const { data: spotMapsData, isLoading: isLoadingSpotMaps } = useRoomTouristSpotMapsQuery(
    Number(roomId || 0),
    true, // isPartner
    { enabled: !!roomId && activeTab === 'tourist_spots' }
  );

  const spotMaps = spotMapsData || [];

  // Map room name to maintenance requests
  const maintenances = rawMaintenances.map((item) => ({
    ...item,
    roomName: item.roomName || room?.name || '',
  }));

  // Tourist spot mutations
  const createMapMutation = useCreateRoomTouristSpotMapMutation(true);
  const updateMapMutation = useUpdateRoomTouristSpotMapMutation(true);
  const deleteMapMutation = useDeleteRoomTouristSpotMapMutation(true);

  const [isSpotDialogOpen, setIsSpotDialogOpen] = useState(false);
  const [selectedSpotMap, setSelectedSpotMap] = useState<any | null>(null);
  const [submittingSpot, setSubmittingSpot] = useState(false);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteApplyToAll, setDeleteApplyToAll] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [cancelMaintenanceTarget, setCancelMaintenanceTarget] = useState<MaintenanceRequest | null>(null);
  const [updatingMaintenanceId, setUpdatingMaintenanceId] = useState<number | string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);

  const invalidateRoomDetailQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['partnerRoomDetail', roomId] }),
      queryClient.invalidateQueries({ queryKey: ['partnerRoomImages', roomId] }),
      queryClient.invalidateQueries({ queryKey: ['partnerRoomBookings', roomId] }),
    ]);
  };

  const openMaintenanceDialog = () => {
    setIsMaintenanceDialogOpen(true);
  };

  const handleSpotDialogSubmit = async (formData: any) => {
    setSubmittingSpot(true);
    try {
      if (selectedSpotMap) {
        await updateMapMutation.mutateAsync({
          id: selectedSpotMap.id,
          roomId: Number(roomId),
          data: {
            distance_km: formData.distance_km,
            travel_time_minutes: formData.travel_time_minutes,
            is_primary: formData.is_primary,
            priority_order: formData.priority_order,
            note: formData.note,
            apply_to_all_rooms: formData.apply_to_all_rooms,
          },
        });
      } else {
        await createMapMutation.mutateAsync({
          room_id: Number(roomId),
          tourist_spot_id: formData.tourist_spot_id,
          distance_km: formData.distance_km,
          travel_time_minutes: formData.travel_time_minutes,
          is_primary: formData.is_primary,
          priority_order: formData.priority_order,
          note: formData.note,
          apply_to_all_rooms: formData.apply_to_all_rooms,
        });
      }
      setIsSpotDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingSpot(false);
    }
  };

  const handleSpotDelete = (id: number) => {
    setDeleteTargetId(id);
    setDeleteApplyToAll(false);
    setIsConfirmDeleteOpen(true);
  };

  const executeDelete = async (id: number, applyToAllRooms: boolean) => {
    try {
      await deleteMapMutation.mutateAsync({ id, roomId: Number(roomId), applyToAllRooms });
      setIsConfirmDeleteOpen(false);
      setDeleteTargetId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMaintenanceStatusUpdate = async (
    id: number | string,
    status: 'in_progress' | 'completed',
  ) => {
    try {
      setUpdatingMaintenanceId(id);
      await partnerService.updateMaintenance(id, { status });
      toastSuccess(status === 'in_progress' ? 'Đã tiếp nhận phiếu bảo trì.' : 'Đã hoàn thành phiếu bảo trì.');
      
      // Invalidate queries to refresh data
      void queryClient.invalidateQueries({ queryKey: ['partnerRoomMaintenances', roomId] });
      void queryClient.invalidateQueries({ queryKey: ['partnerRoomDetail', roomId] });
    } catch (err) {
      const { message } = extractMaintenanceApiError(err);
      toastError(message);
    } finally {
      setUpdatingMaintenanceId(null);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'amenities', label: 'Tiện ích & Dịch vụ' },
    { id: 'tenants', label: 'Lịch sử đặt phòng' },
    { id: 'maintenance', label: 'Bảo trì' },
    { id: 'gallery', label: 'Hình ảnh' },
    { id: 'tourist_spots', label: 'Địa điểm du lịch' },
    { id: 'reviews', label: 'Đánh giá khách hàng' },
  ];

  if (isLoadingRoom) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner size="lg" showText text="Đang tải dữ liệu phòng..." />
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="mb-2 rounded-full bg-rose-50 p-4 text-lg font-bold text-rose-500">
          !
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Oops! Có lỗi xảy ra</h2>
        <p className="max-w-md text-slate-500">{(roomError as Error)?.message || 'Lỗi khi tải dữ liệu phòng'}</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4 gap-2">
           <ArrowLeft size={18} /> Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 duration-500 animate-in fade-in sm:space-y-8">
      {/* Header Section */}
      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 md:flex-row md:items-end md:gap-6 lg:p-8">
        <div className="absolute right-0 top-0 -mr-32 -mt-32 size-64 rounded-full bg-slate-50 opacity-50 blur-3xl" />
        
        <div className="z-10 space-y-4">
           <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2 flex h-auto items-center gap-2 p-0 font-semibold text-slate-400 hover:text-blue-600">
              <ArrowLeft size={16} /> <span className="text-xs uppercase tracking-widest">Quay lại danh sách</span>
           </Button>
           <div>
              <div className="mb-1 flex flex-wrap items-center gap-3">
                 <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">{formatRoomDisplayTitle(room.name)}</h1>
                 <div className="flex flex-wrap items-center gap-2">
                    <Badge className={cn(
                      "px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider border",
                      room.status === 'Trống' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      room.status === 'Đang thuê' ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      {room.status}
                    </Badge>
                    <HousekeepingStatusControl
                      roomId={room.id}
                      status={room.housekeeping_status ?? 'clean'}
                      occupancyStatus={room.status}
                      onStatusUpdated={() => {
                        void queryClient.invalidateQueries({ queryKey: ['partnerRoomDetail', roomId] });
                      }}
                    />
                    {room.reviews_avg_rating && room.reviews_avg_rating > 0 && (
                       <Badge className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                          <Star className="size-3.5 shrink-0 fill-amber-500 text-amber-500" />
                          {room.reviews_avg_rating} ({room.reviews_count} đánh giá)
                       </Badge>
                    )}
                 </div>
              </div>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                 <MapPin size={14} className="text-slate-300" /> {room.propertyName} • Tầng {room.floor_number}
              </p>
           </div>
        </div>

        <div className="z-10 flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
           <Button
              size="default"
              variant="outline"
              onClick={() => setIsEditOpen(true)}
              aria-label="Chỉnh sửa phòng"
              className="w-full rounded-2xl border-2 border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-sm hover:bg-slate-50 sm:w-auto"
           >
              <Edit size={18} className="mr-2 text-blue-500" /> Chỉnh sửa phòng
           </Button>
           <Button
              size="default"
              variant="outline"
              onClick={() => navigate('/partner/contracts')}
              className="w-full rounded-2xl border-2 border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-sm hover:bg-slate-50 sm:w-auto"
           >
              <Shield size={18} className="mr-2 text-indigo-500" /> Hợp đồng
           </Button>
           <Button
              size="default"
              onClick={() => {
                 setActiveTab('maintenance');
                 openMaintenanceDialog();
              }}
              className="w-full rounded-2xl bg-blue-600 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 sm:w-auto"
           >
              <Wrench size={18} className="mr-2" /> Bảo trì
           </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
         {[
           { icon: <Square size={20} />, label: "Diện tích", value: `${room.area} m²`, color: "bg-blue-50 text-blue-600" },
           { icon: <Users size={20} />, label: "Sức chứa", value: `${room.people} người`, color: "bg-indigo-50 text-indigo-600" },
           { icon: <Home size={20} />, label: "Loại phòng", value: room.room_type === 1 ? "Phòng đơn" : room.room_type === 2 ? "Phòng đôi" : "Căn hộ", color: "bg-amber-50 text-amber-600" },
           { icon: <Wallet size={20} />, label: "Giá thuê từ", value: `${Number(room.prices[0]?.price || 0).toLocaleString()}đ`, color: "bg-emerald-50 text-emerald-600" },
         ].map((card, i) => (
           <Card key={i} className="overflow-hidden rounded-2xl border-none bg-white shadow-sm transition-transform duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-6">
                 <div className={`mb-4 w-fit rounded-2xl p-3 ${card.color}`}>{card.icon}</div>
                 <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{card.label}</p>
                 <p className="mt-1 text-xl font-bold text-slate-900">{card.value}</p>
              </CardContent>
           </Card>
         ))}
      </div>

      {/* Tab Navigation */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/50 bg-slate-100/50 p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
         <div className="flex w-max min-w-full gap-2">
         {tabs.map((tab) => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                  "shrink-0 px-4 py-2.5 rounded-2xl font-bold text-[11px] uppercase tracking-wider transition-all duration-200 sm:px-6 sm:py-3",
                  activeTab === tab.id 
                     ? "bg-white text-blue-600 shadow-md shadow-slate-200/50 scale-105" 
                     : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
               )}
            >
               {tab.label}
            </button>
         ))}
         </div>
      </div>

      {/* Tab Content */}
      <div className="mt-8 transition-all duration-300">
         {activeTab === 'overview' && <OverviewTab room={room} />}
         
         {activeTab === 'amenities' && <AmenitiesTab room={room} />}
         
         {activeTab === 'tenants' && <TenantsTab bookings={bookings} isLoading={isLoadingBookings} />}
         
         {activeTab === 'maintenance' && (
           <MaintenanceTab 
             maintenances={maintenances} 
             isLoading={isLoadingMaintenances} 
             openMaintenanceDialog={openMaintenanceDialog}
             handleMaintenanceStatusUpdate={handleMaintenanceStatusUpdate}
             updatingMaintenanceId={updatingMaintenanceId}
             setCancelMaintenanceTarget={setCancelMaintenanceTarget}
           />
         )}
         
         {activeTab === 'gallery' && (
           <GalleryTab
             images={images}
             isLoading={isLoadingImages}
             onManageImages={() => setIsImageManagerOpen(true)}
           />
         )}
         
         {activeTab === 'tourist_spots' && (
           <TouristSpotsTab 
             spotMaps={spotMaps} 
             isLoadingSpotMaps={isLoadingSpotMaps} 
             setSelectedSpotMap={setSelectedSpotMap}
             setIsSpotDialogOpen={setIsSpotDialogOpen}
             handleSpotDelete={handleSpotDelete}
           />
         )}
         
         {activeTab === 'reviews' && <ReviewsTab reviewsData={reviewsData} isLoading={isLoadingReviews} />}
      </div>

      <PartnerRoomFormSheet
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        propertyId={String(room.propertyId)}
        room={room}
        onSaved={async () => {
          await invalidateRoomDetailQueries();
          setIsEditOpen(false);
        }}
      />

      <PartnerImageManager
        isOpen={isImageManagerOpen}
        onClose={() => {
          setIsImageManagerOpen(false);
          void queryClient.invalidateQueries({ queryKey: ['partnerRoomImages', roomId] });
          void queryClient.invalidateQueries({ queryKey: ['partnerRoomDetail', roomId] });
        }}
        type="room"
        targetId={String(room.id)}
        targetName={room.name}
      />

      <MaintenanceCreateDialog
        open={isMaintenanceDialogOpen}
        onOpenChange={setIsMaintenanceDialogOpen}
        roomId={roomId!}
        propertyId={room.propertyId}
        roomLabel={room.name}
        onCreated={async () => {
          void queryClient.invalidateQueries({ queryKey: ['partnerRoomMaintenances', roomId] });
          void queryClient.invalidateQueries({ queryKey: ['partnerRoomDetail', roomId] });
          setActiveTab('maintenance');
        }}
      />

      <MaintenanceCancelDialog
        open={Boolean(cancelMaintenanceTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelMaintenanceTarget(null);
        }}
        maintenanceId={cancelMaintenanceTarget?.id}
        maintenanceTitle={cancelMaintenanceTarget?.title || cancelMaintenanceTarget?.type}
        onCancelled={() => {
          setCancelMaintenanceTarget(null);
          void queryClient.invalidateQueries({ queryKey: ['partnerRoomMaintenances', roomId] });
          void queryClient.invalidateQueries({ queryKey: ['partnerRoomDetail', roomId] });
        }}
      />

      <RoomTouristSpotDialog
         open={isSpotDialogOpen}
         onOpenChange={setIsSpotDialogOpen}
         provinceId={room.province_id}
         existingSpotIds={spotMaps.map((item: any) => item.tourist_spot_id)}
         mapping={selectedSpotMap}
         onSubmit={handleSpotDialogSubmit}
         submitting={submittingSpot}
      />

      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <span className="rounded-lg bg-rose-50 p-1.5 text-rose-600">
                <Trash2 size={18} />
              </span>
              Xác nhận xóa liên kết
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-relaxed text-slate-500">
              Bạn có chắc chắn muốn xóa liên kết với địa điểm du lịch này? Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 flex items-center space-x-2.5 border-y border-slate-100 py-3">
            <Checkbox
              id="delete-apply-all-checkbox"
              checked={deleteApplyToAll}
              onCheckedChange={(checked: boolean | 'indeterminate') => setDeleteApplyToAll(checked === true)}
            />
            <label
              htmlFor="delete-apply-all-checkbox"
              className="cursor-pointer select-none text-xs font-bold uppercase tracking-wider text-slate-600"
            >
              Áp dụng cho tất cả các phòng khác thuộc cùng tòa nhà
            </label>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="min-w-[80px]"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (deleteTargetId != null) {
                  executeDelete(deleteTargetId, deleteApplyToAll);
                }
              }}
              className="min-w-[100px] bg-rose-600 text-white hover:bg-rose-700"
            >
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomDetail;

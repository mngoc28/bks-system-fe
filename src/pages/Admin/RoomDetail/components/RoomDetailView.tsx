import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS } from "@/constant";
import { RoomDetailViewProps } from "@/dataHelper/room.dataHelper";
import { RoomImage } from "@/dataHelper/roomImage.dataHelper";
import { usePricePackagesQuery } from "@/hooks/usePricePackageQuery";
import { useRoomImagesQuery } from "@/hooks/useRoomImageQuery";
import { resolveImageUrl } from "@/utils/imageUtils";
import { ArrowLeft, Building2, CalendarDays, ChevronDown, DollarSign, Edit, FileText, Home, ImageIcon, MapPin, Square, Users, X, Compass, Plus, Trash2, Star } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { buildAdminUrl, toBookingsByRoom } from "@/utils/adminNavigation";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import {
  useRoomTouristSpotMapsQuery,
  useCreateRoomTouristSpotMapMutation,
  useUpdateRoomTouristSpotMapMutation,
  useDeleteRoomTouristSpotMapMutation,
} from "@/hooks/useRoomTouristSpotMapQuery";
import { RoomTouristSpotDialog } from "@/pages/Partner/components/RoomTouristSpotDialog";

/**
 * Room Detail View
 * A read-only presentation of a room's full profile, organized into logical sections like basic info, pricing, amenities, and an image gallery.
 */
export const RoomDetailView: React.FC<RoomDetailViewProps> = ({ room, onEdit, onBack }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { data: roomImages, isLoading: isLoadingImages } = useRoomImagesQuery(room.id);

  // Room tourist spot maps query and mutations (isPartner = false for admin)
  const { data: spotMaps = [], isLoading: isLoadingSpotMaps } = useRoomTouristSpotMapsQuery(
    room.id,
    false, // isPartner
    { enabled: !!room.id }
  );

  const createMapMutation = useCreateRoomTouristSpotMapMutation(false);
  const updateMapMutation = useUpdateRoomTouristSpotMapMutation(false);
  const deleteMapMutation = useDeleteRoomTouristSpotMapMutation(false);

  const [isSpotDialogOpen, setIsSpotDialogOpen] = useState(false);
  const [selectedSpotMap, setSelectedSpotMap] = useState<any | null>(null);
  const [submittingSpot, setSubmittingSpot] = useState(false);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteApplyToAll, setDeleteApplyToAll] = useState(false);

  const handleSpotDialogSubmit = async (formData: any) => {
    setSubmittingSpot(true);
    try {
      if (selectedSpotMap) {
        // Edit mode
        await updateMapMutation.mutateAsync({
          id: selectedSpotMap.id,
          roomId: room.id,
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
        // Create mode
        await createMapMutation.mutateAsync({
          room_id: room.id,
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
      await deleteMapMutation.mutateAsync({ id, roomId: room.id, applyToAllRooms });
      setIsConfirmDeleteOpen(false);
      setDeleteTargetId(null);
    } catch (err) {
      console.error(err);
    }
  };
  
  // Price packages data
  const { data: pricePackagesData } = usePricePackagesQuery();
  const pricePackages = useMemo(() => pricePackagesData ?? [], [pricePackagesData]);
  const pricePackageMap = useMemo(() => {
    const map = new Map<number, string>();
    // Fallback names if API not loaded
    const fallbackNames: Record<number, string> = {
      1: 'super_small',
      2: 'small',
      3: 'medium',
      4: 'large',
    };
    // Use API data if available
    if (pricePackages.length > 0) {
      pricePackages.forEach((pkg: any) => map.set(pkg.id, pkg.name));
    } else {
      // Use fallback
      Object.entries(fallbackNames).forEach(([id, name]) => map.set(Number(id), name));
    }
    return map;
  }, [pricePackages]);

  const getPropertyName = () => {
    return room.property_name || room.property_name || room.property?.name || "-";
  };

  const getRoomTypeName = (type: number) => {
    switch (type) {
      case 1:
        return t("rooms.room_type_single");
      case 2:
        return t("rooms.room_type_double");
      case 3:
        return t("rooms.room_type_mini_apartment");
      default:
        return "-";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 size-4" />
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{room.title}</h1>
            <p className="text-sm text-gray-600">{t("rooms.room_details")}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 border-slate-300 bg-white text-slate-700 hover:bg-slate-100">
                <CalendarDays className="mr-2 size-4" />
                {t("adminCrossNav.related_actions")}
                <ChevronDown className="ml-1 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {room.property_id ? (
                <DropdownMenuItem onClick={() => navigate(`${ROUTERS.PROPERTIES_DETAIL}/${room.property_id}`)}>
                  <Building2 className="size-4" />
                  {t("adminCrossNav.view_property")}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                onClick={() => {
                  const roomDisplayName = room.room_number || room.title;
                  navigate(buildAdminUrl(ROUTERS.BOOKING_MANAGE, toBookingsByRoom(room.id, "room-detail", roomDisplayName)));
                }}
              >
                <CalendarDays className="size-4" />
                {t("adminCrossNav.bookings")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700" onClick={onEdit}>
            <Edit className="mr-2 size-4" />
            {t("rooms.edit_room_info")}
          </Button>
        </div>
      </div>

      {/* Room Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Home className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("rooms.room_number")}</p>
                <p className="font-semibold">{room.room_number || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Square className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("rooms.area")}</p>
                <p className="font-semibold">{room.area} m²</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Users className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("rooms.people")}</p>
                <p className="font-semibold">{room.people} người</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <MapPin className="size-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("rooms.floor_number")}</p>
                <p className="font-semibold">Tầng {room.floor_number}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information - Row 1: Basic Info & Prices */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              {t("rooms.basic_information")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">{t("rooms.property")}</label>
                <p className="mt-1 text-sm text-gray-900">{getPropertyName()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t("rooms.room_type")}</label>
                <p className="mt-1 text-sm text-gray-900">{getRoomTypeName(room.room_type)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t("rooms.bedrooms_count")}</label>
                <p className="mt-1 text-sm text-gray-900">{room.bedrooms_count ?? 1} phòng</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t("rooms.beds_count")}</label>
                <p className="mt-1 text-sm text-gray-900">{room.beds_count ?? 1} giường</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t("rooms.created_at")}
                </label>
                <p className="mt-1 text-sm text-gray-900">{new Date(room.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t("rooms.updated_at")}
                </label>
                <p className="mt-1 text-sm text-gray-900">{new Date(room.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">{t("rooms.status")}</label>
                <div className="mt-1">
                  <Badge variant={room.status ? "default" : "secondary"} className="text-xs">
                    {room.status ? t("rooms.status_public") : t("rooms.status_private")}
                  </Badge>
                </div>
              </div>
              {room.deposit && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <DollarSign className="size-4" />
                    {t("rooms.deposit")}
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{room.deposit ? parseFloat(room.deposit.toString()).toLocaleString() : '0'} VND</p>
                </div>
              )}
            </div>
            {room.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">{t("rooms.description")}</label>
                <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-900">{room.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="size-5" />
              {t("rooms.price_package")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {room.prices && room.prices.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {room.prices.map((price: any, index: number) => (
                  <div key={index} className="rounded-lg border border-primary/10 bg-gradient-to-r from-primary/5 to-primary/10 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{pricePackageMap.get(price.price_package_id) || price.price_package?.name || 'N/A'}</span>
                      <span className="text-xs text-gray-500">/ {price.unit || 'N/A'}</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {price.price ? parseFloat(price.price).toLocaleString() : '0'} <span className="text-sm font-normal">VND</span>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
              <div className="py-6 text-center text-gray-500">
                <DollarSign className="mx-auto mb-2 size-6 opacity-50" />
                <p className="text-sm">{t("rooms.no_prices")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information - Row 2: Amenities & Services */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="size-5" />
              {t("rooms.amenities")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {room.amenities && room.amenities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((amenity: any) => (
                  <Badge key={amenity.id} variant="outline" className="px-3 py-1 text-xs">
                    {amenity.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Home className="mx-auto mb-2 size-8 opacity-50" />
                <p className="text-sm">{t("rooms.no_amenities")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              {t("rooms.services")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {room.services && room.services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {room.services.map((service: any) => (
                  <Badge key={service.id} variant="outline" className="px-3 py-1 text-xs">
                    {service.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Users className="mx-auto mb-2 size-8 opacity-50" />
                <p className="text-sm">{t("rooms.no_services")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Room Images Section */}
      <Card>
        <CardHeader>
          <div className="flex w-full items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" />
            {t("rooms.images")}
          </CardTitle>
          <Button onClick={() => navigate(`${ROUTERS.ROOMS_DETAIL}/${room.id}/images`)} className="bg-green-600 hover:bg-green-700">
            <ImageIcon className="mr-2 size-4" />
            {t("rooms.edit_room_images")}
          </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingImages ? (
            <div className="py-8 text-center">
              <div className="mx-auto size-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">{t("loading")}</p>
            </div>
          ) : roomImages && roomImages.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {/* Sort images by sort order */}
              {roomImages
                .sort((a: RoomImage, b: RoomImage) => a.sort - b.sort)
                .map((image: RoomImage) => (
                  <div key={image.id} className="group relative aspect-[4/3]">
                    <img
                      src={resolveImageUrl(image.image_url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || "/assets/images/photo_error2.png"}
                      alt={`${t("rooms.image")} ${image.sort}`}
                      className="size-full cursor-pointer rounded-lg border object-cover shadow-sm transition-all hover:shadow-md"
                      onClick={() => setSelectedImage(resolveImageUrl(image.image_url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || "/assets/images/photo_error2.png")}
                    />
                    {/* Sort number badge */}
                    <div className="absolute left-2 top-2 rounded bg-black bg-opacity-50 px-2 py-1 text-sm font-medium text-white">
                      #{image.sort > 0 ? image.sort : 1}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            // no image
            <div className="py-12 text-center">
              <ImageIcon className="mx-auto mb-4 size-12 text-gray-400" />
              <p className="text-gray-500">{t("rooms.no_images_yet")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nearby Tourist Spots Section */}
      <Card>
        <CardHeader>
          <div className="flex w-full items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Compass className="size-5" />
              Địa điểm du lịch lân cận
            </CardTitle>
            <Button
              onClick={() => {
                setSelectedSpotMap(null);
                setIsSpotDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 size-4" />
              Gán địa điểm
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingSpotMaps ? (
            <div className="flex h-20 items-center justify-center">
              <Spinner showText text={t("loading")} />
            </div>
          ) : spotMaps && spotMaps.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="pb-3 text-left font-semibold">Địa điểm du lịch</th>
                    <th className="pb-3 text-center font-semibold">Khoảng cách</th>
                    <th className="pb-3 text-center font-semibold">Thời gian đi</th>
                    <th className="pb-3 text-center font-semibold">Nguồn dữ liệu</th>
                    <th className="pb-3 text-right font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {spotMaps.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{item.tourist_spot?.name}</span>
                          {item.is_primary && (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-none rounded-full text-[10px] uppercase font-bold flex items-center gap-0.5">
                              <Star size={10} className="fill-amber-500 text-amber-500 shrink-0" />
                              Chính
                            </Badge>
                          )}
                        </div>
                        {item.note && <p className="text-xs text-gray-400 mt-0.5 max-w-sm line-clamp-1">{item.note}</p>}
                      </td>
                      <td className="py-3 text-center font-medium text-gray-700">
                        {item.distance_km != null ? `${item.distance_km} km` : "-"}
                      </td>
                      <td className="py-3 text-center font-medium text-gray-700">
                        {item.travel_time_minutes} phút
                      </td>
                      <td className="py-3 text-center">
                        <Badge className={cn(
                          "px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-widest border border-slate-200/50 shadow-none",
                          item.source_type === "estimated"
                            ? "bg-slate-50 text-slate-600 border-slate-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        )}>
                          {item.source_type === "estimated" ? "Ước lượng" : "Thủ công"}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSpotMap(item);
                              setIsSpotDialogOpen(true);
                            }}
                            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50"
                          >
                            <Edit className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSpotDelete(item.id)}
                            className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Compass className="mx-auto mb-4 size-12 text-gray-400" />
              <p className="text-sm">Chưa gán địa điểm du lịch nào cho phòng này</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-h-[90vh] max-w-4xl p-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 z-10 size-8 rounded-full bg-black/50 p-0 text-white hover:bg-black/70"
                onClick={() => setSelectedImage(null)}
              >
                <X className="size-4" />
              </Button>
              <img
                src={selectedImage}
                alt="Room image enlarged"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

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
            <DialogDescription className="text-slate-500 pt-2 text-sm leading-relaxed">
              Bạn có chắc chắn muốn xóa liên kết với địa điểm du lịch này? Thao tác này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2.5 py-3 border-t border-b border-slate-100 my-2">
            <Checkbox
              id="delete-apply-all-checkbox"
              checked={deleteApplyToAll}
              onCheckedChange={(checked) => setDeleteApplyToAll(!!checked)}
            />
            <label
              htmlFor="delete-apply-all-checkbox"
              className="text-xs font-bold text-slate-600 cursor-pointer select-none uppercase tracking-wider"
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
              className="bg-rose-600 hover:bg-rose-700 text-white min-w-[100px]"
            >
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

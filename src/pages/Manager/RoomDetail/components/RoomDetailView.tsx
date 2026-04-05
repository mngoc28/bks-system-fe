import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS } from "@/constant";
import { RoomDetailViewProps } from "@/dataHelper/room.dataHelper";
import { RoomImage } from "@/dataHelper/roomImage.dataHelper";
import { usePricePackagesQuery } from "@/hooks/usePricePackageQuery";
import { useRoomImagesQuery } from "@/hooks/useRoomImageQuery";
import { ArrowLeft, DollarSign, Edit, FileText, Home, ImageIcon, MapPin, Square, Users, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

/**
 * Room Detail View
 * A read-only presentation of a room's full profile, organized into logical sections like basic info, pricing, amenities, and an image gallery.
 */
export const RoomDetailView: React.FC<RoomDetailViewProps> = ({ room, onEdit, onBack }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { data: roomImages, isLoading: isLoadingImages } = useRoomImagesQuery(room.id);
  
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

  const getBuildingName = () => {
    return room.building_name || room.building?.name || "-";
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
            <ArrowLeft className="size-4 mr-2" />
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{room.title}</h1>
            <p className="text-sm text-gray-600">{t("rooms.room_details")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
            <Edit className="size-4 mr-2" />
            {t("rooms.edit_room_info")}
          </Button>
        </div>
      </div>

      {/* Room Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
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
              <div className="p-2 bg-green-100 rounded-lg">
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
              <div className="p-2 bg-purple-100 rounded-lg">
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
              <div className="p-2 bg-orange-100 rounded-lg">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <label className="text-sm font-medium text-gray-700">{t("rooms.building")}</label>
                <p className="text-sm text-gray-900 mt-1">{getBuildingName()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t("rooms.room_type")}</label>
                <p className="text-sm text-gray-900 mt-1">{getRoomTypeName(room.room_type)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t("rooms.created_at")}
                </label>
                <p className="text-sm text-gray-900 mt-1">{new Date(room.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t("rooms.updated_at")}
                </label>
                <p className="text-sm text-gray-900 mt-1">{new Date(room.updated_at).toLocaleDateString()}</p>
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
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign className="size-4" />
                    {t("rooms.deposit")}
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{room.deposit ? parseFloat(room.deposit.toString()).toLocaleString() : '0'} VND</p>
                </div>
              )}
            </div>
            {room.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">{t("rooms.description")}</label>
                <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">{room.description}</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {room.prices.map((price: any, index: number) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
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
              <div className="text-center py-6 text-gray-500">
                <DollarSign className="size-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("rooms.no_prices")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information - Row 2: Amenities & Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <Badge key={amenity.id} variant="outline" className="text-xs px-3 py-1">
                    {amenity.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Home className="size-8 mx-auto mb-2 opacity-50" />
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
                  <Badge key={service.id} variant="outline" className="text-xs px-3 py-1">
                    {service.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("rooms.no_services")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Room Images Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" />
            {t("rooms.images")}
          </CardTitle>
          <Button onClick={() => navigate(`${ROUTERS.ROOMS_DETAIL}/${room.id}/images`)} className="bg-green-600 hover:bg-green-700">
            <ImageIcon className="size-4 mr-2" />
            {t("rooms.edit_room_images")}
          </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingImages ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t("loading")}</p>
            </div>
          ) : roomImages && roomImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Sort images by sort order */}
              {roomImages
                .sort((a: RoomImage, b: RoomImage) => a.sort - b.sort)
                .map((image: RoomImage) => (
                  <div key={image.id} className="aspect-[4/3] relative group">
                    <img
                      src={CLOUDINARY_HEADER_IMAGE_URL + image.image_url}
                      alt={`${t("rooms.image")} ${image.sort}`}
                      className="w-full h-full object-cover rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedImage(CLOUDINARY_HEADER_IMAGE_URL + image.image_url)}
                    />
                    {/* Sort number badge */}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm font-medium">
                      #{image.sort}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            // no image
            <div className="text-center py-12">
              <ImageIcon className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">{t("rooms.no_images_yet")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 p-0"
                onClick={() => setSelectedImage(null)}
              >
                <X className="size-4" />
              </Button>
              <img
                src={selectedImage}
                alt="Room image enlarged"
                className="w-full aspect-[4/3] object-cover rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
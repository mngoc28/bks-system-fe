import React, { useEffect, useState, useMemo } from "react";
import { MapPin, Star, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PlainTextarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePublicTouristSpotsQuery } from "@/hooks/EU/useTouristSpotQuery";
import { RoomTouristSpotMap } from "@/api/roomTouristSpotMapApi";

export interface RoomTouristSpotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provinceId?: number;
  existingSpotIds?: number[];
  mapping: RoomTouristSpotMap | null; // Null means create mode, otherwise edit mode
  onSubmit: (data: {
    tourist_spot_id: number;
    distance_km: number | null;
    travel_time_minutes: number;
    is_primary: boolean;
    priority_order: number;
    note: string | null;
    apply_to_all_rooms: boolean;
  }) => Promise<void>;
  submitting: boolean;
}

export const RoomTouristSpotDialog: React.FC<RoomTouristSpotDialogProps> = ({
  open,
  onOpenChange,
  provinceId,
  existingSpotIds,
  mapping,
  onSubmit,
  submitting,
}) => {
  const [touristSpotId, setTouristSpotId] = useState<string>("");
  const [distanceKm, setDistanceKm] = useState<string>("");
  const [travelTimeMinutes, setTravelTimeMinutes] = useState<string>("");
  const [isPrimary, setIsPrimary] = useState<boolean>(false);
  const [note, setNote] = useState<string>("");
  const [applyToAllRooms, setApplyToAllRooms] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch tourist spots in the same province as the room
  const { data: touristSpots = [], isLoading: isLoadingSpots } =
    usePublicTouristSpotsQuery(
      { province_id: provinceId, limit: 50 },
      { enabled: open && !!provinceId }
    );

  // Filter out already mapped spots in create mode to avoid duplicate assignment.
  const availableSpots = useMemo(() => {
    if (!existingSpotIds || existingSpotIds.length === 0 || !!mapping) {
      return touristSpots;
    }
    return touristSpots.filter((spot) => !existingSpotIds.includes(spot.id));
  }, [touristSpots, existingSpotIds, mapping]);

  // Reset form when dialog opens/closes or when mapping changes
  useEffect(() => {
    if (!open) return;

    if (mapping) {
      // Edit mode
      setTouristSpotId(String(mapping.tourist_spot_id));
      setDistanceKm(mapping.distance_km != null ? String(mapping.distance_km) : "");
      setTravelTimeMinutes(String(mapping.travel_time_minutes));
      setIsPrimary(!!mapping.is_primary);
      setNote(mapping.note ?? "");
    } else {
      // Create mode
      setTouristSpotId("");
      setDistanceKm("");
      setTravelTimeMinutes("");
      setIsPrimary(false);
      setNote("");
    }
    setApplyToAllRooms(false);
    setValidationError(null);
  }, [open, mapping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!touristSpotId) {
      setValidationError("Vui lòng chọn địa điểm du lịch.");
      return;
    }

    const time = parseInt(travelTimeMinutes, 10);
    if (isNaN(time) || time < 0) {
      setValidationError("Thời gian di chuyển phải là số nguyên dương.");
      return;
    }

    const dist = distanceKm.trim() ? parseFloat(distanceKm) : null;
    if (dist !== null && (isNaN(dist) || dist < 0)) {
      setValidationError("Khoảng cách phải là số dương.");
      return;
    }

    await onSubmit({
      tourist_spot_id: Number(touristSpotId),
      distance_km: dist,
      travel_time_minutes: time,
      is_primary: isPrimary,
      priority_order: 0,
      note: note.trim() || null,
      apply_to_all_rooms: applyToAllRooms,
    });
  };

  const isEditMode = !!mapping;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <span className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
              <MapPin size={18} />
            </span>
            {isEditMode ? "Cập nhật địa điểm du lịch" : "Gán địa điểm du lịch"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tourist Spot Selection */}
          <div className="space-y-1.5">
            <label htmlFor="tourist-spot-select" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Địa điểm du lịch
            </label>
            {isEditMode ? (
              <Input
                id="tourist-spot-select"
                value={mapping?.tourist_spot?.name || "N/A"}
                disabled
                className="bg-slate-50 font-semibold"
              />
            ) : (
              <Select value={touristSpotId} onValueChange={setTouristSpotId}>
                <SelectTrigger id="tourist-spot-select" className="h-11 rounded-lg border-slate-200">
                  <SelectValue placeholder={isLoadingSpots ? "Đang tải địa điểm..." : "Chọn địa điểm du lịch"} />
                </SelectTrigger>
                <SelectContent>
                  {availableSpots.length === 0 && !isLoadingSpots && (
                    <div className="px-3 py-2 text-sm text-slate-500 italic">
                      Không tìm thấy địa điểm du lịch nào phù hợp hoặc tất cả đã được gán.
                    </div>
                  )}
                  {availableSpots.map((spot) => (
                    <SelectItem key={spot.id} value={String(spot.id)}>
                      {spot.name} {spot.region_label ? `(${spot.region_label})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Distance */}
            <div className="space-y-1.5">
              <label htmlFor="distance-km-input" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Khoảng cách (km)
              </label>
              <Input
                id="distance-km-input"
                type="number"
                step="0.1"
                min="0"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="VD: 3.5 (Tùy chọn)"
              />
            </div>

            {/* Travel Time */}
            <div className="space-y-1.5">
              <label htmlFor="travel-time-input" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Thời gian di chuyển (phút) *
              </label>
              <Input
                id="travel-time-input"
                type="number"
                min="0"
                required
                value={travelTimeMinutes}
                onChange={(e) => setTravelTimeMinutes(e.target.value)}
                placeholder="VD: 10"
              />
            </div>
          </div>

          {/* Is Primary Checkbox */}
          <div className="flex items-center space-x-3 py-1.5">
            <Checkbox
              id="is-primary-checkbox"
              checked={isPrimary}
              onCheckedChange={(checked) => setIsPrimary(!!checked)}
            />
            <label
              htmlFor="is-primary-checkbox"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer select-none"
            >
              <Star className={`size-3.5 ${isPrimary ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
              Đặt làm địa điểm chính (hiển thị đầu tiên)
            </label>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label htmlFor="note-textarea" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Ghi chú
            </label>
            <PlainTextarea
              id="note-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú thêm thông tin về tuyến đường di chuyển..."
              className="min-h-[88px]"
            />
          </div>

          {/* Apply to all rooms in the same property */}
          <div className="flex items-center space-x-3 border-t border-slate-100 pt-4 pb-2">
            <Checkbox
              id="apply-to-all-rooms-checkbox"
              checked={applyToAllRooms}
              onCheckedChange={(checked) => setApplyToAllRooms(!!checked)}
            />
            <label
              htmlFor="apply-to-all-rooms-checkbox"
              className="text-xs font-bold text-slate-600 cursor-pointer select-none uppercase tracking-wider"
            >
              Áp dụng cho tất cả các phòng khác thuộc cùng tòa nhà
            </label>
          </div>

          {/* Error Message */}
          {validationError && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50 p-3 text-rose-700">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div className="text-sm font-medium leading-relaxed">{validationError}</div>
            </div>
          )}

          {/* Footer Actions */}
          <DialogFooter className="flex flex-row flex-wrap items-center justify-end gap-2 gap-y-2 border-t border-slate-100 pt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="min-w-[96px]"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white"
              disabled={submitting}
            >
              {submitting ? "Đang xử lý..." : isEditMode ? "Lưu thay đổi" : "Gán địa điểm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

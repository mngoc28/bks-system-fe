import { Button } from "@/components/ui/button";
import { ROUTERS } from "@/constant";
import { useRoomQuery } from "@/hooks/useRoomQuery";
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { RoomDetailView } from "./components";

/**
 * Room Detail Page
 * Fetches and displays comprehensive information about a specific room, including its property association, pricing, and availability status.
 */
const RoomDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const roomId = id ? parseInt(id, 10) : 0;
  const location = useLocation();

  // For view and edit modes, fetch room data
  const { data: roomData, isLoading: isRoomLoading, isError, error } = useRoomQuery(roomId);

  const room = useMemo(() => {
    if (!roomData) return undefined;
    return roomData;
  }, [roomData]);

  const handleEdit = () => {
    navigate(`${ROUTERS.ROOMS_EDIT}/${roomId}`, { state: location.state });
  };

  const handleBack = () => {
    navigate(ROUTERS.ROOMS, { state: { ...location.state, scrollToId: roomId } });
  };

  if (!roomId || roomId <= 0) {
    return (
      <div className="flex flex-col gap-6 p-3 sm:p-6">
        <div className="text-red-500">{t("rooms.invalid_room_id")}</div>
        <Button onClick={() => navigate(ROUTERS.ROOMS)} className="text-blue-500 hover:underline">
          {t("common.back")}
        </Button>
      </div>
    );
  }

  if (isRoomLoading) {
    return (
      <div className="flex items-center justify-center p-3 sm:p-6">
        <Loader2 className="size-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError || !room) {
    const errorMessage = error ? (error as any)?.response?.data?.message || t("rooms.error_getting_room") : t("rooms.error_getting_room");
    return (
      <div className="flex flex-col gap-6 p-3 sm:p-6">
        <div className="text-red-500">{errorMessage}</div>
        <button onClick={() => navigate(ROUTERS.ROOMS)} className="text-blue-500 hover:underline">
          {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 overflow-hidden p-3 sm:p-6">
        <RoomDetailView
          room={room}
          onEdit={handleEdit}
          onBack={handleBack}
        />
    </div>
  );
};

export default RoomDetail;

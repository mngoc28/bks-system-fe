import { Button } from "@/components/ui/button";
import { toastSuccess } from "@/components/ui/toast";
import { ROUTERS } from "@/constant";
import { RoomFormData } from "@/dataHelper/room.dataHelper";
import { useRoomQuery, useUpdateRoomMutation } from "@/hooks/useRoomQuery";
import { useGetUserProfileQuery } from "@/hooks/useUserQuery";
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { RoomEditForm } from "./components";

const RoomUpdate: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const roomId = id ? parseInt(id, 10) : 0;
  const queryClient = useQueryClient();

  if (!roomId || roomId <= 0) {
    return (
      <div className="flex flex-col gap-6 p-3 sm:p-6">
        <div className="text-red-500">{t("rooms.invalid_room_id")}</div>
        <button onClick={() => navigate(ROUTERS.ROOMS)} className="text-blue-500 hover:underline">
          {t("common.back")}
        </button>
      </div>
    );
  }

  const { data, isLoading, isError, error } = useRoomQuery(roomId);
  const updateRoomMutation = useUpdateRoomMutation();
  const { data: profileData } = useGetUserProfileQuery();
  const currentUser = useMemo(() => profileData?.data, [profileData]);

  const room = useMemo(() => {
    if (!data) return undefined;
    return data;
  }, [data]);

  const handleSubmit = async (formData: RoomFormData) => {
    if (!room) return;
    try {
      await updateRoomMutation.mutateAsync({
        id: room.id,
        data: {
          building_id: formData.building_id,
          title: formData.title,
          room_number: formData.room_number || undefined,
          deposit: formData.deposit ? parseFloat(formData.deposit) : undefined,
          area: parseFloat(formData.area),
          floor_number: formData.floor_number,
          people: formData.people,
          room_type: formData.room_type,
          status: formData.status ? 1 : 0,
          description: formData.description || undefined,
          amenities: formData.amenities,
          services: formData.services,
          prices: formData.prices?.map(p => ({
            price_package_id: p.price_package_id,
            unit: p.unit,
            unit_price: p.unit_price,
          })),
        },
      });
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toastSuccess(t("rooms.room_updated_successfully"));
      navigate(ROUTERS.ROOMS, { state: { ...location.state, highlightedId: room.id, sortField: 'id', sortDirection: 'desc'  } });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleBack = () => {
    if (location.state?.fromRoomList) {
      // Came from room list, navigate back with state
      navigate(ROUTERS.ROOMS, { state: { ...location.state, scrollToId: room?.id } });
    } else {
      // Came from other page (e.g., detail), use browser back
      navigate(-1);
    }
  };

  if (isLoading) {
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
    <div className="flex flex-col gap-6 p-3 sm:p-6 overflow-hidden">
      <div className="flex items-center gap-4">
        <Button variant="outline" className="w-fit" onClick={handleBack}>
          <ArrowLeft className="size-4" />
          {t("common.back")}
        </Button>
        <h2 className="text-2xl font-bold">{t("rooms.edit_room")}</h2>
      </div>
      <RoomEditForm
        room={room}
        onSubmit={handleSubmit}
        onCancel={handleBack}
        isLoading={updateRoomMutation.isPending}
        currentUser={currentUser}
      />
    </div>
  );
};

export default RoomUpdate;
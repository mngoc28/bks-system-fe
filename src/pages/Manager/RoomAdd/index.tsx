import { ROUTERS } from "@/constant";
import { RoomFormData } from "@/dataHelper/room.dataHelper";
import { useCreateRoomMutation } from "@/hooks/useRoomQuery";
import { useGetUserProfileQuery } from "@/hooks/useUserQuery";
import { useQueryClient } from '@tanstack/react-query';
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { RoomAddForm } from "./components";

const RoomAdd: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // const { data, isLoading, isError, error } = useRoomQuery(roomId);
  const { data: profileData } = useGetUserProfileQuery();
  const createRoomMutation = useCreateRoomMutation();

  const currentUser = useMemo(() => profileData?.data, [profileData]);

  const handleCreateSubmit = async (formData: RoomFormData) => {
    try {
      // Convert form data to API format
      const roomData = {
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
      };

      const response = await createRoomMutation.mutateAsync(roomData);
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
      navigate(ROUTERS.ROOMS, { state: { highlightedId: response.data.id, sortField: 'id', sortDirection: 'desc' } });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCancel = () => {
    navigate(ROUTERS.ROOMS);
  };

  return (
    <div className="flex flex-col gap-6 p-3 sm:p-6 overflow-hidden">
      <h2 className="text-2xl font-bold">{t("rooms.create_room")}</h2>
      <RoomAddForm
        onSubmit={handleCreateSubmit}
        onCancel={handleCancel}
        isLoading={createRoomMutation.isPending}
        currentUser={currentUser}
      />
    </div>
  );
};

export default RoomAdd;
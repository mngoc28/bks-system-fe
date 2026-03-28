import { amenityApi } from "@/api/amenityApi";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { SearchAmenityRequest } from "@/dataHelper/amenity.dataHelper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Query hooks
export const useAmenitiesQuery = (params: SearchAmenityRequest, options?: { enabled?: boolean }) => {
  const { t } = useTranslation();
  return useQuery({
    queryKey: ["amenities", params],
    queryFn: async () => {
      try {
        const response = await amenityApi.searchAmenities(params);
        return response.data;
      } catch (error) {
        toastError(t("amenities.error_getting_amenities"));
        throw error;
      }
    },
    enabled: options?.enabled !== false,
  });
};

// get all amenities
export const useAllAmenitiesQuery = () => {
  const { t } = useTranslation();
  return useQuery({
    queryKey: ["all-amenities"],
    queryFn: async () => {
      try {
        const response = await amenityApi.getAllAmenities();
        return response.data;
      } catch (error) {
        toastError(t("amenities.error_getting_amenities"));
        throw error;
      }
    },
  });
};

export const useAmenityQuery = (id: number) => {
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["amenity", id],
    queryFn: async () => {
      try {
        const response = await amenityApi.getAmenityById(id);
        return response.data;
      } catch (error) {
        console.error("Error fetching amenity:", error);
        toastError(t("amenities.error_getting_amenity"));
        throw error;
      }
    },
    enabled: !!id,
  });
};

export const useCreateAmenityMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => amenityApi.createAmenity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
      toastSuccess(t("amenities.create_amenity_success"));
    },
    onError: () => {
      toastError(t("amenities.create_amenity_failed"));
    },
  });
};

export const useUpdateAmenityMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) => amenityApi.updateAmenity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
      toastSuccess(t("amenities.update_amenity_success"));
    },
    onError: () => {
      toastError(t("amenities.update_amenity_failed"));
    },
  });
};

export const useDeleteAmenityMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => amenityApi.deleteAmenity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
      toastSuccess(t("amenities.delete_amenity_success"));
    },
    onError: () => {
      toastError(t("amenities.delete_amenity_failed"));
    },
  });
};


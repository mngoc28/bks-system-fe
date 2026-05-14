import { propertyImageApi } from "@/api/propertyImageApi";
import { ApiResponse } from "@/api/types";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { propertyImage, RequestPropertyImage } from "@/dataHelper/propertyImage.dataHelper";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export const usePropertyImageQuery = (propertyImageId: number) => {
  return useQuery<ApiResponse<propertyImage>, Error>({
    queryKey: ["property-images", propertyImageId],
    queryFn: async () => {
      const response = await propertyImageApi.getPropertyImagesById(propertyImageId);
      return response;
    },
  });
};

export const useImagesByPropertyIdQuery = (propertyid: number, options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<propertyImage[]>, Error>({
    queryKey: ["property-images", propertyid],
    queryFn: async () => {
      const response = await propertyImageApi.getImagesByPropertyId(propertyid);
      return response;
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreatePropertyImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RequestPropertyImage) => propertyImageApi.createPropertyImage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-images"] });
    },
    onError: (error) => {
      throw error;
    },
  });
};

export const useUpdatePropertyImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RequestPropertyImage }) =>
      propertyImageApi.updatePropertyImage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-images"] });
    },
    onError: (error) => {
      throw error;
    },
  });
};

export const useDeletePropertyImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => propertyImageApi.deletePropertyImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-images"] });
    },
    onError: (error) => {
      throw error;
    },
  });
};

export const useImagesByPropertiesIdQuery = (propertiesId: number[]) => {
  const queries = useQueries({
    queries: propertiesId.map((propertyId) => ({
      queryKey: ["property-images", propertyId],
      queryFn: async () => {
        const response = await propertyImageApi.getImagesByPropertyId(propertyId);
        return response.data || [];
      },
    })),
  });
  return queries;
};

export const useUpdatePropertyImageSortMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, ids }: { propertyId: number; ids: number[] }) =>
      propertyImageApi.updatePropertyImageSort(propertyId, ids),
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({ queryKey: ["property-images", propertyId] });
      toastSuccess(t("property-images.update_property_image_sort_success"));
    },
    onError: (error) => {
      toastError(t("property-images.update_property_image_sort_failed"));
      throw error;
    },
  });
};

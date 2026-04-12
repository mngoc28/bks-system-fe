import { buildingImageApi } from "@/api/buildingImageApi";
import { ApiResponse } from "@/api/types";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { buildingImage, RequestBuildingImage } from "@/dataHelper/buildingImage.dataHelper";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// get building images by building id
export const useBuildingImageQuery = (buildingImageId: number) => {
    return useQuery<ApiResponse<buildingImage>, Error>({
        queryKey: ["building-images", buildingImageId],
        queryFn: async () => {
            try {
                const response = await buildingImageApi.getBuildingImagesById(buildingImageId);
                return response;
            } catch (error) {
                throw error;
            }
        },
    });
}

// get image by building id
export const useImagesByBuildingIdQuery = (buildingid: number, options?: { enabled?: boolean }) => {
    return useQuery<ApiResponse<buildingImage[]>, Error>({
        queryKey: ["building-images", buildingid],
        queryFn: async () => {
            try {
                const response = await buildingImageApi.getImagesByBuildingId(buildingid);
                return response;
            } catch (error) {
                throw error;
            }
        },
        enabled: options?.enabled ?? true,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

// create building image
export const useCreateBuildingImageMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: RequestBuildingImage) => buildingImageApi.createBuildingImage(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["building-images"] });
        },
        onError: (error) => {
            throw error;
        }
    });
}

// update building image
export const useUpdateBuildingImageMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: RequestBuildingImage }) => buildingImageApi.updateBuildingImage(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["building-images"] });
        },
        onError: (error) => {
            throw error;
        }
    });
}

// delete building image
export const useDeleteBuildingImageMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => buildingImageApi.deleteBuildingImage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["building-images"] });
        },
        onError: (error) => {
            throw error;
        }
    });
}

// get images by buildings idconst getImagesByBuilingsId = (buildingsId: number[]) => {
export const getImagesByBuilingsId = (buildingsId: number[]) => {
    const queries = useQueries({
        queries: buildingsId.map((buildingId) => ({
            queryKey: ["building-images", buildingId],
            queryFn: () => useImagesByBuildingIdQuery(buildingId).data?.data ?? [],
        })),
    });
    return queries;
}

// update building image sort
export const useUpdateBuildingImageSortMutation = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ buildingId, ids }: { buildingId: number; ids: number[] }) => buildingImageApi.updateBuildingImageSort(buildingId, ids),
        onSuccess: (_, { buildingId }) => {
            queryClient.invalidateQueries({ queryKey: ["building-images", buildingId] });
            toastSuccess(t("building-images.update_building_image_sort_success"));
        },
        onError: (error) => {
            toastError(t("building-images.update_building_image_sort_failed"));
            throw error;
        }
    });
}
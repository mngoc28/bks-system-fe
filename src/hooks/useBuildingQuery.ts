import { buildingApi } from "@/api/buildingApi";
import { ApiResponse } from "@/api/types";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { Building,BuildingDetail, CreateBuildingRequest,BuildingListDataResponse, BuildingType, SearchBuildingRequest, UpdateBuildingRequest } from "@/dataHelper/building.dataHelper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { partnerService } from "@/services/partnerService";

// search buildings
export const useBuildingsQuery = (params: SearchBuildingRequest) => {
  return useQuery<ApiResponse<BuildingListDataResponse>, Error>({
    queryKey: ["buildings", params],
    queryFn: async () => {
      try {
        const response = await buildingApi.searchBuildings(params);
        return response;
      } catch (error) {
        throw error;
      }
    },
  });
};

// get building types (Admin)
export const useBuildingTypesQuery = (enabled = true) => {
  return useQuery<ApiResponse<BuildingType[]>, Error>({
    queryKey: ["building-types-admin"],
    queryFn: async () => {
      const response = await buildingApi.getBuildingTypes();
      const normalized = (response.data ?? []).map((item: any) => ({
        id: Number(item?.id ?? item?.value ?? 0),
        name: String(item?.name ?? item?.label ?? ""),
      }));

      return {
        ...response,
        data: normalized,
      };
    },
    enabled,
  });
};

// get building types (Partner)
export const usePartnerBuildingTypesQuery = () => {
  return useQuery<ApiResponse<BuildingType[]>, Error>({
    queryKey: ["building-types-partner"],
    queryFn: async () => {
      const response = await partnerService.getBuildingTypes();
      const payload = response.data as ApiResponse<any[]>;
      const normalized = (payload.data ?? []).map((item: any) => ({
        id: Number(item?.id ?? item?.value ?? 0),
        name: String(item?.name ?? item?.label ?? ""),
      }));

      return {
        ...payload,
        data: normalized,
      } as ApiResponse<BuildingType[]>;
    },
  });
};

// get building by id
export const useBuildingQuery = (id: number) => {
  return useQuery<ApiResponse<BuildingDetail>, Error>({
    queryKey: ["building", id],
    queryFn: async (): Promise<ApiResponse<BuildingDetail>> => {
      const response = await buildingApi.getBuildingById(id);
      return response;
    },
    enabled: !!id,
  });
};

// get all buildings no pagination
export const useAllBuildingsQuery = () => {
  return useQuery<Building[], Error>({
    queryKey: ["all-buildings"],
    queryFn: async () => {
      try {
        const response = await buildingApi.getAllBuildings();
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  });
};

// create building
export const useCreateBuildingMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (data: CreateBuildingRequest) => buildingApi.createBuilding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      toastSuccess(t("buildings.building_created_successfully"));
    },
    onError: (error) => {
      toastError(t("buildings.building_created_failed"));
      throw error;
    },
  });
};

// update building
export const useUpdateBuildingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBuildingRequest }) => buildingApi.updateBuilding(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      queryClient.invalidateQueries({ queryKey: ["building", id] });
    },
    onError: (error) => {
      throw error;
    },
  });
};

// delete building
export const useDeleteBuildingMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: buildingApi.deleteBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buildings"] });
      toastSuccess(t("buildings.building_deleted_successfully"));
    },
    onError: (error) => {
      toastError(t("buildings.error_deleting_building"));
      throw error;
    },
  });
};

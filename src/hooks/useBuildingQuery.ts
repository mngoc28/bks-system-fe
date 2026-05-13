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
      const response = await buildingApi.searchBuildings(params);
      return response;
    },
  });
};

// get building types (Admin)
export const useBuildingTypesQuery = (enabled = true) => {
  return useQuery<ApiResponse<BuildingType[]>, Error>({
    queryKey: ["building-types-admin"],
    queryFn: async () => {
      const response = await buildingApi.getBuildingTypes() as any;
      const dataArray = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
      
      const normalized = dataArray.map((item: any) => ({
        id: Number(item?.id ?? item?.value ?? 0),
        name: String(item?.name ?? item?.label ?? ""),
      }));

      return {
        ...response,
        data: normalized,
      } as ApiResponse<BuildingType[]>;
    },
    enabled,
  });
};

// get building types (Partner)
export const usePartnerBuildingTypesQuery = () => {
  return useQuery<ApiResponse<BuildingType[]>, Error>({
    queryKey: ["building-types-partner"],
    queryFn: async () => {
      const response = await partnerService.getBuildingTypes() as any;
      const dataArray = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
      
      const normalized = dataArray.map((item: any) => ({
        id: Number(item?.id ?? item?.value ?? 0),
        name: String(item?.name ?? item?.label ?? ""),
      }));

      return {
        ...response,
        data: normalized,
      } as ApiResponse<BuildingType[]>;
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
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
      const response = await buildingApi.getAllBuildings();
      return response.data;
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

import { propertyApi } from "@/api/propertyApi";
import { ApiResponse } from "@/api/types";
import { toastError, toastSuccess } from "@/components/ui/toast";
import {
  Property,
  PropertyDetail,
  CreatePropertyRequest,
  PropertyListDataResponse,
  PropertyType,
  SearchPropertyRequest,
  UpdatePropertyRequest,
} from "@/dataHelper/property.dataHelper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { partnerService } from "@/services/partnerService";

export const usePropertiesQuery = (params: SearchPropertyRequest) => {
  return useQuery<ApiResponse<PropertyListDataResponse>, Error>({
    queryKey: ["properties", params],
    queryFn: async () => {
      const response = await propertyApi.searchProperties(params);
      return response;
    },
  });
};

export const usePropertyTypesQuery = (enabled = true) => {
  return useQuery<ApiResponse<PropertyType[]>, Error>({
    queryKey: ["property-types-admin"],
    queryFn: async () => {
      const response = (await propertyApi.getPropertyTypes()) as any;
      const dataArray = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];

      const normalized = dataArray.map((item: any) => ({
        id: Number(item?.id ?? item?.value ?? 0),
        name: String(item?.name ?? item?.label ?? ""),
        slug: String(item?.slug ?? ""),
      }));

      return {
        ...response,
        data: normalized,
      } as ApiResponse<PropertyType[]>;
    },
    enabled,
  });
};

export const usePartnerPropertyTypesQuery = () => {
  return useQuery<ApiResponse<PropertyType[]>, Error>({
    queryKey: ["property-types-partner"],
    queryFn: async () => {
      const response = (await partnerService.getPropertyTypes()) as any;
      const dataArray = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];

      const normalized = dataArray.map((item: any) => ({
        id: Number(item?.id ?? item?.value ?? 0),
        name: String(item?.name ?? item?.label ?? ""),
      }));

      return {
        ...response,
        data: normalized,
      } as ApiResponse<PropertyType[]>;
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
};

export const usePropertyQuery = (id: number) => {
  return useQuery<ApiResponse<PropertyDetail>, Error>({
    queryKey: ["property", id],
    queryFn: async (): Promise<ApiResponse<PropertyDetail>> => {
      const response = await propertyApi.getPropertyById(id);
      return response;
    },
    enabled: !!id,
  });
};

export const useAllPropertiesQuery = () => {
  return useQuery<Property[], Error>({
    queryKey: ["all-properties"],
    queryFn: async () => {
      const response = await propertyApi.getAllProperties();
      return response.data;
    },
  });
};

export const useCreatePropertyMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (data: CreatePropertyRequest) => propertyApi.createProperty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toastSuccess(t("properties.property_created_successfully"));
    },
    onError: (error) => {
      toastError(t("properties.property_created_failed"));
      throw error;
    },
  });
};

export const useUpdatePropertyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePropertyRequest }) => propertyApi.updateProperty(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", id] });
    },
    onError: (error) => {
      throw error;
    },
  });
};

export const useDeletePropertyMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: propertyApi.deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toastSuccess(t("properties.property_deleted_successfully"));
    },
    onError: (error) => {
      toastError(t("properties.error_deleting_property"));
      throw error;
    },
  });
};

import { provinceApi } from "@/api/provinceApi";
import { ApiResponse } from "@/api/types";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { ProvinceDetail, ProvinceFilter, ProvinceTypes } from "@/dataHelper/province.dataHelper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export const useProvinceQuery = (id: number) => {
    const { t } = useTranslation();

    return useQuery<ProvinceDetail>({
        queryKey: ["province", id],
        queryFn: async (): Promise<ProvinceDetail> => {
            try {
                const response = await provinceApi.getProvinceById(id);
                const nestedData = (response as any).data?.data || (response as any).data || response;
                if (!nestedData || !nestedData.province) {
                    throw new Error("Invalid response structure");
                }

                const transformed: ProvinceDetail = {
                    id: nestedData.province.id,
                    name: nestedData.province.name,
                    name_en: nestedData.province.name_en,
                    image: nestedData.province.image || null,
                    ward_count: nestedData.ward_count || 0,
                    room_count: nestedData.room_count || 0,
                    wards: nestedData.wards || [],
                    rooms: nestedData.rooms || [],
                    created_at: nestedData.province.created_at,
                    updated_at: nestedData.province.updated_at,
                };

                return transformed;
            } catch (error) {
                toastError(t("province.error_getting_province"));
                throw error;
            }
        },
        enabled: !!id,
    });
};

//Get all provinces with filter
export const useGetAllProvinces = (data: ProvinceFilter) => {
    return useQuery({
        queryKey: ["provinces", data],
        queryFn: async () => {
            const response = await provinceApi.getAllProvinces(data);
            return response;
        }
    })
}

// get all provinces types
export const useGetAllProvincesTypes = () => {
  return useQuery<ApiResponse<ProvinceTypes[]>, Error>({
    queryKey: ["home-provinces"],
    queryFn: async ({ signal }) => {
      const response = await provinceApi.getHomeProvinces({ signal });
      return response;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes to prevent duplicate/delayed background refetches
  });
};

export const useUpdateProvinceMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name?: string; name_en?: string; image?: string | null } }) => {
      const response = await provinceApi.updateProvince(id, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["province", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["provinces"] });
      queryClient.invalidateQueries({ queryKey: ["home-provinces"] });
      toastSuccess(t("common.update_success"));
    },
    onError: () => {
      toastError(t("common.update_error"));
    },
  });
};

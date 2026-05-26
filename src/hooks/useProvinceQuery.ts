import { provinceApi } from "@/api/provinceApi";
import { ApiResponse } from "@/api/types";
import { toastError } from "@/components/ui/toast";
import { ProvinceDetail, ProvinceFilter, ProvinceTypes } from "@/dataHelper/province.dataHelper";
import { useQuery } from "@tanstack/react-query";
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
  });
};

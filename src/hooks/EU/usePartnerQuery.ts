import { partnerApi } from "@/api/EU/partnerApi";
import { toastError } from "@/components/ui/toast";
import { Partner, PartnerDetail } from "@/dataHelper/EU/partner.dataHelper";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Hook to fetch partners by province ID
export const usePartnerQuery = (province_id: number) => {
    const { t } = useTranslation();

    return useQuery({
        queryKey: ["partners", province_id],
        queryFn: async (): Promise<Partner[]> => {
            try {
                const response = await partnerApi.getPartnersByProvince(province_id);
                return response.data;
            } catch (error) {
                console.error("Error fetching partners:", error);
                toastError(t("endUserPartners.error_getting_partners"));
                throw error;
            }
        },
        enabled: !!province_id,
    });
};

// Hook to fetch partner details along with their rooms
export const usePartnerDetailQuery = (partner_id: number) => {
    const { t } = useTranslation();

    return useQuery({
        queryKey: ["partnerDetail", partner_id],
        queryFn: async (): Promise<PartnerDetail> => {
            try {
                const response = await partnerApi.getPartnerInfo(partner_id);
                return response.data;
            } catch (error) {
                console.error("Error fetching partners:", error);
                toastError(t("endUserPartners.error_getting_partners"));
                throw error;
            }
        },
        enabled: !!partner_id,
    });
};
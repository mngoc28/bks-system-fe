import { partnerApi } from "@/api/EU/partnerApi";
import { toastError } from "@/components/ui/toast";
import { Partner, PartnerDetail } from "@/dataHelper/EU/partner.dataHelper";
import { HOMEPAGE_QUERY_OPTIONS, PUBLIC_DETAIL_QUERY_OPTIONS, PUBLIC_STATIC_QUERY_OPTIONS } from "@/lib/queryCache";
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
        ...PUBLIC_STATIC_QUERY_OPTIONS,
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
        ...PUBLIC_DETAIL_QUERY_OPTIONS,
    });
};

export const useRandomPartnersQuery = (enabled = true) => {
    return useQuery({
        queryKey: ["home-random-partners"],
        queryFn: async (): Promise<Partner[]> => {
            const response = await partnerApi.getRandomPartners();
            return response.data;
        },
        enabled,
        ...HOMEPAGE_QUERY_OPTIONS,
    });
};
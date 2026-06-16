import { partnerApi } from "@/api/partnerApi"
import { toastError, toastSuccess } from "@/components/ui/toast";
import { PartnerDetailResponse, PartnerFilter, PartnerResponse, PartnerUpdate } from "@/dataHelper/partner.dataHelper"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { t } from "i18next";

// List Partners information
export const useListPartnerQuery = (params: PartnerFilter, options?: { enabled?: boolean }) => {
    return useQuery<PartnerResponse, Error>({
        queryKey: ["partners", params],
        queryFn: () => partnerApi.getlistPartners(params),
        ...options,
    });
}

// Detail Partner information
export const usePartnerQuery = (id: number) => {
    return useQuery<PartnerDetailResponse, Error>({
        queryKey: ["partner", id],
        queryFn: () => partnerApi.getPartnerById(id),
        enabled: !!id,
    });
}

//update Partner information
export const useUpdatePartnerQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: PartnerUpdate | FormData }) => partnerApi.updatePartner(data, id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["partner"]});
        toastSuccess(t('partner.update_partner_success'))
      },
      onError: () => {
        toastError(t('partner.update_partner_fail'))
      },
    });
}

// Get logged-in partner profile
export const usePartnerProfileQuery = () => {
    return useQuery<PartnerDetailResponse, Error>({
        queryKey: ["partner-profile"],
        queryFn: ({ signal }) => partnerApi.getPartnerProfile({ signal }),
        staleTime: 60_000,
        gcTime: 5 * 60_000,
    });
}

// Update logged-in partner profile
export const useUpdatePartnerProfileMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: PartnerUpdate | FormData) => partnerApi.updatePartnerProfile(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["partner-profile"]});
        toastSuccess(t('partner.update_partner_success'))
      },
      onError: () => {
        toastError(t('partner.update_partner_fail'))
      },
    });
}
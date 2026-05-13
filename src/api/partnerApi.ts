import { PartnerDetailResponse, PartnerFilter, PartnerResponse, PartnerUpdate, PartnerUpdateResponse } from "@/dataHelper/partner.dataHelper";
import axiosClient from "./axiosClient";

export const partnerApi = {
    getlistPartners: (data: PartnerFilter): Promise<PartnerResponse> =>
        axiosClient.get("admin/partner/search", { params: data}),
    getPartnerById: (id: number): Promise<PartnerDetailResponse> =>
        axiosClient.get(`admin/partner/${id}`),
    updatePartner: (data: PartnerUpdate | FormData, id: number): Promise<PartnerUpdateResponse> =>
        axiosClient.post(`admin/partner/${id}`, data),

    // Partner-scoped profile endpoints
    getPartnerProfile: (): Promise<PartnerDetailResponse> =>
        axiosClient.get("partner/profile"),
    updatePartnerProfile: (data: PartnerUpdate | FormData): Promise<PartnerUpdateResponse> =>
        axiosClient.put("partner/profile", data),
}
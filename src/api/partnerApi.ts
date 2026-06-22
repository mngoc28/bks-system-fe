import { PartnerDetailResponse, PartnerFilter, PartnerResponse, PartnerUpdate, PartnerUpdateResponse } from "@/dataHelper/partner.dataHelper";
import axiosClient from "./axiosClient";

const normalizePartnerListParams = (data: PartnerFilter): PartnerFilter => {
    const params: PartnerFilter = {};

    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return;
        }

        params[key as keyof PartnerFilter] = value as never;
    });

    params.page = Number(data.page) > 0 ? Number(data.page) : 1;
    params.per_page = Number(data.per_page) > 0 ? Number(data.per_page) : 12;

    return params;
};

export const partnerApi = {
    getlistPartners: (data: PartnerFilter): Promise<PartnerResponse> =>
        axiosClient.get("admin/partner/search", { params: normalizePartnerListParams(data) }),
    getPartnerById: (id: number): Promise<PartnerDetailResponse> =>
        axiosClient.get(`admin/partner/${id}`),
    updatePartner: (data: PartnerUpdate | FormData, id: number): Promise<PartnerUpdateResponse> =>
        axiosClient.post(`admin/partner/${id}`, data),

    getPartnerProfile: (config?: any): Promise<PartnerDetailResponse> =>
        axiosClient.get("partner/business-profile", config),
    updatePartnerProfile: (data: PartnerUpdate | FormData): Promise<PartnerUpdateResponse> => {
        // PHP/Laravel cannot parse multipart file uploads on PUT — use POST (same as admin partner edit).
        if (data instanceof FormData) {
            return axiosClient.post("partner/business-profile", data);
        }
        return axiosClient.put("partner/business-profile", data);
    },
}

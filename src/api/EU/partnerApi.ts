import { Partner, PartnerDetail } from "@/dataHelper/EU/partner.dataHelper";
import axiosClient from "../axiosClient";

export const partnerApi = {
    // Fetch partners by province ID
    getPartnersByProvince: (province_id: number): Promise<{ data: Partner[] }> =>
        axiosClient.get(`partners/${province_id}`),

    // Fetch partner details along with their rooms
    getPartnerInfo: (partner_id: number): Promise<{ data: PartnerDetail }> =>
        axiosClient.get(`partners/detail/${partner_id}`),
}
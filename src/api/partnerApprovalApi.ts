import axiosClient from "./axiosClient";
import type { ApiResponse } from "./types";

export interface PartnerInfoSnapshot {
  id?: number;
  user_id?: number;
  company_name?: string;
  partner_type?: string;
  representative_name?: string;
  phone?: string;
  tax_code?: string;
  address?: string;
  website?: string;
  description?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
  id_card_front?: string;
  id_card_back?: string;
  business_license?: string;
  ownership_document?: string;
  bank_statement_image?: string;
  contract_pdf_path?: string;
  rejection_reason?: string;
}

export interface PendingPartnerItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: number;
  created_at?: string;
  partner_info?: PartnerInfoSnapshot;
}

export interface VerifyPartnerRequest {
  action: "approve" | "reject";
  rejection_reason?: string;
}

export const partnerApprovalApi = {
  getPendingList: (): Promise<ApiResponse<PendingPartnerItem[]>> =>
    axiosClient.get("admin/partners/pending-list") as Promise<ApiResponse<PendingPartnerItem[]>>,

  getDetail: (id: number): Promise<ApiResponse<PendingPartnerItem>> =>
    axiosClient.get(`admin/partners/${id}/detail`) as Promise<ApiResponse<PendingPartnerItem>>,

  verify: (id: number, payload: VerifyPartnerRequest): Promise<ApiResponse<null>> =>
    axiosClient.post(`admin/partners/${id}/verify`, payload) as Promise<ApiResponse<null>>,
};

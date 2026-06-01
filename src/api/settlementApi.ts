import axiosClient from "./axiosClient";
import { ApiResponse } from "./types";

export interface SettlementPeriod {
  id: number;
  partner_id: number;
  period_start: string;
  period_end: string;
  issue_date: string;
  total_gmv: number;
  total_commission: number;
  commission_rate: number;
  status: 'draft' | 'issued' | 'paid' | 'disputed' | 'closed';
  issued_at: string | null;
  paid_at: string | null;
  payment_reference: string | null;
  confirmed_by: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  total_adjustments: number;
  net_commission_to_pay: number;
  partner?: {
    id: number;
    name: string;
    email: string;
  };
  adjustments?: {
    id: number;
    amount: number;
    reason: string;
    created_at: string;
    creator?: {
      name: string;
    };
  }[];
}

export interface SettlementLineItem {
  id: number;
  settlement_period_id: number;
  booking_id: number;
  booking_code: string;
  checkout_date: string;
  room_gmv: number;
  services_gmv: number;
  total_gmv: number;
  commission_amount: number;
  snapshot_status: number;
  booking?: {
    room?: {
      title: string;
      property?: {
        title: string;
      };
    };
  };
}

export interface SettlementSummary {
  total_gmv: number;
  total_commission: number;
  pending_commission: number;
  paid_commission: number;
}

export interface DailyReportItem {
  date: string;
  total_gmv: number;
  total_commission: number;
}

export interface MonthlyReportItem {
  month: string;
  total_gmv: number;
  total_commission: number;
}

export const settlementApi = {
  // === Admin APIs ===
  getAdminSettlements: async (filters: any): Promise<ApiResponse<{ items: SettlementPeriod[]; meta: any }>> => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
        params.append(key, String(filters[key]));
      }
    });
    return axiosClient.get(`/admin/settlements?${params.toString()}`);
  },

  getAdminSettlementDetail: async (id: number): Promise<ApiResponse<SettlementPeriod>> => {
    return axiosClient.get(`/admin/settlements/${id}`);
  },

  getAdminSettlementLineItems: async (id: number, filters: any): Promise<ApiResponse<{ items: SettlementLineItem[]; meta: any }>> => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
        params.append(key, String(filters[key]));
      }
    });
    return axiosClient.get(`/admin/settlements/${id}/line-items?${params.toString()}`);
  },

  issueSettlement: async (id: number): Promise<ApiResponse<SettlementPeriod>> => {
    return axiosClient.post(`/admin/settlements/${id}/issue`);
  },

  confirmSettlementPayment: async (id: number, data: { payment_reference: string; note?: string }): Promise<ApiResponse<SettlementPeriod>> => {
    return axiosClient.post(`/admin/settlements/${id}/confirm-payment`, data);
  },

  addSettlementAdjustment: async (id: number, data: { amount: number; reason: string }): Promise<ApiResponse<any>> => {
    return axiosClient.post(`/admin/settlements/${id}/adjustments`, data);
  },

  getAdminSettlementSummary: async (): Promise<ApiResponse<SettlementSummary>> => {
    return axiosClient.get("/admin/settlements/summary");
  },

  getAdminSettlementDailyReport: async (startDate: string, endDate: string): Promise<ApiResponse<DailyReportItem[]>> => {
    return axiosClient.get(`/admin/settlements/report/daily?start_date=${startDate}&end_date=${endDate}`);
  },

  getAdminSettlementMonthlyReport: async (year: string): Promise<ApiResponse<MonthlyReportItem[]>> => {
    return axiosClient.get(`/admin/settlements/report/monthly?year=${year}`);
  },

  // === Partner APIs ===
  getPartnerSettlements: async (filters: any): Promise<ApiResponse<{ items: SettlementPeriod[]; meta: any }>> => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
        params.append(key, String(filters[key]));
      }
    });
    return axiosClient.get(`/partner/settlements?${params.toString()}`);
  },

  getPartnerSettlementDetail: async (id: number): Promise<ApiResponse<SettlementPeriod>> => {
    return axiosClient.get(`/partner/settlements/${id}`);
  },

  getPartnerSettlementLineItems: async (id: number, filters: any): Promise<ApiResponse<{ items: SettlementLineItem[]; meta: any }>> => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
        params.append(key, String(filters[key]));
      }
    });
    return axiosClient.get(`/partner/settlements/${id}/line-items?${params.toString()}`);
  },

  disputeSettlement: async (id: number, reason: string): Promise<ApiResponse<SettlementPeriod>> => {
    return axiosClient.post(`/partner/settlements/${id}/dispute`, { reason });
  },
};

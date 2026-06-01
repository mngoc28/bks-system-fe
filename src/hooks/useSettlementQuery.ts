import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { settlementApi } from "@/api/settlementApi";

// === Admin Hooks ===

export const useAdminSettlementsQuery = (filters: any) => {
  return useQuery({
    queryKey: ["admin", "settlements", filters],
    queryFn: () => settlementApi.getAdminSettlements(filters),
    placeholderData: keepPreviousData,
  });
};

export const useAdminSettlementDetailQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ["admin", "settlement-detail", id],
    queryFn: () => settlementApi.getAdminSettlementDetail(id),
    enabled: enabled && !!id,
  });
};

export const useAdminSettlementLineItemsQuery = (id: number, filters: any) => {
  return useQuery({
    queryKey: ["admin", "settlement-line-items", id, filters],
    queryFn: () => settlementApi.getAdminSettlementLineItems(id, filters),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
};

export const useAdminSettlementSummaryQuery = () => {
  return useQuery({
    queryKey: ["admin", "settlement-summary"],
    queryFn: () => settlementApi.getAdminSettlementSummary(),
  });
};

export const useAdminSettlementDailyReportQuery = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["admin", "settlement-daily-report", startDate, endDate],
    queryFn: () => settlementApi.getAdminSettlementDailyReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

export const useAdminSettlementMonthlyReportQuery = (year: string) => {
  return useQuery({
    queryKey: ["admin", "settlement-monthly-report", year],
    queryFn: () => settlementApi.getAdminSettlementMonthlyReport(year),
    enabled: !!year,
  });
};

// Mutations
export const useIssueSettlementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => settlementApi.issueSettlement(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settlements"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "settlement-detail", id] });
    },
  });
};

export const useConfirmSettlementPaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { payment_reference: string; note?: string } }) =>
      settlementApi.confirmSettlementPayment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settlements"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "settlement-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "settlement-summary"] });
    },
  });
};

export const useAddSettlementAdjustmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { amount: number; reason: string } }) =>
      settlementApi.addSettlementAdjustment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settlements"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "settlement-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "settlement-line-items", id] });
    },
  });
};

// === Partner Hooks ===

export const usePartnerSettlementsQuery = (filters: any) => {
  return useQuery({
    queryKey: ["partner", "settlements", filters],
    queryFn: () => settlementApi.getPartnerSettlements(filters),
    placeholderData: keepPreviousData,
  });
};

export const usePartnerSettlementDetailQuery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ["partner", "settlement-detail", id],
    queryFn: () => settlementApi.getPartnerSettlementDetail(id),
    enabled: enabled && !!id,
  });
};

export const usePartnerSettlementLineItemsQuery = (id: number, filters: any) => {
  return useQuery({
    queryKey: ["partner", "settlement-line-items", id, filters],
    queryFn: () => settlementApi.getPartnerSettlementLineItems(id, filters),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
};

export const useDisputeSettlementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      settlementApi.disputeSettlement(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["partner", "settlements"] });
      queryClient.invalidateQueries({ queryKey: ["partner", "settlement-detail", id] });
    },
  });
};

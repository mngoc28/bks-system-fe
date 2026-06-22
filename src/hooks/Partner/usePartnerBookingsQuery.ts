import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { PARTNER_OPERATIONAL_QUERY_OPTIONS } from '@/lib/queryCache';
import { partnerService } from '@/services/partnerService';
import { normalizePartnerBookings } from '@/utils/partnerBookingNormalize';

export type PartnerBookingsStatusFilter =
  | 'all'
  | 0
  | 1
  | 2
  | 3
  | 4
  | 'in_stay'
  | 'no_show'
  | 'deposit_unpaid'
  | 'deposit_submitted'
  | 'payment_unpaid';

export type PartnerBookingsListParams = {
  page: number;
  per_page: number;
  keyword?: string;
  room_id?: number;
  status?: number;
  stay_status?: string;
  deposit_status?: string;
  payment_status?: string;
};

export const buildPartnerBookingsListParams = (input: {
  page: number;
  pageSize: number;
  keyword: string;
  statusFilter: PartnerBookingsStatusFilter;
  roomIdFromUrl: string | null;
}): PartnerBookingsListParams => {
  const params: PartnerBookingsListParams = {
    page: input.page,
    per_page: input.pageSize,
    keyword: input.keyword || undefined,
  };

  if (input.roomIdFromUrl) {
    params.room_id = Number(input.roomIdFromUrl);
  }

  const { statusFilter } = input;
  if (statusFilter === 'in_stay') {
    params.stay_status = 'checked_in';
    params.status = 1;
  } else if (statusFilter === 'no_show') {
    params.stay_status = 'no_show';
    params.status = 1;
  } else if (statusFilter === 'deposit_unpaid') {
    params.status = 1;
    params.deposit_status = 'pending';
  } else if (statusFilter === 'deposit_submitted') {
    params.status = 1;
    params.deposit_status = 'payment_submitted';
  } else if (statusFilter === 'payment_unpaid') {
    params.payment_status = 'unpaid';
  } else if (statusFilter !== 'all') {
    params.status = statusFilter as number;
  }

  return params;
};

export const parsePartnerBookingsListResponse = (res: unknown, pageSize: number) => {
  const resBody = (res as any)?.data || res;
  const paginator =
    resBody?.data && typeof resBody.data === 'object' && !Array.isArray(resBody.data)
      ? resBody.data
      : resBody;

  const rawData = Array.isArray(paginator.data)
    ? paginator.data
    : Array.isArray(paginator)
      ? paginator
      : [];
  const totalCount = paginator.total ?? rawData.length;
  const pagesCount =
    paginator.last_page ?? (paginator.total ? Math.ceil(paginator.total / pageSize) : 1);

  return {
    bookings: normalizePartnerBookings(rawData),
    totalItems: totalCount,
    totalPages: pagesCount,
  };
};

export const partnerBookingsListQueryKey = (params: PartnerBookingsListParams) =>
  ['partner', 'bookings', params] as const;

export const usePartnerBookingsListQuery = (params: PartnerBookingsListParams, enabled = true) => {
  return useQuery({
    queryKey: partnerBookingsListQueryKey(params),
    queryFn: async ({ signal }) => {
      const res = await partnerService.getBookings(params, { signal });
      return parsePartnerBookingsListResponse(res, params.per_page);
    },
    enabled,
    placeholderData: keepPreviousData,
    ...PARTNER_OPERATIONAL_QUERY_OPTIONS,
  });
};

export const usePartnerBookingSummaryQuery = (panelKey = 0) => {
  return useQuery({
    queryKey: ['partner-booking-summary', panelKey],
    queryFn: async ({ signal }) => {
      const res: any = await partnerService.getBookingSummary({ signal });
      return res?.data?.data ?? res?.data ?? res;
    },
    ...PARTNER_OPERATIONAL_QUERY_OPTIONS,
  });
};

export const useInvalidatePartnerBookings = () => {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['partner', 'bookings'] }),
      queryClient.invalidateQueries({ queryKey: ['partner-booking-summary'] }),
    ]);
  };
};

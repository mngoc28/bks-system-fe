export const HOMEPAGE_QUERY_STALE_TIME = 10 * 60 * 1000;
export const HOMEPAGE_QUERY_GC_TIME = 30 * 60 * 1000;
export const ROOM_SEARCH_QUERY_STALE_TIME = 60 * 1000;
export const ROOM_SEARCH_QUERY_GC_TIME = 10 * 60 * 1000;
export const PUBLIC_STATIC_QUERY_STALE_TIME = 10 * 60 * 1000;
export const PUBLIC_STATIC_QUERY_GC_TIME = 30 * 60 * 1000;
export const PUBLIC_DETAIL_QUERY_STALE_TIME = 5 * 60 * 1000;
export const PUBLIC_DETAIL_QUERY_GC_TIME = 15 * 60 * 1000;
export const BOOKED_DATES_QUERY_STALE_TIME = 30 * 1000;
export const BOOKED_DATES_QUERY_GC_TIME = 5 * 60 * 1000;

/** Loại BĐS — cố định toàn hệ thống, hiếm khi đổi. */
export const SYSTEM_CONFIG_QUERY_STALE_TIME = 60 * 60 * 1000;
export const SYSTEM_CONFIG_QUERY_GC_TIME = 2 * 60 * 60 * 1000;

/** Tỉnh / phường — master data, hiếm khi đổi. */
export const MASTER_DATA_QUERY_STALE_TIME = 24 * 60 * 60 * 1000;
export const MASTER_DATA_QUERY_GC_TIME = 24 * 60 * 60 * 1000 + 30 * 60 * 1000;

/** Catalog dịch vụ / tiện ích partner — ít biến động. */
export const CATALOG_QUERY_STALE_TIME = 10 * 60 * 1000;
export const CATALOG_QUERY_GC_TIME = 30 * 60 * 1000;

/** Báo cáo partner theo timeRange — aggregate, không cần realtime. */
export const PARTNER_REPORTS_QUERY_STALE_TIME = 10 * 60 * 1000;
export const PARTNER_REPORTS_QUERY_GC_TIME = 30 * 60 * 1000;

/** Partner vận hành (booking, cancellation, notification) — có realtime invalidate. */
export const PARTNER_OPERATIONAL_QUERY_STALE_TIME = 60 * 1000;
export const PARTNER_OPERATIONAL_QUERY_GC_TIME = 5 * 60 * 1000;

/** Partner đối soát / settlements. */
export const PARTNER_FINANCE_QUERY_STALE_TIME = 3 * 60 * 1000;
export const PARTNER_FINANCE_QUERY_GC_TIME = 10 * 60 * 1000;

/** Partner hợp đồng. */
export const PARTNER_CONTRACT_QUERY_STALE_TIME = 2 * 60 * 1000;
export const PARTNER_CONTRACT_QUERY_GC_TIME = 10 * 60 * 1000;

/** Partner chi tiết phòng (tabs lazy). */
export const PARTNER_ROOM_DETAIL_QUERY_STALE_TIME = 2 * 60 * 1000;
export const PARTNER_ROOM_DETAIL_QUERY_GC_TIME = 10 * 60 * 1000;

/** Partner danh sách phòng theo tài sản / occupancy. */
export const PARTNER_ROOM_LIST_QUERY_STALE_TIME = 60 * 1000;
export const PARTNER_ROOM_LIST_QUERY_GC_TIME = 5 * 60 * 1000;

/** Partner quy tắc giá — ít biến động. */
export const PARTNER_PRICE_RULES_QUERY_STALE_TIME = 5 * 60 * 1000;
export const PARTNER_PRICE_RULES_QUERY_GC_TIME = 15 * 60 * 1000;

export const HOMEPAGE_QUERY_OPTIONS = {
  staleTime: HOMEPAGE_QUERY_STALE_TIME,
  gcTime: HOMEPAGE_QUERY_GC_TIME,
} as const;

export const ROOM_SEARCH_QUERY_OPTIONS = {
  staleTime: ROOM_SEARCH_QUERY_STALE_TIME,
  gcTime: ROOM_SEARCH_QUERY_GC_TIME,
} as const;

export const PUBLIC_STATIC_QUERY_OPTIONS = {
  staleTime: PUBLIC_STATIC_QUERY_STALE_TIME,
  gcTime: PUBLIC_STATIC_QUERY_GC_TIME,
} as const;

export const PUBLIC_DETAIL_QUERY_OPTIONS = {
  staleTime: PUBLIC_DETAIL_QUERY_STALE_TIME,
  gcTime: PUBLIC_DETAIL_QUERY_GC_TIME,
} as const;

export const BOOKED_DATES_QUERY_OPTIONS = {
  staleTime: BOOKED_DATES_QUERY_STALE_TIME,
  gcTime: BOOKED_DATES_QUERY_GC_TIME,
} as const;

export const SYSTEM_CONFIG_QUERY_OPTIONS = {
  staleTime: SYSTEM_CONFIG_QUERY_STALE_TIME,
  gcTime: SYSTEM_CONFIG_QUERY_GC_TIME,
} as const;

export const MASTER_DATA_QUERY_OPTIONS = {
  staleTime: MASTER_DATA_QUERY_STALE_TIME,
  gcTime: MASTER_DATA_QUERY_GC_TIME,
} as const;

export const CATALOG_QUERY_OPTIONS = {
  staleTime: CATALOG_QUERY_STALE_TIME,
  gcTime: CATALOG_QUERY_GC_TIME,
} as const;

export const PARTNER_REPORTS_QUERY_OPTIONS = {
  staleTime: PARTNER_REPORTS_QUERY_STALE_TIME,
  gcTime: PARTNER_REPORTS_QUERY_GC_TIME,
} as const;

export const PARTNER_OPERATIONAL_QUERY_OPTIONS = {
  staleTime: PARTNER_OPERATIONAL_QUERY_STALE_TIME,
  gcTime: PARTNER_OPERATIONAL_QUERY_GC_TIME,
} as const;

export const PARTNER_FINANCE_QUERY_OPTIONS = {
  staleTime: PARTNER_FINANCE_QUERY_STALE_TIME,
  gcTime: PARTNER_FINANCE_QUERY_GC_TIME,
} as const;

export const PARTNER_CONTRACT_QUERY_OPTIONS = {
  staleTime: PARTNER_CONTRACT_QUERY_STALE_TIME,
  gcTime: PARTNER_CONTRACT_QUERY_GC_TIME,
} as const;

export const PARTNER_ROOM_DETAIL_QUERY_OPTIONS = {
  staleTime: PARTNER_ROOM_DETAIL_QUERY_STALE_TIME,
  gcTime: PARTNER_ROOM_DETAIL_QUERY_GC_TIME,
} as const;

export const PARTNER_ROOM_LIST_QUERY_OPTIONS = {
  staleTime: PARTNER_ROOM_LIST_QUERY_STALE_TIME,
  gcTime: PARTNER_ROOM_LIST_QUERY_GC_TIME,
} as const;

export const PARTNER_PRICE_RULES_QUERY_OPTIONS = {
  staleTime: PARTNER_PRICE_RULES_QUERY_STALE_TIME,
  gcTime: PARTNER_PRICE_RULES_QUERY_GC_TIME,
} as const;

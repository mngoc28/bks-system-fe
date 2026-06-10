/**
 * Partner Portal 360 feature flag (FE side).
 *
 * Mirror của BE config `partner_360_enabled` thông qua biến môi trường
 * `VITE_PARTNER_REALTIME` (mặc định bật). Khi tắt:
 *  - Echo client trong `lib/echoClient.ts` không khởi tạo → không subscribe
 *    private channels.
 *  - Các UI Phase 3+ (quick confirm, bulk action, calendar block, contract
 *    renewal/terminate) đọc `isPartner360Enabled()` để ẩn nút/menu thay vì
 *    render và để user chạm phải 403 từ server.
 */
const RAW_FLAG = import.meta.env.VITE_PARTNER_REALTIME;

export const PARTNER_360_FLAG_VALUE: string =
  typeof RAW_FLAG === 'string' ? RAW_FLAG : 'true';

export const isPartner360Enabled = (): boolean =>
  String(PARTNER_360_FLAG_VALUE).toLowerCase() !== 'false';

export const isPartnerRealtimeEnabled = (): boolean => isPartner360Enabled();

/**
 * Partner sidebar items hidden for release slice (routes/pages remain).
 * Re-enable by removing path from this list.
 */
export const PARTNER_SIDEBAR_DISABLED_PATHS: readonly string[] = [
  '/partner/calendar',
  '/partner/chat',
  '/partner/stay-services',
  '/partner/news',
  '/partner/reports',
];

export const isPartnerSidebarItemEnabled = (path: string): boolean =>
  !PARTNER_SIDEBAR_DISABLED_PATHS.includes(path);

/** Tạm tắt Lịch khả dụng — workflow duyệt/IN-OUT đã có trên Bookings. Bật lại: xóa path khỏi PARTNER_SIDEBAR_DISABLED_PATHS. */
export const isPartnerCalendarEnabled = (): boolean =>
  isPartnerSidebarItemEnabled('/partner/calendar');

/**
 * Partner Portal chưa i18n đầy đủ (phần lớn label VI cố định).
 * Bật khi toàn bộ màn partner dùng i18n keys.
 */
export const isPartnerI18nEnabled = (): boolean => false;

/**
 * BKS Stay Portal — màn ẩn cho release slice (route vẫn tồn tại, redirect về dashboard).
 * Bật lại bằng cách xóa path khỏi danh sách.
 */
export const BKS_STAY_DISABLED_PATHS: readonly string[] = [
  '/bks-stay/services',
  '/bks-stay/guide',
];

export const isBksStayRouteEnabled = (path: string): boolean =>
  !BKS_STAY_DISABLED_PATHS.includes(path);

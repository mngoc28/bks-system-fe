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

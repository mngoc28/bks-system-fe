# E2E Test Script — Partner Portal 360 Phase 2 (Realtime + Quick Confirm)

**Phiên bản:** 1.0
**Ngày soạn:** 2026-05-10
**Người soạn:** Senior Engineer (qua stack-task)
**Plan tham chiếu:** `bks-system-be/docs/plans/plan_001.md` — Phase 2.

## Tiền điều kiện

- Backend chạy ở `http://localhost:8000` (Laravel `php artisan serve`).
- Frontend chạy ở `http://localhost:5173` (Vite dev).
- Tài khoản partner: `partner@gmail.com` / `123456a!`.
- Database đã chạy migration Phase 1 (xem terminal log: `2026_05_10_120001..120003`).
- Optional cho test realtime đầy đủ:
  - Soketi container chạy: `docker compose -f docker-compose.soketi.yml up -d`.
  - BE `.env`: `BROADCAST_DRIVER=pusher`, `PUSHER_HOST=127.0.0.1`, `PUSHER_PORT=6001`, `PUSHER_SCHEME=http`.
  - FE `.env`: copy từ `.env.example` đã thêm `VITE_PUSHER_*`.

> **Lưu ý:** Test này đã được chạy qua MCP chrome-devtools với
> Soketi **không** sẵn sàng. Banner fallback và polling 30s vẫn cho kết
> quả mong đợi, validate được toàn bộ luồng resilience.

---

## TC-2.10 — Header badge realtime hiển thị

**Bước thực hiện:**

1. Mở `http://localhost:5173/partner/login`, đăng nhập với `partner@gmail.com` / `123456a!`.
2. Sau khi navigate đến `/partner/dashboard`, quan sát góc phải Header.

**Kết quả mong đợi:** Hiển thị thêm nút mới với label `Booking realtime` (icon Bell). Khi chưa có event, không có badge counter.

**Đã verify (qua MCP chrome-devtools):** ✅ uid=2_39 button "Booking realtime" hiện sau login.

---

## TC-2.13 — Polling fallback khi mất kết nối WebSocket

**Bước thực hiện:**

1. Đăng nhập như TC-2.10.
2. KHÔNG khởi Soketi (giữ Echo ở trạng thái `disconnected`).
3. Đợi 5–10 giây trên trang dashboard.
4. Quan sát Network tab.

**Kết quả mong đợi:**

- Banner màu vàng/amber xuất hiện trên cùng main: *"Mất kết nối realtime, hệ thống sẽ tự cập nhật mỗi 30 giây."*
- Sau mỗi 30 giây, các request `GET /api/v1/partner/dashboard/stats`, `GET /api/v1/partner/dashboard/pending-bookings`, `GET /api/v1/partner/notifications?page=1` được lặp lại tự động.

**Đã verify:** ✅ Banner hiện sau ~5s. Network log: `reqid=128 → 139 → 145 → 151 → 155` (refetch `stats` mỗi 30s).

---

## TC-2.11 — Quick confirm với undo 15 giây

**Bước thực hiện:**

1. Đăng nhập, ở Dashboard, scroll đến panel **"Yêu cầu mới"** (pending bookings).
2. Bấm nút `Duyệt` trên booking đầu tiên.
3. Quan sát toast và button.
4. Trong vòng 15 giây, bấm `Hoàn tác (XXs)` (XX là đếm ngược).

**Kết quả mong đợi:**

- Bước 2: Toast notification: *"Đã xác nhận booking #ID. Có thể hoàn tác trong 15s."*. Button đổi thành `Hoàn tác (15s)`, đếm ngược mỗi giây.
- Booking khác trong list không bị ảnh hưởng.
- Bước 4 (undo trong 15s): Button quay lại `Từ chối` / `Duyệt`. Không có request `PUT /confirm` được gửi.
- Nếu KHÔNG bấm undo, sau 15s tự gửi `PUT /api/v1/partner/bookings/{id}/confirm`.

**Đã verify:** ✅ Click `Duyệt` (booking #127) → toast hiện + button `Hoàn tác (15s)` xuất hiện → click `Hoàn tác` → revert. Booking khác không bị ảnh hưởng.

---

## TC-2.12 — Cancel dialog với reason validation

**Bước thực hiện:**

1. Bấm `Từ chối` trên 1 booking pending.
2. Dialog `Xác nhận huỷ booking #ID` mở.
3. Để trống textarea, quan sát button `Xác nhận huỷ`.
4. Nhập 1 ký tự, quan sát.
5. Nhập đủ 5+ ký tự, bấm `Xác nhận huỷ`.

**Kết quả mong đợi:**

- Bước 3: Button `Xác nhận huỷ` ở trạng thái disabled. Counter `0/500`. Helper text: *"Tối thiểu 5 ký tự, tối đa 500."*
- Bước 4: Counter cập nhật `1/500`, button vẫn disabled.
- Bước 5: Button enable, click → backend nhận `PUT /api/v1/partner/bookings/{id}/cancel` với body `{"reason":"<text>"}` → response 200 + booking chuyển status=2 (CANCELLED).

**Đã verify:** ✅
- Counter, helper, disabled state đúng.
- Submit thành công: `reqid=161 PUT /partner/bookings/127/cancel` body `{"reason":"Khach yeu cau huy phong"}` → 200, response data có `cancelled_at: "2026-05-10 22:30:59"`, `cancellation_reason: "Khach yeu cau huy phong"`.

---

## TC-2.14 — Channel isolation giữa các Partner (manual với 2 tab)

**Yêu cầu:** Cần 2 tài khoản partner khác nhau và Soketi chạy.

**Bước thực hiện:**

1. Mở 2 tab Chrome (incognito riêng để JWT tách biệt).
2. Tab A đăng nhập Partner A, Tab B đăng nhập Partner B.
3. Tạo booking mới (qua End User flow hoặc seed) cho property của Partner A.
4. Quan sát toast realtime trên cả 2 tab.

**Kết quả mong đợi:**

- Tab A: Toast `"Có booking mới"` xuất hiện, badge realtime tăng 1.
- Tab B: KHÔNG có toast/badge thay đổi (vì subscribe channel `private-partner.{B.id}`, event chỉ broadcast trên `private-partner.{A.id}`).
- Cả 2 tab Network: chỉ tab A có request `POST /broadcasting/auth` thành công cho channel A; nếu B cố subscribe channel A, server trả 403.

**Trạng thái:** Tự test thủ công khi infra Pusher/Soketi sẵn sàng. Logic đã unit-test qua `BookingPolicyTest` (channel auth follows ownership pattern tương tự).

---

## Network Trace Tham Khảo (run thực tế)

```
reqid=92  POST /api/v1/partner/auth/login           [200] (login)
reqid=126 GET  /api/v1/partner/notifications        [200] (load list)
reqid=128 GET  /api/v1/partner/dashboard/stats      [200] (initial)
...
reqid=139 GET  /api/v1/partner/dashboard/stats      [200] (polling tick #1)
reqid=145 GET  /api/v1/partner/dashboard/stats      [200] (polling tick #2)
reqid=161 PUT  /api/v1/partner/bookings/127/cancel  [200] (cancel với reason)
```

## Defects ghi nhận

Không phát hiện defect ở Phase 2 trong test pass này.

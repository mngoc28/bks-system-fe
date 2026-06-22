# E2E Test Script — Partner Maintenance (PLAN-MNT-014 Phase 4)

**Phiên bản:** 1.0  
**Ngày soạn:** 2026-06-18  
**Plan tham chiếu:** `bks-system-be/docs/plans/plan_014_partner_maintenance.md`  
**SRS tham chiếu:** `bks-system-be/docs/SRC/srs_partner_maintenance.md`

## Tiền điều kiện

- Backend: `http://localhost:8000` (`php artisan serve`).
- Frontend: `http://localhost:5173` (Vite dev).
- Tài khoản partner: `partner@gmail.com` / `123456a!` (hoặc partner có ≥1 property + 2 rooms).
- Migration đã chạy: `2026_06_18_120000_extend_room_maintenances_for_partner_lifecycle`.
- Có ít nhất 1 phòng **không** có booking overlap trong 7 ngày tới (để test `block_calendar=true`).
- Optional realtime (TC-MNT-08): Soketi + `VITE_PARTNER_REALTIME=true`.

---

## S-MNT-01 — Tạo phiếu khẩn cấp + khóa lịch (Room Detail)

**Mục tiêu:** Validate `POST /partner/room-maintenances` với `maintenance_type=emergency`, `block_calendar=true`.

**Bước:**

1. Login partner → vào `/partner/properties` → mở 1 phòng → tab **Bảo trì**.
2. Bấm **Đăng ký bảo trì**.
3. Chọn loại **Sự cố khẩn cấp**, nhập tiêu đề + mô tả.
4. Chọn ngày bắt đầu = hôm nay, ngày hoàn thành = +3 ngày.
5. Giữ bật **Khóa lịch đặt phòng trong thời gian bảo trì**.
6. Bấm **Xác nhận đăng ký**.

**Kỳ vọng:**

- Toast thành công; phiếu xuất hiện tab Bảo trì với trạng thái **Chờ xử lý**.
- Network: `POST /api/v1/partner/room-maintenances` → 201, body có `status=planned`, `block_calendar=true`.
- Vào `/partner/calendar` → thấy block loại **Bảo trì** trùng khoảng ngày vừa tạo.

**Đã verify:** [Manual]

---

## S-MNT-02 — Dashboard urgent + Tiếp nhận (CTA)

**Mục tiêu:** Widget Dashboard hiển thị phiếu khẩn cấp và nút **Tiếp nhận** gọi PATCH.

**Bước:**

1. Sau S-MNT-01, vào `/partner/dashboard`.
2. Kiểm tra section **Bảo trì & Sự cố khẩn cấp** có card phòng vừa tạo.
3. Bấm **Tiếp nhận** trên card.
4. Bấm tên phòng trên card.

**Kỳ vọng:**

- Bước 3: `PATCH /api/v1/partner/room-maintenances/{id}` body `{ status: "in_progress" }` → 200; badge đổi **Đang sửa**; nút Tiếp nhận biến mất.
- Bước 4: Navigate tới `/partner/rooms/{roomId}` mở tab **Bảo trì**.
- `GET /partner/dashboard/urgent-maintenances` ưu tiên `emergency` trước `scheduled`.

**Đã verify:** [Manual]

---

## S-MNT-03 — Danh sách bảo trì: filter + lifecycle hoàn thành

**Mục tiêu:** Màn `/partner/maintenances` đồng bộ API lifecycle.

**Bước:**

1. Vào `/partner/maintenances`.
2. Filter trạng thái **Đang xử lý** → thấy phiếu S-MNT-02.
3. Bấm **Xong**.
4. Filter **Đã hoàn thành**.

**Kỳ vọng:**

- Bước 3: `PATCH { status: "completed" }` → 200; toast thành công.
- Bước 4: Phiếu nằm trong danh sách hoàn thành.
- Pagination: response có `current_page`, `total`, `last_page`.

**Đã verify:** [Manual] — Feature test BE `PartnerRoomMaintenanceTest` cover API lifecycle.

---

## S-MNT-04 — Calendar regression: block biến mất sau complete

**Mục tiêu:** US-04 — complete maintenance → block sync release → calendar mở slot.

**Bước:**

1. Sau S-MNT-03 (phiếu đã `completed`), mở `/partner/calendar`.
2. Tìm phòng và khoảng ngày của phiếu S-MNT-01.
3. (Regression) Thử drag-drop 1 booking confirmed trong tháng — không crash.

**Kỳ vọng:**

- Block bảo trì **không còn** hiển thị trên calendar (hoặc biến mất sau refetch / event `room_block.changed`).
- Drag-drop booking vẫn hoạt động như trước Phase 4 (không regression).
- `useBookingsRealtime` invalidate `partner/calendar` khi nhận `room_block.changed`.

**Đã verify:** [Manual]

---

## S-MNT-05 — Conflict 409 khi trùng booking

**Mục tiêu:** `MAINTENANCE_CALENDAR_CONFLICT` khi `block_calendar=true` overlap booking.

**Bước:**

1. Chọn phòng đã có booking **confirmed** trong khoảng ngày cố định.
2. Tạo phiếu bảo trì cùng khoảng, `block_calendar=true`, có `end_time`.
3. Quan sát dialog lỗi.

**Kỳ vọng:**

- HTTP 409, code `MAINTENANCE_CALENDAR_CONFLICT`.
- FE hiển thị danh sách booking/block conflict; form **không** đóng.
- Tạo lại cùng khoảng với `block_calendar=false` → **201** (ghi nhận không khóa lịch).

**Đã verify:** [Manual]

---

## TC-MNT-06 — Hủy phiếu + mở lại lịch

**Bước:**

1. Tạo phiếu `planned` với `block_calendar=true`.
2. Xác nhận block trên calendar.
3. Bấm **Hủy** → nhập lý do → xác nhận.

**Kỳ vọng:**

- `PATCH { status: "cancelled", cancellation_reason: "..." }` → 200.
- Block liên kết bị gỡ; calendar refetch không còn block đó.

**Đã verify:** [Manual]

---

## TC-MNT-07 — Properties badge "Đang bảo trì" (MNT-013)

**Bước:**

1. Tạo phiếu active (`planned`/`in_progress`) bao phủ **hôm nay** cho 1 phòng.
2. Vào `/partner/properties`, expand property chứa phòng đó.

**Kỳ vọng:**

- Badge phòng hiển thị **Đang bảo trì** (màu amber).
- API room preview trả `occupancy_status: "maintenance"`.

**Đã verify:** [Manual]

---

## TC-MNT-08 — Realtime calendar invalidation (optional)

**Điều kiện:** Soketi + realtime bật.

**Bước:**

1. Mở 2 tab: `/partner/calendar` và `/partner/maintenances`.
2. Tab 2: complete 1 phiếu có block.
3. Quan sát tab 1 không cần F5.

**Kỳ vọng:**

- Tab calendar tự refetch sau event `room_block.changed` (≤ 5s nếu polling fallback).

**Đã verify:** [Manual / Optional]

---

## S-MNT-06 — Conflict preview trước khi submit

**Mục tiêu:** Dialog tạo bảo trì gọi `GET conflict-preview` và chặn submit khi khóa lịch trùng booking.

**Bước:**

1. Vào `/partner/rooms/{id}` có booking confirmed overlap → mở **Đăng ký bảo trì**.
2. Chọn ngày trùng booking, bật **Khóa lịch**.
3. Quan sát panel cảnh báo và nút **Xác nhận đăng ký**.
4. Bấm **Tắt khóa lịch** hoặc **Đổi ngày**.
5. Lặp trên PropertyRooms (nút Wrench sơ đồ phòng).

**Kỳ vọng:**

- Panel đỏ + danh sách booking/block; nút Xác nhận **disabled** khi `block_calendar=true` và `has_conflict=true`.
- Banner **Khách đang ở phòng** hiện khi có `current_stay`.
- CTA: Đổi ngày, Tắt khóa lịch, Xem booking.
- Tắt khóa lịch → panel vàng, nút Xác nhận enable.

**Đã verify:** [Manual]

---

## Checklist release Phase 4

| # | Hạng mục | Pass |
|---|----------|------|
| 1 | Dashboard CTA Tiếp nhận | ☐ |
| 2 | Navigate room từ dashboard card | ☐ |
| 3 | Calendar hiện block khi tạo maintenance | ☐ |
| 4 | Calendar mất block khi complete/cancel | ☐ |
| 5 | Properties badge Đang bảo trì | ☐ |
| 6 | Conflict preview + 409 UI | ☐ |
| 7 | BE feature tests 6/6 green | ☐ |

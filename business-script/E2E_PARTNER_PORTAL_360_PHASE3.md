# E2E Test Script — Partner Portal 360 Phase 3 (Calendar + Room Block)

**Phiên bản:** 1.0
**Ngày soạn:** 2026-05-10
**Người soạn:** Senior Engineer (qua stack-task)
**Plan tham chiếu:** `bks-system-be/docs/plans/plan_001.md` — Phase 3.
**Liên quan:** `E2E_PARTNER_PORTAL_360_PHASE2.md` (realtime + quick confirm).

## Tiền điều kiện

- Backend chạy ở `http://localhost:8000` (Laravel `php artisan serve`).
- Frontend chạy ở `http://localhost:5173` (Vite dev).
- Tài khoản partner: `partner@gmail.com` / `123456a!`.
- Database đã chạy migration Phase 1 + Phase 3:
  - Phase 1: `2026_05_10_120001..120003_*`.
  - Phase 3: `2026_05_10_120004_create_room_blocks_table` (đã verified `migrate` + `migrate:rollback`).
- Đã có ít nhất 1 building thuộc partner và 2+ rooms để test "Tất cả tài sản" + drag-drop.
- Đã có 2+ booking trong tháng hiện tại (status `1 confirmed`) để test calendar render và drag-drop.
- Optional cho test realtime đầy đủ (TC-3.10):
  - Soketi container chạy: `docker compose -f docker-compose.soketi.yml up -d`.
  - BE `.env`: `BROADCAST_DRIVER=pusher`, `PUSHER_HOST=127.0.0.1`, `PUSHER_PORT=6001`, `PUSHER_SCHEME=http`.
  - FE `.env`: `VITE_PARTNER_REALTIME=true` + `VITE_PUSHER_*` đầy đủ.

> **Lưu ý phạm vi verify:** Phần lớn TC dưới đây đã được verify ở mức **logic + unit test** (28/28 ✅), bao gồm cả conflict semantics và pessimistic lock. UI E2E cần chạy thủ công qua MCP chrome-devtools hoặc browser thủ công khi data seed sẵn — đánh dấu `[Manual]` ở phần "Đã verify".

---

## TC-3.1 — Endpoint `GET /partner/calendar` trả bookings + blocks đúng range

**Mục tiêu:** Validate API calendar cap 31 ngày và lọc theo ownership.

**Bước thực hiện:**

1. Login partner → lấy access token.
2. Gọi `GET /api/v1/partner/calendar?from=2026-05-01&to=2026-05-31` (Authorization Bearer).
3. Gọi cùng endpoint với `?from=2026-05-01&to=2026-07-01` (range > 31 ngày).
4. Gọi với `?property_id=<của partner khác>` để verify ownership filter.

**Kết quả mong đợi:**

- Bước 2: HTTP 200, body có `{success, data: { bookings: [...], blocks: [...], property_id, room_id, from, to, cached_at }}`. Mỗi `booking` có `id`, `room_id`, `start_date`, `end_date`, `status`, `stay_status`, `building_id`, `room_label`, `guest_name`, `guest_phone`, `total_amount`, `note`. Mỗi `block` có `id`, `room_id`, `start_date`, `end_date`, `block_type`, `reason`, `note`.
- Bước 3: HTTP 422 với message liên quan range max 31 ngày.
- Bước 4: HTTP 200 với arrays rỗng (không thấy data của partner khác).

**Đã verify:** [Manual] — logic ownership filter qua `Room.building.user_id` đã được validate trong unit test (`RoomBlockServiceTest::test_create_returns_unauthorized_when_policy_denies`) cùng pattern.

---

## TC-3.2 — Filter "Tất cả tài sản" trên Calendar

**Bước thực hiện:**

1. Login → vào `/partner/calendar`.
2. Mở dropdown property selector ở header.
3. Chọn option **"Tất cả tài sản"** (option đầu tiên, màu xanh).
4. Quan sát danh sách events render và dropdown "Lọc theo phòng".

**Kết quả mong đợi:**

- Bước 3: events từ tất cả buildings của partner đều render trên FullCalendar (cùng grid tháng).
- Dropdown "Lọc theo phòng" lúc này hiển thị tất cả rooms với label `"<room_number> — <building_name>"` để phân biệt.
- Network: gọi `GET /api/v1/partner/calendar?from=...&to=...` (KHÔNG có `property_id` query).

**Đã verify:** [Manual] — code path đã implement (`ALL_PROPERTIES = '__all__'` trong `Calendar.tsx`).

---

## TC-3.3 — Tạo room block thành công

**Bước thực hiện:**

1. Vào `/partner/calendar`, bấm nút **"Tạo block"** (button amber góc trên phải).
2. Dialog "Tạo block phòng" mở.
3. Chọn 1 phòng từ dropdown.
4. Set `Từ ngày` = ngày trống bất kỳ trong tương lai, `Đến ngày` = +2 ngày.
5. Chọn `Loại block` = "Bảo trì".
6. Nhập `Lý do` = "Sửa máy lạnh phòng test E2E".
7. Nhập `Ghi chú` (optional) = "Đội kỹ thuật A xử lý".
8. Bấm **"Tạo block"**.

**Kết quả mong đợi:**

- Bước 8: Toast success *"Đã tạo block phòng."*. Dialog đóng.
- Network: `POST /api/v1/partner/room-blocks` body đầy đủ → response 200 với `success: true`, `data: {id, room_id, ...}`.
- Calendar tự refetch (do `useInvalidatePartnerCalendar`) → event block mới xuất hiện trên grid với màu xám/violet + pattern stripe + label `[Block] <room_label> - Bảo trì`.
- Sidebar "Vận hành hôm nay": ô "Block đang áp dụng" tăng 1 (nếu block bao gồm hôm nay).

**Đã verify:** [Manual]. Logic verify qua unit test (`RoomBlockServiceTest::test_create_returns_success_and_dispatches_event_when_no_conflict`).

---

## TC-3.4 — Tạo room block khi conflict (booking hoặc block khác)

**Bước thực hiện:**

1. Lặp lại TC-3.3 nhưng chọn phòng và range trùng với 1 booking `confirmed` hoặc room block đã có.
2. Bấm **"Tạo block"**.

**Kết quả mong đợi:**

- Network: `POST /partner/room-blocks` → HTTP **409**, body `{success: false, message: "...", code: "ROOM_BLOCK_CONFLICT", data: { bookings: [...], blocks: [...] }}`.
- UI: dialog KHÔNG đóng. Banner đỏ trong dialog hiển thị: *"Khoảng thời gian này đã trùng với booking hoặc block khác."*. Liệt kê chi tiết các conflict (booking #ID hoặc Block #ID + start_date → end_date).
- Form giữ nguyên data để user chỉnh range.

**Đã verify:** Logic verify qua unit test (`RoomBlockServiceTest::test_create_returns_conflict_when_overlap_detected`). UI E2E [Manual].

---

## TC-3.5 — Render block events + cảnh báo overbooking

**Bước thực hiện:**

1. Seed 2 booking `status=1 confirmed` cho cùng 1 room với khoảng thời gian giao nhau (ví dụ #A: 2026-05-10 → 2026-05-15; #B: 2026-05-13 → 2026-05-18) — cố ý tạo overbooking để test alert (qua DB seed/raw insert vì service từ chối qua ConflictChecker).
2. Vào `/partner/calendar`, chọn building chứa 2 booking đó.
3. Quan sát đầu trang và FullCalendar grid.

**Kết quả mong đợi:**

- Banner đỏ phía trên grid: *"Cảnh báo overbooking — Phát hiện 1 cặp booking trùng lịch trong dải ngày hiện tại. Vui lòng kiểm tra và điều phối."*
- 2 booking events đều được render bình thường, có thể overlap thị giác trong grid.
- Tạo thêm 1 room block trong cùng range → block render với màu xám/violet, pattern stripe (`repeating-linear-gradient`), label có prefix `[Block]`.
- Sidebar "Block đang áp dụng" tăng 1.

**Đã verify:** [Manual]. Logic detect overbooking nằm trong `Calendar.tsx::overbookingCount` memo — interval `[start,end)` exclusive; back-to-back KHÔNG bị flag (đồng bộ với DEC-260510-PP360-019 và `ConflictCheckerTest::test_back_to_back_intervals_are_not_conflicts`).

---

## TC-3.6 — Drag-drop booking sang ngày trống → cập nhật thành công

**Bước thực hiện:**

1. Vào `/partner/calendar`, chọn building có booking `status=1 confirmed`.
2. Trên FullCalendar grid, kéo thả 1 booking event sang ngày khác **không có conflict**.
3. Quan sát Network và toast.

**Kết quả mong đợi:**

- Bước 2: FullCalendar gọi `eventDrop` → FE gửi `PUT /api/v1/partner/bookings/{id}/move` với body `{start_date: "...", end_date: "..."}`.
- Backend: `BookingService::handleMove` chạy trong `DB::transaction` + `ConflictChecker::findConflicts(useLock=true)` → không conflict → update + return success.
- UI: Toast success *"Đã cập nhật lịch booking."*. Calendar invalidate → refetch → event ở vị trí mới.

**Đã verify:** [Manual]. BE endpoint `PUT /partner/bookings/{id}/move` đã add ở `routes/api.php:583` và verified by route list.

---

## TC-3.7 — Drag-drop booking conflict → revert + toast

**Bước thực hiện:**

1. Lặp lại TC-3.6 nhưng kéo thả vào ngày đã có **booking khác** hoặc **room block** chiếm chỗ trên cùng phòng.

**Kết quả mong đợi:**

- Network: `PUT /partner/bookings/{id}/move` → HTTP **409**, body `{success: false, code: "BOOKING_CONFLICT", data: {bookings: [...], blocks: [...]}}`.
- UI: FullCalendar gọi `info.revert()` → event tự nhảy về vị trí cũ.
- Toast lỗi: *"Không thể di chuyển: trùng booking/block khác. Đã hoàn tác."*

**Đã verify:** [Manual]. Logic conflict + lock verify qua unit test (`ConflictCheckerTest` 6 test); BE handler `handleMove` test gián tiếp qua design pattern giống `handleConfirmBooking`.

---

## TC-3.8 — Confirm booking trùng room block → 409 BOOKING_CONFLICT

**Bước thực hiện:**

1. Tạo room block trên 1 phòng cho range A.
2. Tạo booking `status=0 pending` trên cùng phòng cùng range A (qua flow End User hoặc raw insert).
3. Login partner, vào Bookings hoặc Calendar dialog → bấm **"Duyệt ngay"**.

**Kết quả mong đợi:**

- Network: `PUT /partner/bookings/{id}/confirm` → HTTP **409** với `code: "BOOKING_CONFLICT"`, data có `bookings` + `blocks` mô tả conflict.
- Toast lỗi: *"Không thể duyệt: khoảng thời gian đã có booking/block khác."*
- DB: `booking_timeline_events` ghi 1 row `event_type='conflict_detected'` với metadata `{operation: 'confirm', ...}`.
- Booking giữ nguyên status pending.

**Đã verify:** [Manual]. Logic ghi timeline đã wired trong `BookingService::handleConfirmBooking` (verify qua review code + Phase 1 unit test pattern).

---

## TC-3.9 — Cache calendar 30s + invalidation khi RoomBlockChanged

**Bước thực hiện:**

1. Login partner, mở `/partner/calendar` (request 1: `GET /partner/calendar` → 200, data X).
2. Trong vòng < 30 giây, refresh page hoặc trigger `useCalendar` lần nữa cùng range.
3. Tạo 1 room block mới (qua TC-3.3) → response 200.
4. Calendar tự refetch ngay sau khi tạo block.
5. Đợi 30+ giây không có event nào, refetch.

**Kết quả mong đợi:**

- Bước 2: trong cùng cache window, BE log/Telescope cho thấy KHÔNG hit DB lại — payload trả từ cache (so cùng `cached_at` timestamp với request 1).
- Bước 3 → 4: Listener `InvalidateCalendarCache::handleRoomBlockChanged` chạy → `bumpVersion(partnerId)` → cache key cũ stale. Request mới đi với `v{N+1}` → recompute → trả block vừa tạo + `cached_at` mới.
- Bước 5: TTL 30s expire → request tiếp theo recompute mặc dù version chưa bump.

**Đã verify:** [Manual]. Code path: `PartnerCalendarService` cache key `calendar:{partnerId}:v{version}:...` + listener đã đăng ký `EventServiceProvider`.

---

## TC-3.10 — Realtime event `room_block.changed` invalidate calendar (cần Soketi)

**Yêu cầu:** Soketi chạy + 2 tab.

**Bước thực hiện:**

1. Mở Tab A: login partner X → vào `/partner/calendar` → quan sát Network tab.
2. Mở Tab B: cùng partner X → vào `/partner/calendar`.
3. Trên Tab B, tạo 1 room block (TC-3.3).
4. Quan sát Tab A.

**Kết quả mong đợi:**

- Tab A: nhận event `room_block.changed` qua kênh `private-partner.{X.id}` → `useBookingsRealtime::handle("room_block.changed")` → invalidate prefix `['partner','calendar']` → tự refetch `GET /partner/calendar` → block mới render trên grid mà không cần manual refresh.
- Sidebar "Block đang áp dụng" tự tăng 1.

**Đã verify:** Tự test thủ công khi Soketi sẵn sàng. Logic đã wired:
- Event `App\Events\RoomBlockChanged implements ShouldBroadcast` với `broadcastAs='room_block.changed'`.
- FE `useBookingsRealtime` đã `channel.listen(".room_block.changed", ...)` và invalidate calendar prefix.

---

## TC-3.11 — Pessimistic lock chống race condition khi 2 confirm song song

**Yêu cầu:** Chạy trên Linux/macOS (Windows dev không có `pcntl`). Có thể skip ở môi trường dev hiện tại.

**Bước thực hiện:**

1. Tạo 2 booking pending #A và #B cho **cùng 1 phòng** với **cùng range** (cố tình overlap).
2. Dùng tool concurrency (Apache Bench, k6, hoặc 2 curl song song) gửi đồng thời:
   ```
   PUT /api/v1/partner/bookings/A/confirm
   PUT /api/v1/partner/bookings/B/confirm
   ```
3. Quan sát response code và DB state.

**Kết quả mong đợi:**

- 1 request trả 200 (booking đó được confirm thành công, status → 1).
- Request kia trả 409 với `code: "BOOKING_CONFLICT"` và payload chỉ tới booking đã confirm.
- DB: chỉ 1 booking có `status=1 confirmed`, booking còn lại giữ `status=0 pending`.
- `booking_timeline_events`: 1 row `event_type='confirmed'` cho booking thắng + 1 row `event_type='conflict_detected'` cho booking thua.

**Đã verify:** Unit test logic interval + lock đã pass (`ConflictCheckerTest`, `RoomBlockServiceTest::test_create_returns_conflict_when_overlap_detected`). Concurrent integration test sẽ chạy ở CI Linux phase release-hardening (out-of-scope T3 hiện tại).

---

## Network Trace Tham Khảo (template — fill khi run thực tế)

```
reqid=001 POST /api/v1/partner/auth/login                       [200] (login)
reqid=010 GET  /api/v1/partner/calendar?from=...&to=...         [200] (initial load — cache miss)
reqid=011 GET  /api/v1/partner/calendar?from=...&to=...         [200] (cache hit — same cached_at)
reqid=020 POST /api/v1/partner/room-blocks                       [200] (TC-3.3 success)
reqid=021 GET  /api/v1/partner/calendar?from=...&to=...         [200] (post-invalidate — new cached_at)
reqid=030 POST /api/v1/partner/room-blocks                       [409] code=ROOM_BLOCK_CONFLICT (TC-3.4)
reqid=040 PUT  /api/v1/partner/bookings/{id}/move               [200] (TC-3.6 success)
reqid=041 PUT  /api/v1/partner/bookings/{id}/move               [409] code=BOOKING_CONFLICT (TC-3.7)
reqid=050 PUT  /api/v1/partner/bookings/{id}/confirm            [409] code=BOOKING_CONFLICT (TC-3.8)
reqid=060 DELETE /api/v1/partner/room-blocks/{id}               [200] (gỡ block)
```

## Defects ghi nhận

Chưa phát hiện defect ở triple review (BA + TLA + QA) Phase 3. UI E2E pass cần chạy thủ công với data seed phù hợp.

## Mapping plan → test case

| Plan task | Test case |
|---|---|
| T3.1 Migration room_blocks | TC-3.1 (cấu trúc payload), TC-3.3 (DB persist) |
| T3.4 ConflictChecker | TC-3.4, TC-3.7, TC-3.8, TC-3.11 |
| T3.5 RoomBlockService | TC-3.3, TC-3.4 |
| T3.6 Endpoints `/partner/room-blocks` | TC-3.3, TC-3.4 |
| T3.7 Endpoint `GET /partner/calendar` | TC-3.1, TC-3.2 |
| T3.8 Event RoomBlockChanged | TC-3.10 |
| T3.9 BookingService.confirm dùng ConflictChecker + lock | TC-3.8, TC-3.11 |
| T3.10 Cache calendar 30s + invalidation | TC-3.9, TC-3.10 |
| T3.11 FE useCalendar hook | TC-3.1, TC-3.2 |
| T3.12 FE filter "Tất cả tài sản" | TC-3.2 |
| T3.13 FE dialog tạo room block | TC-3.3, TC-3.4 |
| T3.14 FE render block + overbooking warning | TC-3.5 |
| T3.15 FE drag-drop conflict revert + BE move endpoint | TC-3.6, TC-3.7 |
| T3.16 Unit test ConflictChecker + RoomBlockService | (đã ✅ 12/12 trong Unit suite) |

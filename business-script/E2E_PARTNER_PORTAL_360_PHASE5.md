# E2E Test Script — Partner Portal 360 Phase 5 (Long-term Contract Subset)

**Phiên bản:** 1.0
**Ngày soạn:** 2026-05-12
**Người soạn:** Senior Engineer (qua stack-task)
**Plan tham chiếu:** `bks-system-be/docs/plans/plan_001.md` — Phase 5.
**Liên quan:** `E2E_PARTNER_PORTAL_360_PHASE3.md`, `E2E_PARTNER_PORTAL_360_PHASE2.md`.

## Tiền điều kiện

- Backend `http://localhost:8000` (Laravel `php artisan serve`).
- Frontend `http://localhost:5173` (Vite dev).
- Soketi (optional cho realtime alert) `http://localhost:6001` qua `docker compose -f docker-compose.soketi.yml up -d`.
- Tài khoản partner: `partner@gmail.com / 123456a!`.
- `.env` của BE đã hỗ trợ `PARTNER_360_ENABLED` (mặc định `true`).
- Dữ liệu seed Phase 5 (script trong session E2E):
  - Contract #1 → `LEASE_AGREEMENT`, booking 101 (90 ngày).
  - Contract #3, #5 → `LEASE_AGREEMENT`, booking 101 với end_date 20/28 ngày từ hôm nay (cho scheduler).
  - Contract #9 → `LEASE_AGREEMENT`, booking 296 (demo terminate).
  - Room 169 có 4 utility fees (`electricity`, `water`, `internet`, `cleaning`).

Tất cả screenshot lưu tại `business-script/screenshots/phase5/`.

---

## TC-5.1 — Dashboard Alert Center hiển thị tile "Contract sắp hết hạn"

**Mục tiêu:** Validate T5.5 Alert Center fetch `GET /partner/contracts/expiring-soon`.

**Bước thực hiện:**
1. Login partner → vào `/partner/dashboard`.
2. Quan sát tile "Cần xử lý ngay" có 3 nhóm: Pending booking, Overbooking, Contract sắp hết hạn.
3. Đối tác chưa có hợp đồng nào được scheduler tag → tile hiển thị `0`.

**Kết quả mong đợi:**
- Tile "Contract sắp hết hạn" tồn tại với mô tả "Scheduler 06:00 đánh dấu hợp đồng còn ≤ 30 ngày."
- Khi count = 0, hiển thị fallback text scheduler.
- Khi count > 0, hiển thị "Sớm nhất: {date} · {guest_name}".

**Screenshot:** `01-dashboard-alert-center.png`, `07-dashboard-alert-with-expiring.png`.
**Đã verify:** [Manual] PASS.

---

## TC-5.2 — Contract list điều hướng đến detail page

**Mục tiêu:** Validate T5.3 navigation thay vì inline modal.

**Bước thực hiện:**
1. Vào `/partner/contracts`.
2. Click nút **"Mở trang chi tiết"** (icon Eye) trên 1 dòng hợp đồng.

**Kết quả mong đợi:**
- URL chuyển sang `/partner/contracts/:id`.
- Component `ContractDetail` render đầy đủ.

**Screenshot:** `02-contracts-list.png`.
**Đã verify:** [Manual] PASS.

---

## TC-5.3 — Contract Detail page hiển thị utility_fees + 2 CTA cho LEASE

**Mục tiêu:** Validate T5.3 acceptance criteria.

**Bước thực hiện:**
1. Vào `/partner/contracts/1` (LEASE_AGREEMENT đã seed + room 169 có 4 utility fees).
2. Quan sát 3 card và 2 button "Đánh dấu nhắc gia hạn" + "Chấm dứt hợp đồng".

**Kết quả mong đợi:**
- Card "Thời hạn thuê": Ngày bắt đầu, Ngày kết thúc, Ngày ký.
- Card "Khách thuê & tài sản": Tên/SĐT/email khách, building, room.
- Card "Phí tiện ích đính kèm": 4 dòng (Điện 3.500đ, Nước 25.000đ, Internet 150.000đ - Đã bao gồm, Vệ sinh 80.000đ).
- 2 button hiển thị (vì `contract_type=LEASE_AGREEMENT`, `terminated_at=null`).
- Đối chiếu với contract `TERMS_AND_CONDITIONS` (TC-5.3 negative): không hiển thị button.

**Screenshot:** `03-contract-detail-lease.png` (LEASE với CTAs), `03-contract-detail-terms.png` (TERMS không CTA).
**Đã verify:** [Manual] PASS.

---

## TC-5.4 — Set renewal reminder + idempotence

**Mục tiêu:** Validate T5.1 happy path + idempotence.

**Bước thực hiện:**
1. Vào `/partner/contracts/1`.
2. Click **"Đánh dấu nhắc gia hạn"**.

**Kết quả mong đợi:**
- API `PUT /partner/contracts/1/renewal-reminder` → 200 success.
- UI hiển thị badge "Đã nhắc gia hạn" + dòng "Đã nhắc gia hạn lúc {datetime}".
- Button đổi text "Đã đánh dấu nhắc gia hạn" + `disabled=true`.
- Event `ContractRenewalReminderQueued` dispatch tới channel `private-partner.{id}` + `private-property.{id}`.

**Screenshot:** `04-contract-renewal-reminder-set.png`.
**Đã verify:** [Manual] PASS.

---

## TC-5.5 — Terminate contract flow

**Mục tiêu:** Validate T5.1 terminate (reason ≥ 5 chars, idempotent).

**Bước thực hiện:**
1. Vào `/partner/contracts/9` (LEASE_AGREEMENT).
2. Click **"Chấm dứt hợp đồng"** → dialog mở ra.
3. Nhập reason ≥ 5 ký tự: "Khách báo chuyển nhà sang tỉnh khác và đồng ý thanh lý sớm hợp đồng."
4. Click **"Xác nhận chấm dứt"**.

**Kết quả mong đợi:**
- Dialog có textbox với placeholder và label "Lý do chấm dứt (tối thiểu 5 ký tự)".
- API `POST /partner/contracts/9/terminate` → 200 success, toast "Đã chấm dứt hợp đồng.".
- UI hiển thị badge đỏ "Đã chấm dứt" + "Đã chấm dứt lúc {datetime}" + "Lý do: {reason}".
- Cả 2 CTA biến mất (vì `terminated_at !== null`).
- Gọi lại endpoint → 422 `CONTRACT_ALREADY_TERMINATED` (verified backend test).

**Screenshot:** `05-terminate-dialog-filled.png`, `06-contract-terminated.png`.
**Đã verify:** [Manual] PASS.

---

## TC-5.6 — Scheduler `partner:send-contract-renewal-reminders`

**Mục tiêu:** Validate T5.2 daily scheduler.

**Bước thực hiện:**
```powershell
# Seed contracts với end_date trong 20 và 28 ngày
# Lần 1: tag mới
php artisan partner:send-contract-renewal-reminders --days=30
# Lần 2: idempotent
php artisan partner:send-contract-renewal-reminders --days=30
```

**Kết quả mong đợi:**
- Lần 1: `Tagged 2 contracts as expiring within 30 days.` (contract 3, 5).
- Lần 2: `Tagged 0 contracts as expiring within 30 days.` (idempotent vì `renewal_reminder_at IS NULL` filter).
- Sau scheduler: Dashboard Alert Center tile "Contract sắp hết hạn" hiển thị `3` (Contract 1 manual + 3, 5 scheduler).

**Screenshot:** `07-dashboard-alert-with-expiring.png`.
**Đã verify:** [Manual] PASS (Tagged 2 → 0, Alert Center sync).

---

## TC-5.7 — Calendar badge "Contract" cho booking ≥ 30 đêm

**Mục tiêu:** Validate T5.4 calendar badge.

**Bước thực hiện:**
1. Vào `/partner/calendar`.
2. Quan sát các event ngày 26/4 → 31/5 với booking 101 (88 đêm) trên phòng R169.
3. Click event để mở dialog chi tiết.

**Kết quả mong đợi:**
- Trong event tile: badge "CONTRACT" nhỏ bên cạnh status.
- Trong dialog chi tiết: badge to "Contract · 88 đêm".
- Booking ngắn ngày (R060, R102, R140) **không** có badge.

**Screenshot:** `08-calendar-contract-badge.png`, `09-booking-detail-contract-badge.png`.
**Đã verify:** [Manual] PASS.

---

## TC-5.8 — Feature flag `PARTNER_360_ENABLED` toggle

**Mục tiêu:** Validate T5.6 middleware bật/tắt Phase 3+ routes.

**Bước thực hiện (Backend):**
```powershell
# Tắt flag
Add-Content -Path .env -Value "PARTNER_360_ENABLED=false"
php artisan config:clear
```

**Kết quả mong đợi qua API (test cụ thể trong session):**

| Endpoint | Phase | Status khi `false` | Status khi `true` |
|---|---|---|---|
| `GET /partner/contracts/expiring-soon` | 5 | 403 `PARTNER_360_DISABLED` | 200 |
| `GET /partner/calendar?from=...&to=...` | 3 | 403 `PARTNER_360_DISABLED` | 200 |
| `GET /partner/dashboard/charts/occupancy` | 4 | 403 `PARTNER_360_DISABLED` | 200 |
| `GET /partner/dashboard/kpis` | 1 | 200 (backwards-compatible) | 200 |
| `GET /partner/contracts/{id}` | 1 | 200 (backwards-compatible) | 200 |

Response body khi disabled:
```json
{
  "success": false,
  "data": null,
  "message": "Tính năng Partner Portal 360 hiện tạm tắt.",
  "code": "PARTNER_360_DISABLED"
}
```

**Screenshot:** `10-dashboard-feature-flag-disabled.png` (dashboard sau khi flag tắt).
**Đã verify:** [Manual] PASS (5 endpoints, 3 trả 403, 2 trả 200).
**Lưu ý:** FE axios interceptor hiện logout khi gặp 403 → ux sẽ ép user re-login. Cải tiến UX khi flag off thuộc backlog.

---

## Tổng kết verify

| TC | Mô tả | Kết quả |
|---|---|---|
| TC-5.1 | Alert Center tile "Contract sắp hết hạn" | ✅ |
| TC-5.2 | Contract list → detail navigation | ✅ |
| TC-5.3 | Contract Detail card + utility_fees + CTA visibility | ✅ |
| TC-5.4 | Set renewal reminder + button disabled state | ✅ |
| TC-5.5 | Terminate dialog + idempotence | ✅ |
| TC-5.6 | Scheduler tag + idempotent re-run | ✅ |
| TC-5.7 | Calendar inline + dialog badge "Contract" | ✅ |
| TC-5.8 | Feature flag toggle (3 endpoints 403, 2 endpoints 200) | ✅ |

**Backend Unit suite:** 34/34 PASS (96 assertions).
**Frontend `npm run build`:** PASS.

---

## Phụ lục — Cleanup sau E2E (rollback dữ liệu seed)

```php
use App\Models\Contract;

// Khôi phục contract_type về TERMS_AND_CONDITIONS
Contract::whereIn('id', [1, 3, 5, 9])->update([
    'contract_type' => 'TERMS_AND_CONDITIONS',
    'renewal_reminder_at' => null,
    'terminated_at' => null,
    'termination_reason' => null,
]);
```

Tắt scheduler (nếu cần): comment out `$schedule->command('partner:send-contract-renewal-reminders')` trong `app/Console/Kernel.php`.

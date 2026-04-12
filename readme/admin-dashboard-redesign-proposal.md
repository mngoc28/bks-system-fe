# Admin Dashboard Redesign Proposal

## 1) Muc tieu

Xay lai trang Admin Dashboard theo huong "Action Dashboard":
- Hien thi dung KPI quan trong va xu huong.
- Moi the KPI va diem tren bieu do deu click duoc de di den module tuong ung.
- Tu dong set bo loc khi dieu huong (query params) de nguoi van hanh xu ly ngay.

Muc tieu nghiep vu:
- Giam so click tu Dashboard den danh sach can xu ly xuong <= 2 click.
- Cac KPI quan trong (pending/block/new) deu co duong dan thao tac ro rang.
- Dong bo tong so record giua Dashboard va trang module.

## 2) Van de hien tai

Tu code hien tai trong `src/pages/Admin/Dashboard/index.tsx`:
- Dashboard la tap hop card + tab bieu do, nhung card chua co deep-link action.
- Bieu do chu yeu de xem, chua co drill-down theo diem du lieu.
- Date range cua chart dang apply rieng le tung chart, chua co bo loc toan dashboard.
- Chua co "work queue" (nhung muc can xu ly gap nhu partner pending, user pending, booking sap toi).

## 3) De xuat thong tin tren dashboard moi

### A. Header thong minh
- Tieu de + subtitle theo role.
- Global filter:
  - Date range (7d/30d/90d/custom)
  - Building (all / specific)
  - Province (all / specific)
- Nut nhanh:
  - Export report
  - Refresh all

### B. KPI Action Cards (hang 1)
Moi card gom:
- Gia tri hien tai
- % thay doi so voi ky truoc
- Mo ta ngan
- Nut hoac click card de mo module da loc

Card de xuat:
- Partner pending
- Partner blocked
- User pending
- User blocked
- Room available
- Bookings cho duyet

### C. Work Queue (hang 2 - can xu ly ngay)
Bang ngan "Can xu ly hom nay":
- Partner pending > 48h
- Booking sap check-in trong 24h
- Yeu cau sua chua gap
- Tin tuc cho duyet

Moi dong co CTA "Xu ly ngay" -> route module + filter

### D. Insight Charts (hang 3)
- Booking trend theo thoi gian (line/area)
- Revenue trend theo thoi gian (bar + line moving average)
- Booking by building (horizontal bar)
- Conversion funnel (view -> booking -> completed)

Yeu cau quan trong:
- Co tooltip ro rang.
- Co click tren diem/chart segment de drill-down sang module.

### E. Bottom Section: Top canh bao
- Top 5 building co booking giam manh.
- Top 5 partner co nhieu ticket ho tro.
- Top 5 room occupancy thap.

## 4) Drill-down va deep-link mapping (quan trong nhat)

Nguyen tac:
- Tat ca CTA tren dashboard deu di qua query params.
- Trang dich tu doc query params va set filter state ban dau.

### Mapping de xuat
1. Partner pending card
- Route: `/admin/partner-information`
- Query: `status=0&page=1`

2. Partner blocked card
- Route: `/admin/partner-information`
- Query: `status=2&page=1`

3. User pending card
- Route: `/admin/user-management`
- Query: `status=0&page=1`

4. User blocked card
- Route: `/admin/user-management`
- Query: `status=2&page=1`

5. Booking trend point (thang X)
- Route: `/admin/booking-manage`
- Query: `start_date=YYYY-MM-01&end_date=YYYY-MM-lastDay&page=1`

6. Booking by building bar
- Route: `/admin/booking-manage`
- Query: `building_id={id}&page=1`

7. Room available card
- Route: `/admin/rooms`
- Query: `status=available&page=1`

8. News pending approval
- Route: `/admin/news`
- Query: `status=pending&page=1`

## 5) De xuat UI/UX (khong "safe" qua)

Visual direction: "Operations Cockpit"
- Nen gradient rat nhe + texture grid mo.
- KPI card co border color theo tinh trang (warning/error/success).
- Muc "Work Queue" dung mau am, de nhan biet viec can xu ly.
- Chart bo tri 2 cot, uu tien kha nang doc nhanh.
- Mobile: KPI thanh carousel ngang + chart stack theo cot doc.

Typography de xuat:
- Heading: Space Grotesk
- Body: Manrope

## 6) De xuat ky thuat frontend

### Component architecture
- `DashboardV2Page`
- `DashboardFiltersBar`
- `KpiActionCard`
- `WorkQueuePanel`
- `InteractiveTrendChart`
- `DrillDownLink` (helper tao url + query)

### State va data
- React Query cho tung widget.
- Dung chung `dashboardFilters` state cho toan page.
- Query key co filter: `['dashboard-v2', widgetName, filters]`

### Helper quan trong
- `buildModuleLink(module, filterPayload)`
- `normalizeDashboardPayload(...)`
- `getDateRangeFromPreset('30d')`

## 7) API de xuat cho backend

Uu tien 1 endpoint tong hop:
- `GET /admin/dashboard/overview`
- Input: `start_date`, `end_date`, `building_id`, `province_id`
- Output:
  - `kpis`
  - `work_queue`
  - `bookings_trend`
  - `revenue_trend`
  - `bookings_by_building`

Neu chua gom endpoint ngay, co the giu endpoint hien tai va bo sung:
- pending theo module
- work queue metrics
- payload co `deep_link` de FE map nhanh

## 8) Lo trinh trien khai de xuat

Phase 1 (2-3 ngay):
- Dung khung DashboardV2 + KPI action cards + deep-link sang module.
- Dam bao query params set filter chinh xac.

Phase 2 (2-3 ngay):
- Interactive charts + click drill-down.
- Global filter bar va dong bo tren tat ca widget.

Phase 3 (1-2 ngay):
- Work Queue + canh bao thong minh.
- Hoan thien loading/skeleton/empty/error state.

Phase 4 (1 ngay):
- QA e2e: doi chieu tong record dashboard vs module.
- Tinh chinh responsive + performance.

## 9) Acceptance criteria

- Card "Partner pending" click vao den dung trang partner va tu dong filter status pending.
- Tong so hien tren card khop voi tong so record o module dich (cho cung bo loc).
- Click diem tren chart Booking trend phai mo booking-manage voi khoang ngay tuong ung.
- Mobile van thao tac duoc tat ca CTA quan trong.
- TTFB va render dashboard khong vuot nguong da dat (de xuat < 2s voi data trung binh).

## 10) De xuat bat dau ngay

Buoc tiep theo nen lam ngay:
1. Chot danh sach KPI + deep-link mapping (muc 4).
2. Chot API payload (gom endpoint hay tach endpoint).
3. Implement Phase 1 truoc de co gia tri van hanh ngay (click card -> module + filter).

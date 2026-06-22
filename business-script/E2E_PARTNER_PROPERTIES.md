# E2E Smoke — Partner Properties List (PP-015)

**URL:** `http://localhost:5173/partner/properties`  
**Điều kiện:** Partner đã đăng nhập; BE + FE đang chạy.

---

## 1. Must — Filter & CTA cơ bản

1. Mở trang **Cơ sở lưu trú**.
2. Nhập từ khóa vào ô **Tìm kiếm** (tên hoặc địa chỉ) → danh sách cập nhật sau debounce.
3. Chọn **Hình thức cho thuê** và **Loại hình** → kết quả lọc đúng.
4. Trên card property, click **Thêm phòng** → modal mở.
5. Click icon xóa property → dialog xác nhận 2 nút; **Hủy** không xóa.

## 2. Should — Bộ lọc nâng cao

1. Click **Bộ lọc nâng cao**.
2. Chọn Tỉnh/Thành, Phường/Xã, **Sắp xếp** (ví dụ: Nhiều phòng nhất).
3. Xác nhận thumbnail ảnh cover (nếu property có ảnh).
4. Click **Xóa lọc** → reset toàn bộ filter.

## 3. Could — Filter nâng cao + URL

1. Trong bộ lọc nâng cao: chọn **Có phòng trống**, **Từ 4 sao**, **Chưa có phòng** (từng case).
2. Kiểm tra URL có query `occupancy`, `min_rating`, `has_rooms` (chỉ param khác mặc định).
3. Reload trang → filter vẫn giữ.
4. Expand một property có nhiều phòng:
   - Dùng ô **Tìm trong preview** + dropdown trạng thái.
   - Banner **Xem toàn bộ** vẫn hiện khi property có >6 phòng.

## 4. Regression nhanh

- Expand/collapse property load preview phòng (≤6).
- Bulk chọn + xóa hàng loạt vẫn yêu cầu gõ `XÁC NHẬN XÓA`.

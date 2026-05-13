# Kịch bản Kiểm thử E2E (UAT) Quy trình Đặt phòng - BKS System

Tài liệu này được thiết kế theo chuẩn kịch bản kiểm thử End-to-End (E2E) mô phỏng trải nghiệm thực tế (giống Booking.com/Airbnb) nhưng được giới hạn tuyệt đối trong cấu trúc Database và các luồng UI/API hiện tại của dự án BKS System.

**Mục tiêu:** Agent hoặc Tester có thể đọc file này và tự động thực thi các thao tác test từ A-Z mà không cần phải đoán hay sửa bất kỳ một chi tiết nào.

---

## 1. GIAI ĐOẠN 1: TÌM KIẾM VÀ TẠO YÊU CẦU ĐẶT PHÒNG
**Vai trò (Role):** Người dùng cuối (End User - EU) (Chưa đăng nhập / Khách vãng lai)

### Bước 1: Tìm kiếm phòng
*   **Trang hiện tại:** Trang chủ (Home)
*   **URL:** `/`
*   **Hành động:** 
    *   Truy cập vào trang chủ. 
    *   (Tùy chọn) Chọn một Tỉnh/Thành phố hoặc nhập tên phòng vào thanh tìm kiếm.
    *   Nhấn nút "Tìm kiếm" hoặc chọn xem tất cả phòng để chuyển sang trang danh sách.

### Bước 2: Xem chi tiết phòng
*   **Trang hiện tại:** Danh sách phòng (Room Search)
*   **URL:** `/rooms`
*   **Hành động:**
    *   Tại danh sách kết quả, chọn một phòng bất kỳ (ví dụ phòng có trạng thái `Available` / `Trống`).
    *   Nhấn vào ảnh hoặc nút "Xem chi tiết" để chuyển tới trang thông tin phòng.
*   **Yêu cầu bắt buộc:** Phòng được chọn phải có giá (Room Prices) đã được thiết lập bởi Partner.

### Bước 3: Khởi tạo Đơn đặt phòng
*   **Trang hiện tại:** Chi tiết phòng (Room Detail)
*   **URL:** `/rooms/detail/:roomId` (VD: `/rooms/detail/15`)
*   **Hành động:**
    *   Xem qua các thông tin tiện nghi, mô tả.
    *   Nhấn nút **"Đặt phòng ngay"** (Book Now). Nút này sẽ chuyển hướng người dùng sang trang điền form đặt phòng.

### Bước 4: Điền Form và Submit
*   **Trang hiện tại:** Trang Đặt phòng (Booking Page)
*   **URL:** `/booking/:roomId` (VD: `/booking/15`)
*   **Dữ liệu cần điền (Input Data):**
    *   `Họ và tên` (Name): "Nguyễn Văn UAT Test" *(Bắt buộc)*
    *   `Email`: "uat_tester_123@example.com" *(Bắt buộc - dùng email này để hệ thống tự tạo tài khoản PENDING)*
    *   `Số điện thoại` (Phone): "0987654321" *(Bắt buộc)*
    *   `Ngày nhận phòng` (Start Date): Chọn ngày mai (T+1) *(Bắt buộc)*
    *   `Ngày trả phòng` (End Date): Chọn ngày T+3 *(Bắt buộc)*
    *   `Dịch vụ thêm` (Services): 
        *   Tích chọn các dịch vụ mong muốn từ danh sách (Ví dụ: "Dịch vụ spa - 800.000 VNĐ", "Dịch vụ giặt ủi - 50.000 VNĐ", hoặc các dịch vụ Free). *(Tùy chọn)*
        *   **Hành động phụ:** Kiểm tra xem phần Tổng tiền (Total Amount) có cộng dồn chính xác giá của các dịch vụ vừa tích hay không.
    *   `Ghi chú` (Note): "E2E Test Booking Request" *(Tùy chọn)*
*   **Hành động:**
    *   Nhấn nút **"Xác nhận đặt phòng"** (Submit).
*   **Yêu cầu bắt buộc & Kết quả kỳ vọng:**
    *   Hệ thống không được báo lỗi "Phòng đã có người đặt trùng ngày" (Conflict Check).
    *   Thành công: Trình duyệt chuyển hướng sang trang `/booking-success`. Giao diện báo thành công và yêu cầu check email.

### Bước 4.1: Kiểm tra Email và Xác thực tài khoản (Xử lý ngoài UI chính)
*   **Hành động Hệ thống:** Hệ thống tự động gửi 1 email xác nhận đến `uat_tester_123@example.com` thông qua Job `SendBooking`.
*   **Thông tin trong Email (Payload):**
    *   `booking_code`: Mã đặt phòng (VD: RM-2026-000015).
    *   Thông tin phòng & tòa nhà: Tên phòng, địa chỉ, các tiện nghi, công ty quản lý.
    *   Chi tiết đơn đặt: Ngày nhận/trả (`start_time`, `end_time`), số ngày (`total_days`), tổng tiền (`total_amount`), và danh sách dịch vụ đi kèm.
    *   Các link tiện ích: Link phòng (`room_url`) và link theo dõi đơn (`bookings_url`).
    *   **Token xác thực (Dành riêng cho User mới):** Do email chưa từng tồn tại trong hệ thống (is_first_time = true), hệ thống sinh ra một `token` xác thực và đính kèm link kích hoạt tài khoản.
*   **Hành động của Người dùng (EU):**
    *   Truy cập hộp thư đến (Inbox) của email.
    *   Đối chiếu lại thông tin đặt phòng (giá tiền, ngày tháng) trong nội dung thư.
    *   Nhấp vào link xác thực tài khoản trong email (dẫn đến URL `/set-password/:token` hoặc `/verify-email/:token` trên frontend).
    *   Tại trang đích, người dùng thiết lập Mật khẩu (Password) mới. 
    *   **Mục đích:** Mật khẩu này sẽ được sử dụng để đăng nhập vào hệ thống **BKS Stay Portal** ở Giai đoạn 3 nhằm quản lý phòng và gọi dịch vụ.

---

## 2. GIAI ĐOẠN 2: PHÊ DUYỆT ĐƠN ĐẶT PHÒNG
**Vai trò (Role):** Đối tác (Partner - Chủ tài sản)

### Bước 5: Đăng nhập Partner
*   **Trang hiện tại:** Partner Login
*   **URL:** `/partner/login`
*   **Dữ liệu cần điền:**
    *   `Email`: Email của tài khoản Partner (chủ sở hữu của phòng ở Bước 2).
    *   `Password`: Mật khẩu của tài khoản Partner.
*   **Hành động:** Nhấn nút Đăng nhập. Chuyển hướng thành công vào `/partner/dashboard`.

### Bước 6: Duyệt đơn đặt phòng mới
*   **Trang hiện tại:** Quản lý Đơn đặt (Partner Bookings)
*   **URL:** `/partner/bookings`
*   **Hành động:**
    *   Chuyển sang tab/mục **"Chờ duyệt"** (Pending).
    *   Tìm đơn đặt phòng từ "Nguyễn Văn UAT Test" vừa tạo ở Bước 4.
    *   Bấm vào nút **"Xác nhận" (Confirm)**.
*   **Kết quả kỳ vọng:**
    *   Trạng thái đơn (Status) chuyển từ `0` (Pending) sang `1` (Confirmed). Đơn hiển thị ở tab "Đã xác nhận".

### Bước 6.1: Tự động hóa sinh Hợp đồng (Contract Automation)
*   **Hành động Hệ thống:** Ngay khi Partner nhấn "Xác nhận", hệ thống tự động kiểm tra loại hình bất động sản (`property_type`) của phòng đó.
*   **Logic Phân loại (Theo tư vấn):**
    *   **Trường hợp 1 (Khách sạn / Homestay / Ngắn hạn):** 
        *   Tạo bản ghi `Contract` với `contract_type` = `TERMS_AND_CONDITIONS`. 
        *   Trạng thái (Status) tự động là `1` (Hiệu lực/Signed). 
        *   Mục đích: Đây là phiếu xác nhận dịch vụ kèm điều khoản sử dụng nhanh.
    *   **Trường hợp 2 (Căn hộ dịch vụ / Dài hạn):** 
        *   Tạo bản ghi `Contract` với `contract_type` = `LEASE_AGREEMENT`. 
        *   Trạng thái (Status) khởi tạo là `0` (Chờ ký/Pending).
        *   Mục đích: Yêu cầu ký kết hợp đồng thuê nhà điện tử để đảm bảo tính pháp lý dài hạn.
*   **Kết quả kỳ vọng:**
    *   Truy cập Database table `contracts`, kiểm tra mã `booking_id` tương ứng phải xuất hiện bản ghi mới với đúng `contract_type` và `status` tương ứng với loại phòng.

---

## 3. GIAI ĐOẠN 3: NHẬN PHÒNG VÀ LƯU TRÚ (CHECK-IN)
**Vai trò (Role):** Đối tác (Partner) & Khách (EU)

### Bước 7: Thực hiện Check-in cho khách
*   **Trang hiện tại:** Quản lý Đơn đặt (Partner Bookings)
*   **URL:** `/partner/bookings`
*   **Hành động:**
    *   Tại tab "Đã xác nhận", tìm đơn của "Nguyễn Văn UAT Test".
    *   Nhấn nút **"Check-in"** (Nút màu xanh blue).
*   **Kết quả kỳ vọng:**
    *   Biến `stay_status` trong DB cập nhật thành `checked_in`.
    *   **QUAN TRỌNG:** Trạng thái phòng (Room Status) tự động chuyển sang `false` (Đang có khách / Khóa phòng). Đảm bảo khách khác không thể book đè.

### Bước 8: Khách hàng quản lý lưu trú (BKS Stay Portal)
*   **Vai trò:** Người dùng (EU)
*   **Trang hiện tại:** Stay Login
*   **URL:** `/bks-stay/login`
*   **Dữ liệu cần điền:**
    *   `Email`: "uat_tester_123@example.com"
    *   `Password`: (Sử dụng mật khẩu đã được gửi trong email hoặc mật khẩu mặc định tạo ra từ bước user-create).
*   **Hành động:** Đăng nhập thành công và chuyển vào `/bks-stay/dashboard`.
*   **Kiểm tra tính năng:**
    *   Truy cập `/bks-stay/contracts` (Menu: **Hồ sơ lưu trú & Hợp đồng**).
    *   **Logic Kiểm tra (Quyết định kết quả UAT):**
        *   **Nếu đơn đặt là Khách sạn:** Hợp đồng phải hiển thị Badge "Hiệu lực". Nút hành động là "Chi tiết".
        *   **Nếu đơn đặt là Căn hộ:** Hợp đồng phải hiển thị Badge "Chờ ký". Nút hành động nổi bật màu cam là **"Ký ngay"**.
    *   **Hành động ký kết (Dành cho Căn hộ):**
        *   Nhấn vào **"Ký ngay"** -> Chuyển đến trang `/bks-stay/contracts/:id`.
        *   Nhấn nút **"Ký hợp đồng ngay"** -> Mở Modal ký tên.
        *   Thực hiện vẽ chữ ký hoặc Tải ảnh chữ ký lên.
        *   Nhấn **"Xác nhận & Hoàn tất"**.
    *   **Kết quả kỳ vọng:**
        *   Hệ thống báo thành công. Badge trạng thái đổi từ "Chờ ký" sang "Hiệu lực".
        *   Trong Database: `status` của contract chuyển sang `1`, `signature_date` lưu thời gian hiện tại.
    *   Truy cập `/bks-stay/services` (Dịch vụ nội khu).
    *   Nhấn nút **"Gọi dịch vụ"** (Order Service) cho dịch vụ bất kỳ.
    *   Truy cập lại `/bks-stay/dashboard`, nhập ngày vào ô **Ngày checkout mới** để test API gia hạn (`extend booking`).

---

## 4. GIAI ĐOẠN 4: TRẢ PHÒNG (CHECK-OUT)
**Vai trò (Role):** Đối tác (Partner)

### Bước 9: Thực hiện Check-out
*   **Trang hiện tại:** Quản lý Đơn đặt (Partner Bookings)
*   **URL:** `/partner/bookings`
*   **Hành động:**
    *   Tìm đơn đang có `stay_status` là Đang ở (checked_in) của "Nguyễn Văn UAT Test".
    *   Nhấn nút **"Check-out"** (Nút màu cam/vàng - Amber).
*   **Kết quả kỳ vọng & Yêu cầu bắt buộc:**
    *   Trạng thái đơn (Status) chuyển thành `3` (Completed / Hoàn thành).
    *   Biến `stay_status` chuyển thành `checked_out`.
    *   **QUAN TRỌNG:** Trạng thái phòng (Room Status) phải tự động quay trở lại `true` (Trống / Available) để hiển thị lại trên trang chủ cho các khách hàng tiếp theo tìm kiếm.
    *   Luồng E2E kết thúc thành công 100%.

---

## 5. CÁC TRƯỜNG HỢP CẠNH (EDGE CASES) DÀNH CHO PARTNER
Đây là các kịch bản phụ (Alternative Paths) cần thiết để đảm bảo tính toàn vẹn của nghiệp vụ quản lý đơn đặt.

### Trường hợp 5.1: Partner Từ chối / Hủy đơn đặt (Reject / Cancel Booking)
*   **Điều kiện:** Tại Bước 6, thay vì bấm "Xác nhận", Partner quyết định không nhận khách (do bận đột xuất, lý do cá nhân, v.v.).
*   **Hành động:** 
    *   Trong tab "Chờ duyệt" tại `/partner/bookings`.
    *   Nhấn nút **"Hủy"** (Cancel / Reject) trên đơn của "Nguyễn Văn UAT Test".
*   **Kết quả kỳ vọng:** 
    *   Trạng thái đơn chuyển sang `2` (Cancelled).
    *   Trạng thái phòng vẫn là `true` (Available - Không bị khóa). Khách hàng khác vẫn có thể tiếp tục book phòng này.

### Trường hợp 5.2: Khách không đến (No-show)
*   **Điều kiện:** Đơn đã được "Xác nhận" (Status = 1) nhưng tới hạn Check-in thực tế, khách hàng không xuất hiện.
*   **Hành động:**
    *   Trong tab "Đã xác nhận" tại `/partner/bookings`.
    *   Thay vì nhấn "Check-in", Partner nhấn nút **"Hủy"** đơn để giải phóng hợp đồng.
*   **Kết quả kỳ vọng:**
    *   Đơn bị chuyển trạng thái Hủy (Status = 2).
    *   Phòng được đảm bảo trạng thái `true` (Trống) trên trang chủ.

### Trường hợp 5.3: Trả phòng sớm / Hủy đột xuất (Early Check-out)
*   **Điều kiện:** Đơn đã được Check-in (`stay_status` = `checked_in`, phòng đang bị khóa).
*   **Hành động:**
    *   Luồng chuẩn: Khi khách muốn rời đi sớm, Partner thao tác **"Check-out"** (Bước 9) bất kể ngày `end_date` trên đơn gốc.
*   **Kết quả kỳ vọng:**
    *   Hệ thống không được validate cứng ngày hiện tại phải lớn hơn hoặc bằng `end_date` mới cho Check-out.
    *   Ngay khi bấm Check-out, `stay_status` = `checked_out`, hoàn tất đơn đặt và quan trọng nhất là lập tức **giải phóng khóa phòng** (`room_status` = `true`).

---

## TÓM TẮT MỤC TIÊU KIỂM THỬ (ASSERTIONS CHO E2E BOT):
1.  **Form Input Validation:** Ở URL `/booking/:roomId`, bỏ trống thông tin bắt buộc phải báo lỗi (HTTP 422).
2.  **Room Status Lock Check:** Sau Bước 7 (Check-in), API `/api/v1/rooms/search` sẽ KHÔNG trả về phòng này nữa.
3.  **Role Access Control:** Khách hàng (EU) không thể truy cập vào `/partner/bookings` (Phải redirect về login).
4.  **Database Release Check:** Sau Bước 9 (Check-out), phòng tự động xuất hiện lại ở trang chủ.

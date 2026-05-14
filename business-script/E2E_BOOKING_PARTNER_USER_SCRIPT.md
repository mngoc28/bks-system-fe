# Kịch bản Kiểm thử Luồng Booking giữa Partner và Người dùng

Tài liệu này mô tả 1 luồng kiểm thử End-to-End (E2E) cho nghiệp vụ booking giữa tài khoản Partner và tài khoản Người dùng đã có sẵn trong hệ thống.

## 1. Thông tin kiểm thử

### 1.1. Tài khoản test
* Partner: `partner@gmail.com`
* User: `user@gmail.com`
* Password User: `123456a!`

### 1.2. Tiền điều kiện
* Partner đã có ít nhất 1 phòng đang ở trạng thái khả dụng.
* Phòng đã được cấu hình giá và có thể hiển thị trên trang tìm kiếm.
* User `user@gmail.com` đã có sẵn tài khoản và có thể đăng nhập bằng mật khẩu `123456a!`.
* Hệ thống không có booking trùng với khoảng thời gian test.

### 1.3. Dữ liệu test đề xuất
* Ngày nhận phòng: ngày mai
* Ngày trả phòng: ngày mai + 2 ngày
* Ghi chú booking: `E2E booking flow partner-user`

### 1.4. Dữ liệu test cố định để chạy ngay
| Hạng mục | Giá trị |
| --- | --- |
| Partner | `partner@gmail.com` |
| Password Partner | dùng mật khẩu hiện có của tài khoản Partner |
| User | `user@gmail.com` |
| Password User | `123456a!` |
| Tên người đặt | `Nguyễn Văn Test` |
| Số điện thoại | `0987654321` |
| Email liên hệ | `user@gmail.com` |
| Ngày nhận phòng | `2026-05-07` |
| Ngày trả phòng | `2026-05-09` |
| Ghi chú booking | `E2E booking flow partner-user` |
| Phòng test | `roomId = 10` |
| Room number | `R010` |
| Tên phòng | `Phòng Cao Cấp 399` |
| Tòa nhà | `Vinhomes Serviced Room` |
| Trạng thái phòng | `Available` / `status = 1` |
| Giá theo ngày | `4,840,951` - `6,915,645` VNĐ/ngày |
| Giá theo tháng | `251,729,478` VNĐ/tháng |
| Điều kiện phòng | phòng phải có giá và đang hiển thị trong kết quả tìm kiếm |

### 1.5. Dữ liệu cần xác nhận trước khi chạy
* Nếu user `user@gmail.com` chưa đăng nhập được do cần đổi mật khẩu hoặc xác thực email, hãy hoàn tất bước đó trước.
* Nếu ngày test trùng với lịch thực tế của môi trường, hãy giữ nguyên cấu trúc và đổi sang 1 cặp ngày tương đương.

## 2. Kịch bản chính

### Bước 1: User đăng nhập và tạo booking
* Truy cập trang đăng nhập người dùng.
* Đăng nhập bằng `user@gmail.com` / `123456a!`.
* Tìm một phòng còn trống do Partner quản lý.
* Mở trang chi tiết phòng và nhấn nút đặt phòng.
* Điền thông tin booking với dữ liệu cố định ở mục 1.4.
* Nếu form có trường họ tên, nhập `Nguyễn Văn Test`.
* Nếu form có trường số điện thoại, nhập `0987654321`.
* Nhấn xác nhận đặt phòng.

**Kết quả kỳ vọng:**
* Booking được tạo thành công.
* Hệ thống hiển thị trạng thái chờ Partner duyệt hoặc trang xác nhận đặt phòng thành công.

### Bước 2: Partner kiểm tra booking mới
* Truy cập trang đăng nhập Partner.
* Đăng nhập bằng `partner@gmail.com`.
* Mở danh sách booking của Partner.
* Tìm booking vừa được tạo bởi `user@gmail.com`.

**Kết quả kỳ vọng:**
* Booking xuất hiện trong danh sách chờ xử lý.
* Thông tin người đặt, thời gian lưu trú và tổng tiền hiển thị đúng.

### Bước 3: Partner xác nhận booking
* Tại booking vừa tạo, nhấn nút xác nhận.

**Kết quả kỳ vọng:**
* Trạng thái booking chuyển sang đã xác nhận.
* Booking không còn nằm trong danh sách chờ duyệt.

### Bước 3b: Kiểm tra hợp đồng gắn booking (sau khi xác nhận)

**Bối cảnh:** Sau khi Partner xác nhận, hệ thống có thể tự sinh bản ghi hợp đồng liên kết `booking_id`. Booking **ngắn hạn** (ví dụ 2 đêm như mục 1.4) thường tương ứng loại `TERMS_AND_CONDITIONS`; booking **dài hạn** (ví dụ ≥ 30 ngày hoặc theo rule giá tháng / loại phòng trong tài liệu pricing của dự án) có thể là `LEASE_AGREEMENT`. Nếu môi trường chưa bật sinh hợp đồng tự động, bước này ghi nhận là **không áp dụng** và ghi chú vào báo cáo UAT.

**Phía Partner**

* Đăng nhập Partner → mục **Hợp đồng** (đường dẫn `/partner/contracts`).
* Trong danh sách, tìm hợp đồng gắn booking vừa xác nhận (đối chiếu khách `user@gmail.com`, phòng/tòa như mục 1.4).
* Mở chi tiết (`/partner/contracts/{id}`): kiểm tra trường loại hợp đồng (`contract_type`), ngày ký (`signature_date` nếu có), nội dung/hồ sơ tối thiểu hiển thị; đối chiếu ngày nhận/trả phòng và khách với booking.

**Phía User (End User)**

* Vào **chi tiết booking** đã xác nhận (từ lịch sử đặt phòng / đơn của tôi).
* Nếu có đường dẫn tới hợp đồng (ví dụ mở `/bks-stay/contracts/{id}` từ màn booking chi tiết): mở và đối chiếu cùng một booking với Partner.

**Kết quả kỳ vọng:**

* Tồn tại đúng một hợp đồng gắn booking test (hoặc đúng số lượng theo rule nghiệp vụ đã chốt).
* Loại hợp đồng khớp kỳ vọng ngắn hạn/dài hạn theo khoảng ngày và loại phòng đã chọn.
* Thông tin khách, phòng, khoảng ngày lưu trú nhất quán giữa booking và hợp đồng.

**Kịch bản mở rộng (tùy chọn — dài hạn):** Lặp lại từ Bước 1 với khoảng ngày đủ dài theo rule dự án (ví dụ ≥ 30 ngày), sau đó lặp Bước 2–3 và Bước 3b; kỳ vọng `LEASE_AGREEMENT` và các trường/UI đặc thù dài hạn (nhắc gia hạn, chấm dứt) **chỉ kiểm tra nếu đã triển khai** trên môi trường test.

### Bước 4: User kiểm tra booking sau xác nhận
* User đăng nhập lại vào hệ thống.
* Truy cập trang lịch sử booking hoặc danh sách đơn của mình.

**Kết quả kỳ vọng:**
* Booking hiển thị trạng thái đã xác nhận.
* Thông tin phòng, ngày ở và tổng tiền vẫn đúng như lúc tạo đơn.

### Bước 5: Partner check-in cho booking
* Partner mở lại danh sách booking đã xác nhận.
* Chọn booking của `user@gmail.com` và thực hiện check-in.

**Kết quả kỳ vọng:**
* Trạng thái lưu trú chuyển sang đang ở.
* Phòng được khóa trạng thái khả dụng để tránh đặt trùng.

### Bước 6: Partner check-out khi kết thúc lưu trú
* Sau thời điểm trả phòng, Partner mở booking đang ở.
* Thực hiện check-out.

**Kết quả kỳ vọng:**
* Booking chuyển sang hoàn thành.
* Phòng được trả về trạng thái trống/khả dụng.
* Phòng có thể xuất hiện trở lại ở kết quả tìm kiếm cho lượt đặt tiếp theo.

## 3. Tiêu chí đạt

* User có thể đặt phòng thành công bằng tài khoản `user@gmail.com`.
* Partner có thể thấy và duyệt booking bằng tài khoản `partner@gmail.com`.
* Luồng xác nhận, check-in và check-out hoạt động xuyên suốt.
* Trạng thái phòng được cập nhật đúng trước và sau booking.
* (Nếu nghiệp vụ đã bật sinh hợp đồng khi confirm) Sau xác nhận, Partner và User đều tra cứu được hợp đồng gắn booking với loại và dữ liệu khớp kỳ vọng (xem Bước 3b).

## 4. Ghi chú kiểm thử

* Nếu hệ thống yêu cầu OTP, email xác thực hoặc đổi mật khẩu lần đầu, cần hoàn tất bước đó trước khi chạy kịch bản này.
* Nếu phòng test đang bận, chọn một phòng khác nhưng vẫn giữ nguyên tài khoản kiểm thử.
* Nếu muốn dùng file này như checklist UAT, nên ghi thêm `roomId`, `bookingId` thực tế sau khi tạo booking, và tổng tiền thực tế sau khi đặt thành công.
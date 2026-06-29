# Test Case Manual - Phân hệ Trang Public

## 1. Phạm vi

Tài liệu này bao phủ các màn hình public-facing và route public trong hệ thống FE:

- Trang chủ `/`
- Tìm phòng `/search/rooms`
- Tìm phòng theo tỉnh `/search/rooms/province/:provinceId`
- Danh sách đối tác theo tỉnh `/:provinceNameEn/partners`
- Chi tiết đối tác `/partner/detail/:partner_id`
- Chi tiết phòng `/rooms/:roomId`
- Đặt phòng `/booking/:roomId`
- Đặt phòng của tôi `/my-bookings`
- Đặt phòng thành công `/booking-success`
- Company hub `/company`
- Danh sách tin tức `/news-list`
- Chi tiết tin tức `/news/:newsId`
- FAQ `/faq`
- Đăng ký đối tác `/partner/register`
- Trở thành đối tác `/become-a-partner`
- Đăng nhập đối tác `/partner/login`

## 2. Môi trường và dữ liệu mẫu

- Base URL local đề xuất: `http://localhost:5173`
- Chạy local: `npm run dev`
- Dữ liệu dynamic cần có sẵn trên môi trường test:
- `provinceNameEn`: `ha_noi`
- `provinceId`: `1`
- `partner_id`: ID đối tác đang active, có ít nhất 1 phòng public
- `roomId`: ID phòng public còn có thể đặt
- `newsId`: ID bài viết đã publish
- Email tra cứu đơn: email đã từng đặt phòng
- Mã đặt phòng: ví dụ `RM-2026-000042`

## 3. Nguyên tắc test

- Test trên desktop và mobile responsive.
- Kiểm tra console browser không có lỗi nghiêm trọng.
- Kiểm tra URL, điều hướng, dữ liệu hiển thị, thông báo, trạng thái loading.

## 4. Danh sách test case

| TC ID | Màn hình | URL | Tiền điều kiện | Hành động test manual | Kết quả mong đợi |
|---|---|---|---|---|---|
| PUB-01 | Trang chủ | `/` | Hệ thống chạy bình thường | 1. Mở `http://localhost:5173/` 2. Quan sát header, hero, section phòng/đối tác/tin tức | Trang load thành công, không trắng trang, header/footer hiển thị đầy đủ |
| PUB-02 | Chuyển ngôn ngữ | `/` | Đang ở trang public bất kỳ | 1. Chọn language switcher 2. Đổi từ `VI` sang `EN` 3. Refresh trang | Text giao diện đổi theo ngôn ngữ đã chọn và được giữ sau refresh nếu có cơ chế lưu |
| PUB-03 | Điều hướng từ hero search | `/` | Có room/province dữ liệu | 1. Nhập địa điểm/tỉnh trong form tìm kiếm 2. Chọn ngày nhận-trả phòng 3. Bấm tìm | Điều hướng sang `/search/rooms` kèm query phù hợp, danh sách kết quả được tải |
| PUB-04 | Company hub | `/company` | Có dữ liệu province/partner | 1. Mở trang company 2. Chọn 1 tỉnh/thành 3. Bấm CTA xem đối tác | Điều hướng đúng về route `/:provinceNameEn/partners` |
| PUB-05 | Danh sách đối tác theo tỉnh | `/ha_noi/partners` | Tỉnh `ha_noi` hợp lệ | 1. Mở URL 2. Kiểm tra danh sách đối tác 3. Thử expand/collapse nếu có block thông tin | Danh sách đối tác hiển thị, không vỡ layout, thao tác mở/rút hoạt động |
| PUB-06 | Chi tiết đối tác | `/partner/detail/:partner_id` | `partner_id` hợp lệ | 1. Mở chi tiết đối tác 2. Kiểm tra thông tin cơ bản, hình ảnh, danh sách phòng 3. Bấm vào 1 phòng | Thông tin đối tác hiển thị đúng, có thể điều hướng sang chi tiết phòng |
| PUB-07 | Tìm phòng cơ bản | `/search/rooms` | Có data phòng public | 1. Mở trang tìm phòng 2. Không nhập filter 3. Bấm tìm hoặc chờ auto-load | Danh sách phòng hiển thị, có phần loading và pagination/per-page nếu đủ data |
| PUB-08 | Tìm phòng theo tỉnh | `/search/rooms` | Có province hợp lệ | 1. Chọn tỉnh/thành 2. Chọn ngày 3. Bấm tìm | Kết quả được lọc theo tỉnh, URL/query thay đổi đúng |
| PUB-09 | Lọc nâng cao phòng | `/search/rooms` | Có data phòng đã đăng | 1. Chọn loại phòng 2. Chọn mức giá 3. Chọn rating/amenity/service 4. Quan sát kết quả | Danh sách thay đổi đúng theo filter, không bị treo UI, có thể clear filter |
| PUB-10 | Reset filter tìm phòng | `/search/rooms` | Đã áp nhiều filter | 1. Bấm reset/clear filter 2. Quan sát URL và danh sách | Filter được xóa hết, kết quả trở về mặc định |
| PUB-11 | Pagination tìm phòng | `/search/rooms` | Kết quả > 1 trang | 1. Chuyển trang 2. Đổi số lượng item/page | URL/query và danh sách cập nhật đúng, scroll về vùng kết quả nếu có xử lý |
| PUB-12 | Tìm phòng theo tỉnh bằng route riêng | `/search/rooms/province/1` | `provinceId=1` tồn tại | 1. Mở URL 2. Chuyển page 3. Đổi per-page | Danh sách phòng của tỉnh đó hiển thị, pagination hoạt động đúng |
| PUB-13 | Chi tiết phòng | `/rooms/:roomId` | `roomId` hợp lệ | 1. Mở chi tiết phòng 2. Kiểm tra gallery, thông tin phòng, giá, amenity/service 3. Scroll các section | Trang hiển thị đầy đủ, hình fallback hiển thị đúng nếu ảnh lỗi, không vỡ layout |
| PUB-14 | Chọn ngày trên chi tiết phòng | `/rooms/:roomId` | `roomId` hợp lệ | 1. Chọn ngày nhận phòng 2. Chọn ngày trả phòng 3. Thử clear dates | Ngày được cập nhật đúng, thông tin giá/tạm tính thay đổi theo khoảng ngày |
| PUB-15 | Chuyển kiểu giá theo đêm/tháng | `/rooms/:roomId` | Phòng có bảng giá theo đơn vị | 1. Ở chi tiết phòng, đổi tab/option giá theo đêm-tháng nếu có 2. Quan sát booking card | Đơn giá, cách tính và nhãn hiển thị cập nhật đúng |
| PUB-16 | Mở trang đặt phòng | `/booking/:roomId` | `roomId` public hợp lệ | 1. Từ chi tiết phòng bấm đặt ngay, hoặc mở trực tiếp URL 2. Kiểm tra thông tin phòng và form | Trang booking load thành công, thông tin phòng đúng với room đã chọn |
| PUB-17 | Validate bắt buộc trên form đặt phòng | `/booking/:roomId` | `roomId` hợp lệ | 1. Để trống họ tên/email/SDT/ngày 2. Bấm tiếp tục xác nhận | Hiện lỗi validate dưới field, không qua bước tiếp theo |
| PUB-18 | Validate định dạng email/SDT | `/booking/:roomId` | `roomId` hợp lệ | 1. Nhập email sai định dạng 2. Nhập SDT không hợp lệ 3. Bấm tiếp tục | Hiện thông báo validate đúng, field sai không được submit |
| PUB-19 | Chọn dịch vụ bổ sung | `/booking/:roomId` | Phòng có services | 1. Tick 1 vài dịch vụ 2. Dùng chức năng chọn tất cả bổ sung nếu có 3. Bỏ chọn lại | Tổng tiền dịch vụ và tổng tạm tính cập nhật đúng |
| PUB-20 | Logic đặt cọc bắt buộc | `/booking/:roomId` | Chọn bộ ngày thỏa điều kiện đặt cọc | 1. Chọn ngày gần ngày hiện tại hoặc có weekend/dài hạn 2. Quan sát block payment | Hệ thống khóa thanh toán theo logic đặt cọc, hiện mức đặt cọc và số tiền còn lại đúng |
| PUB-21 | Xác nhận đặt phòng bước 2 | `/booking/:roomId` | Form hợp lệ | 1. Điền form hợp lệ 2. Bấm `Tiếp tục xác nhận` 3. Đối chiếu thông tin preview | Màn preview hiện đúng thông tin khách, ngày ở, thanh toán, dịch vụ, tổng tiền |
| PUB-22 | Đặt phòng thành công | `/booking/:roomId` -> `/booking-success` | Có API tạo booking thành công | 1. Submit booking 2. Theo dõi điều hướng | Điều hướng sang `/booking-success`, thông tin mã đơn/phòng/tổng tiền hiển thị đúng |
| PUB-23 | Reload trang booking-success | `/booking-success` | Vừa tạo booking thành công | 1. Tải lại trang booking-success | Trang vẫn xử lý ổn định; nếu phụ thuộc state thì cần hiện thông báo phù hợp, không crash |
| PUB-24 | Tra cứu đơn không cần đăng nhập | `/my-bookings` | Có email + booking code hợp lệ | 1. Mở trang 2. Nhập email và mã đặt phòng 3. Bấm `Tra cứu` | Hiện toast thành công, đơn đặt phòng hiện ở đúng tab trạng thái |
| PUB-25 | Tra cứu đơn với thông tin sai | `/my-bookings` | Không có booking phù hợp | 1. Nhập email/booking code sai 2. Bấm `Tra cứu` | Hiện toast báo không tìm thấy hoặc thất bại, không vỡ trang |
| PUB-26 | Chuyển tab trên My Bookings | `/my-bookings` | Đã có ít nhất 1 kết quả | 1. Chuyển giữa `Sắp tới`, `Hoàn thành`, `Đã hủy` | Danh sách lọc đúng theo tab |
| PUB-27 | Link từ My Bookings sang room detail | `/my-bookings` | Kết quả lookup có `roomId` | 1. Sau khi tra cứu, bấm `Xem phòng` | Điều hướng đúng sang `/rooms/:roomId` |
| PUB-28 | Danh sách tin tức | `/news-list` | Có bài viết publish | 1. Mở trang 2. Chuyển page nếu có 3. Bấm 1 bài viết | Danh sách bài viết hiển thị đúng, phân trang hoạt động, điều hướng sang chi tiết |
| PUB-29 | Chi tiết tin tức | `/news/:newsId` | `newsId` hợp lệ | 1. Mở chi tiết 2. Thử copy link 3. Thử nút share social nếu có | Nội dung bài viết hiển thị đúng, thao tác copy/share không gây lỗi UI |
| PUB-30 | FAQ | `/faq` | Hệ thống chatbot bật nếu có feature flag | 1. Mở trang FAQ 2. Expand/collapse câu hỏi 3. Bấm CTA liên hệ/chatbot nếu có | Accordion mở đóng đúng, CTA hoạt động đúng mục tiêu |
| PUB-31 | Đăng ký đối tác | `/partner/register` | Chưa đăng nhập partner | 1. Mở trang đăng ký 2. Nhập thiếu thông tin 3. Thử nhập đầy đủ hợp lệ | Validate hiển thị đúng; với dữ liệu hợp lệ thì gửi form thành công hoặc hiện thông báo phù hợp |
| PUB-32 | Trang Become a Partner | `/become-a-partner` | Chưa đăng nhập | 1. Mở trang 2. Bấm CTA đăng ký/đăng nhập đối tác | CTA điều hướng đúng tới route partner register/login |
| PUB-33 | Đăng nhập đối tác | `/partner/login` | Có tài khoản partner hợp lệ | 1. Thử login sai 2. Thử login đúng | Login sai báo lỗi; login đúng điều hướng về `/partner/dashboard` |
| PUB-34 | Header/Footer public | Bất kỳ trang public | Đang ở desktop và mobile | 1. Kiểm tra logo/menu/footer 2. Bấm các link chính | Link điều hướng đúng, layout responsive không bị vỡ |
| PUB-35 | Route sai | `/abc-public-not-found` | Không cần | 1. Mở URL sai | Hệ thống redirect theo cấu hình hiện tại, không treo trang |

## 5. Test bổ sung nên thực hiện

- Test responsive trên mobile cho: `/`, `/search/rooms`, `/rooms/:roomId`, `/booking/:roomId`, `/my-bookings`.
- Test với dữ liệu rỗng:
- Tỉnh không có phòng
- Đối tác không có phòng
- Tin tức không tồn tại
- Mã đặt phòng sai
- Test với mạng chậm để kiểm tra loading skeleton/spinner.

## 6. Ghi chú

- Một số route cần ID/token động. Khi test manual, thay `:roomId`, `:partner_id`, `:newsId`, `:token` bằng dữ liệu thật trên môi trường test.
- Route wildcard hiện đang redirect về `/admin/login`, do đó khi test route sai ở public cần ghi nhận theo đúng behavior hiện tại của code.

# Test Case Manual - Phân hệ Partner Portal

## 1. Phạm vi

Tài liệu này bao phủ các màn hình và route chính của partner portal:

- Đăng nhập đối tác `/partner/login`
- Onboarding đối tác `/partner/onboarding`
- Dashboard `/partner/dashboard`
- Phòng & Đơn vị `/partner/units`
- Quản lý Cơ sở `/partner/properties`
- Danh sách booking `/partner/bookings`
- Yêu cầu hủy `/partner/cancellation-requests`
- Danh mục dịch vụ `/partner/catalog/services`
- Danh mục tiện ích `/partner/catalog/amenities`
- Tài chính & Đối soát `/partner/finance`
- Tin tức đối tác `/partner/news`
- Bảo trì `/partner/maintenances`
- Hợp đồng `/partner/contracts`
- Chi tiết hợp đồng `/partner/contracts/:id`
- Yêu cầu dịch vụ lưu trú `/partner/stay-services`
- Lịch khả dụng `/partner/calendar`
- Quy tắc giá `/partner/price-rules`
- Chat `/partner/chat`
- Báo cáo `/partner/reports`
- Thông báo `/partner/notifications`
- Hồ sơ đối tác `/partner/profile`
- Phòng theo cơ sở `/partner/properties/:propertyId/rooms`
- Chi tiết phòng `/partner/rooms/:roomId`

## 2. Môi trường và dữ liệu mẫu

- Base URL local đề xuất: `http://localhost:5173`
- Chạy local: `npm run dev`
- Tài khoản partner active:
- Email partner hợp lệ
- Mật khẩu hợp lệ
- Tài khoản partner pending/rejected để test onboarding
- Dữ liệu mẫu nên có:
- Ít nhất 1 cơ sở
- Ít nhất 3 phòng với trạng thái khác nhau: trống, đang thuê, ẩn/bảo trì
- Ít nhất 1 booking chờ duyệt
- Ít nhất 1 booking đã duyệt và chưa check-in
- Ít nhất 1 booking đang ở
- Ít nhất 1 kỳ đối soát trạng thái `issued`
- Ít nhất 1 hợp đồng đã tạo

## 3. Nguyên tắc test

- Test trên desktop và mobile responsive.
- Kiểm tra route bảo vệ: chưa đăng nhập phải bị chuyển về `/partner/login`.
- Kiểm tra loading, toast, validate, phân trang, filter và cập nhật dữ liệu sau thao tác.
- Kiểm tra các thao tác quan trọng không gây vỡ layout hoặc trắng trang.

## 4. Danh sách test case

| TC ID | Màn hình | URL | Tiền điều kiện | Hành động test manual | Kết quả mong đợi |
|---|---|---|---|---|---|
| PARTNER-01 | Đăng nhập partner | `/partner/login` | Chưa đăng nhập | 1. Mở trang login 2. Kiểm tra form email, password, remember me | Form hiển thị đầy đủ, không lỗi giao diện |
| PARTNER-02 | Validate login rỗng | `/partner/login` | Chưa đăng nhập | 1. Để trống email/password 2. Bấm đăng nhập | Hiển thị lỗi validate đúng từng field |
| PARTNER-03 | Login sai thông tin | `/partner/login` | Chưa đăng nhập | 1. Nhập email/password sai 2. Bấm đăng nhập | Hiển thị toast/thông báo lỗi, không vào portal |
| PARTNER-04 | Hiện/ẩn mật khẩu | `/partner/login` | Chưa đăng nhập | 1. Nhập mật khẩu 2. Bấm icon mắt 2 lần | Mật khẩu chuyển đổi đúng giữa ẩn/hiện |
| PARTNER-05 | Remember me | `/partner/login` | Có tài khoản hợp lệ | 1. Tick `remember me` 2. Login thành công 3. Đăng xuất 4. Mở lại login | Email được ghi nhớ theo đúng hành vi mong đợi |
| PARTNER-06 | Login partner active | `/partner/login` | Tài khoản partner active | 1. Nhập đúng tài khoản 2. Bấm đăng nhập | Điều hướng tới `/partner/dashboard` |
| PARTNER-07 | Login partner pending/rejected | `/partner/login` | Tài khoản partner status khác active | 1. Login bằng tài khoản pending/rejected | Điều hướng tới `/partner/onboarding` |
| PARTNER-08 | Route guard partner | `/partner/dashboard` | Chưa đăng nhập | 1. Mở trực tiếp URL dashboard | Bị chuyển về `/partner/login` |
| PARTNER-09 | Onboarding đối tác | `/partner/onboarding` | Login bằng tài khoản pending/rejected | 1. Mở wizard onboarding 2. Kiểm tra các bước 3. Thử nhập thiếu và nhập đủ | Wizard hiển thị đúng, validate đúng, gửi dữ liệu thành công hoặc báo lỗi phù hợp |
| PARTNER-10 | Dashboard tải dữ liệu | `/partner/dashboard` | Đã đăng nhập partner | 1. Mở dashboard 2. Quan sát KPI, biểu đồ, panel booking chờ xử lý | Dữ liệu dashboard tải thành công, có loading hợp lý |
| PARTNER-11 | Lọc dashboard theo cơ sở | `/partner/dashboard` | Có nhiều cơ sở | 1. Chọn từng cơ sở trong bộ lọc 2. Quan sát KPI và widget | Số liệu thay đổi theo cơ sở đã chọn |
| PARTNER-12 | Refresh dashboard | `/partner/dashboard` | Đang ở dashboard | 1. Bấm `Làm mới` | Dữ liệu được refetch, thời gian cập nhật thay đổi |
| PARTNER-13 | Duyệt booking nhanh từ dashboard | `/partner/dashboard` | Có booking chờ duyệt | 1. Bấm `Duyệt` tại card booking chờ 2. Chờ hoàn tất | Booking được duyệt, dashboard cập nhật lại, có thông báo thành công |
| PARTNER-14 | Hoàn tác duyệt nhanh | `/partner/dashboard` | Có booking vừa bấm duyệt nhanh | 1. Bấm `Duyệt` 2. Bấm `Hoàn tác` trong thời gian chờ | Trạng thái booking quay lại như trước |
| PARTNER-15 | Từ chối booking từ dashboard | `/partner/dashboard` | Có booking chờ duyệt | 1. Bấm `Từ chối` 2. Nhập lý do 3. Xác nhận | Booking bị từ chối, có toast thành công, dữ liệu reload |
| PARTNER-16 | Quản lý cơ sở - tải danh sách | `/partner/properties` | Đã đăng nhập, có dữ liệu cơ sở | 1. Mở trang cơ sở 2. Kiểm tra bảng/card danh sách | Danh sách cơ sở hiển thị đúng, có tổng số và phân trang |
| PARTNER-17 | Tìm kiếm cơ sở | `/partner/properties` | Có nhiều cơ sở | 1. Nhập từ khóa tên/địa chỉ 2. Chờ debounce | Danh sách lọc đúng theo từ khóa |
| PARTNER-18 | Lọc nâng cao cơ sở | `/partner/properties` | Có dữ liệu đa dạng | 1. Chọn loại hình 2. Chọn hình thức thuê 3. Chọn tỉnh/phường, sort, rating | Kết quả cập nhật đúng theo bộ lọc |
| PARTNER-19 | Reset filter cơ sở | `/partner/properties` | Đã áp filter | 1. Bấm xóa bộ lọc | Bộ lọc trở về mặc định, danh sách reload đúng |
| PARTNER-20 | Thêm cơ sở mới | `/partner/properties` | Có quyền thao tác | 1. Bấm `Thêm Bất động sản` 2. Nhập đủ thông tin bắt buộc 3. Lưu | Tạo cơ sở thành công, danh sách cập nhật |
| PARTNER-21 | Validate thêm/sửa cơ sở | `/partner/properties` | Mở form tạo/sửa | 1. Để thiếu tên/tỉnh/phường/loại hình/hình thức thuê 2. Bấm lưu | Không cho lưu hoặc nút lưu bị khóa theo đúng logic |
| PARTNER-22 | Sửa cơ sở | `/partner/properties` | Có sẵn cơ sở | 1. Mở menu thao tác 2. Chọn `Sửa` 3. Đổi thông tin 4. Lưu | Dữ liệu cơ sở cập nhật thành công |
| PARTNER-23 | Quản lý ảnh cơ sở | `/partner/properties` | Có cơ sở | 1. Mở menu thao tác 2. Chọn `Ảnh` 3. Upload/xóa ảnh | Ảnh được cập nhật đúng, giao diện preview ổn định |
| PARTNER-24 | Xóa 1 cơ sở | `/partner/properties` | Có cơ sở có thể xóa | 1. Chọn `Xóa` 2. Xác nhận | Cơ sở bị xóa, danh sách cập nhật hoặc báo lỗi nghiệp vụ phù hợp |
| PARTNER-25 | Xóa hàng loạt cơ sở | `/partner/properties` | Có nhiều cơ sở | 1. Tick nhiều dòng 2. Bấm xóa hàng loạt 3. Nhập chuỗi xác nhận 4. Xác nhận | Chỉ xóa khi nhập đúng chuỗi xác nhận, kết quả hiển thị đúng |
| PARTNER-26 | Điều hướng từ cơ sở sang danh sách phòng | `/partner/properties` | Có cơ sở | 1. Mở menu thao tác 2. Chọn `Quản lý phòng` | Điều hướng tới `/partner/properties/:propertyId/rooms` đúng cơ sở |
| PARTNER-27 | Trang phòng & đơn vị | `/partner/units` | Có dữ liệu phòng | 1. Mở trang 2. Kiểm tra KPI và danh sách phòng | Danh sách tải đúng, hiển thị trạng thái phòng |
| PARTNER-28 | Lọc phòng theo cơ sở/trạng thái | `/partner/units` | Có nhiều phòng/cơ sở | 1. Chọn cơ sở 2. Chọn chip `Trống/Đang thuê/Bảo trì/Ẩn` | Danh sách phòng lọc đúng |
| PARTNER-29 | Thêm phòng từ Units | `/partner/units` | Đã chọn cơ sở hoặc chỉ có 1 cơ sở | 1. Bấm `Thêm phòng mới` 2. Nhập form 3. Lưu | Phòng được tạo thành công |
| PARTNER-30 | Chặn thêm phòng khi chưa chọn cơ sở | `/partner/units` | Có nhiều cơ sở, chưa chọn cơ sở | 1. Bấm `Thêm phòng mới` | Hiển thị lỗi yêu cầu chọn cơ sở trước |
| PARTNER-31 | Ẩn/hiện phòng từ Units | `/partner/units` | Có phòng visible/hidden | 1. Mở menu dòng phòng 2. Chọn `Ẩn` hoặc `Hiển thị` | Trạng thái công khai của phòng thay đổi đúng |
| PARTNER-32 | Xem booking của phòng đang thuê | `/partner/units` | Có phòng đang thuê | 1. Mở menu thao tác 2. Chọn `Xem booking` | Điều hướng tới `/partner/bookings` với filter room phù hợp |
| PARTNER-33 | Quản lý phòng theo cơ sở - grid | `/partner/properties/:propertyId/rooms` | Có cơ sở hợp lệ | 1. Mở trang 2. Kiểm tra header, bộ lọc, card phòng | Trang hiển thị đúng danh sách phòng của cơ sở |
| PARTNER-34 | Tìm và lọc phòng theo cơ sở | `/partner/properties/:propertyId/rooms` | Có nhiều phòng | 1. Nhập số phòng 2. Chọn trạng thái visible/hidden | Kết quả lọc đúng |
| PARTNER-35 | Chế độ bulk ở danh sách phòng | `/partner/properties/:propertyId/rooms` | Có nhiều phòng | 1. Bật `Sửa` 2. Chọn nhiều phòng 3. Thử `Hiện phòng`, `Ẩn phòng`, `Xóa hàng loạt` | Thao tác hàng loạt cập nhật đúng, số lượng chọn hiển thị đúng |
| PARTNER-36 | Chuyển view occupancy | `/partner/properties/:propertyId/rooms` | Có dữ liệu occupancy | 1. Chuyển từ `Danh sách` sang `Trạng thái & Lịch` | Sơ đồ tầng/phòng hiển thị đúng theo màu trạng thái |
| PARTNER-37 | Mở nhanh chi tiết phòng từ occupancy | `/partner/properties/:propertyId/rooms` | Có phòng occupied | 1. Bấm vào ô phòng đang ở | Hiển thị quick detail hoặc chuyển đúng sang chi tiết/phanel tương ứng |
| PARTNER-38 | Chi tiết phòng - tổng quan | `/partner/rooms/:roomId` | Có `roomId` hợp lệ | 1. Mở chi tiết phòng 2. Kiểm tra header, badge, stat card | Thông tin phòng hiển thị đúng |
| PARTNER-39 | Chuyển tab chi tiết phòng | `/partner/rooms/:roomId` | Có dữ liệu liên quan | 1. Chuyển lần lượt các tab `Tổng quan`, `Tiện ích`, `Lịch sử đặt phòng`, `Bảo trì`, `Hình ảnh`, `Địa điểm du lịch`, `Đánh giá` | Mỗi tab hiển thị đúng dữ liệu, không lỗi điều hướng |
| PARTNER-40 | Sửa phòng từ room detail | `/partner/rooms/:roomId` | Có quyền thao tác | 1. Bấm `Chỉnh sửa phòng` 2. Cập nhật thông tin 3. Lưu | Dữ liệu phòng cập nhật thành công |
| PARTNER-41 | Quản lý ảnh phòng | `/partner/rooms/:roomId` | Có `roomId` hợp lệ | 1. Vào tab gallery hoặc nút quản lý ảnh 2. Upload/xóa ảnh | Ảnh được cập nhật và danh sách ảnh refresh đúng |
| PARTNER-42 | Tạo phiếu bảo trì từ room detail | `/partner/rooms/:roomId` | Có `roomId` hợp lệ | 1. Bấm `Bảo trì` 2. Nhập thông tin 3. Lưu | Phiếu bảo trì được tạo, tab bảo trì cập nhật |
| PARTNER-43 | Cập nhật trạng thái bảo trì | `/partner/rooms/:roomId?tab=maintenance` | Có phiếu bảo trì mở | 1. Chuyển trạng thái sang `in_progress` hoặc `completed` | Trạng thái cập nhật, có toast thành công |
| PARTNER-44 | Quản lý địa điểm du lịch của phòng | `/partner/rooms/:roomId?tab=tourist_spots` | Có room và tourist spot | 1. Thêm liên kết địa điểm 2. Sửa liên kết 3. Xóa liên kết | CRUD hoạt động đúng, có xác nhận xóa |
| PARTNER-45 | Danh sách booking | `/partner/bookings` | Có dữ liệu booking | 1. Mở trang booking 2. Kiểm tra tab trạng thái, bảng, front desk/today panel nếu có | Dữ liệu tải thành công, thống kê và trạng thái hiển thị đúng |
| PARTNER-46 | Tìm kiếm và filter booking | `/partner/bookings` | Có dữ liệu booking | 1. Tìm theo ID/từ khóa 2. Chuyển tab trạng thái 3. Xóa filter phòng nếu có | Danh sách lọc đúng, URL query cập nhật phù hợp |
| PARTNER-47 | Duyệt booking từ trang booking | `/partner/bookings` | Có booking status chờ duyệt | 1. Bấm `Duyệt` 2. Chờ xử lý | Booking chuyển trạng thái thành công |
| PARTNER-48 | Từ chối booking từ trang booking | `/partner/bookings` | Có booking status chờ duyệt | 1. Bấm `Từ chối` 2. Nhập lý do 3. Xác nhận | Booking bị từ chối, có thông báo thành công |
| PARTNER-49 | Check-in booking | `/partner/bookings` | Có booking đã duyệt, đủ điều kiện check-in | 1. Bấm `Check-in` 2. Xác nhận | Booking chuyển sang trạng thái đang ở |
| PARTNER-50 | Chặn check-in khi cọc chưa hợp lệ | `/partner/bookings` | Có booking bị khóa bởi đặt cọc | 1. Quan sát nút check-in của booking tương ứng | Nút bị khóa/disabled đúng theo rule, tooltip/thông tin giải thích hiển thị |
| PARTNER-51 | Check-out booking | `/partner/bookings` | Có booking đang ở | 1. Bấm `Check-out` 2. Xác nhận | Booking chuyển thành hoàn thành |
| PARTNER-52 | Đánh dấu no-show | `/partner/bookings` | Có booking quá ngày check-in mà chưa đến | 1. Bấm `Không đến` 2. Xác nhận | Booking chuyển đúng trạng thái no-show |
| PARTNER-53 | Bulk confirm booking | `/partner/bookings` | Có nhiều booking chờ duyệt | 1. Tick nhiều booking 2. Bấm xác nhận hàng loạt 3. Xác nhận | Các booking hợp lệ được duyệt, có kết quả tổng hợp |
| PARTNER-54 | Bulk cancel booking | `/partner/bookings` | Có nhiều booking có thể hủy | 1. Tick nhiều booking 2. Bấm hủy hàng loạt 3. Nhập lý do | Kết quả hủy trả về đúng số thành công/thất bại |
| PARTNER-55 | Xem chi tiết booking/biên lai cọc | `/partner/bookings` | Có booking có receipt | 1. Bấm icon xem chi tiết 2. Mở receipt nếu có 3. Xác nhận cọc nếu có chức năng | Modal chi tiết mở đúng, receipt hiển thị được |
| PARTNER-56 | Yêu cầu hủy | `/partner/cancellation-requests` | Có yêu cầu hủy | 1. Mở danh sách 2. Filter/tìm kiếm 3. Duyệt hoặc từ chối từng yêu cầu | Trạng thái yêu cầu hủy cập nhật đúng |
| PARTNER-57 | Danh mục dịch vụ | `/partner/catalog/services` | Có dữ liệu dịch vụ | 1. Mở tab dịch vụ 2. Kiểm tra số lượng 3. Thêm/sửa/xóa nếu chức năng khả dụng | Danh mục dịch vụ hiển thị và thao tác đúng |
| PARTNER-58 | Danh mục tiện ích | `/partner/catalog/amenities` | Có dữ liệu tiện ích | 1. Chuyển sang tab tiện ích 2. Kiểm tra số lượng và thao tác | Danh mục tiện ích hiển thị và cập nhật đúng |
| PARTNER-59 | Tài chính & đối soát | `/partner/finance` | Có ít nhất 1 kỳ đối soát | 1. Mở trang 2. Kiểm tra KPI, bảng lịch sử, hướng dẫn chuyển khoản | Dữ liệu đối soát hiển thị đúng |
| PARTNER-60 | Refresh và phân trang đối soát | `/partner/finance` | Có nhiều kỳ đối soát | 1. Bấm `Làm mới` 2. Chuyển page 3. Đổi per-page | Dữ liệu reload đúng, phân trang hoạt động |
| PARTNER-61 | Export Excel/PDF đối soát | `/partner/finance` | Có kỳ đối soát | 1. Bấm tải Excel 2. Bấm tải PDF | File được tải đúng hoặc hiển thị lỗi hợp lý nếu thất bại |
| PARTNER-62 | Copy thông tin chuyển khoản | `/partner/finance` | Có block thông tin ngân hàng | 1. Bấm copy số tài khoản 2. Bấm copy cú pháp CK | Hiển thị toast sao chép thành công |
| PARTNER-63 | Khiếu nại kỳ đối soát | `/partner/finance` | Có kỳ trạng thái `issued` | 1. Bấm `Khiếu nại` 2. Để trống lý do 3. Nhập lý do hợp lệ 4. Gửi | Bắt lỗi khi để trống; gửi hợp lệ thì kỳ chuyển trạng thái tranh chấp |
| PARTNER-64 | Danh sách hợp đồng | `/partner/contracts` | Có dữ liệu hợp đồng | 1. Mở trang 2. Tìm theo tiêu đề/tên khách 3. Mở chi tiết hợp đồng | Danh sách hiển thị đúng, filter hoạt động |
| PARTNER-65 | Tạo hợp đồng mới | `/partner/contracts` | Có booking confirmed đủ điều kiện tạo hợp đồng | 1. Bấm `Tạo hợp đồng mới` 2. Chọn booking 3. Nhập tiêu đề/nội dung 4. Lưu | Hợp đồng được tạo thành công và xuất hiện trong danh sách |
| PARTNER-66 | Validate tạo hợp đồng | `/partner/contracts` | Mở modal tạo hợp đồng | 1. Không chọn booking hoặc để trống tiêu đề/nội dung 2. Bấm tạo | Hiển thị lỗi phù hợp, không tạo hợp đồng |
| PARTNER-67 | Chi tiết hợp đồng | `/partner/contracts/:id` | Có `contractId` hợp lệ | 1. Mở chi tiết hợp đồng 2. Kiểm tra nội dung, trạng thái, file/chữ ký nếu có | Chi tiết hợp đồng hiển thị đúng |
| PARTNER-68 | Yêu cầu dịch vụ lưu trú | `/partner/stay-services` | Có dữ liệu request | 1. Mở trang 2. Filter trạng thái 3. Xử lý yêu cầu nếu có | Danh sách hiển thị đúng, cập nhật trạng thái thành công |
| PARTNER-69 | Lịch khả dụng | `/partner/calendar` | Feature calendar bật | 1. Mở lịch 2. Chuyển tháng/tuần 3. Xem booking trên lịch 4. Tạo/chặn lịch nếu có | Lịch tải đúng, sự kiện hiển thị đúng |
| PARTNER-70 | Quy tắc giá | `/partner/price-rules` | Có dữ liệu cơ sở/phòng | 1. Mở trang 2. Tạo/sửa rule giá 3. Kiểm tra danh sách rule | Rule giá được lưu và hiển thị đúng |
| PARTNER-71 | Chat | `/partner/chat` | Có hội thoại hoặc kết nối realtime | 1. Mở trang chat 2. Chọn hội thoại 3. Gửi tin nhắn 4. Đính kèm ảnh nếu có | Tin nhắn gửi thành công, UI chat không lỗi |
| PARTNER-72 | Báo cáo | `/partner/reports` | Có dữ liệu báo cáo | 1. Mở trang báo cáo 2. Đổi filter/khoảng thời gian nếu có | Số liệu và biểu đồ cập nhật đúng |
| PARTNER-73 | Thông báo | `/partner/notifications` | Có cả thông báo đã đọc/chưa đọc | 1. Mở trang 2. Chuyển tab `Tất cả/Chưa đọc` | Danh sách lọc đúng |
| PARTNER-74 | Đánh dấu đã đọc thông báo | `/partner/notifications` | Có thông báo unread | 1. Click vào 1 thông báo unread hoặc bấm icon check | Thông báo chuyển sang đã đọc |
| PARTNER-75 | Đánh dấu tất cả đã đọc | `/partner/notifications` | Có nhiều thông báo unread | 1. Bấm `Đánh dấu tất cả đã đọc` | Toàn bộ thông báo chuyển đã đọc, badge unread cập nhật |
| PARTNER-76 | Điều hướng từ thông báo sang màn liên quan | `/partner/notifications` | Có notification có link | 1. Bấm `Chi tiết` | Điều hướng tới route liên kết chính xác |
| PARTNER-77 | Hồ sơ đối tác | `/partner/profile` | Đã đăng nhập partner | 1. Mở trang hồ sơ 2. Kiểm tra dữ liệu cá nhân và doanh nghiệp | Thông tin hiện đúng từ API |
| PARTNER-78 | Cập nhật hồ sơ đối tác | `/partner/profile` | Có dữ liệu partner | 1. Sửa tên, điện thoại, công ty, website, mô tả, địa chỉ 2. Lưu | Hồ sơ cập nhật thành công, tên user nếu đổi được refresh đúng |
| PARTNER-79 | Phụ thuộc tỉnh/phường ở hồ sơ | `/partner/profile` | Có danh mục tỉnh/phường | 1. Đổi tỉnh 2. Kiểm tra ward reset 3. Chọn phường mới | Phường được reset và tải lại theo tỉnh đã chọn |
| PARTNER-80 | Quản lý ảnh đối tác public | `/partner/profile` | Có dialog quản lý ảnh đối tác | 1. Bấm `Quản lý ảnh đối tác` 2. Upload/chỉnh/xóa ảnh | Ảnh hiển thị đúng trong preview, cập nhật thành công |
| PARTNER-81 | Route partner không hợp lệ | `/partner/unknown-page` | Đã đăng nhập partner | 1. Mở URL không tồn tại | Hệ thống xử lý theo cấu hình hiện tại, không treo trắng trang |

## 5. Test bổ sung nên thực hiện

- Test responsive các trang chính:
- `/partner/dashboard`
- `/partner/properties`
- `/partner/units`
- `/partner/bookings`
- `/partner/profile`
- Test với dữ liệu rỗng:
- Partner chưa có cơ sở
- Cơ sở chưa có phòng
- Chưa có booking
- Chưa có hợp đồng
- Chưa có kỳ đối soát
- Test quyền và trạng thái:
- Partner active
- Partner pending/rejected
- Booking không đủ điều kiện check-in
- Tính năng calendar bật/tắt theo feature flag
- Test mạng chậm để kiểm tra skeleton/loading/spinner/toast retry.

## 6. Ghi chú

- Các route động như `:propertyId`, `:roomId`, `:id` cần thay bằng dữ liệu thật trên môi trường test.
- Một số chức năng phụ thuộc dữ liệu backend hoặc feature flag, cần ghi nhận rõ nếu không hiển thị do cấu hình môi trường.
- Với các thao tác thay đổi trạng thái booking, nên test trên dữ liệu sandbox riêng để tránh ảnh hưởng vận hành.

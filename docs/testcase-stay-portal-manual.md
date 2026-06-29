# Test Case Manual - Phân hệ BKS Stay Portal

## 1. Phạm vi

Tài liệu này bao phủ các màn hình và route chính của Stay Portal:

- Đăng nhập khách lưu trú `/bks-stay/login`
- Đổi mật khẩu bắt buộc `/bks-stay/force-change-password`
- Dashboard `/bks-stay/dashboard`
- Lịch sử đặt phòng `/bks-stay/bookings`
- Chi tiết booking `/bks-stay/bookings/:id`
- Stay voucher `/bks-stay/bookings/:id/voucher`
- Tài khoản `/bks-stay/account`
- Hỗ trợ `/bks-stay/support`
- Chat `/bks-stay/chat`
- Dịch vụ tại phòng `/bks-stay/services`
- Hợp đồng lưu trú `/bks-stay/contracts`
- Chi tiết hợp đồng `/bks-stay/contracts/:id`
- Hướng dẫn lưu trú `/bks-stay/guide`

## 2. Môi trường và dữ liệu mẫu

- Base URL local đề xuất: `http://localhost:5173`
- Chạy local: `npm run dev`
- Tài khoản khách lưu trú hợp lệ:
- Email guest hợp lệ
- Mật khẩu hợp lệ
- Dữ liệu mẫu nên có:
- Ít nhất 1 booking pending
- Ít nhất 1 booking confirmed
- Ít nhất 1 booking checked-in hoặc completed
- Ít nhất 1 hợp đồng chờ ký
- Ít nhất 1 dịch vụ nội trú đã yêu cầu
- Tối thiểu 1 booking có thể nộp biên lai cọc

## 3. Nguyên tắc test

- Test trên desktop và mobile responsive.
- Kiểm tra route bảo vệ: chưa đăng nhập phải bị chuyển về `/bks-stay/login`.
- Kiểm tra trạng thái booking ảnh hưởng đúng tới hành động trên portal.
- Kiểm tra loading, countdown, toast, dialog, upload file, copy-to-clipboard.
- Kiểm tra feature-flag cho các route `support`, `services`, `contracts`, `guide` nếu môi trường có bật/tắt.

## 4. Danh sách test case

| TC ID | Màn hình | URL | Tiền điều kiện | Hành động test manual | Kết quả mong đợi |
|---|---|---|---|---|---|
| STAY-01 | Login Stay Portal | `/bks-stay/login` | Chưa đăng nhập | 1. Mở trang login 2. Kiểm tra email, password, remember me | Form hiển thị đúng, không lỗi giao diện |
| STAY-02 | Validate login rỗng | `/bks-stay/login` | Chưa đăng nhập | 1. Để trống email/password 2. Bấm đăng nhập | Hiển thị lỗi yêu cầu nhập đầy đủ |
| STAY-03 | Login sai thông tin | `/bks-stay/login` | Chưa đăng nhập | 1. Nhập sai email/password 2. Submit | Hiện toast lỗi, không vào portal |
| STAY-04 | Hiện/ẩn mật khẩu | `/bks-stay/login` | Chưa đăng nhập | 1. Nhập mật khẩu 2. Bấm icon mắt | Mật khẩu chuyển đổi đúng giữa ẩn/hiện |
| STAY-05 | Remember me | `/bks-stay/login` | Có tài khoản hợp lệ | 1. Tick `Ghi nhớ tôi` 2. Login 3. Logout 4. Mở lại login | Email được ghi nhớ đúng |
| STAY-06 | Login thành công | `/bks-stay/login` | Tài khoản guest hợp lệ | 1. Login đúng thông tin | Điều hướng đến `/bks-stay/dashboard` hoặc route trước đó nếu có `from` |
| STAY-07 | Route guard Stay Portal | `/bks-stay/dashboard` | Chưa đăng nhập | 1. Mở trực tiếp URL dashboard | Bị chuyển về `/bks-stay/login` |
| STAY-08 | Đổi mật khẩu bắt buộc | `/bks-stay/force-change-password` | Có user phải đổi mật khẩu | 1. Nhập mật khẩu mới 2. Xác nhận 3. Submit | Đổi mật khẩu thành công |
| STAY-09 | Validate đổi mật khẩu bắt buộc | `/bks-stay/force-change-password` | Mở form đổi mật khẩu | 1. Nhập thiếu hoặc không khớp 2. Submit | Hiển thị lỗi validate phù hợp |
| STAY-10 | Dashboard tải dữ liệu | `/bks-stay/dashboard` | Đã đăng nhập guest | 1. Mở dashboard 2. Quan sát welcome banner, stats, quick actions | Dashboard tải thành công, không trắng trang |
| STAY-11 | Alert hợp đồng chờ ký trên dashboard | `/bks-stay/dashboard` | Có `has_pending_contract=true` | 1. Mở dashboard 2. Kiểm tra alert 3. Bấm CTA ký ngay | Alert hiển thị đúng và điều hướng sang `/bks-stay/contracts` |
| STAY-12 | Stats dashboard | `/bks-stay/dashboard` | Có dữ liệu guest | 1. Kiểm tra tổng số kỳ nghỉ, điểm thưởng, chi tiêu, hạng thành viên | Số liệu hiển thị đúng với dữ liệu API |
| STAY-13 | Quick actions dashboard | `/bks-stay/dashboard` | Feature route bật | 1. Bấm từng phím tắt `Đặt dịch vụ`, `Hướng dẫn`, `Gia hạn ở`, `Báo cáo sự cố` | Điều hướng hoặc mở dialog đúng theo từng action |
| STAY-14 | Gia hạn ở từ dashboard | `/bks-stay/dashboard` | Có active booking | 1. Bấm `Gia hạn ở` 2. Nhập ngày trả mới 3. Gửi yêu cầu | Hiển thị toast thành công hoặc lỗi phù hợp |
| STAY-15 | Active booking card dashboard | `/bks-stay/dashboard` | Có active booking | 1. Quan sát card booking hiện tại 2. Bấm `Quản lý kỳ nghỉ này` | Điều hướng đúng tới `/bks-stay/bookings/:id` |
| STAY-16 | Trạng thái không có active booking | `/bks-stay/dashboard` | Không có active booking | 1. Mở dashboard | Hiển thị empty state và CTA khám phá/đặt mới đúng |
| STAY-17 | Lịch sử booking - tải danh sách | `/bks-stay/bookings` | Có dữ liệu booking | 1. Mở trang lịch sử | Danh sách booking tải đúng, có phân trang nếu nhiều trang |
| STAY-18 | Chuyển tab lịch sử booking | `/bks-stay/bookings` | Có dữ liệu nhiều trạng thái | 1. Chuyển tab `Tất cả`, `Upcoming`, `Completed`, `Cancelled` | Danh sách lọc đúng theo tab |
| STAY-19 | Tìm kiếm lịch sử booking | `/bks-stay/bookings` | Có dữ liệu booking | 1. Tìm theo mã đơn/tên phòng/tên cơ sở | Kết quả lọc đúng |
| STAY-20 | Sắp xếp booking newest/oldest | `/bks-stay/bookings` | Có nhiều booking | 1. Đổi sort `Mới nhất` và `Cũ nhất` | Danh sách đổi đúng thứ tự |
| STAY-21 | Export lịch sử booking | `/bks-stay/bookings` | Có dữ liệu booking | 1. Bấm `Xuất báo cáo` | File CSV được tải xuống thành công |
| STAY-22 | Chặn export khi không có dữ liệu | `/bks-stay/bookings` | Không có booking theo filter | 1. Lọc để danh sách rỗng 2. Bấm export | Hiển thị thông báo không có dữ liệu để xuất |
| STAY-23 | Xem chi tiết booking từ history | `/bks-stay/bookings` | Có booking tồn tại | 1. Click dòng booking hoặc bấm `Xem chi tiết` | Điều hướng đúng tới `/bks-stay/bookings/:id` |
| STAY-24 | Chia sẻ voucher từ history | `/bks-stay/bookings` | Có booking tồn tại | 1. Mở menu 2. Bấm `Chia sẻ hóa đơn` | Link voucher được copy vào clipboard và có toast thành công |
| STAY-25 | Tải hóa đơn từ history | `/bks-stay/bookings` | Có booking completed | 1. Bấm icon tải hóa đơn | File hóa đơn text được tải về |
| STAY-26 | Chặn xóa bản ghi booking | `/bks-stay/bookings` | Có booking bất kỳ | 1. Mở menu 2. Bấm `Xóa bản ghi` | Hiện dialog thông báo không thể xóa bản ghi |
| STAY-27 | Chi tiết booking - tải dữ liệu | `/bks-stay/bookings/:id` | Có `bookingId` hợp lệ | 1. Mở chi tiết booking | Trang hiển thị đúng thông tin booking |
| STAY-28 | Chi tiết booking không tồn tại | `/bks-stay/bookings/:id` | `bookingId` không hợp lệ | 1. Mở URL với id sai | Hiển thị empty/error state phù hợp |
| STAY-29 | Share booking detail | `/bks-stay/bookings/:id` | Có booking tồn tại | 1. Bấm chia sẻ | Nội dung booking được copy vào clipboard |
| STAY-30 | Mở Google Maps từ booking detail | `/bks-stay/bookings/:id` | Booking có địa chỉ property | 1. Bấm mở bản đồ | Mở tab Google Maps đúng địa chỉ |
| STAY-31 | Countdown booking sắp tới | `/bks-stay/bookings/:id` | Booking upcoming | 1. Mở trang chi tiết booking | Countdown hiển thị đúng số ngày/giờ/phút còn lại |
| STAY-32 | Polling tự cập nhật khi booking pending -> confirmed | `/bks-stay/bookings/:id` | Booking đang pending | 1. Mở trang 2. Chờ backend đổi trạng thái | Trang tự cập nhật và hiện toast xác nhận thành công |
| STAY-33 | Xem/copy thông tin wifi và passcode | `/bks-stay/bookings/:id` hoặc dashboard/services nếu có block | Có active booking | 1. Bấm copy passcode/wifi | Clipboard nhận đúng nội dung và có toast |
| STAY-34 | Submit biên lai cọc | `/bks-stay/bookings/:id` | Booking yêu cầu nộp cọc | 1. Upload ảnh biên lai 2. Chờ xử lý | Ảnh upload thành công, booking chuyển trạng thái chờ xác thực cọc |
| STAY-35 | Validate upload biên lai sai định dạng | `/bks-stay/bookings/:id` | Booking yêu cầu nộp cọc | 1. Chọn file không phải ảnh | Hiển thị lỗi định dạng file |
| STAY-36 | Đổi phương thức thanh toán | `/bks-stay/bookings/:id` | Booking cho phép đổi payment method | 1. Mở dialog phương thức thanh toán 2. Chọn phương thức 3. Xác nhận | Phương thức thanh toán được cập nhật thành công |
| STAY-37 | Gửi yêu cầu hủy booking pending | `/bks-stay/bookings/:id` | Booking status pending | 1. Mở dialog hủy 2. Chọn lý do 3. Gửi | Booking bị hủy trực tiếp thành công |
| STAY-38 | Gửi yêu cầu hủy booking confirmed | `/bks-stay/bookings/:id` | Booking status confirmed | 1. Mở dialog hủy 2. Chọn lý do 3. Gửi | Booking chuyển sang trạng thái chờ duyệt hủy |
| STAY-39 | Validate note bắt buộc khi hủy | `/bks-stay/bookings/:id` | Lý do hủy yêu cầu nhập chi tiết | 1. Chọn reason cần note 2. Để trống note 3. Gửi | Hiển thị lỗi yêu cầu nhập chi tiết |
| STAY-40 | Cooldown sau thao tác hủy | `/bks-stay/bookings/:id` | Backend trả retry/cooldown | 1. Gửi thao tác hủy 2. Thử lại ngay | Hiển thị thời gian chờ, không cho gửi liên tục |
| STAY-41 | Rút yêu cầu hủy | `/bks-stay/bookings/:id` | Booking đang pending cancellation | 1. Bấm `Rút yêu cầu hủy` 2. Xác nhận hoặc undo nếu có | Yêu cầu hủy được rút thành công |
| STAY-42 | Dời ngày nghỉ | `/bks-stay/bookings/:id` | Booking cho phép reschedule | 1. Mở dialog đổi ngày 2. Chọn ngày mới 3. Xác nhận | Yêu cầu đổi ngày được gửi thành công hoặc báo lỗi phù hợp |
| STAY-43 | Xem nội quy/chính sách | `/bks-stay/bookings/:id` | Có booking tồn tại | 1. Bấm `Xem toàn bộ` nội quy | Modal hiển thị đầy đủ nội quy và chính sách hủy |
| STAY-44 | Submit review sau khi hoàn tất | `/bks-stay/bookings/:id` | Booking completed/checked_out | 1. Chọn rating/comment cho phòng/partner 2. Gửi đánh giá | Đánh giá gửi thành công |
| STAY-45 | Stay voucher | `/bks-stay/bookings/:id/voucher` | Có booking hợp lệ | 1. Mở voucher 2. Kiểm tra mã, thông tin, layout 3. In hoặc tải nếu có | Voucher hiển thị đúng và in/tải ổn định |
| STAY-46 | Danh sách hợp đồng | `/bks-stay/contracts` | Có dữ liệu contract | 1. Mở trang hợp đồng | Danh sách hợp đồng tải đúng |
| STAY-47 | Filter hợp đồng theo trạng thái | `/bks-stay/contracts` | Có hợp đồng nhiều trạng thái | 1. Chuyển tab `Tất cả`, `Chờ ký`, `Hiệu lực`, `Đã xong` | Danh sách lọc đúng |
| STAY-48 | Tìm kiếm hợp đồng | `/bks-stay/contracts` | Có dữ liệu contract | 1. Tìm theo tên căn hộ/ID | Kết quả lọc đúng |
| STAY-49 | Tải hợp đồng | `/bks-stay/contracts` | Có contract bất kỳ | 1. Bấm icon tải hợp đồng | File hợp đồng text được tải xuống |
| STAY-50 | Điều hướng đến chi tiết hợp đồng | `/bks-stay/contracts` | Có contract tồn tại | 1. Bấm `Chi tiết` hoặc `Ký ngay` | Điều hướng đúng tới `/bks-stay/contracts/:id` |
| STAY-51 | Chi tiết hợp đồng - tải dữ liệu | `/bks-stay/contracts/:id` | Có `contractId` hợp lệ | 1. Mở chi tiết hợp đồng | Thông tin hợp đồng hiển thị đúng |
| STAY-52 | Ký hợp đồng điện tử | `/bks-stay/contracts/:id` | Hợp đồng chờ ký | 1. Ký/submit xác nhận theo flow hiện có | Hợp đồng chuyển trạng thái đúng sau khi ký |
| STAY-53 | Upload tài liệu kèm hợp đồng | `/bks-stay/contracts/:id` | Flow hợp đồng yêu cầu upload tài liệu | 1. Upload file/ảnh 2. Xác nhận | File được tải lên thành công |
| STAY-54 | Tải hợp đồng từ chi tiết | `/bks-stay/contracts/:id` | Có contract hợp lệ | 1. Bấm tải file hợp đồng | File được tải thành công |
| STAY-55 | Dịch vụ tại phòng - tải dữ liệu | `/bks-stay/services` | Có active booking và feature bật | 1. Mở trang dịch vụ | Danh sách dịch vụ tải đúng |
| STAY-56 | Empty state khi không có active booking | `/bks-stay/services` | Không có active booking | 1. Mở trang dịch vụ | Hiển thị cảnh báo không có kỳ nghỉ đang diễn ra |
| STAY-57 | Gọi dịch vụ nhanh | `/bks-stay/services` | Có active booking | 1. Chọn một service card | Yêu cầu dịch vụ được gửi thành công |
| STAY-58 | Gửi dịch vụ kèm ghi chú | `/bks-stay/services` | Có active booking | 1. Nhập note 2. Chọn service | Ghi chú được gửi kèm đúng |
| STAY-59 | Gọi thêm nước suối | `/bks-stay/services` | Có active booking | 1. Tăng/giảm số lượng 2. Bấm xác nhận gọi thêm | Yêu cầu được gửi thành công |
| STAY-60 | Copy wifi/password từ trang services | `/bks-stay/services` | Có active booking | 1. Bấm sao chép mật khẩu wifi | Clipboard nhận đúng dữ liệu |
| STAY-61 | Theo dõi tiến độ yêu cầu dịch vụ | `/bks-stay/services` | Có booking_services | 1. Kiểm tra timeline trạng thái chờ xử lý/đang xử lý/hoàn thành/hủy | Timeline hiển thị đúng theo trạng thái từng request |
| STAY-62 | Làm mới tiến độ dịch vụ | `/bks-stay/services` | Có active booking | 1. Bấm `Làm mới` | Dữ liệu được refetch thành công |
| STAY-63 | Hỗ trợ | `/bks-stay/support` | Feature route bật | 1. Mở trang support 2. Kiểm tra FAQ và CTA | Trang tải đúng, không lỗi |
| STAY-64 | Expand/collapse FAQ hỗ trợ | `/bks-stay/support` | Có danh sách FAQ | 1. Bấm mở/đóng nhiều mục FAQ | Accordion hoạt động đúng |
| STAY-65 | Gửi yêu cầu hỗ trợ/sự cố | `/bks-stay/support` | Có form/CTA hỗ trợ | 1. Nhập nội dung 2. Gửi yêu cầu | Yêu cầu hỗ trợ gửi thành công hoặc báo lỗi phù hợp |
| STAY-66 | Hướng dẫn lưu trú | `/bks-stay/guide` | Feature route bật | 1. Mở trang guide 2. Scroll các section | Nội dung hướng dẫn hiển thị đúng |
| STAY-67 | Điều hướng nội bộ trong guide | `/bks-stay/guide` | Có anchor/accordion/section | 1. Tương tác các mục chỉ dẫn | Điều hướng nội bộ hoặc mở section đúng |
| STAY-68 | Chat chủ nhà | `/bks-stay/chat` | Có conversation hoặc API chat | 1. Mở trang chat 2. Gửi tin nhắn text | Tin nhắn gửi thành công |
| STAY-69 | Gửi ảnh trong chat | `/bks-stay/chat` | Có quyền upload ảnh | 1. Bấm đính kèm ảnh 2. Chọn ảnh 3. Gửi | Ảnh hiển thị đúng trong khung chat |
| STAY-70 | Mở preview ảnh chat | `/bks-stay/chat` | Có tin nhắn ảnh | 1. Click vào ảnh trong chat | Preview ảnh mở đúng |
| STAY-71 | Tài khoản - tải dữ liệu | `/bks-stay/account` | Đã đăng nhập guest | 1. Mở trang account | Thông tin user hiển thị đúng |
| STAY-72 | Cập nhật hồ sơ tài khoản | `/bks-stay/account` | Có dữ liệu user | 1. Sửa tên/phone/address 2. Lưu | Hồ sơ cập nhật thành công |
| STAY-73 | Đổi avatar | `/bks-stay/account` | Đang ở account | 1. Bấm icon camera 2. Chọn ảnh | Avatar preview cập nhật và hiển thị toast thành công |
| STAY-74 | Upload KYC | `/bks-stay/account` | Chưa xác thực KYC | 1. Mở dialog KYC 2. Chọn ảnh trước/sau CCCD 3. Gửi hồ sơ | KYC chuyển trạng thái submitted thành công |
| STAY-75 | Validate thiếu file KYC | `/bks-stay/account` | Chưa xác thực KYC | 1. Chỉ chọn 1 mặt CCCD 2. Gửi | Hiển thị lỗi yêu cầu đủ 2 file |
| STAY-76 | Mở quyền lợi thành viên | `/bks-stay/account` | Đã đăng nhập guest | 1. Bấm `Xem tất cả đặc quyền` | Modal quyền lợi hiển thị đúng |
| STAY-77 | Điều hướng đổi mật khẩu từ account | `/bks-stay/account` | Đã đăng nhập guest | 1. Bấm `Thay đổi` ở block bảo mật | Điều hướng sang `/bks-stay/force-change-password` |
| STAY-78 | Logout Stay Portal | `/bks-stay/account` | Đã đăng nhập guest | 1. Bấm `Đăng xuất` | Đăng xuất thành công và quay về `/bks-stay/login` |
| STAY-79 | Route feature bị tắt | `/bks-stay/support` hoặc `/services` hoặc `/contracts` hoặc `/guide` | Feature flag tắt trên môi trường | 1. Mở route tương ứng | Hệ thống redirect về `/bks-stay/dashboard` đúng theo guard |
| STAY-80 | Route sai trong Stay Portal | `/bks-stay/unknown-page` | Đã đăng nhập guest | 1. Mở route sai | Hệ thống xử lý theo cấu hình hiện tại, không treo trắng trang |

## 5. Test bổ sung nên thực hiện

- Test responsive các trang chính:
- `/bks-stay/dashboard`
- `/bks-stay/bookings`
- `/bks-stay/bookings/:id`
- `/bks-stay/services`
- `/bks-stay/account`
- Test dữ liệu rỗng:
- Không có active booking
- Không có contract
- Không có booking history
- Không có booking_services
- Test nghiệp vụ:
- Booking pending
- Booking confirmed
- Booking pending cancellation
- Booking completed
- Contract chờ ký
- KYC pending/submitted
- Test mạng chậm để kiểm tra loading spinner, polling, upload progress và dialog state.

## 6. Ghi chú

- Các route động như `:id` cần thay bằng dữ liệu thật trên môi trường test.
- Một số tính năng phụ thuộc dữ liệu backend hoặc feature flag; nếu không hiển thị trên môi trường test thì cần ghi nhận rõ lý do.
- Với các thao tác như hủy booking, đổi phương thức thanh toán, ký hợp đồng hoặc nộp biên lai cọc, nên test trên dữ liệu sandbox để tránh ảnh hưởng dữ liệu vận hành.

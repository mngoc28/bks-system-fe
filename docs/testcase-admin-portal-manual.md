# Test Case Manual - Phân hệ Admin Portal

## 1. Phạm vi

Tài liệu này bao phủ các màn hình và route chính của admin portal:

- Đăng nhập admin `/admin/login`
- Quên mật khẩu `/admin/forgot-password`
- Đặt lại mật khẩu `/admin/reset-password/:token`
- Dashboard `/admin/dashboard`
- Quản lý booking `/admin/booking-manage`
- Quản lý bất động sản `/admin/properties`
- Thêm bất động sản `/admin/properties/add`
- Chi tiết bất động sản `/admin/properties/detail/:property_id`
- Sửa bất động sản `/admin/properties/edit/:action/:property_id`
- Quản lý ảnh bất động sản `/admin/properties/detail/:propertyId/images`
- Quản lý phòng `/admin/rooms`
- Thêm phòng `/admin/rooms/add`
- Chi tiết phòng `/admin/rooms/detail/:id`
- Sửa phòng `/admin/rooms/edit/:id`
- Quản lý ảnh phòng `/admin/rooms/detail/:roomId/images`
- Quản lý người dùng `/admin/user-management`
- Chi tiết người dùng `/admin/user-management/detail/:id`
- Sửa người dùng `/admin/user-management/edit/:id`
- Quản lý tỉnh/thành `/admin/province/manage`
- Chi tiết tỉnh `/admin/province/detail/:id`
- Quản lý tiện ích `/admin/amenity-management`
- Quản lý dịch vụ `/admin/service-management`
- Quản lý câu hỏi `/admin/question-management`
- Tạo câu hỏi `/admin/question-management/create`
- Chi tiết câu hỏi `/admin/question-management/:id`
- Sửa câu hỏi `/admin/question-management/:id/edit`
- Sơ đồ luồng câu hỏi `/admin/question-management/flow`
- Quản lý tin tức `/admin/news`
- Thêm tin tức `/admin/news/add`
- Chi tiết tin tức `/admin/news/detail/:id`
- Sửa tin tức `/admin/news/edit/:id`
- Quản lý newsletter `/admin/newsletter-management`
- Quản lý đối tác `/admin/partner-information`
- Phê duyệt đối tác `/admin/partner-approval`
- Chi tiết đối tác `/admin/partner-information/detail/:id`
- Sửa đối tác `/admin/partner-information/edit/:id`
- Quản lý đối soát `/admin/settlements`
- Chi tiết đối soát `/admin/settlements/:id`

## 2. Môi trường và dữ liệu mẫu

- Base URL local đề xuất: `http://localhost:5173`
- Chạy local: `npm run dev`
- Tài khoản admin hợp lệ
- Tài khoản partner để test chặn truy cập admin portal
- Dữ liệu mẫu nên có:
- Ít nhất 1 user admin, 1 user thường, 1 user partner
- Ít nhất 3 bất động sản
- Ít nhất 5 phòng
- Ít nhất 5 booking ở nhiều trạng thái
- Ít nhất 3 đối tác, trong đó có đối tác chờ duyệt
- Ít nhất 3 bài tin tức
- Ít nhất 1 kỳ đối soát
- Ít nhất 1 câu hỏi trong module question flow

## 3. Nguyên tắc test

- Test trên desktop và mobile responsive.
- Kiểm tra route bảo vệ: chưa đăng nhập phải bị chuyển về `/admin/login`.
- Kiểm tra role: tài khoản partner không được vào admin portal.
- Kiểm tra loading, filter, phân trang, sort, modal CRUD, cross-navigation.
- Kiểm tra thao tác xóa/sửa quan trọng có confirm và phản hồi phù hợp.

## 4. Danh sách test case

| TC ID | Màn hình | URL | Tiền điều kiện | Hành động test manual | Kết quả mong đợi |
|---|---|---|---|---|---|
| ADMIN-01 | Login admin | `/admin/login` | Chưa đăng nhập | 1. Mở trang login 2. Kiểm tra email, password, remember me | Form hiển thị đúng, không lỗi UI |
| ADMIN-02 | Validate login rỗng | `/admin/login` | Chưa đăng nhập | 1. Để trống email/password 2. Bấm đăng nhập | Hiển thị lỗi validate đúng |
| ADMIN-03 | Login sai thông tin | `/admin/login` | Chưa đăng nhập | 1. Nhập email/password sai 2. Bấm đăng nhập | Hiện lỗi/ toast sai thông tin đăng nhập |
| ADMIN-04 | Hiện/ẩn mật khẩu | `/admin/login` | Chưa đăng nhập | 1. Nhập mật khẩu 2. Bấm icon mắt | Mật khẩu chuyển đổi đúng giữa ẩn/hiện |
| ADMIN-05 | Remember me | `/admin/login` | Có tài khoản admin hợp lệ | 1. Tick `remember me` 2. Login 3. Logout 4. Mở lại login | Email được ghi nhớ đúng hành vi |
| ADMIN-06 | Login admin thành công | `/admin/login` | Tài khoản admin hợp lệ | 1. Nhập đúng tài khoản 2. Bấm đăng nhập | Điều hướng tới `/admin/dashboard` |
| ADMIN-07 | Chặn partner login vào admin | `/admin/login` | Có tài khoản partner | 1. Login bằng tài khoản partner | Hệ thống chặn, hiển thị lỗi không có quyền truy cập admin |
| ADMIN-08 | Route guard admin | `/admin/dashboard` | Chưa đăng nhập | 1. Mở trực tiếp URL dashboard | Bị chuyển về `/admin/login` |
| ADMIN-09 | Quên mật khẩu | `/admin/forgot-password` | Có email hợp lệ | 1. Nhập email 2. Submit | Hệ thống gửi yêu cầu thành công hoặc báo lỗi phù hợp |
| ADMIN-10 | Đặt lại mật khẩu | `/admin/reset-password/:token` | Có token hợp lệ | 1. Nhập mật khẩu mới 2. Xác nhận 3. Submit | Đổi mật khẩu thành công |
| ADMIN-11 | Dashboard tải dữ liệu | `/admin/dashboard` | Đã đăng nhập admin | 1. Mở dashboard 2. Quan sát KPI, widget, biểu đồ | Dashboard tải thành công, không trắng trang |
| ADMIN-12 | Chọn khoảng ngày dashboard | `/admin/dashboard` | Đã đăng nhập admin | 1. Chọn `Từ ngày` và `Đến ngày` 2. Quan sát số liệu | KPI/biểu đồ cập nhật theo khoảng thời gian |
| ADMIN-13 | Reset khoảng ngày dashboard | `/admin/dashboard` | Đã thay đổi ngày | 1. Bấm `Đặt lại` | Dashboard quay về khoảng ngày mặc định |
| ADMIN-14 | Drill-down từ dashboard sang booking | `/admin/dashboard` | Có dữ liệu KPI | 1. Click KPI vận hành hoặc nút hành động 2. Quan sát route booking | Điều hướng sang `/admin/booking-manage` với query filter phù hợp |
| ADMIN-15 | Drill-down từ dashboard sang user/partner/property | `/admin/dashboard` | Có dữ liệu | 1. Bấm quick action phù hợp 2. Quan sát route đích | Điều hướng đúng tới module tương ứng với filter context |
| ADMIN-16 | Ẩn/hiện khối analytics | `/admin/dashboard` | Đã đăng nhập admin | 1. Bấm tiêu đề khối analytics 2 lần | Khối analytics thu gọn/mở rộng đúng |
| ADMIN-17 | Quản lý user - tải danh sách | `/admin/user-management` | Có dữ liệu user | 1. Mở trang 2. Kiểm tra table/grid, filter panel | Danh sách tải đúng, có phân trang |
| ADMIN-18 | Chuyển view user | `/admin/user-management` | Có dữ liệu user | 1. Chuyển giữa table/grid | Giao diện đổi đúng, dữ liệu giữ nguyên |
| ADMIN-19 | Tìm kiếm user theo tên | `/admin/user-management` | Có dữ liệu user | 1. Nhập từ khóa tên 2. Chờ debounce | Danh sách lọc đúng |
| ADMIN-20 | Tìm kiếm user theo email/sđt | `/admin/user-management` | Có dữ liệu user | 1. Nhập email hoặc số điện thoại 2. Chờ debounce | Danh sách lọc đúng |
| ADMIN-21 | Lọc user theo role/status/ngày tạo | `/admin/user-management` | Có dữ liệu đa dạng | 1. Mở filter 2. Chọn role/status/date range | Kết quả lọc đúng |
| ADMIN-22 | Reset filter user | `/admin/user-management` | Đã áp filter | 1. Bấm reset | Filter trở về mặc định |
| ADMIN-23 | Thêm user | `/admin/user-management` | Có quyền thao tác | 1. Bấm `Add user` 2. Nhập form hợp lệ 3. Submit | User được tạo thành công |
| ADMIN-24 | Validate thêm user | `/admin/user-management` | Mở dialog add | 1. Để thiếu field bắt buộc 2. Submit | Hiển thị validate đúng |
| ADMIN-25 | Chặn email trùng khi thêm user | `/admin/user-management` | Có email đã tồn tại | 1. Tạo user với email trùng | Hiển thị lỗi server/email trùng |
| ADMIN-26 | Sửa user | `/admin/user-management` | Có user tồn tại | 1. Bấm edit 2. Cập nhật thông tin 3. Submit | User được cập nhật thành công |
| ADMIN-27 | Reset password user | `/admin/user-management` | Có user tồn tại | 1. Bấm reset password 2. Nhập mật khẩu mới 3. Xác nhận | Reset mật khẩu thành công |
| ADMIN-28 | Xóa user | `/admin/user-management` | Có user có thể xóa | 1. Bấm delete 2. Xác nhận | User bị xóa thành công |
| ADMIN-29 | Xem chi tiết user | `/admin/user-management/detail/:id` | Có `userId` hợp lệ | 1. Mở chi tiết user | Thông tin user hiển thị đúng |
| ADMIN-30 | Sửa user từ route riêng | `/admin/user-management/edit/:id` | Có `userId` hợp lệ | 1. Mở trang edit 2. Cập nhật 3. Lưu | Thông tin user cập nhật thành công |
| ADMIN-31 | Quản lý booking - tải danh sách | `/admin/booking-manage` | Có dữ liệu booking | 1. Mở trang booking 2. Kiểm tra danh sách và filter | Danh sách tải đúng |
| ADMIN-32 | Chuyển view booking | `/admin/booking-manage` | Có dữ liệu booking | 1. Chuyển table/grid | Giao diện đổi đúng |
| ADMIN-33 | Tìm booking theo user/room/assignee | `/admin/booking-manage` | Có dữ liệu booking | 1. Nhập từ khóa tương ứng 2. Quan sát kết quả | Danh sách lọc đúng |
| ADMIN-34 | Lọc booking theo trạng thái/ngày/giá | `/admin/booking-manage` | Có dữ liệu booking | 1. Chọn status 2. Chọn ngày 3. Chọn khoảng giá | Kết quả lọc đúng |
| ADMIN-35 | Clear context filter booking | `/admin/booking-manage?...source=dashboard` | Đang vào từ context | 1. Quan sát context chips 2. Bấm xóa context | Context bị xóa, danh sách trở về bình thường |
| ADMIN-36 | Tạo booking từ admin | `/admin/booking-manage` | Có dữ liệu cần thiết | 1. Bấm `Create` 2. Nhập form 3. Submit | Booking được tạo thành công |
| ADMIN-37 | Xem chi tiết booking | `/admin/booking-manage` | Có booking tồn tại | 1. Bấm view trên một booking | Modal/detail booking hiển thị đúng |
| ADMIN-38 | Sửa booking | `/admin/booking-manage` | Có booking tồn tại | 1. Bấm edit 2. Cập nhật 3. Lưu | Booking được cập nhật thành công |
| ADMIN-39 | Xóa booking | `/admin/booking-manage` | Có booking có thể xóa | 1. Bấm delete 2. Xác nhận | Booking bị xóa thành công |
| ADMIN-40 | Cross-nav từ booking sang user/room/property | `/admin/booking-manage` | Có dữ liệu liên kết | 1. Bấm link user 2. Bấm link room 3. Bấm link property | Điều hướng đúng tới module liên quan |
| ADMIN-41 | Quản lý bất động sản - tải danh sách | `/admin/properties` | Có dữ liệu property | 1. Mở trang property | Danh sách property tải đúng |
| ADMIN-42 | Tìm/lọc property | `/admin/properties` | Có dữ liệu property | 1. Tìm theo tên 2. Áp filter liên quan | Danh sách lọc đúng |
| ADMIN-43 | Thêm property | `/admin/properties/add` | Có quyền thao tác | 1. Mở trang add 2. Nhập form hợp lệ 3. Lưu | Property được tạo thành công |
| ADMIN-44 | Validate thêm property | `/admin/properties/add` | Mở form add | 1. Để trống field bắt buộc 2. Submit | Hiện validate đúng |
| ADMIN-45 | Xem chi tiết property | `/admin/properties/detail/:property_id` | Có `propertyId` hợp lệ | 1. Mở chi tiết property | Thông tin property hiển thị đúng |
| ADMIN-46 | Sửa property | `/admin/properties/edit/:action/:property_id` | Có `propertyId` hợp lệ | 1. Mở edit 2. Chỉnh sửa 3. Lưu | Property cập nhật thành công |
| ADMIN-47 | Quản lý ảnh property | `/admin/properties/detail/:propertyId/images` | Có property hợp lệ | 1. Upload ảnh 2. Xóa ảnh 3. Kiểm tra danh sách ảnh | Ảnh được quản lý đúng |
| ADMIN-48 | Xóa property | `/admin/properties` | Có property có thể xóa | 1. Chọn xóa 2. Xác nhận | Property bị xóa hoặc báo lỗi nghiệp vụ phù hợp |
| ADMIN-49 | Cross-nav property -> rooms/bookings | `/admin/properties` hoặc detail | Có property liên quan | 1. Bấm xem rooms 2. Bấm xem bookings | Điều hướng sang module đích với query context đúng |
| ADMIN-50 | Quản lý phòng - tải danh sách | `/admin/rooms` | Có dữ liệu room | 1. Mở trang room | Danh sách room tải đúng |
| ADMIN-51 | Sort và filter room | `/admin/rooms` | Có dữ liệu room | 1. Sort cột 2. Tìm kiếm/filter | Dữ liệu cập nhật đúng |
| ADMIN-52 | Thêm room | `/admin/rooms/add` | Có property hợp lệ | 1. Mở add room 2. Nhập form 3. Lưu | Room được tạo thành công |
| ADMIN-53 | Sửa room | `/admin/rooms/edit/:id` | Có `roomId` hợp lệ | 1. Mở edit 2. Chỉnh sửa 3. Lưu | Room cập nhật thành công |
| ADMIN-54 | Xem chi tiết room | `/admin/rooms/detail/:id` | Có `roomId` hợp lệ | 1. Mở chi tiết room | Thông tin room hiển thị đúng |
| ADMIN-55 | Quản lý ảnh room | `/admin/rooms/detail/:roomId/images` | Có room hợp lệ | 1. Upload/xóa ảnh | Ảnh room được cập nhật đúng |
| ADMIN-56 | Xóa room | `/admin/rooms` | Có room có thể xóa | 1. Bấm delete 2. Xác nhận | Room bị xóa hoặc báo lỗi đúng |
| ADMIN-57 | Cross-nav room -> property/bookings/partner | `/admin/rooms` | Có dữ liệu liên kết | 1. Bấm link tương ứng | Điều hướng đúng |
| ADMIN-58 | Quản lý tỉnh/thành | `/admin/province/manage` | Có dữ liệu province | 1. Mở trang 2. Tìm kiếm/lọc nếu có | Danh sách hiển thị đúng |
| ADMIN-59 | Xem chi tiết tỉnh | `/admin/province/detail/:id` | Có `provinceId` hợp lệ | 1. Mở chi tiết tỉnh | Thông tin tỉnh hiển thị đúng |
| ADMIN-60 | Cập nhật tỉnh | `/admin/province/detail/:id` | Có `provinceId` hợp lệ | 1. Sửa thông tin 2. Lưu | Dữ liệu cập nhật thành công |
| ADMIN-61 | Quản lý tiện ích | `/admin/amenity-management` | Có dữ liệu amenity | 1. Mở trang 2. Kiểm tra table/card | Danh sách hiển thị đúng |
| ADMIN-62 | CRUD tiện ích | `/admin/amenity-management` | Có quyền thao tác | 1. Thêm tiện ích 2. Sửa tiện ích 3. Xóa tiện ích | CRUD hoạt động đúng |
| ADMIN-63 | Quản lý dịch vụ | `/admin/service-management` | Có dữ liệu service | 1. Mở trang 2. Kiểm tra list | Danh sách service hiển thị đúng |
| ADMIN-64 | CRUD dịch vụ | `/admin/service-management` | Có quyền thao tác | 1. Add 2. Edit 3. View detail 4. Delete | Các thao tác hoạt động đúng |
| ADMIN-65 | Quản lý câu hỏi | `/admin/question-management` | Có dữ liệu question | 1. Mở trang 2. Tìm kiếm/lọc | Danh sách câu hỏi hiển thị đúng |
| ADMIN-66 | Tạo câu hỏi | `/admin/question-management/create` | Có quyền thao tác | 1. Nhập form 2. Lưu | Câu hỏi tạo thành công |
| ADMIN-67 | Chi tiết câu hỏi | `/admin/question-management/:id` | Có `questionId` hợp lệ | 1. Mở chi tiết câu hỏi | Nội dung hiển thị đúng |
| ADMIN-68 | Sửa câu hỏi | `/admin/question-management/:id/edit` | Có `questionId` hợp lệ | 1. Chỉnh sửa 2. Lưu | Câu hỏi cập nhật thành công |
| ADMIN-69 | Xóa câu hỏi | `/admin/question-management` | Có question tồn tại | 1. Bấm delete 2. Xác nhận | Câu hỏi bị xóa thành công |
| ADMIN-70 | Question flow | `/admin/question-management/flow` | Có dữ liệu flow | 1. Mở sơ đồ 2. Thêm/sửa liên kết hoặc node nếu chức năng có 3. Lưu | Flow hiển thị và lưu đúng |
| ADMIN-71 | Quản lý tin tức | `/admin/news` | Có dữ liệu news | 1. Mở trang 2. Tìm kiếm/lọc | Danh sách tin tức hiển thị đúng |
| ADMIN-72 | Thêm tin tức | `/admin/news/add` | Có quyền thao tác | 1. Nhập tiêu đề/nội dung/trạng thái 2. Lưu | Tin tức được tạo thành công |
| ADMIN-73 | Chi tiết tin tức | `/admin/news/detail/:id` | Có `newsId` hợp lệ | 1. Mở chi tiết tin | Nội dung hiển thị đúng |
| ADMIN-74 | Sửa tin tức | `/admin/news/edit/:id` | Có `newsId` hợp lệ | 1. Chỉnh sửa 2. Lưu | Tin tức cập nhật thành công |
| ADMIN-75 | Xóa tin tức | `/admin/news` | Có news tồn tại | 1. Bấm delete 2. Xác nhận | Tin tức bị xóa thành công |
| ADMIN-76 | Quản lý newsletter | `/admin/newsletter-management` | Có subscriber data | 1. Mở trang 2. Tìm/lọc 3. Đổi trạng thái 4. Xóa subscriber | Các thao tác hoạt động đúng |
| ADMIN-77 | Quản lý đối tác | `/admin/partner-information` | Có dữ liệu partner | 1. Mở trang 2. Tìm kiếm/lọc | Danh sách đối tác hiển thị đúng |
| ADMIN-78 | Xem chi tiết đối tác | `/admin/partner-information/detail/:id` | Có `partnerId` hợp lệ | 1. Mở chi tiết đối tác | Thông tin đối tác hiển thị đúng |
| ADMIN-79 | Sửa đối tác | `/admin/partner-information/edit/:id` | Có `partnerId` hợp lệ | 1. Mở form edit 2. Cập nhật 3. Lưu | Thông tin đối tác cập nhật thành công |
| ADMIN-80 | Cross-nav partner -> properties/rooms/bookings | `/admin/partner-information` hoặc detail | Có dữ liệu partner liên kết | 1. Bấm điều hướng chéo | Điều hướng đúng sang module liên quan |
| ADMIN-81 | Phê duyệt đối tác | `/admin/partner-approval` | Có đối tác pending | 1. Mở trang approval 2. Xem hồ sơ/chứng từ 3. Approve | Trạng thái đối tác cập nhật thành công |
| ADMIN-82 | Từ chối đối tác | `/admin/partner-approval` | Có đối tác pending | 1. Chọn reject 2. Nhập lý do nếu có 3. Xác nhận | Đối tác bị từ chối, có thông báo đúng |
| ADMIN-83 | Xem tài liệu đối tác | `/admin/partner-approval` | Có file giấy tờ | 1. Bấm xem business license/CCCD/hợp đồng... | File/tài liệu mở đúng |
| ADMIN-84 | Quản lý đối soát | `/admin/settlements` | Có dữ liệu settlement | 1. Mở trang 2. Tìm/lọc 3. Xem list kỳ đối soát | Dữ liệu đối soát hiển thị đúng |
| ADMIN-85 | Xem chi tiết đối soát | `/admin/settlements/:id` | Có `settlementId` hợp lệ | 1. Mở chi tiết kỳ đối soát | Chi tiết hiển thị đúng |
| ADMIN-86 | Hành động quản trị trên đối soát | `/admin/settlements` hoặc detail | Có settlement phù hợp trạng thái | 1. Thử duyệt/phát hành/đóng kỳ hoặc thao tác có sẵn | Trạng thái kỳ đối soát cập nhật đúng |
| ADMIN-87 | Quản lý hồ sơ admin | `/admin/profile` nếu có menu điều hướng | Đã đăng nhập admin | 1. Mở profile 2. Cập nhật thông tin 3. Đổi mật khẩu | Hồ sơ/mật khẩu cập nhật thành công |
| ADMIN-88 | 404 admin | `/admin/unknown-page` | Đã đăng nhập admin | 1. Mở route sai | Hệ thống xử lý theo cấu hình hiện tại, không treo trắng trang |

## 5. Test bổ sung nên thực hiện

- Test responsive các trang chính:
- `/admin/dashboard`
- `/admin/user-management`
- `/admin/booking-manage`
- `/admin/properties`
- `/admin/rooms`
- Test dữ liệu rỗng:
- Không có booking
- Không có property
- Không có room
- Không có partner pending
- Không có newsletter subscriber
- Test quyền và điều hướng:
- Admin hợp lệ
- Partner bị chặn khỏi admin
- Route protected khi token hết hạn
- Test mạng chậm để kiểm tra loading skeleton/spinner/dialog state.

## 6. Ghi chú

- Các route động như `:id`, `:property_id`, `:roomId`, `:token` cần thay bằng dữ liệu thật trên môi trường test.
- Một số thao tác phụ thuộc backend và phân quyền thực tế; nếu môi trường test không mở đầy đủ quyền thì cần ghi nhận rõ.
- Với các thao tác CRUD/xóa/phê duyệt/đối soát, nên test trên dữ liệu sandbox để tránh ảnh hưởng dữ liệu vận hành.

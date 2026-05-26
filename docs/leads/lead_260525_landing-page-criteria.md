# Lead: Landing Page Display Criteria Optimization

## Document Information
- **Lead ID:** L260525-landing-page-criteria
- **Created:** 2026-05-25
- **Status:** Needs Further Discussion
- **Next Step:** Collect user responses to clarify logic, then transition to `stack-analyze` for SRS.

## Original Input
> dùng /stack-brainstorm để lên kế hoạch tiêu chí hiển thị trên trang landing để logic nhất có thể

---

## Current Landing Page Structure
Hiện tại, trang chủ (`PublicHome` tại `/`) đang hiển thị các khối nội dung theo thứ tự từ trên xuống dưới như sau:
1. **Hero Search**: Form tìm kiếm theo Tỉnh/Thành, Phường/Xã và Loại hình chỗ nghỉ.
2. **Province Carousel** ("Khám phá thành phố đáng đi nhất"): Hiển thị danh sách Tỉnh/Thành phố nổi bật. Thứ tự sắp xếp hiện tại dựa trên mức độ ưu tiên tĩnh (`FEATURED_CITY_PRIORITY` và `FEATURED_DESTINATION_PRIORITY` trong `constant.ts`).
3. **Featured Rooms Carousel** ("Phòng nổi bật dành cho chuyến đi tiếp theo"): Hiển thị 6 phòng mới nhất lấy từ API `GET /api/v1/rooms/latest` (chưa có thuật toán lọc phòng nổi bật thực sự).
4. **Suggested Rooms by Province** ("Gợi ý phòng theo khu vực"): Hiển thị các tabs chứa phòng thuộc các tỉnh trọng điểm (mặc định Đà Nẵng, Khánh Hòa, Quảng Ninh).
5. **Partner Grid** ("Đối tác BKS"): Hiển thị ngẫu nhiên 6 đối tác từ API `useRandomPartnersQuery`.
6. **Contact Card**: Form liên hệ.
7. **News Grid**: Hiển thị 6 tin tức mới nhất.

---

## Clarification Questions (Discovery Phase)

Để tối ưu hóa các tiêu chí hiển thị này sao cho logic nhất dưới góc độ nghiệp vụ (Business Analyst) và kiến trúc kỹ thuật (Technical Lead), chúng ta cần thống nhất các câu hỏi sau:

### Business Questions (BA Perspective)

| # | Câu hỏi từ Business Analyst | Mục đích nghiệp vụ | Lựa chọn gợi ý |
|---|---|---|---|
| 1 | **Tiêu chí định nghĩa "Phòng nổi bật" là gì?** | Thay vì lấy 6 phòng mới nhất, ta nên định nghĩa tiêu chí để tối ưu tỷ lệ đặt phòng (conversion rate). | **A.** Phòng có điểm đánh giá (Rating) cao nhất + có nhiều lượt đặt nhất.<br>**B.** Phòng đang có chương trình khuyến mãi/giảm giá sâu nhất.<br>**C.** Dựa trên cấu hình "Nổi bật" do Admin tích chọn trong trang quản trị. |
| 2 | **Quy tắc hiển thị khoảng cách đến điểm du lịch (Tourist Spot Mapping) trên card phòng?** | Giúp khách hàng thấy ngay sự tiện lợi khi di chuyển. | **A.** Chỉ hiển thị nếu phòng cách điểm du lịch < 10km (hoặc < 20 phút đi xe), nếu xa hơn thì ẩn hoặc chuyển sang hiển thị khoảng cách tới trung tâm thành phố.<br>**B.** Hiển thị điểm du lịch gần nhất bất kể khoảng cách bao xa. |
| 3 | **Cách sắp xếp danh sách Tỉnh/Thành nổi bật (Province Carousel)?** | Tối ưu hóa việc hiển thị các thành phố thu hút khách du lịch nhất theo mùa. | **A.** Giữ nguyên danh sách hardcode tĩnh (`Hà Nội`, `Hồ Chí Minh`, `Đà Nẵng`,...) như hiện tại.<br>**B.** Tự động sắp xếp theo Tỉnh/Thành có số lượng phòng trống/chỗ nghỉ đang hoạt động nhiều nhất.<br>**C.** Cho phép Admin kéo thả sắp xếp thứ tự ưu tiên trong Admin Dashboard. |
| 4 | **Tiêu chí gợi ý phòng theo khu vực (Suggested Rooms by Province)?** | Đà Nẵng, Khánh Hòa, Quảng Ninh hiện đang được hardcode. Làm sao để hiển thị linh hoạt? | **A.** Giữ nguyên 3 tỉnh trọng điểm này.<br>**B.** Tự động chọn 3 tỉnh có lượt tìm kiếm/booking cao nhất trong tháng.<br>**C.** Admin cấu hình 3 tỉnh này tùy biến theo chiến dịch marketing. |
| 5 | **Tiêu chí hiển thị Đối tác (Partner Grid)?** | Tăng độ uy tín thương hiệu và chất lượng hiển thị. | **A.** Hiển thị ngẫu nhiên (random) như hiện tại.<br>**B.** Ưu tiên các đối tác Gold/Premium (đối tác trả phí hoặc có quy mô lớn).<br>**C.** Ưu tiên đối tác có điểm đánh giá trung bình cao nhất (ví dụ > 4.5*). |

### Technical Questions (TLA Perspective)

| # | Câu hỏi từ Technical Lead | Mục đích kiến trúc & hiệu năng | Lựa chọn gợi ý |
|---|---|---|---|
| 6 | **Nguồn dữ liệu tính khoảng cách điểm du lịch (Tourist Spot Mapping)?** | Quyết định cách tính khoảng cách/thời gian mà không làm giảm tốc độ hệ thống. | **A.** **Tự nhập (Manual):** Partner tự điền tên địa điểm du lịch + khoảng cách + thời gian di chuyển khi tạo phòng.<br>**B.** **Tự động (Geo-calc):** Hệ thống lưu tọa độ (Lat, Long) của phòng và điểm du lịch, Backend tự động tính khoảng cách bằng công thức toán học và quy đổi ra thời gian ước lượng (ví dụ 1km ~ 2 phút đi xe). |
| 7 | **Phương án quản trị cấu hình động (Dynamic Config) cho Admin?** | Nếu chọn phương án cấu hình động (ở câu 1, 3, 4), ta sẽ lưu trữ và phân phối cấu hình như thế nào? | **A.** Tạo bảng `system_settings` trong DB để lưu JSON cấu hình, FE sẽ gọi 1 API config khi load trang.<br>**B.** Lưu cấu hình ở file JSON tĩnh trên server Backend, tránh truy vấn DB nhiều lần. |
| 8 | **Giải pháp caching để tối ưu hiệu năng trang Landing (LCP)?** | Trang chủ có lượng truy cập lớn nhất, nếu mỗi lượt tải đều query DB phức tạp sẽ gây nghẽn cổ chai. | **A.** Sử dụng Redis Cache trên Backend cho các API trang chủ (cache stats, featured rooms, partners) với thời gian hết hạn là 1 giờ.<br>**B.** Sử dụng HTTP Cache (Stale-While-Revalidate) phía client/Cloudflare CDN. |
| 9 | **Xử lý Đa ngôn ngữ (i18n) cho dữ liệu động?** | Làm thế nào dịch các dữ liệu động như mô tả điểm du lịch, tên loại phòng? | **A.** Thêm các trường ngôn ngữ trong DB (ví dụ: `tourist_spot_name_vi`, `tourist_spot_name_en`).<br>**B.** Chỉ hiển thị tiếng Việt cho các dữ liệu động do người dùng nhập, giao diện tĩnh mới dùng i18n. |

---

## Recommended Next Steps
1. User xem xét và phản hồi các câu hỏi BA & TLA ở trên.
2. Tổng hợp phản hồi vào tài liệu Lead này (cập nhật trạng thái thành `Clarified`).
3. Chạy `stack-analyze` để thiết kế SRS chi tiết và đề xuất giải pháp kỹ thuật cụ thể (thay đổi database schema, cấu trúc API, và UI components).

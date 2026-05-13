# Software Requirement Specification (SRS) - BKS System Overview

## 1. Giới thiệu dự án (Project Overview)
**BKS System** là hệ thống quản lý lưu trú thế hệ mới, được phát triển dựa trên các tiêu chuẩn vận hành khắt khe và hiện đại của mô hình quản lý lưu trú chuyên nghiệp. Hệ thống được tinh chỉnh và nâng cấp để phù hợp với thị trường PropTech tại Việt Nam, kết hợp sức mạnh của 3 mô hình:
*   **OTA (Online Travel Agency):** Kênh tìm kiếm và đặt phòng.
*   **PMS (Property Management System):** Hệ thống quản trị vận hành cho chủ tài sản.
*   **Connected Stay Portal:** Cổng trải nghiệm số dành riêng cho khách đang lưu trú.

## 2. Đối tượng mục tiêu (Target Categories)
Hệ thống được thiết kế linh hoạt (Modular Design) để quản lý 4 nhóm hình thái lưu trú chính:
1.  **Khách sạn (Hotel)**
2.  **Nhà nghỉ / Guesthouse**
3.  **Căn hộ dịch vụ cho thuê (Serviced Apartment)**
4.  **Homestay chia phòng**

## 3. Cấu trúc phân quyền (Role Definition)

### 3.1. Admin (Hệ thống BKS)
*   Quản trị vĩ mô: Tòa nhà, Phòng, Tỉnh thành, Tiện ích, Tin tức.
*   Quản lý Đối tác (Partner Management): Phê duyệt và giám sát các đơn vị nhượng quyền/hợp tác.
*   Cấu hình AI Chatbot: Thiết kế luồng câu hỏi (`Question Flow`) tự động hóa CSKH.

### 3.2. Partner (Chủ nhà/Đơn vị vận hành)
*   Quản lý tài sản riêng: Cập nhật thông tin phòng, giá (`Price Rules`), lịch trống (`Calendar`).
*   Quản lý tài chính: Theo dõi doanh thu tổng, phí nền tảng, và lợi nhuận thực nhận (`Net Income`).
*   Chăm sóc khách hàng: Hệ thống Chat và xử lý các yêu cầu bảo trì (`Maintenances`).

### 3.3. End User (Khách hàng)
*   Tìm kiếm, so sánh và đặt phòng trực tuyến.
*   Quản lý lịch sử đặt phòng (`My Bookings`).

### 3.4. BKS Stay Connect (Khách đang ở)
*   Trải nghiệm xuyên suốt qua **Stay Portal**.
*   Số hóa thủ tục: Ký hợp đồng điện tử (`Digital Contracts`), xem hồ sơ lưu trú.
*   Dịch vụ tại chỗ: Gọi dịch vụ phòng, xem hướng dẫn (`Stay Guide`), gửi yêu cầu hỗ trợ 24/7.

## 4. Các tính năng cốt lõi (Core Features)

| Phân hệ | Tính năng chính |
| :--- | :--- |
| **Vận hành (PMS)** | Quản lý tòa nhà, sơ đồ phòng, lịch trống theo thời gian thực. |
| **Tài chính** | Tự động đối soát doanh thu, tính toán hoa hồng cho nền tảng. |
| **Hợp đồng** | Số hóa quy trình ký kết hợp đồng thuê dài hạn/ngắn hạn. |
| **Connected Stay** | Mobile-first portal cho khách ở, tích hợp hướng dẫn và dịch vụ phòng. |
| **Marketing** | Hệ thống tin tức, quản lý đối tác và tích hợp AI Chatbot. |

## 5. Giá trị khác biệt (Unique Selling Points - USP)
1.  **DNA Vận hành Chuyên nghiệp:** Thừa hưởng quy trình vận hành kỷ luật, chặt chẽ và chuyên nghiệp theo tiêu chuẩn quốc tế.
2.  **Connected Stay:** Không chỉ dừng lại ở giao dịch đặt phòng, BKS đồng hành cùng khách hàng trong suốt quá trình lưu trú.
3.  **Open Platform:** Cho phép các chủ nhà nhỏ lẻ vận hành chuyên nghiệp theo tiêu chuẩn quốc tế (Sonder-as-a-Service).
4.  **Địa phương hóa:** Tối ưu cho mô hình Căn hộ mini và quy định pháp lý lưu trú tại Việt Nam.

## 6. Định hướng phát triển
*   Tích hợp **Channel Manager** để đẩy dữ liệu phòng lên các sàn quốc tế (Agoda, Booking, Traveloka).
*   Ứng dụng AI sâu hơn vào việc dự báo giá và tự động hóa yêu cầu dịch vụ phòng.

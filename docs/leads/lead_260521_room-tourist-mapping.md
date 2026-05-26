# Lead: Room-to-Tourist-Spot Mapping

## Document Information
- **Lead ID:** L260521-room-tourist-mapping
- **Created:** 2026-05-21
- **Status:** Clarified
- **Next Step:** Ready for `stack-analyze` or a tighter SRS draft if scope is approved.

---

## Original Input
> `http://localhost:5173/`
> 
> Mục tiêu: map các phòng nổi bật với các khu du lịch (ví dụ: phòng ... cách bà nà hill 2km, hoặc 5/10/15 phút đi xe...)

---

## Clarified Requirements

### Problem Statement
Người dùng đang xem landing page và kết quả tìm kiếm cần biết nhanh phòng nào phù hợp với chuyến đi gắn với một điểm du lịch cụ thể. Mục tiêu không chỉ là hiển thị phòng nổi bật, mà còn giúp người dùng hiểu phòng đó cách địa điểm du lịch bao xa hoặc mất bao lâu để di chuyển tới đó.

### Target Users
- **Primary:** Khách đặt phòng trên trang public.
- **Secondary:** Người dùng đang so sánh phòng theo điểm đến du lịch, marketing/content team muốn nhấn mạnh các điểm đến nổi tiếng.

### Business Context
- **Business Value:** Tăng khả năng người dùng chọn phòng phù hợp với lịch trình du lịch và tăng click-through từ landing page sang chi tiết phòng / tìm kiếm.
- **Success Metric:** End user biết được phòng của họ mất bao nhiêu thời gian để đến được địa điểm du lịch.
- **Confirmed Preference:** Chỉ thêm table hoặc field, không bớt dữ liệu hiện có.

### Technical Context
- **Screens Involved:** Trang chủ và trang kết quả tìm kiếm phòng.
- **Data Source Preference:** Dùng dữ liệu phòng / khu vực hiện có làm nền tảng ban đầu.
- **Display Style:** Hiển thị cả tên điểm đến và khoảng cách, nhưng user ưu tiên ngữ nghĩa theo thời gian di chuyển.
- **Current UI Baseline:** Homepage đã có hero search, block điểm đến nổi bật, và block phòng nổi bật; feature mới cần lồng vào luồng hiện có thay vì thay toàn bộ layout.

### Key Features
1. Gắn phòng nổi bật với một hoặc nhiều điểm du lịch nổi tiếng.
2. Hiển thị thông tin theo dạng dễ đọc như tên địa điểm + thời gian di chuyển / khoảng cách.
3. Áp dụng trên cả trang chủ và trang kết quả tìm kiếm.
4. Giữ logic ưu tiên theo dữ liệu hiện có, không thay đổi routing.

### Out of Scope
- Không làm lại toàn bộ homepage.
- Không thay đổi luồng đặt phòng hiện tại.
- Không xóa các field/bảng cũ trong giai đoạn discovery này.
- Không tối ưu bản đồ GIS phức tạp nếu chưa được xác nhận là cần thiết.

---

## Clarification Q&A

### Business Questions
| Question | Answer |
|----------|--------|
| Bạn muốn hiển thị mapping phòng ↔ địa điểm du lịch ở đâu? | Cả trang chủ và trang kết quả tìm kiếm |
| Phạm vi MVP của mapping là gì? | Tất cả phòng có đủ dữ liệu địa lý |
| Tiêu chí thành công của tính năng này là gì? | End user biết được phòng của họ mất bao nhiêu thời gian để đến được địa điểm du lịch |

### Technical Questions
| Question | Answer |
|----------|--------|
| Nguồn dữ liệu địa điểm du lịch sẽ lấy từ đâu? | Từ dữ liệu phòng/khu vực hiện có |
| Khoảng cách nên được tính và hiển thị thế nào? | Thời gian di chuyển |
| Quy tắc ưu tiên khi một phòng gần nhiều điểm du lịch là gì? | Ưu tiên điểm nổi tiếng nhất |
| Bạn muốn thông điệp hiển thị theo kiểu nào trên card? | Cả tên điểm đến và khoảng cách |
| Có ràng buộc kỹ thuật hoặc dữ liệu nào cần giữ nguyên không? | Chỉ thêm table hoặc field, không bớt |

---

## Assumptions
- Có thể suy ra một phần mapping từ dữ liệu khu vực / vị trí phòng hiện có.
- Nếu cần thời gian di chuyển chính xác, sẽ cần thêm rule tính toán hoặc dữ liệu bổ sung ngoài tên khu vực thuần túy.
- Danh mục điểm du lịch nổi tiếng sẽ cần một cách ưu tiên rõ ràng để tránh hiển thị quá nhiều kết quả cho cùng một phòng.

## Open Questions
- [ ] “Thời gian di chuyển” sẽ là con số ước tính hay lấy từ dịch vụ bản đồ / routing thực tế?
- [ ] Danh mục điểm du lịch nổi tiếng sẽ do hệ thống tự suy ra hay cần admin cấu hình?
- [ ] Một phòng có thể map với bao nhiêu điểm du lịch trên một card / một màn hình?
- [ ] Khi phòng không có dữ liệu địa lý đủ tốt, hệ thống sẽ ẩn block hay fallback sang nhãn tỉnh/thành?

## Risks Identified
| Risk | Impact | Mitigation |
|------|--------|------------|
| Dữ liệu khu vực hiện có không đủ chi tiết để suy ra thời gian di chuyển chính xác | H | Cần xác nhận nguồn geo / routing trước khi vào SRS |
| Hiển thị quá nhiều điểm du lịch cho một phòng có thể làm card rối | M | Giới hạn số điểm ưu tiên và chỉ show điểm nổi bật nhất |
| Chỉ dựa vào dữ liệu hiện có có thể tạo ra thông tin ước tính không nhất quán | M | Chốt rule tính toán và nhãn hiển thị rõ ràng |

---

## Next Steps
- [ ] Nếu scope đã đủ rõ, chuyển sang `stack-analyze` để viết SRS chi tiết cho mapping phòng với điểm du lịch.
- [ ] Nếu cần chốt thêm rule tính thời gian di chuyển hoặc dữ liệu địa lý, tiếp tục discovery với một vòng hỏi ngắn nữa.

## Appendix

### Discovery Session Log
- **Round 1:** Xác định scope hiển thị trên trang chủ và trang kết quả, nguồn dữ liệu từ phòng / khu vực hiện có, ưu tiên điểm nổi tiếng nhất, hiển thị tên địa điểm + thời gian di chuyển, success metric là người dùng biết phòng mất bao lâu để tới điểm du lịch.

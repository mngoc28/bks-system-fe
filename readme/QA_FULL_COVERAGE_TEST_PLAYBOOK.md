# Sổ Tay QA Full Coverage (Áp Dụng Cho Mọi Dự Án)

## 1) Mục tiêu
Tài liệu này là bộ quy tắc chung để bất kỳ tester nào cũng có thể kiểm thử toàn diện một dự án, không bỏ sót:
- Bất kỳ chức năng nào
- Bất kỳ nút bấm/hành động nào
- Bất kỳ luồng CRUD nào
- Bất kỳ ràng buộc quyền/role nào

Nguyên tắc cốt lõi:
Không được kết luận "đã test xong" nếu chưa có bảng đối soát đầy đủ: Route -> Màn hình -> Thành phần -> Hành động -> Kết quả.

---

## 2) Định nghĩa Done (bắt buộc)
Chỉ được đánh dấu Done khi thỏa tất cả điều kiện sau:
1. Có inventory đầy đủ toàn bộ route/màn hình trong phạm vi test.
2. Mỗi màn hình có danh sách đầy đủ button/link/icon action/menu action/modal action/keyboard action.
3. Mỗi action có kết quả Pass/Fail và bằng chứng (ảnh, video, log, request, response).
4. Mỗi module có ma trận CRUD đầy đủ.
5. Có ma trận quyền theo role.
6. Có báo cáo bug theo mức độ nghiêm trọng, có bước tái hiện rõ ràng.
7. Có danh sách Not Tested (nếu có), kèm lý do và người chịu trách nhiệm follow-up.

Thiếu bất kỳ mục nào ở trên => Chưa đạt Done.

---

## 3) Bộ rules không được vi phạm
1. Không test theo trí nhớ. Luôn test theo inventory/checklist.
2. Không bỏ qua icon button, row action, dropdown item, context menu, action trong modal.
3. Không bỏ qua các trạng thái: loading, empty, error, success, disabled/readonly.
4. Không bỏ qua test âm (negative cases) và dữ liệu biên (boundary cases).
5. Không bỏ qua phân quyền theo role.
6. Không bỏ qua search/filter/sort/pagination/reset.
7. Không bỏ qua upload/media: ảnh hợp lệ, không có ảnh, ảnh lỗi.
8. Không bỏ qua hành vi trên thiết bị khác nhau (desktop/tablet/mobile nếu scope có yêu cầu).
9. Không bỏ qua i18n/l10n (nếu dự án đa ngôn ngữ).
10. Không kết luận "ổn" nếu chưa có bằng chứng.

---

## 4) Prompt chuẩn để giao cho tester khác
Sao chép prompt dưới đây khi bàn giao nhiệm vụ:

"Bạn là Senior QA Tester. Nhiệm vụ: kiểm thử full coverage cho [TÊN DỰ ÁN/PHẠM VI].
Yêu cầu bắt buộc:
1) Tạo inventory: Route -> Screen -> Component -> Tất cả action.
2) Kiểm thử đầy đủ theo ma trận: CRUD, UI states, validation, permission, API mapping.
3) Không bỏ sót bất kỳ action nào (bao gồm icon, context action, modal action, keyboard submit).
4) Mỗi action phải có kết quả Pass/Fail + evidence.
5) Báo cáo bug theo severity: Critical/High/Medium/Low, có bước reproduce.
6) Có bảng coverage cuối: Tested/Not Tested + lý do.
Trả kết quả theo format trong tài liệu QA_FULL_COVERAGE_TEST_PLAYBOOK.md."

---

## 5) Quy trình kiểm thử full coverage

### Giai đoạn A - Lập inventory (chống sót chức năng)
1. Liệt kê toàn bộ routes trong phạm vi.
2. Map mỗi route vào màn hình tương ứng.
3. Với mỗi màn hình, liệt kê đầy đủ:
   - Primary actions (hành động chính)
   - Secondary actions (filter, reset, import/export, back, duplicate...)
   - Row actions (view/edit/delete/custom)
   - Modal actions (confirm/cancel/close/secondary)
   - Conditional actions (chỉ hiện khi có dữ liệu, theo trạng thái, theo role)
4. Tạo Action Registry với Action ID duy nhất.

Mẫu Action Registry:

| Action ID | Route | Screen | Component | UI Element | Action Type | Role | API/Mutation |
|---|---|---|---|---|---|---|---|
| ACT-001 | /users | User List | UserTable | Edit icon | Update | Admin | updateUser |

### Giai đoạn B - Functional test
Kiểm thử theo nhóm:
1. Navigation/routing
2. CRUD
3. Search/filter/sort/pagination
4. Form validation (required, format, min/max, boundary)
5. Upload/file/media
6. Empty/loading/error/success states
7. Permission/role behavior
8. i18n/text fallback

### Giai đoạn C - API và logic verification
1. Đối chiếu action UI với API thực tế.
2. Verify payload, status code, thông điệp lỗi.
3. Verify cache invalidation/refetch/optimistic update (nếu có).
4. Verify dữ liệu nhất quán trước/sau mutation.

### Giai đoạn D - Regression và cross-module
1. Re-test các luồng liên quan sau khi fix.
2. Re-test các module dùng chung component/hook/service.
3. Re-test các luồng có phụ thuộc dữ liệu chéo.

---

## 6) Ma trận bắt buộc

### 6.1 CRUD matrix (mỗi module)
| Module | Create | Read (List/Detail) | Update | Delete | Kết luận |
|---|---|---|---|---|---|

### 6.2 UI state matrix (mỗi màn hình)
| Screen | Loading | Empty | Error | Success | Disabled/Readonly |
|---|---|---|---|---|---|

### 6.3 Role matrix
| Screen/Action | Admin | Manager | User | Guest |
|---|---|---|---|---|

### 6.4 Button/action coverage matrix
| Screen | Tổng action | Đã test | Chưa test | % Coverage |
|---|---|---|---|---|

Quy định pass:
Coverage action phải đạt 100% trong phạm vi đã cam kết.

---

## 7) Requirement chi tiết để không sót bất kỳ nút nào
1. Quét UI theo tất cả chế độ hiển thị có thể có (ví dụ: grid/table/list/card).
2. Quét ít nhất 2 dòng dữ liệu cho bảng/list (dòng đầu + dòng cuối).
3. Mở tất cả modal/dropdown/popover/context menu để lấy hết action ẩn.
4. Test cả chuột và bàn phím (Enter/Space/Escape/Tab) với các action liên quan.
5. Test action trong mọi trạng thái dữ liệu: có dữ liệu, không dữ liệu, loading, error.
6. Test theo role/quyền (nếu hệ thống có phân quyền).
7. Mọi mục không test phải đánh dấu Not Tested và ghi rõ lý do.

---

## 8) Chuẩn ghi nhận bug
Mỗi bug bắt buộc có:
1. Bug ID
2. Severity (Critical/High/Medium/Low)
3. Environment (build/branch/role/device/browser)
4. Preconditions
5. Steps to reproduce
6. Expected result
7. Actual result
8. Evidence (screenshot/video/network log)
9. Tần suất tái hiện (Always/Sometimes/Rare)
10. Owner/Assignee

Mẫu:

| Bug ID | Severity | Module | Title | Steps | Expected | Actual | Evidence | Owner |
|---|---|---|---|---|---|---|---|---|

---

## 9) Mẫu báo cáo tổng kết chuẩn
Báo cáo cuối phải có:
1. Phạm vi đã test
2. Coverage theo module
3. Coverage theo button/action
4. Danh sách bug theo severity
5. Danh sách Not Tested + lý do
6. Các rủi ro còn tồn đọng
7. Khuyến nghị Go/No-Go

### 9.1 Executive summary
- Tổng số module trong phạm vi:
- Tổng số action phát hiện:
- Tổng số action đã test:
- Tỷ lệ coverage action:
- Tổng số bug:
- Số bug Critical/High còn mở:
- Khuyến nghị: GO / NO-GO

### 9.2 Coverage table
| Module | Actions | Tested | Not Tested | Coverage |
|---|---|---|---|---|

### 9.3 Open risks
| Risk | Impact | Mitigation | Owner |
|---|---|---|---|

---

## 10) Checklist thực thi nhanh

### Trước khi bắt đầu
- [ ] Chốt phạm vi test và role test
- [ ] Chuẩn bị test data đầy đủ
- [ ] Xác nhận môi trường ổn định

### Trong khi test
- [ ] Cập nhật Action Registry liên tục
- [ ] Mỗi action có kết quả + evidence
- [ ] Mỗi module có CRUD matrix
- [ ] Mỗi màn hình có UI state matrix

### Trước khi đóng task
- [ ] Coverage action = 100% trong phạm vi
- [ ] Bug report đầy đủ trường
- [ ] Có danh sách Not Tested + lý do
- [ ] Có khuyến nghị GO/NO-GO

---

## 11) Bộ test tối thiểu cho media/ảnh/file (áp dụng chung)
Bắt buộc test 3 nhóm:
1. Có file hợp lệ -> hiển thị đúng
2. Không có file -> hiển thị placeholder chuẩn
3. File lỗi/404 -> hiển thị fallback chuẩn

Áp dụng cho cả grid/table/detail/form preview.

---

## 12) Quy tắc handover giữa tester
1. Bàn giao Action Registry phiên bản mới nhất.
2. Bàn giao danh sách bug + thư mục evidence.
3. Đánh dấu rõ phạm vi đã test/chưa test.
4. Người nhận handover bắt buộc verify lại tối thiểu 10% action ngẫu nhiên.

---

## 13) Cam kết chất lượng
"Không sót chức năng" phải được chứng minh bằng dữ liệu:
- Action Registry đầy đủ
- Coverage action 100%
- Evidence đầy đủ
- Ma trận CRUD/State/Role đầy đủ

Thiếu bất kỳ thành phần nào ở trên => Báo cáo mặc định chưa đạt.

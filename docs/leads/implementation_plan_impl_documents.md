# Kế hoạch Tạo Tài Liệu Đầy Đủ (Comprehensive Documentation Plan) cho BKS System

Tài liệu này là bản kế hoạch cuối cùng để xây dựng hệ thống tài liệu cho dự án BKS System. Mục tiêu là tạo ra bộ tài liệu rõ ràng, dễ bảo trì, phục vụ cho tất cả các đối tượng (Developer, QA, Khách hàng) cùng một lúc.

## Các Quyết Định Đã Chốt (Design Decisions)
- **Đối tượng:** Tất cả (Dev, QA, User) sẽ được viết song song để đảm bảo tính đồng bộ.
- **Công cụ sơ đồ:** Sử dụng **Mermaid** trực tiếp trong Markdown.
- **Lưu trữ:** Tập trung **toàn bộ tài liệu** tại repository Frontend (`bks-system-fe/docs`). Các tài liệu cũ ở Backend sẽ được quy hoạch và chuyển dần sang đây.
- **Ngôn ngữ:** **Song ngữ** (Tiếng Việt và Tiếng Anh).

---

## Cấu trúc tài liệu đề xuất (`bks-system-fe/docs/`)

Thư mục `docs` trong Frontend repo sẽ được tổ chức lại thành trung tâm tài liệu:

```
bks-system-fe/docs/
├── architecture/       # Sơ đồ hệ thống, luồng dữ liệu (Mermaid)
├── backend/            # Chuyển từ BE sang: ERD, API reference, Logic cốt lõi
├── frontend/           # Component guides, State management, UI/UX guidelines
├── qa/                 # QA Playbooks, Test Cases
├── onboarding/         # Hướng dẫn setup local cho Dev mới (cả BE & FE)
└── user-manual/        # Hướng dẫn sử dụng cho End-user, Admin, Partner
```

---

## Các Bước Thực Hiện (Execution Phases)

Dưới đây là kế hoạch triển khai chi tiết:

### Phase 1: Kiến trúc cốt lõi & Chuyển đổi tài liệu
- Tạo bộ khung thư mục mới tại `bks-system-fe/docs/`.
- Di chuyển/tổng hợp các tài liệu hiện có từ BE (`bks-system-be/docs/*`) sang FE.
- Dùng Mermaid để vẽ sơ đồ Kiến trúc tổng thể (System Architecture) và ERD Database hiện tại.
- *Ngôn ngữ: Tiếng Việt/English song song.*

### Phase 2: Cập nhật API & Backend Logic
- Rà soát các tài liệu API (từ `api-doc/` của BE), trích xuất và chuẩn hóa lại theo định dạng Markdown tại `docs/backend/api-reference.md`.
- Viết tài liệu giải thích các module nghiệp vụ phức tạp (Booking flow, Payment, Partner management).

### Phase 3: Frontend & Onboarding
- Viết tài liệu `onboarding` hoàn chỉnh: Hướng dẫn cài đặt song song BE và FE, setup Docker.
- Hoàn thiện tài liệu Frontend: cấu trúc source code, cách dùng Zustand, React Query, Component Library (shadcn/ui).

### Phase 4: QA & User Manuals
- Chuẩn hóa QA Playbook, bổ sung các test case cốt lõi.
- Viết hướng dẫn sử dụng (User Manual) dành cho người dùng cuối (Admin, Partner, Guest).

---

## User Review Required

> [!IMPORTANT]
> Đây là bản kế hoạch đã được cập nhật. Nếu bạn đồng ý với kế hoạch này, vui lòng phê duyệt để tôi bắt đầu thực thi **Phase 1** (Tạo cấu trúc thư mục mới, tổng hợp tài liệu, và vẽ sơ đồ kiến trúc bằng Mermaid).

## Verification Plan

### Manual Verification
- Sau mỗi Phase, tôi sẽ cập nhật file `task.md` và `walkthrough.md` để bạn theo dõi tiến độ.
- Bạn có thể vào trực tiếp thư mục `bks-system-fe/docs/` để preview các sơ đồ Mermaid bằng trình xem Markdown của IDE/GitHub.

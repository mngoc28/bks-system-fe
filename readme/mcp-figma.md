# Hướng dẫn Tạo Code từ Figma với MCP và Cursor

## Giới thiệu

Tài liệu này hướng dẫn cách sử dụng Figma Developer MCP (Model-Code-Plugin) kết hợp với Cursor để tự động tạo code từ thiết kế Figma. Công cụ này giúp chuyển đổi các thiết kế UI trực tiếp thành code React, HTML, CSS hoặc các framework khác một cách nhanh chóng và hiệu quả.

## Các bước chuẩn bị

### 1. Tạo Figma Access Token

Để kết nối với Figma API, bạn cần một Access Token cá nhân:

1. Đăng nhập vào tài khoản Figma của bạn
2. Truy cập [trang cài đặt tài khoản](https://www.figma.com/settings)
3. Cuộn xuống mục "Personal access tokens"
4. Nhấp vào "Create a new personal access token"
5. Đặt tên cho token (ví dụ: "MPC Integration")
6. Sao chép token được tạo và lưu trữ an toàn (lưu ý: token chỉ hiển thị một lần)

> **Lưu ý quan trọng**: Không chia sẻ access token của bạn. Token này cung cấp quyền truy cập vào tài khoản Figma của bạn.

### 2. Cài đặt các công cụ cần thiết

Đảm bảo bạn đã cài đặt:

- [Node.js](https://nodejs.org/) (phiên bản 14.0.0 trở lên)
- [Cursor](https://cursor.sh/) - Trình soạn thảo mã nguồn dựa trên AI
- Một dự án đã tồn tại hoặc một thư mục mới để tạo code

## Thiết lập MPC Server

### 1. Khởi chạy MPC Server

Mở terminal/command prompt và chạy lệnh sau:

```bash
npx figma-developer-mcp --figma-api-key="YOUR_ACCESS_TOKEN"
```

Thay `YOUR_ACCESS_TOKEN` bằng token Figma bạn đã tạo ở bước trước.

Nếu thành công, bạn sẽ thấy thông báo xác nhận rằng MPC server đang chạy, thường là trên cổng 21001.

### 2. Kết nối MPC với Cursor

1. Mở Cursor
2. Truy cập menu "Extensions" hoặc "Plugins"
3. Tìm và chọn "Model Code Plugin (MCP)"
4. Nhấp vào "Add" hoặc "Connect"
5. Nếu được yêu cầu, nhập địa chỉ server (mặc định là `http://localhost:21001`)

## Sử dụng Agent Mode để tạo code từ Figma

### 1. Chuẩn bị Figma Design URL

1. Mở thiết kế Figma bạn muốn chuyển đổi thành code
2. Sao chép URL của file Figma hoặc frame cụ thể

### 2. Tạo code với Agent Mode

1. Trong Cursor, mở dự án hoặc thư mục nơi bạn muốn tạo code
2. Kích hoạt Agent Mode (thường bằng cách nhấn Ctrl+Shift+A hoặc qua menu)
3. Nhập lệnh như sau:

```
Tạo code dựa trên thiết kế Figma này: [URL_FIGMA]
Vui lòng tạo các component React sử dụng [CÔNG_NGHỆ] (VD: React, TailwindCSS, etc.)
```

4. Agent sẽ phân tích thiết kế Figma và bắt đầu tạo code tương ứng

### 3. Tùy chỉnh yêu cầu tạo code

Bạn có thể tùy chỉnh yêu cầu để có kết quả chính xác hơn:

- Chỉ định framework: React, Vue, Angular, HTML/CSS thuần, v.v.
- Chỉ định thư viện CSS: TailwindCSS, Material UI, Bootstrap, v.v.
- Yêu cầu responsive hay không
- Chỉ định các thành phần cụ thể để tạo code
- Yêu cầu animation hoặc chức năng tương tác

Ví dụ:

```
Tạo code cho navbar trong thiết kế Figma này: [URL_FIGMA]
Sử dụng React và TailwindCSS. Đảm bảo responsive trên mobile.
```

## Các lỗi thường gặp và cách khắc phục

### 1. Không thể kết nối với MPC Server

- Kiểm tra xem server có đang chạy không
- Đảm bảo rằng cổng 21001 không bị chặn bởi tường lửa
- Thử khởi động lại server

### 2. Token không hợp lệ

- Kiểm tra xem token còn hiệu lực không
- Tạo token mới nếu cần thiết

### 3. Không thể truy cập file Figma

- Đảm bảo rằng bạn có quyền truy cập vào file Figma
- Kiểm tra xem URL có chính xác không
- Đảm bảo file Figma là public hoặc bạn đã được chia sẻ quyền truy cập

## Các mẹo nâng cao

1. **Đặt tên layer hợp lý trong Figma**: Đặt tên rõ ràng cho các layer và frame sẽ giúp AI hiểu rõ hơn về mục đích của từng thành phần.

2. **Sử dụng Auto Layout trong Figma**: Thiết kế sử dụng Auto Layout sẽ dễ dàng chuyển đổi thành flexbox hoặc grid trong CSS.

3. **Sử dụng Components trong Figma**: Các component sẽ được chuyển đổi thành các React component hoặc các thành phần tái sử dụng.

4. **Yêu cầu cụ thể**: Cung cấp yêu cầu càng cụ thể càng tốt để có kết quả tốt nhất.

---

## Tham khảo

- [Figma API Documentation](https://www.figma.com/developers/api)
- [Cursor Documentation](https://cursor.sh/docs)
- [Figma Developer MCP GitHub](https://github.com/figma/figma-developer-mcp)

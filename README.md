# FRONT BKS SYSTEM
## 🛠️ Công nghệ sử dụng

- **React 18** với TypeScript
- **Vite** - Build tool nhanh chóng
- **TailwindCSS** - Styling framework
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query** - Data fetching và caching
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

## 📦 Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd front-bks-system

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

## 🏗️ Cấu trúc dự án

```
src/
├── api/                 # API services
├── components/          # React components
│   ├── ui/             # UI components (shadcn/ui)
│   ├── layout/         # Layout components
│   └── ...
├── hooks/              # Custom React hooks
├── locales/            # Đa ngôn ngữ (vi, en)
├── pages/              # Page components
├── store/              # Zustand stores
├── utils/              # Utility functions
└── ...
```
## 🌐 Đa ngôn ngữ

Hỗ trợ 2 ngôn ngữ:
- 🇻🇳 Tiếng Việt (mặc định)
- 🇺🇸 English

## 🎨 UI Components

Sử dụng shadcn/ui components:
- Button, Input, Dialog
- Dropdown Menu, Badge
- Table, Card, Form
- Toast notifications

## 📱 Responsive Design

- **Desktop**: Sidebar đầy đủ với menu items
- **Mobile**: Sidebar thu gọn với dialog overlay
- **Tablet**: Tự động điều chỉnh layout

## 🚀 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint checking
```

## 📄 License

MIT License

## 👥 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request
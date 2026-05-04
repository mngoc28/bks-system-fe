# Frontend Project Blueprint — bks-system-fe Style

> **Mục đích**: Tài liệu này mô tả toàn bộ kiến trúc, phong cách code, và quy ước đặt tên của dự án `bks-system-fe`. Dùng làm blueprint cho AI agent hoặc developer khi khởi tạo một dự án FE mới với nội dung khác nhưng cùng phong cách code.

---

## 1. Tech Stack Chuẩn

| Hạng mục | Thư viện / Công cụ | Version |
|---|---|---|
| **Framework** | React | ^18.3 |
| **Ngôn ngữ** | TypeScript | ~5.6 |
| **Build tool** | Vite | ^6.0 |
| **Routing** | React Router DOM | ^7.3 |
| **Data fetching** | TanStack React Query | ^5.74 |
| **Global state** | Zustand (+ persist middleware) | ^5.0 |
| **HTTP client** | Axios | ^1.7 |
| **Form** | React Hook Form + Zod | ^7.54 + ^3.24 |
| **UI components** | Shadcn/ui (Radix UI primitives) | latest |
| **Styling** | Tailwind CSS v3 | ^3.4 |
| **Toast notification** | Sonner | ^2.0 |
| **Icon** | Lucide React | ^0.474 |
| **i18n** | i18next + react-i18next | ^24 + 15.4 |
| **Charts** | Recharts | ^3.3 |
| **Linter** | ESLint (typescript-eslint) | ^9 |
| **Formatter** | Prettier + prettier-plugin-tailwindcss | ^3.5 |

---

## 2. Cấu Trúc Thư Mục Chuẩn

```
src/
├── api/                    # Lớp giao tiếp HTTP thuần túy
│   ├── axiosClient.ts      # Cấu hình Axios instance (interceptors, auth header)
│   ├── types.ts            # Kiểu dùng chung: ApiResponse<T>, Paginator<T>, ErrorResponse
│   ├── authApi.ts          # API endpoint của từng domain (auth)
│   ├── partnerApi.ts       # API endpoint của từng domain (partner)
│   └── ...Api.ts           # Mỗi domain 1 file
│
├── hooks/                  # TanStack Query hooks (data fetching / mutations)
│   ├── useAuthQuery.ts     # Hooks cho domain auth
│   ├── usePartnerQuery.ts  # Hooks cho domain partner
│   └── use[Domain]Query.ts # Mỗi domain 1 file, đặt tên use[Domain]Query.ts
│
├── store/                  # Zustand global state stores
│   ├── useUserStore.ts     # Store xác thực người dùng (token, role, email)
│   ├── useCheckTokenStore.ts
│   └── useLanguage/        # Store cài đặt ngôn ngữ
│
├── dataHelper/             # TypeScript interfaces & types cho từng domain
│   ├── auth.dataHelper.ts
│   ├── partner.dataHelper.ts
│   └── [domain].dataHelper.ts
│
├── pages/                  # Các page component, phân theo role
│   ├── Admin/              # Role: Admin
│   ├── Partner/            # Role: Partner
│   │   ├── Dashboard.tsx
│   │   ├── Properties.tsx
│   │   ├── PartnerLayout.tsx   # Layout wrapper cho role Partner
│   │   ├── components/         # Sub-components dùng riêng trong Partner
│   │   ├── types.ts            # Local types của Partner feature
│   │   ├── mockData.ts         # Mock data (nếu cần)
│   │   └── index.ts            # Re-export barrel file
│   └── EndUser/            # Role: End User
│
├── components/             # Shared UI components dùng lại nhiều nơi
│   ├── ui/                 # Shadcn primitives (button, input, dialog...)
│   ├── layout/             # Layout wrappers (AdminLayout, AuthLayout, PublicLayout)
│   ├── DataTable/          # Bảng dữ liệu chung
│   ├── Pagination/         # Phân trang chung
│   ├── RowActions/         # Dropdown actions cho table row
│   ├── common/             # Shared utility components (ScrollToTop, EmptyPage...)
│   └── type.ts             # Shared component-level types
│
├── utils/                  # Utility functions thuần (không có React)
│   ├── storage.ts          # localStorage / token access helpers
│   ├── tokenUtils.ts       # JWT decode & expiry check
│   ├── dateUtils.ts        # Định dạng ngày tháng
│   ├── errorUtils.ts       # Parse lỗi từ server
│   ├── imageUtils.ts       # Xử lý ảnh (compress, validate)
│   └── utils.ts            # cn() helper + các hàm dùng chung
│
├── lib/                    # Thư viện / config nội bộ (utils.ts, i18n init...)
├── locales/                # JSON translation files
├── assets/                 # Images, fonts, icons tĩnh
├── types/                  # Global ambient TypeScript declarations (.d.ts)
├── constant.ts             # Hằng số toàn ứng dụng (ROUTERS enum, business constants)
├── Router.tsx              # Định nghĩa toàn bộ routes & PrivateRoute guards
└── main.tsx                # Entry point — khởi tạo QueryClient, BrowserRouter, Toaster
```

---

## 3. Kiến Trúc Phân Lớp (3-Layer Architecture)

```
┌─────────────────┐
│   Page / View   │  ← Chỉ gọi hooks, không gọi API trực tiếp
│  (pages/**.tsx) │
└────────┬────────┘
         │ gọi hook
┌────────▼────────┐
│     Hooks       │  ← Bọc TanStack Query, xử lý onSuccess/onError, toast
│ (hooks/use*.ts) │
└────────┬────────┘
         │ gọi api
┌────────▼────────┐
│   API Layer     │  ← Chỉ định nghĩa endpoint, return axiosClient call
│  (api/**.ts)    │
└────────┬────────┘
         │
┌────────▼────────┐
│  axiosClient.ts │  ← Interceptors: auth header, 401 logout, FormData detect
└─────────────────┘
```

**Quy tắc bất biến**: Page không bao giờ gọi `axiosClient` hay `xxxApi` trực tiếp. Page chỉ gọi hooks.

---

## 4. Patterns Chi Tiết

### 4.1 — API Layer (`src/api/[domain]Api.ts`)

```typescript
// src/api/partnerApi.ts
import { PartnerDetailResponse, PartnerFilter, PartnerResponse, PartnerUpdate } from "@/dataHelper/partner.dataHelper";
import axiosClient from "./axiosClient";

export const partnerApi = {
  getList: (params: PartnerFilter): Promise<PartnerResponse> =>
    axiosClient.get("admin/partner/search", { params }),

  getById: (id: number): Promise<PartnerDetailResponse> =>
    axiosClient.get(`admin/partner/${id}`),

  create: (data: PartnerCreate): Promise<PartnerDetailResponse> =>
    axiosClient.post("admin/partner", data),

  update: (id: number, data: PartnerUpdate | FormData): Promise<PartnerDetailResponse> =>
    axiosClient.post(`admin/partner/${id}`, data),

  delete: (id: number): Promise<ApiResponse<null>> =>
    axiosClient.delete(`admin/partner/${id}`),
};
```

**Quy tắc**:
- Mỗi domain 1 file, tên file: `[domain]Api.ts`
- Export 1 object named `[domain]Api` (camelCase)
- Tất cả phương thức là arrow functions trả về Promise
- Import types từ `@/dataHelper/[domain].dataHelper`
- Không xử lý lỗi ở lớp này — let bubbles up

---

### 4.2 — Data Helper (`src/dataHelper/[domain].dataHelper.ts`)

```typescript
// src/dataHelper/partner.dataHelper.ts
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constant";

// Entity từ API
export interface PartnerInfor {
  id: number;
  company_name: string;
  province_id: number;
  // ... mirror API response chính xác
}

// Filter/Query params
export interface PartnerFilter {
  page?: number | typeof DEFAULT_PAGE;
  per_page?: number | typeof DEFAULT_LIMIT;
  sort_field?: string;
  sort_direction?: string;
  company_name?: string;
  // ... các filter fields
}

// Response wrapper từ API (paginated)
export interface PartnerResponse {
  current_page: number;
  data: PartnerInfor[];
  last_page: number;
  total: number;
  // ... pagination fields
}

// Response đơn lẻ
export interface PartnerDetailResponse {
  status: string;
  data: PartnerDetail;
  message: string;
}

// Payload tạo mới
export interface PartnerCreate {
  company_name: string;
  // ...
}

// Payload cập nhật (fields optional)
export interface PartnerUpdate {
  company_name?: string;
  image_1?: File | null | 'delete';
  // ...
}

// Props của từng component page
export interface PartnerTableProps {
  data: PartnerInfor[];
  onSort: (key: string) => void;
  filters: PartnerFilter;
}
```

**Quy tắc**:
- Tên file: `[domain].dataHelper.ts`
- Đặt tất cả interfaces liên quan đến domain tại đây
- Bao gồm cả: Entity, Filter, Response (list + detail), Create payload, Update payload, Component Props
- Dùng `snake_case` cho field names (mirror backend Laravel)

---

### 4.3 — Hook Layer (`src/hooks/use[Domain]Query.ts`)

```typescript
// src/hooks/usePartnerQuery.ts
import { partnerApi } from "@/api/partnerApi";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { PartnerDetailResponse, PartnerFilter, PartnerResponse, PartnerUpdate } from "@/dataHelper/partner.dataHelper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// READ (List)
export const useListPartnerQuery = (params: PartnerFilter) => {
  return useQuery<PartnerResponse, Error>({
    queryKey: ["partners", params],
    queryFn: () => partnerApi.getList(params),
  });
};

// READ (Single)
export const usePartnerQuery = (id: number) => {
  return useQuery<PartnerDetailResponse, Error>({
    queryKey: ["partner", id],
    queryFn: () => partnerApi.getById(id),
    enabled: !!id,  // ← chỉ fetch khi có id
  });
};

// WRITE (Mutation)
export const useUpdatePartnerQuery = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PartnerUpdate | FormData }) =>
      partnerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toastSuccess(t("partner.update_success"));
    },
    onError: () => {
      toastError(t("partner.update_fail"));
    },
  });
};

// DELETE
export const useDeletePartnerQuery = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => partnerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toastSuccess(t("partner.delete_success"));
    },
    onError: () => {
      toastError(t("partner.delete_fail"));
    },
  });
};
```

**Quy tắc đặt tên hooks**:

| Mục đích | Pattern tên |
|---|---|
| Fetch danh sách | `useList[Domain]Query` |
| Fetch 1 item | `use[Domain]Query` |
| Tạo mới | `useCreate[Domain]Mutation` |
| Cập nhật | `useUpdate[Domain]Query` (hoặc Mutation) |
| Xóa | `useDelete[Domain]Query` |

---

### 4.4 — Global State (Zustand)

```typescript
// src/store/useUserStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserStore {
  userEmail: string;
  userRole: string;
  userName: string;
  get isAuthenticated(): boolean;
  login: (token: string, email: string, role: string, name: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore, [["zustand/persist", unknown]]>(
  persist(
    (set, get) => ({
      userEmail: "",
      userRole: "",
      userName: "",
      get isAuthenticated() {
        const token = getAccessToken();
        return !!token && !!get().userEmail;
      },
      login(token, email, role, name) {
        setAccessToken(token);
        set({ userEmail: email, userRole: role.toLowerCase(), userName: name });
      },
      logout() {
        removeAccessToken();
        set({ userEmail: "", userRole: "", userName: "" });
      },
    }),
    {
      name: "user",  // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({  // chỉ persist những field cần
        userEmail: state.userEmail,
        userRole: state.userRole,
        userName: state.userName,
      }),
    },
  ),
);
```

**Khi nào dùng Zustand vs React Query**:
- **Zustand**: Dữ liệu toàn cục persistent (auth info, settings, UI preferences)
- **React Query**: Server state — mọi thứ fetch từ API

---

### 4.5 — Axios Client (Không thay đổi giữa các dự án)

```typescript
// src/api/axiosClient.ts
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_URL,  // ← env variable
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: Attach Bearer token + language header
axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && isTokenExpired(token)) {
    useUserStore.getState().logout();
    window.location.href = ROUTERS.LOGIN;
    return Promise.reject(new Error("Token expired"));
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["Accept-Language"] = getLanguageStorage();
  // Auto-remove Content-Type for FormData (browser sets boundary)
  if (config.data instanceof FormData) delete config.headers["Content-Type"];
  return config;
});

// Response interceptor: Unwrap .data, handle 401
axiosClient.interceptors.response.use(
  (response) => {
    if (response.data?.code === 401) { /* logout */ }
    return response.data ?? response;  // ← Unwrap response.data
  },
  (error) => {
    if (error.response?.data?.code === 401) { /* logout */ }
    return Promise.reject(error);
  },
);
```

---

### 4.6 — Routing (`src/Router.tsx`)

```typescript
// Pattern: Lazy loading + PrivateRoute guards
const PartnerDashboard = React.lazy(() => import("./pages/Partner/Dashboard"));

// Guard components
const PrivateRoute = ({ children }) => {
  const token = useCheckTokenStore();
  const isAuthenticated = !!token && !isTokenExpired(token);
  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTERS.LOGIN} replace />;
};

// Route structure: Public / Private / Role-based
<Routes>
  {/* Role-based protected route */}
  <Route path="/partner" element={
    <PartnerPrivateRoute>
      <Suspense fallback={<LoadingFallback />}>
        <PartnerLayout />
      </Suspense>
    </PartnerPrivateRoute>
  }>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<PartnerDashboard />} />
    <Route path="items" element={<PartnerItems />} />
  </Route>
</Routes>
```

---

### 4.7 — Constants (`src/constant.ts`)

```typescript
// Route constants — dùng const enum
export const enum ROUTERS {
  LOGIN = "/admin/login",
  CONTROL = "/admin/dashboard",
  // Thêm route mới tại đây
}

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const PAGINATION_PER_PAGE_OPTIONS = [5, 10, 20, 50] as const;

// Business constants
export const MAX_LENGTH_INPUT = 255;
export const SEARCH_DEBOUNCE_DELAY_MS = 500;
```

---

### 4.8 — Global API Response Types (`src/api/types.ts`)

```typescript
// Tất cả API response đều follow pattern này
export interface ApiResponse<T> {
  status: string;
  message: string;
  data?: T;
  errors: { [key: string]: string[] };
}

// Paginated list response
export interface Paginator<T> {
  current_page: number;
  data: T[];
  last_page?: number;
  total: number;
  per_page?: number;
}

export interface ErrorResponse {
  code?: number;
  message?: string;
}
```

---

### 4.9 — Page Component Pattern

```typescript
// src/pages/[Role]/[FeatureName].tsx
import React, { useState } from 'react';
// 1. Third-party imports
import { useTranslation } from 'react-i18next';
import { Search, Plus } from 'lucide-react';
// 2. Internal component imports
import { Button } from '@/components/ui/button';
// 3. Hook imports
import { useListPartnerQuery } from '@/hooks/usePartnerQuery';
// 4. Type imports
import type { PartnerFilter } from '@/dataHelper/partner.dataHelper';

type PartnerListProps = {
  onSelect?: (id: number) => void;
};

const PartnerList: React.FC<PartnerListProps> = ({ onSelect }) => {
  const { t } = useTranslation();

  // State
  const [filters, setFilters] = useState<PartnerFilter>({
    page: 1,
    per_page: 10,
  });

  // Data hooks
  const { data, isLoading } = useListPartnerQuery(filters);

  // Event handlers (handle prefix)
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Early returns
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* ... */}
    </div>
  );
};

export default PartnerList;
```

---

## 5. Coding Conventions

### 5.1 Naming Conventions

| Element | Convention | Ví dụ |
|---|---|---|
| Component | `PascalCase` | `PartnerDashboard`, `InlineSheet` |
| Hook | `camelCase` + `use` prefix | `usePartnerQuery`, `useUserStore` |
| API object | `camelCase` + `Api` suffix | `partnerApi`, `authApi` |
| Data helper file | `[domain].dataHelper.ts` | `partner.dataHelper.ts` |
| Event handlers | `handle` prefix | `handleSubmit`, `handleClose` |
| Boolean vars | `is/has/can` prefix | `isLoading`, `hasError`, `canEdit` |
| Type/Interface | `PascalCase` | `PartnerFilter`, `ApiResponse<T>` |

### 5.2 TypeScript Rules

- **Luôn** định nghĩa type/interface cho props của component
- **Không dùng** `any` — dùng `unknown` nếu không biết type
- Dùng **generic** cho response types: `ApiResponse<T>`, `Paginator<T>`
- Dùng **`as const`** cho mảng options/enums cố định
- Dùng **`const` arrow functions** thay vì `function` declarations

```typescript
// ✅ Đúng
const handleSubmit = (data: FormData) => { ... };
const SORT_OPTIONS = ["asc", "desc"] as const;
type SortDirection = typeof SORT_OPTIONS[number];

// ❌ Sai
function handleSubmit(data: any) { ... }
const SORT_OPTIONS = ["asc", "desc"];
```

### 5.3 Tailwind Conventions

- **Luôn** dùng Tailwind classes — không dùng inline style
- Dùng `cn()` utility để merge classes có điều kiện:

```typescript
import { cn } from "@/lib/utils";
<div className={cn("base-class", condition && "conditional-class", className)} />
```

### 5.4 Import Order

```typescript
// 1. React core
import React, { useState, useEffect } from 'react';
// 2. Third-party libraries
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
// 3. Internal shared components
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
// 4. Feature hooks
import { useListPartnerQuery } from '@/hooks/usePartnerQuery';
// 5. Types (last, `import type`)
import type { PartnerFilter } from '@/dataHelper/partner.dataHelper';
```

---

## 6. Entry Point Setup (`src/main.tsx`)

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import ScrollToTop from "./components/common/ScrollToTop";
import Router from "./Router";
import "./index.css";
import "./lib/changeLanguageUtils"; // i18n init

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Router />
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
```

---

## 7. Environment Variables

```bash
# .env
VITE_URL=https://your-api.com/api/v1/

# .env.example (commit vào git)
VITE_URL=
```

---

## 8. Hướng Dẫn Tạo Dự Án Mới Từ Blueprint

### Bước 1: Scaffold dự án

```bash
npx -y create-vite@latest my-new-project -- --template react-ts
cd my-new-project
```

### Bước 2: Cài đặt dependencies

```bash
npm install \
  @tanstack/react-query \
  zustand \
  axios \
  react-router-dom \
  react-hook-form @hookform/resolvers zod \
  sonner \
  lucide-react \
  i18next react-i18next \
  tailwind-merge clsx class-variance-authority \
  @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select \
  tailwindcss-animate

npm install -D tailwindcss postcss autoprefixer prettier prettier-plugin-tailwindcss typescript-eslint
```

### Bước 3: Copy cấu hình gốc từ `bks-system-fe`

| File | Ghi chú |
|---|---|
| `tailwind.config.js` | Dùng nguyên — chứa toàn bộ CSS variable token system |
| `tsconfig.app.json` | Đảm bảo path alias `@/*` → `./src/*` |
| `.prettierrc` | Dùng nguyên |
| `vite.config.ts` | Đảm bảo có `resolve.alias: { '@': '/src' }` |
| `components.json` | Shadcn config |

### Bước 4: Tạo cấu trúc thư mục (Bước 2 trong sơ đồ)

```
src/
├── api/
│   ├── axiosClient.ts    ← Copy từ bks-system-fe, đổi ROUTERS.LOGIN nếu cần
│   └── types.ts          ← Copy nguyên
├── hooks/
├── store/
│   └── useUserStore.ts   ← Copy, điều chỉnh fields nếu cần
├── dataHelper/
├── pages/
├── components/
│   └── ui/               ← Dùng Shadcn CLI để add components
├── utils/
│   ├── storage.ts        ← Copy nguyên
│   └── tokenUtils.ts     ← Copy nguyên
├── lib/
│   └── utils.ts          ← cn() utility
├── locales/
├── constant.ts           ← Đặt ROUTERS enum ở đây
├── Router.tsx
└── main.tsx
```

### Bước 5: Thêm một domain mới — thứ tự BẮT BUỘC

```
1. dataHelper/[domain].dataHelper.ts   → Interfaces & types
2. api/[domain]Api.ts                  → API endpoints
3. hooks/use[Domain]Query.ts           → TanStack Query hooks
4. pages/[Role]/[Feature].tsx          → Page component
5. constant.ts                         → Thêm vào ROUTERS enum
6. Router.tsx                          → Khai báo route + guard
```

---

## 9. Files Copy Nguyên Từ Dự Án Cũ

| File | Lý do không cần thay đổi |
|---|---|
| `src/api/axiosClient.ts` | Logic auth/interceptor đã hoàn chỉnh |
| `src/utils/storage.ts` | Token get/set/remove pattern chuẩn |
| `src/utils/tokenUtils.ts` | JWT decode & expiry chuẩn |
| `src/api/types.ts` | `ApiResponse<T>`, `Paginator<T>` generic |
| `tailwind.config.js` | Design token system (CSS variables) |
| `src/store/useUserStore.ts` | Auth state pattern — chỉ đổi field names nếu cần |
| `.prettierrc` | Format config |

---

## 10. Các Quy Tắc Bất Biến (Hard Rules)

1. **Page không gọi `axiosClient` hay `xxxApi` trực tiếp** — Phải qua Hook layer
2. **API layer không xử lý lỗi, không toast** — chỉ khai báo endpoints
3. **Toast notification chỉ xuất hiện ở Hook layer** (`onSuccess`/`onError`)
4. **Không dùng `any`** — Dùng `unknown` + type narrowing
5. **Event handlers phải có prefix `handle`** — `handleClick`, `handleSubmit`
6. **Routes định nghĩa trong `ROUTERS` enum** trong `constant.ts`
7. **Token logic** chỉ nằm trong `utils/tokenUtils.ts` và `utils/storage.ts`
8. **Không import trực tiếp từ `axios`** ngoài `api/axiosClient.ts`
9. **Dùng `const` arrow functions** thay vì `function` declarations
10. **FormData upload**: axiosClient tự detect và remove `Content-Type` header

---

## 11. Checklist Khi Tạo Dự Án Mới

- [ ] `VITE_URL` đã được set trong `.env`
- [ ] `ROUTERS` enum đã có `LOGIN` route
- [ ] `useUserStore` đã cấu hình với đúng fields
- [ ] `axiosClient.ts` đã trỏ đúng `ROUTERS.LOGIN` khi 401
- [ ] `main.tsx` đã wrap đủ: `QueryClientProvider` + `BrowserRouter` + `Toaster`
- [ ] Tailwind CSS variables được copy (từ `src/index.css` của dự án gốc)
- [ ] `tsconfig.app.json` đã có path alias `"@/*": ["./src/*"]`
- [ ] `.prettierrc` đầy đủ với tailwind plugin
- [ ] i18n được khởi tạo trong `src/lib/` nếu dùng đa ngôn ngữ
- [ ] `scrollToTop` component được mount trong `main.tsx`

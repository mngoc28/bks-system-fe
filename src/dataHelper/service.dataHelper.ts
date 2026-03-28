export interface Service {
  id: number;
  name: string;
  price: string;
  description: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceFilters {
  name?: string;
  min_price?: string;
  max_price?: string;
  page?: number;
  per_page?: number;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface ServiceResponse {
  status: string;
  message: string;
  data: Service;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface ServiceSearchSectionProps {
  open: boolean;
  value: {
    name: string;
    priceMax: string;
    priceMin: string;
  };
  onChange: (newValue: {
    name: string;
    priceMax: string;
    priceMin: string;
  }) => void;
  onReset: () => void;
  onClose: () => void;
}

export interface ServiceTableProps {
  filtered: Service[];
  onSort: (key: "id" | "name" | "created_at" | "updated_at") => void;
  onEdit: (id: number) => void;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
  filters: ServiceFilters;
}

export interface ServiceListItem {
  id: number;
  name: string;
  description: string | null;
  price: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceListData {
  current_page: number;
  data: ServiceListItem[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface SearchServiceResponse {
  status: string;
  message: string | null;
  data: ServiceListData;
}

export interface DeleteConfirmDialogProps {
  service: Service | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export interface CreateServiceRequest {
  name: string;
  price: string;
  description?: string;
}

export interface AddServiceDialogProps {
  isOpen: boolean;
  isLoading?: boolean;
  serverError?: string | null;
  existingServices?: string[];
  onClose: () => void;
  onSubmit: (data: CreateServiceRequest) => void;
}

export interface EditServiceDialogProps {
  service: Service | null;
  isOpen: boolean;
  isLoading?: boolean;
  editServerError?: string | null;
  onClose: () => void;
  onSubmit: (data: CreateServiceRequest) => void;
}

export interface DetailServiceDialogProps {
  service: Service | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
}
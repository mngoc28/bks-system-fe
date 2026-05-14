import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constant";
import { ViewMode } from "@/components/LayoutToggle";
import { Province } from "./province.dataHelper";
import { UserProfile } from "./user.dataHelper";
import { Ward } from "./ward.dataHelper";

export interface Property {
  id: number;
  name: string;
  number_of_floors: number;
  number_of_units: number;
  year_built: string | null;
  property_type_id: number;
  rent_category: number;
  area: number;
  description: string;
  user_id: number;
  province_id: number;
  ward_id: number;
  user_name: string;
  province_name: string;
  ward_name: string;
  cover_image_url?: string | null;
  address_detail: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyDetail {
  id: number;
  name: string;
  number_of_floors: number;
  number_of_units: number;
  year_built: number | null;
  property_type_id: number;
  rent_category: number;
  address_detail: string;
  area: number;
  description: string;
  user_id: number;
  province_id: number;
  ward_id: number;
  user: UserProfile | null;
  province: Province | null;
  ward: Ward | null;
  created_by: number;
  updated_by: number;
}

export interface SearchPropertyRequest {
  name?: string | null;
  area_max?: number | null;
  area_min?: number | null;
  province_name?: string | null;
  ward_name?: string | null;
  year_built?: string | null;
  property_type_id?: number | null;
  rent_category?: number | null;
  sort?: TypeSort[] | null;
  page?: number | typeof DEFAULT_PAGE;
  per_page?: number | typeof DEFAULT_LIMIT;
}

export interface TypeSort {
  field: string;
  order: string;
}

export interface PropertyListDataResponse {
  current_page: number;
  data: Property[];
  first_page_url: string | null;
  from: number;
  last_page: number;
  last_page_url: string | null;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PropertyType {
  id: number;
  name: string;
}
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface CreatePropertyRequest {
  name: string;
  user_id: number;
  province_id: number;
  ward_id: number;
  address_detail: string;
  number_of_floors: number;
  number_of_units: number;
  year_built: number | null;
  property_type_id: number;
  rent_category: number;
  area: number;
  description: string;
}

export type UpdatePropertyRequest = Partial<CreatePropertyRequest>;

export interface DeleteConfirmDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export interface PropertyCardProps {
  property: Property;
  onView?: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
  isDeleting?: boolean;
  highlightTerms?: {
    name?: string;
    province_name?: string;
    ward_name?: string;
  };
}

export interface PropertySearchSectionProps {
  open: boolean;
  filters: SearchPropertyRequest;
  setFilters: (filters: SearchPropertyRequest) => void;
  onReset: () => void;
  onClose: () => void;
}

export interface PropertyEditFormProps {
  userId?: number;
  propertyId?: number;
  property: PropertyDetail;
  onSubmit: (data: UpdatePropertyRequest) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isError?: boolean;
}
export interface PropertyAddFormProps {
  onSubmit: (data: CreatePropertyRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface PropertyListRequestForRoom {
  page?: number | typeof DEFAULT_PAGE;
  per_page?: number | typeof DEFAULT_LIMIT;
  name?: string;
}

export interface PropertyHeaderProps {
  onCreateProperty: () => void;
  onOpenFilter: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export type SortKey = "id" | "name" | "user_name" | "province_name" | "ward_name" | "area";

export interface PropertyTableProps {
  properties: Property[];
  sort: Array<{ key: SortKey; direction: "asc" | "desc" }>;
  getSortDirection: (key: SortKey) => "asc" | "desc" | null;
  onToggleSort: (key: SortKey) => void;
  onClearSort: () => void;
  onDelete: (id: number) => void;
  highlightTerms?: {
    name?: string;
    province_name?: string;
    ward_name?: string;
  };
}

export interface PropertyTableHeaderProps {
  getSortDirection: (key: SortKey) => "asc" | "desc" | null;
  onToggleSort: (key: SortKey) => void;
}

export interface PropertyTableRowProps {
  property: Property;
  onDelete: (id: number) => void;
  highlightTerms?: {
    name?: string;
    province_name?: string;
    ward_name?: string;
  };
}

export interface ScrollControlsProps {
  hasScroll: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
}

export interface SortControlsProps {
  hasSort: boolean;
  onClearSort: () => void;
}

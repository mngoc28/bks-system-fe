import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constant";
import { Province } from "./province.dataHelper";
import { UserProfile } from "./user.dataHelper";
import { Ward } from "./ward.dataHelper";

export interface Building {
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
  province_id:number;
  ward_id:number;
  user_name:string;
  province_name:string;
  ward_name:string;
  cover_image_url?: string | null;
  address_detail: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export interface BuildingDetail {
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
  province_id:number;
  ward_id:number;
  user:UserProfile | null;
  province:Province | null;
  ward:Ward | null;
  created_by: number;
  updated_by: number;
}

export interface SearchBuildingRequest {
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

export interface BuildingListDataResponse {
  current_page: number;
  data: Building[];
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

export interface BuildingType {
  id: number;
  name: string;
}
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface CreateBuildingRequest {
  name: string;
  user_id: number;
  province_id:number;
  ward_id:number;
  address_detail: string;
  number_of_floors: number;
  number_of_units: number;
  year_built: number | null;
  property_type_id: number;
  rent_category: number;
  area: number;
  description: string;
}

export interface UpdateBuildingRequest extends Partial<CreateBuildingRequest> {
}
export interface DeleteConfirmDialogProps {
  building: Building | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export interface BuildingCardProps {
  building: Building;
  onView?: (building: Building) => void;
  onEdit: (building: Building) => void;
  onDelete: (building: Building) => void;
  isDeleting?: boolean;
  highlightTerms?: {
    name?: string;
    province_name?: string;
    ward_name?: string;
  };
}

export interface BuildingSearchSectionProps {
  open: boolean;
  filters: SearchBuildingRequest;
  setFilters: (filters: SearchBuildingRequest) => void;
  onReset: () => void;
  onClose: () => void;
}

export interface BuildingEditFormProps {
  userId?: number;
  buildingId?: number;
  building: BuildingDetail;
  onSubmit: (data: UpdateBuildingRequest) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isError?: boolean;
}
export interface BuildingAddFormProps {
  onSubmit: (data: CreateBuildingRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// dataHelper for room model
export interface BuildingListRequestForRoom {
  page?: number | typeof DEFAULT_PAGE;
  per_page?: number | typeof DEFAULT_LIMIT;
  name?: string;
}

import { ViewMode } from "@/components/LayoutToggle";

export interface BuildingHeaderProps {
  onCreateBuilding: () => void;
  onOpenFilter: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export type SortKey = "id" | "name" | "user_name" | "province_name" | "ward_name" | "area";


export interface BuildingTableProps {
  buildings: Building[];
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

export interface BuildingTableHeaderProps {
  getSortDirection: (key: SortKey) => "asc" | "desc" | null;
  onToggleSort: (key: SortKey) => void;
}

export interface BuildingTableRowProps {
  building: Building;
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
// data structure for an amenity
export interface Amenity {
  id: number;
  name: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export type AmenitySortKey = "id" | "name" | "created_at" | "updated_at";

// data structure for API response of a single amenity
export interface AmenityResponse {
  status: string;
  message: string | null;
  data: Amenity;
}

// props for AmenityTable component
export interface AmenityTableProps {
  filtered: Amenity[];
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (p: number) => void;
  onPerPageChange: (pp: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  highlightedId: number | null;
  toggleSort: (key: AmenitySortKey) => void;
  filters: AmenityFilters;
}


// data structure for paginated
export interface AmenityListData {
  current_page: number;
  data: Amenity[];
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

// empty state props
export interface AmenitiesEmptyStateProps {
  onAddAmenity?: () => void;
}

// data structure for filters when searching
export interface AmenityFilters {
  name?: string;
  page?: number;
  per_page?: number;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}

export type SearchAmenityRequest = AmenityFilters;

export interface SearchAmenityResponse {
  status: string;
  message: string | null;
  data: AmenityListData;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface AddAmenityDialogProps {
  isOpen: boolean;
  isLoading?: boolean;
  serverError?: string | null;
  existingAmenities?: string[];
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
}

export interface AmenitySearchSectionProps {
  open: boolean;
  searchValue: string;
  setSearchValue: (v: string) => void;
  onReset: () => void;
  onClose: () => void;
}

export interface DeleteConfirmDialogProps {
  amenity: Amenity | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export interface EditAmenityDialogProps {
  amenity: Amenity | null;
  isOpen: boolean;
  isLoading?: boolean;
  serverError?: string | null;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
}
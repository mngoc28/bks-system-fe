import { Amenity } from "@/dataHelper/amenity.dataHelper";
import { Property } from "@/dataHelper/property.dataHelper";
import { PricePackage } from "@/dataHelper/pricePackage.dataHelper";
import { RoomImage } from "@/dataHelper/roomImage.dataHelper";
import { ServiceListItem } from "@/dataHelper/service.dataHelper";
// Room interfaces and types
export type RoomSortKey = "id" | "title" | "room_number" | "property" | "area" | "people" | "status" | "created_at";

// Main Room interface
export interface Room {
  id: number;
  property_id?: number;
  property_name?: string;
  title: string;
  room_number: string | null;
  deposit: number | null;
  area: number;
  floor_number: number;
  people: number;
  room_type: number;
  status: boolean;
  description: string | null;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  property?: Property;
  amenities?: RoomAmenity[];
  services?: RoomService[];
  prices?: RoomPrice[];
  images?: RoomImage[];
}

// Related interfaces
export interface RoomAmenity {
  id: number;
  room_id: number;
  amenity_id: number;
  amenity?: Amenity;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

// Related interfaces
export interface RoomService {
  id: number;
  room_id: number;
  service_id: number;
  service?: ServiceListItem;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

// Related interfaces
export interface RoomPrice {
  id: number;
  room_id: number;
  price_package_id: number;
  unit: string;
  price: number;
  package?: PricePackage;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

// Search and Request types
export interface SearchRoomRequest {
  page?: number;
  per_page?: number;
  property_id?: number;
  title?: string;
  room_number?: string;
  room_type?: number;
  status?: string;
  min_area?: number;
  max_area?: number;
  min_price?: number;
  max_price?: number;
  floor_number?: number;
  people?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Alias for filters
export type RoomFilters = SearchRoomRequest;

// Search Response type
export interface SearchRoomResponse {
  status: string;
  message: string | null;
  data: RoomListData;
}

// Room List Data type
export interface RoomListData {
  current_page: number;
  data: Room[];
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

// Component Props
export interface RoomTableProps {
  sorted: Room[];
  page: number;
  totalPages: number;
  perPage: number;
  totalItems: number;
  selectedImage: string | null;
  highlightedId?: number | null;
  sort: { key: RoomSortKey; direction: "asc" | "desc" | null} | null;
  filters: RoomFilters;
  onPageChange: (p: number) => void;
  onPerPageChange: (pp: number) => void;
  onViewModal: (imageUrl: string | null) => void;
  onView: (id: string | number) => void;
  onEdit: (id: string | number) => void;
  onDelete: (room: Room) => void;
  // canModifyRoom: (room: Room) => boolean;
  getPropertyName: (room: Room) => string;
  getRoomTypeName: (type: number) => string;
  toggleSort: (key: RoomSortKey) => void;
}

// Pagination Link type
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

// Create and Update types
export interface CreateRoomRequest {
  property_id: number;
  title: string;
  room_number?: string;
  deposit?: number;
  area: number;
  floor_number: number;
  people: number;
  room_type: number;
  status: number;
  description?: string;
  amenities?: number[];
  services?: number[];
  prices?: CreateRoomPriceRequest[];
}

// Related interfaces
export interface CreateRoomPriceRequest {
  price_package_id: number;
  unit: string;
  unit_price: number;
}

// Update type
export type UpdateRoomRequest = Partial<CreateRoomRequest>;

// Single Room Response type
export interface RoomResponse {
  status: string;
  message: string | null;
  data: Room;
}

// Form types
export type RoomFormData = {
  property_id: number;
  title: string;
  room_number?: string;
  deposit?: string;
  area: string;
  floor_number: number;
  people: number;
  room_type: number;
  status: boolean;
  description?: string;
  amenities?: number[];
  services?: number[];
  prices?: CreateRoomPriceRequest[];
};

export interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  isDeleting?: boolean;
  currentUser?: {
    id: number;
    role: string;
    partner_id?: number;
  } | null;
}

export interface RoomAddFormProps {
  onSubmit: (data: RoomFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  currentUser?: {
    id: number;
    role: string;
    partner_id?: number;
  } | null;
}

export interface AddRoomDialogProps extends RoomAddFormProps {
  isOpen: boolean;
  serverError?: string;
}
export interface RoomEditFormProps extends RoomAddFormProps {
  room: Room;
}

export interface RoomSearchSectionProps {
  open: boolean;
  filters: RoomFilters;
  setFilters: React.Dispatch<React.SetStateAction<RoomFilters>>;
  onReset: () => void;
  onClose: () => void;
}

export interface RoomDetailViewProps {
  room: Room;
  onEdit: () => void;
  onBack: () => void;
}

export interface DeleteConfirmDialogProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export interface DeleteRoomDialogProps {
  isOpen: boolean;
  room: {
    id: number;
    room_number: string;
    property_name: string;
  } | null;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export interface RoomsEmptyStateProps {
  onOpenFilter?: () => void;
}



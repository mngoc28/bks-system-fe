// Props for DeleteConfirmDialog component
export interface DeleteConfirmDialogProps {
	booking: Booking | null;
	isOpen: boolean;
	isLoading?: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void> | void;
}

// Props for BookingSearchSection component
export interface BookingSearchSectionProps {
	open: boolean;
	filters: BookingFilters;
	setFilters: React.Dispatch<React.SetStateAction<BookingFilters>>;
	onReset: () => void;
	onClose: () => void;
}

// Interface for pagination links in booking list
export interface BookingPageLink {
	url: string | null;
	label: string;
	active: boolean;
}

// Props for BookingDetailDialog component
export interface BookingDetailDialogProps {
	id: number | null;
	open: boolean;
	onClose: () => void;
	// fallback values from the list row in case detail API doesn't include joined fields
	fallback?: {
		user_name?: string | null;
		property_name?: string | null;
		room_name?: string | null;
		room_price?: number | string | null;
		partner_name?: string | null;
	};
}

// Room information nested in Booking
export interface RoomInfo {
	room_id?: number;
	room_number: string;
	property: {
		id?: number;
		name: string;
	};
}

// Main Booking type
export type Booking = {
	id: string;
	user: { id?: number; name: string };
	room: RoomInfo;
	start_date: string;
	end_date: string;
	price: number;
	status: "pending" | "confirmed" | "cancelled" | "completed";
	assignee?: string;
	created_at: string;
	note?: string | null;
};

// Request interface for creating a booking
export interface CreateBookingRequest {
	room_id: number;
	price_id: number;
	user_id: number;
	start_date: string;
	end_date?: string | null;
	status: number;
	note?: string | null;
}

// Props for BookingCreateDialog component
export interface BookingCreateDialogProps {
	open: boolean;
	onClose: () => void;
	onSuccess?: (id: number) => void;
}

// Filters for searching bookings
export type BookingFilters = {
	q: string;
	room: string;
	status: string;
	start_date: string;
	end_date: string;
	price_min: string;
	price_max: string;
	assignee: string;
};

// Request interface for searching bookings
export interface SearchBookingRequest {
	page?: number;
	per_page?: number;
	partner_id?: number;
	room_id?: number;
	property_id?: number;
	start_date?: string;
	end_date?: string;
	status?: number;
	// Optional text filters (supported by backend if available)
	room_name?: string;
	q?: string;
	sort_field?: string;
	sort_direction?: "asc" | "desc";
}

// Request interface for creating a booking
export interface BookingListItem {
	property_name: string;
	room_name: string;
	user_name: string;
	start_date: string;
	end_date: string | null;
	booking_status: "pending" | "confirmed" | "cancelled" | "completed";
	booking_note?: string | null;
	id?: number;
	created_at?: string;
    room_price?: number | string;
	staff_name?: string;
}

// Data structure for paginated booking list
export interface BookingListData {
	current_page: number;
	data: BookingListItem[];
	first_page_url: string | null;
	from: number | null;
	last_page: number;
	last_page_url: string | null;
	links: BookingPageLink[];
	next_page_url: string | null;
	path: string;
	per_page: number;
	prev_page_url: string | null;
	to: number | null;
	total: number;
}

// Response interface for searching bookings
export interface SearchBookingResponse {
	status: string;
	message: string | null;
	data: BookingListData;
}

// Response interface for general booking operations
export interface BookingResponse {
	status: string;
	message: string | null;
	data: unknown;
}

// Interface for detailed booking information
export interface BookingDetail {
	id: number;
	user_name: string;
	room_name: string;
	property_name: string;
	start_date: string;
	end_date: string | null;
	status: "pending" | "confirmed" | "cancelled" | "completed";
	note?: string | null;
	created_at?: string;
	room_price?: number | string;
	staff_name?: string | null;
}

// Props for BookingEditDialog component
export interface BookingEditDialogProps {
	id: number | null;
	open: boolean;
	onClose: () => void;
	onSuccess?: (id: number) => void;
}

// Request interface for creating a booking
export interface BookingDetailResponse {
	status: string;
	message: string | null;
	data: BookingDetail;
}

// Request interface for creating a booking
export interface UpdateBookingRequest {
	start_date?: string;
	end_date?: string | null;
	status?: number;
	note?: string | null;
}

// Props for row action buttons in booking list
export interface RowActionsProps {
	id: string;
	onView?: (id: string) => void;
	onEdit?: (id: string) => void;
	onDelete?: (id: string) => void;
}

export interface BookingTableProps {
	filtered: Booking[];
	onView: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	filters: BookingFilters;
	onNavigateUser?: (booking: Booking) => void;
	onNavigateRoom?: (booking: Booking) => void;
	onNavigateProperty?: (booking: Booking) => void;
}


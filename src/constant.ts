export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGINATION = 10;
export const DEFAULT_LIMIT = 10;
export const DEFAULT_CARD_LIMIT = 12;
export const CARD_PER_PAGE_OPTIONS = [12, 24, 48] as const;
export const DEFAULT_TOTAL = 0;
export const enum ROUTERS {
  HOME = "/",
  LOGIN = "/admin/login",
  REGISTER = "/admin/register",
  FORGOT_PASSWORD = "/admin/forgot-password",
  RESET_PASSWORD = "/admin/reset-password",
  PROFILE = "/admin/profile",
  UPDATE_PROFILE = "/admin/profile/update",
  BUILDINGS = "/admin/buildings",
  BUILDINGS_ADD = "/admin/buildings/add",
  BUILDINGS_EDIT = "/admin/buildings/edit",
  BUILDINGS_DETAIL = "/admin/buildings/detail",
  BUILDINGS_EDIT_IMAGES = "/admin/buildings/edit-images",
  ROOMS = "/admin/rooms",
  ROOMS_ADD = "/admin/rooms/add",
  ROOMS_EDIT = "/admin/rooms/edit",
  ROOMS_DETAIL = "/admin/rooms/detail",
  ACCOUNT = "/account",
  EDIT_PROFILE = "/admin/edit-profile",
  CONTROL = "/admin/dashboard",
  BOOKING_MANAGE = "/admin/booking-manage",
  SETTINGS = "/admin/settings",
  USER_MANAGEMENT = "/admin/user-management",
  USER_EDIT = "/admin/user-management/edit",
  USER_DETAIL = "/admin/user-management/detail",
  PROVINCE_MANAGE = "/admin/province/manage",
  AMENITY_MANAGEMENT = "/admin/amenity-management",
  QUESTION_MANAGEMENT = "/admin/question-management",
  QUESTION_DETAIL = "/admin/question-management/:id",
  QUESTION_FLOW = "/admin/question-management/flow",
  QUESTION_CREATE = "/admin/question-management/create",
  QUESTION_UPDATE = "/admin/question-management/:id/edit",
  NOT_FOUND = "/404",
  PROVINCE_DETAIL = "/admin/province/detail",
  SERVICE_MANAGEMENT = "/admin/service-management",
  NEWS = "/admin/news",
  NEWS_ADD = "/admin/news/add",
  NEWS_EDIT = "/admin/news/edit",
  NEWS_DETAIL = "/admin/news/detail",
  PARTNER_MANAGEMENT = "/admin/partner-information",
  
  // Partner Routes
  PARTNER_LOGIN = "/partner/login",
  PARTNER_DASHBOARD = "/partner/dashboard",
  PARTNER_PROPERTIES = "/partner/properties",
  PARTNER_BOOKINGS = "/partner/bookings",
  PARTNER_SERVICES = "/partner/services",
  PARTNER_AMENITIES = "/partner/amenities",
  PARTNER_NEWS = "/partner/news",
  PARTNER_MAINTENANCE = "/partner/maintenances",

  // End User Routes
  PARTNERS = "/:provinceNameEn/partners",
  PARTNER_DETAIL = "/partner/detail/:partner_id",
  PUBLIC_ROOM_DETAIL = "/rooms/:roomId",
  MY_BOOKINGS = "/my-bookings",
  BOOKING_SUCCESS = "/booking-success",
  PARTNER_EDIT = "/partner/edit",
  CONTACT = "/contact",
  COMPANY_HUB = "/company",
  SEARCH_ROOMS = "/search/rooms",
  SEARCH_ROOMS_BY_PROVINCE = "/search/rooms/province/:provinceId",
  BOOKING = "/booking",
  SET_PASSWORD = "/set-password",
  VERIFY_EMAIL = "/verify-email",
  RESET_TOKEN_SUCCESS = "/reset-token-success",
  PUBLIC_NEWS_DETAIL = "/news/:newsId",
  PUBLIC_NEWS_LIST = "/news-list",
}

export const STORAGE_VAR = {
  ACCESS_TOKEN: "accessToken",
  USER_EMAIL: "userEmail",
  USER_TOKEN: "userToken",
  USER: "user",
  REFRESH_TOKEN: "refresh_token",
};

export const USER_TYPE = "admin";
export const MAX_FILE_SIZE = 1024 * 1024; // 1MB
export const ALLOWED_TYPES = ["text/csv"];

export const MAX_LENGTH_INPUT = 255;

export const regexPassword = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

export const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const dayOfWeekMap: Record<string, number> = {
  monday: 2,
  tuesday: 3,
  wednesday: 4,
  thursday: 5,
  friday: 6,
  saturday: 7,
  sunday: 8,
};

export const dayOfWeekNumberToStringMap: Record<number, string> = {
  2: "monday",
  3: "tuesday",
  4: "wednesday",
  5: "thursday",
  6: "friday",
  7: "saturday",
  8: "sunday",
};

export const PUBLISHED_STATUS = 2;

export const NODE_WIDTH = 280;
export const NODE_HEADER_HEIGHT = 40;
export const NODE_CONTENT_PADDING = 16;
export const NODE_OPTION_HEIGHT = 40;
export const NODE_OPTION_MARGIN = 8;
export const CONNECTION_POINT_SIZE = 12;
export const TOKEN_EXPIRATION_TIME = 10;
export const TOKEN_REFRESH_TIME = 5;
export const TOKEN_REFRESH_THRESHOLD_MINUTES = 10;
export const TOKEN_CHECK_INTERVAL = 60000;
export const TOKEN_EXPIRATION_BUFFER_MS = 5000;
export const TOKEN_REFRESH_INTERVAL_MS = 20 * 60 * 1000;

// Search configuration
export const SEARCH_DEBOUNCE_DELAY_MS = 500;
export const SEARCH_HISTORY_HIDE_DELAY_MS = 200;

export const DEFAULT_SORT_KEY = "id" as const;
export const DEFAULT_SORT_DIRECTION: "asc" | "desc" = "asc";
export const DIRECTION_VALUES: Array<"asc" | "desc"> = ["asc", "desc"];

// Pagination configuration
export const PAGINATION_MAX_VISIBLE_PAGES = 5;
export const PAGINATION_PER_PAGE_OPTIONS = [5, 10, 20, 50] as const;

export const PERMISSIONS = {
  ADMIN: "admin",
  USER: "user",
  PARTNER: "partner",
};

// Room type
export const ROOM_TYPES = [
  { value: 1, label: "Phòng đơn" },
  { value: 2, label: "Phòng đôi" },
  { value: 3, label: "Căn hộ mini" },
];

// Room status
export const ROOM_STATUS = [
  { value: 1, label: "Public" },
  { value: 0, label: "Private" },
];
export const BUILDING_TYPE = {
  1: "buildings.building_type.1",
  2: "buildings.building_type.2",
  3: "buildings.building_type.3",
  4: "buildings.building_type.4",
  5: "buildings.building_type.5",
  6: "buildings.building_type.6",
  7: "buildings.building_type.7",
  8: "buildings.building_type.8",
  9: "buildings.building_type.9",
};

export const RENT_CATEGORY = {
  1: "buildings.rent_category.1",
  2: "buildings.rent_category.2",
  3: "buildings.rent_category.3",
};

export const BUILDING_IMAGE_TYPE = {
  1: "buildings.building_image_type.1",
  2: "buildings.building_image_type.2",
  3: "buildings.building_image_type.3",
  4: "buildings.building_image_type.4",
  5: "buildings.building_image_type.5",
  6: "buildings.building_image_type.6",
  7: "buildings.building_image_type.7",
  8: "buildings.building_image_type.8",
  9: "buildings.building_image_type.9",
  10: "buildings.building_image_type.10",
  11: "buildings.building_image_type.11",
  12: "buildings.building_image_type.12",
  13: "buildings.building_image_type.13",
  14: "buildings.building_image_type.14",
  15: "buildings.building_image_type.15",
  16: "buildings.building_image_type.16",
  17: "buildings.building_image_type.17",
  0: "buildings.building_image_type.0",
};

export const HEADER_BUILDING_CLOUDINARY = "buildings/"
export const CLOUDINARY_HEADER_IMAGE_URL = "https://res.cloudinary.com/dyragzjcd/image/upload"

// Lightbox configuration
export const LIGHTBOX_MAX_ZOOM_PIXEL_RATIO = 5;
export const LIGHTBOX_ZOOM_IN_MULTIPLIER = 2;
export const LIGHTBOX_DOUBLE_TAP_DELAY = 300;
export const LIGHTBOX_DOUBLE_CLICK_DELAY = 300;
export const LIGHTBOX_DOUBLE_CLICK_MAX_STOPS = 2;
export const LIGHTBOX_PINCH_ZOOM_DISTANCE_FACTOR = 0.1;

// Image upload constants
export const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
export const IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
export const IMAGE_MAX_FILES = 20;
export const IMAGE_FOLDER = 'room-images';
export const IMAGE_COMPRESS_QUALITY = 0.8;
export const IMAGE_MAX_WIDTH = 1200;
export const IMAGE_TYPE_DEFAULT = '1';
export const DEFAULT_IMAGE_TYPE = 0;


export const ROOM_IMAGE_TYPE = {
  OTHER: 0,
  MAIN_ROOM: 1,
  INTERIOR: 2,
  EXTERIOR: 3,
  BATHROOM: 4,
  KITCHEN: 5,
  BALCONY: 6,
  LIVING_ROOM: 7,
  BEDROOM: 8,
  DINING_ROOM: 9,
  GARDEN: 10,
  PARKING: 11,
  ENTRANCE: 12,
  STAIRCASE: 13,
  HALLWAY: 14,
  OFFICE: 15,
} as const;

// Booking status order
export const BOOKING_STATUS_ORDER = [0, 1, 3, 2] as const;

// Chatbot configuration
export const FIRST_MESSAGE_ID = "start";
export const BOT_TYPING_DELAY_MS = 1200;

// status news
export const DEFAULT_STATUS_NEWS = 0;

export const PROVINCES = [
  { id: 1, name_en: "ha_noi", name: "Hà Nội" },
  { id: 2, name_en: "cao_bang", name: "Cao Bằng" },
  { id: 3, name_en: "tuyen_quang", name: "Tuyên Quang" },
  { id: 4, name_en: "dien_bien", name: "Điện Biên" },
  { id: 5, name_en: "lai_chau", name: "Lai Châu" },
  { id: 6, name_en: "son_la", name: "Sơn La" },
  { id: 7, name_en: "lao_cai", name: "Lào Cai" },
  { id: 8, name_en: "thai_nguyen", name: "Thái Nguyên" },
  { id: 9, name_en: "lang_son", name: "Lạng Sơn" },
  { id: 10, name_en: "quang_ninh", name: "Quảng Ninh" },
  { id: 11, name_en: "bac_ninh", name: "Bắc Ninh" },
  { id: 12, name_en: "phu_tho", name: "Phú Thọ" },
  { id: 13, name_en: "hai_phong", name: "Hải Phòng" },
  { id: 14, name_en: "hung_yen", name: "Hưng Yên" },
  { id: 15, name_en: "ninh_binh", name: "Ninh Bình" },
  { id: 16, name_en: "thanh_hoa", name: "Thanh Hóa" },
  { id: 17, name_en: "nghe_an", name: "Nghệ An" },
  { id: 18, name_en: "ha_tinh", name: "Hà Tĩnh" },
  { id: 19, name_en: "quang_tri", name: "Quảng Trị" },
  { id: 20, name_en: "hue", name: "Huế" },
  { id: 21, name_en: "da_nang", name: "Đà Nẵng" },
  { id: 22, name_en: "quang_ngai", name: "Quảng Ngãi" },
  { id: 23, name_en: "gia_lai", name: "Gia Lai" },
  { id: 24, name_en: "khanh_hoa", name: "Khánh Hòa" },
  { id: 25, name_en: "dak_lak", name: "Đắk Lắk" },
  { id: 26, name_en: "lam_dong", name: "Lâm Đồng" },
  { id: 27, name_en: "dong_nai", name: "Đồng Nai" },
  { id: 28, name_en: "ho_chi_minh", name: "Hồ Chí Minh" },
  { id: 29, name_en: "tay_ninh", name: "Tây Ninh" },
  { id: 30, name_en: "dong_thap", name: "Đồng Tháp" },
  { id: 31, name_en: "vinh_long", name: "Vĩnh Long" },
  { id: 32, name_en: "an_giang", name: "An Giang" },
  { id: 33, name_en: "can_tho", name: "Cần Thơ" },
  { id: 34, name_en: "ca_mau", name: "Cà Mau" },
];

// Language options
export const LANGUAGE_OPTIONS: Array<{ value: string; flag: string; label: string }> = [
  { value: "vi", flag: "vi", label: "Việt Nam" },
  { value: "en", flag: "en", label: "English" },
];

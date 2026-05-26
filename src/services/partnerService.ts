import apiService from './apiService';
import { NotificationData, PaginatedResponse } from './stayService';

const BASE_URL = '/api/v1/partner';

export const partnerService = {
  // --- PROVINCES & WARDS ---
  getProvinces: () =>
    apiService.get(`${BASE_URL}/provinces/all`),
  getWardsByProvince: (provinceId: number | string) =>
    apiService.get(`${BASE_URL}/wards/${provinceId}`),

  // --- PROPERTIES (partner) ---
  getProperties: (params?: any, config?: any) => apiService.get(`${BASE_URL}/properties/searchAll`, { params, ...config }),
  getPropertyTypes: () => apiService.get(`${BASE_URL}/properties/types`),
  createProperty: (data: any) => apiService.post(`${BASE_URL}/properties`, data),
  updateProperty: (id: number | string, data: any) => apiService.put(`${BASE_URL}/properties/${id}`, data),
  deleteProperty: (id: number | string) => apiService.delete(`${BASE_URL}/properties/${id}`),

  // --- ROOMS ---
  getRooms: (params?: any, config?: any) => apiService.get(`${BASE_URL}/rooms/search`, { params, ...config }),
  getRoomDetail: (id: number | string, config?: any) => apiService.get(`${BASE_URL}/rooms/${id}`, config),
  getPricePackages: () => apiService.get(`${BASE_URL}/rooms/price-packages`),
  getRoomsOccupancy: (params?: any, config?: any) => apiService.get(`${BASE_URL}/rooms/occupancy`, { params, ...config }),
  getRoomNamesByPropertyId: (propertyId: number | string) =>
    apiService.get(`${BASE_URL}/rooms/property/${propertyId}`),
  createRoom: (data: any) => {
    const { name, ...rest } = data;
    const pid = data.propertyId ?? data.property_id ?? data.propertyId ?? data.property_id;
    return apiService.post(`${BASE_URL}/rooms`, {
      ...rest,
      property_id: pid,
      name: name ?? data.title,
    });
  },
  bulkCreateRoom: (data: any) => apiService.post(`${BASE_URL}/rooms/bulk-store`, data),
  updateRoom: (id: number | string, data: any) => {
    const { name, ...rest } = data;
    const pid = data.propertyId ?? data.property_id ?? data.propertyId ?? data.property_id;
    return apiService.put(`${BASE_URL}/rooms/${id}`, {
      ...rest,
      property_id: pid,
      name: name ?? data.title,
    });
  },
  bulkUpdateRoomStatus: (ids: (number | string)[], status: number) =>
    apiService.post(`${BASE_URL}/rooms/bulk-update-status`, { ids, status }),
  deleteRoom: (id: number | string) => apiService.delete(`${BASE_URL}/rooms/${id}`),
  bulkDeleteRooms: (ids: (number | string)[]) =>
    apiService.post(`${BASE_URL}/rooms/bulk-delete`, { ids }),

  // --- PROPERTY IMAGES ---
  getPropertyImages: (propertyId: number | string) => apiService.get(`${BASE_URL}/property-images/property/${propertyId}`),
  addPropertyImage: (propertyId: number | string, data: any) => apiService.post(`${BASE_URL}/property-images/${propertyId}`, data),
  deletePropertyImage: (propertyId: number | string, imageId: number | string) => apiService.delete(`${BASE_URL}/property-images/${propertyId}/${imageId}`),

  getRoomImages: (roomId: number | string, config?: any) => apiService.get(`${BASE_URL}/room-images/room/${roomId}`, config),
  addRoomImage: (roomId: number | string, data: any) => apiService.post(`${BASE_URL}/room-images/${roomId}`, data),
  deleteRoomImage: (roomId: number | string, imageId: number | string) => apiService.delete(`${BASE_URL}/room-images/${roomId}/${imageId}`),

  // --- SERVICES ---
  getAllServices: (config?: any) => apiService.get(`${BASE_URL}/services/all`, config),
  createService: (data: any) => apiService.post(`${BASE_URL}/services`, data),
  updateService: (id: number | string, data: any) => apiService.put(`${BASE_URL}/services/${id}`, data),
  deleteService: (id: number | string) => apiService.delete(`${BASE_URL}/services/${id}`),

  // --- AMENITIES ---
  getAllAmenities: (config?: any) => apiService.get(`${BASE_URL}/amenities/all`, config),
  createAmenity: (data: any) => apiService.post(`${BASE_URL}/amenities/store`, data),
  updateAmenity: (id: number | string, data: any) => apiService.put(`${BASE_URL}/amenities/${id}`, data),
  deleteAmenity: (id: number | string) => apiService.delete(`${BASE_URL}/amenities/${id}`),

  // --- NEWS ---
  getNews: (config?: any) => apiService.get(`${BASE_URL}/news`, config),
  createNews: (data: any) => apiService.post(`${BASE_URL}/news`, data),
  updateNews: (id: number | string, data: any) => apiService.put(`${BASE_URL}/news/${id}`, data),
  deleteNews: (id: number | string) => apiService.delete(`${BASE_URL}/news/${id}`),

  // --- BOOKINGS ---
  getBookings: (params?: any, config?: any) => apiService.get(`${BASE_URL}/bookings`, { params, ...config }),
  confirmBooking: (id: number | string) => apiService.put(`${BASE_URL}/bookings/${id}/confirm`),
  // Partner Portal 360 Phase 2: quickConfirm là alias rõ nghĩa của confirmBooking,
  // dùng cho quick action trong list/dashboard. Server-side cùng endpoint.
  quickConfirm: (id: number | string) => apiService.put(`${BASE_URL}/bookings/${id}/confirm`),
  cancelBooking: (id: number | string, reason?: string) =>
    apiService.put(`${BASE_URL}/bookings/${id}/cancel`, reason ? { reason } : undefined),
  noShowBooking: (id: number | string) => apiService.put(`${BASE_URL}/bookings/${id}/no-show`),
  checkInBooking: (id: number | string) => apiService.put(`${BASE_URL}/bookings/${id}/check-in`),
  checkOutBooking: (id: number | string) => apiService.put(`${BASE_URL}/bookings/${id}/check-out`),
  bulkConfirmBookings: (ids: Array<number | string>) =>
    apiService.post(`${BASE_URL}/bookings/bulk-confirm`, { ids }),
  bulkCancelBookings: (ids: Array<number | string>, reason: string) =>
    apiService.post(`${BASE_URL}/bookings/bulk-cancel`, { ids, reason }),

  /** BCP — guest cancellation requests (requires `BCP_CANCELLATION_V1` on API). */
  getCancellationRequests: (params?: {
    status?: string;
    property_id?: number;
    per_page?: number;
    page?: number;
  }, config?: any) => apiService.get(`${BASE_URL}/cancellation-requests`, { params, ...config }),
  approveCancellationRequest: (id: number | string, body?: { note?: string }) =>
    apiService.post(`${BASE_URL}/cancellation-requests/${id}/approve`, body ?? {}),
  rejectCancellationRequest: (id: number | string, body: { note: string }) =>
    apiService.post(`${BASE_URL}/cancellation-requests/${id}/reject`, body),

  checkIn: (id: number | string) => apiService.put(`${BASE_URL}/bookings/${id}/check-in`),
  checkOut: (id: number | string) => apiService.put(`${BASE_URL}/bookings/${id}/check-out`),
  getPartnerCalendar: (params?: any) => apiService.get(`${BASE_URL}/bookings`, { params: { ...params, per_page: 100 } }),

  // Partner Portal 360 Phase 3 — Calendar/Room Block
  // Trả {bookings, blocks, property_id, room_id, from, to, cached_at}.
  // `property_id`/`room_id` optional; bỏ trống = "tất cả tài sản".
  getCalendar: (params: {
    property_id?: number | string | null;
    room_id?: number | string | null;
    from: string;
    to: string;
  }) => apiService.get(`${BASE_URL}/calendar`, { params }),

  getRoomBlocks: (params: {
    property_id?: number | string | null;
    room_id?: number | string | null;
    from: string;
    to: string;
  }) => apiService.get(`${BASE_URL}/room-blocks`, { params }),
  createRoomBlock: (data: {
    room_id: number | string;
    start_date: string;
    end_date: string;
    block_type: 'maintenance' | 'owner_use' | 'off_market';
    reason: string;
    note?: string;
  }) => apiService.post(`${BASE_URL}/room-blocks`, data),
  deleteRoomBlock: (id: number | string) =>
    apiService.delete(`${BASE_URL}/room-blocks/${id}`),

  // drag-drop: update booking
  moveBooking: (
    id: number | string,
    payload: { start_date?: string; end_date?: string; room_id?: number | string },
  ) => apiService.put(`${BASE_URL}/bookings/${id}/move`, payload),

  // --- CHAT ---
  getConversations: (config?: any) => apiService.get(`${BASE_URL}/chat`, config),
  getMessages: (conversationId: number | string, config?: any) => apiService.get(`${BASE_URL}/chat/${conversationId}`, config),
  sendMessage: (data: { conversation_id: number | string, content: string, metadata?: any }) =>
    apiService.post(`${BASE_URL}/chat`, data),

  // --- PRICE RULES ---
  getPriceRules: (params?: any, config?: any) => apiService.get(`${BASE_URL}/price-rules`, { params, ...config }),
  createPriceRule: (data: any) => apiService.post(`${BASE_URL}/price-rules`, data),
  updatePriceRule: (id: number | string, data: any) => apiService.put(`${BASE_URL}/price-rules/${id}`, data),
  deletePriceRule: (id: number | string) => apiService.delete(`${BASE_URL}/price-rules/${id}`),

  // --- REPORTS ---
  getPartnerReports: (params?: any, config?: any) =>
    apiService.get(`${BASE_URL}/reports/kpis`, { params, ...config }),
  getKPIs: (startDate?: string, endDate?: string) =>
    apiService.get(`${BASE_URL}/reports/kpis`, { params: { start_date: startDate, end_date: endDate } }),

  // --- MAINTENANCE ---
  getMaintenances: (params?: any, config?: any) => apiService.get(`${BASE_URL}/room-maintenances`, { params, ...config }),
  createMaintenance: (data: any) => apiService.post(`${BASE_URL}/room-maintenances`, data),

  // --- STAY SERVICES ---
  getStayServiceRequests: (config?: any) => apiService.get(`${BASE_URL}/stay-services`, config),
  updateStayServiceStatus: (id: number | string, status: number) =>
    apiService.patch(`${BASE_URL}/stay-services/${id}`, { status }),

  // --- CONTRACTS ---
  getContracts: (config?: any) => apiService.get(`${BASE_URL}/contracts`, config),
  getContractDetail: (id: number | string, config?: any) => apiService.get(`${BASE_URL}/contracts/${id}`, config),
  createContract: (data: any) => apiService.post(`${BASE_URL}/contracts`, data),
  // Partner Portal 360 Phase 5: renewal reminder + termination + alert listing.
  getExpiringContracts: (config?: any) => apiService.get(`${BASE_URL}/contracts/expiring-soon`, config),
  setContractRenewalReminder: (id: number | string, remindAt?: string) =>
    apiService.put(`${BASE_URL}/contracts/${id}/renewal-reminder`, remindAt ? { remind_at: remindAt } : {}),
  terminateContract: (id: number | string, reason: string) =>
    apiService.post(`${BASE_URL}/contracts/${id}/terminate`, { reason }),
  // --- NOTIFICATIONS ---
  getNotifications: (page: number = 1, config?: any) =>
    apiService.get<PaginatedResponse<NotificationData>>(`${BASE_URL}/notifications?page=${page}`, config),
  markNotificationAsRead: (id: number) =>
    apiService.put(`${BASE_URL}/notifications/${id}/read`),
  markAllAsRead: () =>
    apiService.put(`${BASE_URL}/notifications/read-all`),
};

export default partnerService;


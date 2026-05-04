import apiService from './apiService';
import { NotificationData, PaginatedResponse } from './stayService';

const BASE_URL = '/api/v1/partner';

export const partnerService = {
  // --- PROVINCES & WARDS ---
  getProvinces: () =>
    apiService.get(`${BASE_URL}/provinces/all`),
  getWardsByProvince: (provinceId: number | string) =>
    apiService.get(`${BASE_URL}/wards/${provinceId}`),

  // --- BUILDINGS ---
  getBuildings: (params?: any) => apiService.get(`${BASE_URL}/buildings/searchAll`, { params }),
  getBuildingTypes: () => apiService.get(`${BASE_URL}/buildings/types`),
  createBuilding: (data: any) => apiService.post(`${BASE_URL}/buildings`, data),
  updateBuilding: (id: number | string, data: any) => apiService.put(`${BASE_URL}/buildings/${id}`, data),
  deleteBuilding: (id: number | string) => apiService.delete(`${BASE_URL}/buildings/${id}`),

  // --- ROOMS ---
  getRooms: (params?: any) => apiService.get(`${BASE_URL}/rooms/search`, { params }),
  getRoomDetail: (id: number | string) => apiService.get(`${BASE_URL}/rooms/${id}`),
  getPricePackages: () => apiService.get(`${BASE_URL}/rooms/price-packages`),
  getRoomsOccupancy: (params?: any) => apiService.get(`${BASE_URL}/rooms/occupancy`, { params }),
  getRoomNamesByBuildingId: (buildingId: number | string) =>
    apiService.get(`${BASE_URL}/rooms/building/${buildingId}`),
  createRoom: (data: any) => {
    const { buildingId, name, ...rest } = data;
    return apiService.post(`${BASE_URL}/rooms`, {
      ...rest,
      building_id: buildingId ?? data.building_id,
      name: name ?? data.title,
    });
  },
  bulkCreateRoom: (data: any) => apiService.post(`${BASE_URL}/rooms/bulk-store`, data),
  updateRoom: (id: number | string, data: any) => {
    const { buildingId, name, ...rest } = data;
    return apiService.put(`${BASE_URL}/rooms/${id}`, {
      ...rest,
      building_id: buildingId ?? data.building_id,
      name: name ?? data.title,
    });
  },
  bulkUpdateRoomStatus: (ids: (number | string)[], status: number) =>
    apiService.post(`${BASE_URL}/rooms/bulk-update-status`, { ids, status }),
  deleteRoom: (id: number | string) => apiService.delete(`${BASE_URL}/rooms/${id}`),
  bulkDeleteRooms: (ids: (number | string)[]) =>
    apiService.post(`${BASE_URL}/rooms/bulk-delete`, { ids }),

  // --- IMAGES ---
  getBuildingImages: (buildingId: number | string) => apiService.get(`${BASE_URL}/building-images/building/${buildingId}`),
  addBuildingImage: (buildingId: number | string, data: any) => apiService.post(`${BASE_URL}/building-images/${buildingId}`, data),
  deleteBuildingImage: (buildingId: number | string, imageId: number | string) => apiService.delete(`${BASE_URL}/building-images/${buildingId}/${imageId}`),

  getRoomImages: (roomId: number | string) => apiService.get(`${BASE_URL}/room-images/room/${roomId}`),
  addRoomImage: (roomId: number | string, data: any) => apiService.post(`${BASE_URL}/room-images/${roomId}`, data),
  deleteRoomImage: (roomId: number | string, imageId: number | string) => apiService.delete(`${BASE_URL}/room-images/${roomId}/${imageId}`),

  // --- SERVICES ---
  getAllServices: () => apiService.get(`${BASE_URL}/services/all`),
  createService: (data: any) => apiService.post(`${BASE_URL}/services`, data),
  updateService: (id: number | string, data: any) => apiService.put(`${BASE_URL}/services/${id}`, data),
  deleteService: (id: number | string) => apiService.delete(`${BASE_URL}/services/${id}`),

  // --- AMENITIES ---
  getAllAmenities: () => apiService.get(`${BASE_URL}/amenities/all`),
  createAmenity: (data: any) => apiService.post(`${BASE_URL}/amenities/store`, data),
  updateAmenity: (id: number | string, data: any) => apiService.put(`${BASE_URL}/amenities/${id}`, data),
  deleteAmenity: (id: number | string) => apiService.delete(`${BASE_URL}/amenities/${id}`),

  // --- NEWS ---
  getNews: () => apiService.get(`${BASE_URL}/news`),
  createNews: (data: any) => apiService.post(`${BASE_URL}/news`, data),
  updateNews: (id: number | string, data: any) => apiService.put(`${BASE_URL}/news/${id}`, data),
  deleteNews: (id: number | string) => apiService.delete(`${BASE_URL}/news/${id}`),

  // --- BOOKINGS ---
  getBookings: (params?: any) => apiService.get(`${BASE_URL}/bookings`, { params }),
  confirmBooking: (id: number | string) => apiService.put(`${BASE_URL}/bookings/${id}/confirm`),
  cancelBooking: (id: number | string) => apiService.put(`${BASE_URL}/bookings/${id}/cancel`),
  checkInBooking: (id: number | string) => apiService.put(`${BASE_URL}/bookings/${id}/check-in`),
  checkOutBooking: (id: number | string) => apiService.put(`${BASE_URL}/bookings/${id}/check-out`),

  checkIn: (id: number | string) => apiService.put(`${BASE_URL}/bookings/${id}/check-in`),
  checkOut: (id: number | string) => apiService.put(`${BASE_URL}/bookings/${id}/check-out`),
  getPartnerCalendar: (params?: any) => apiService.get(`${BASE_URL}/bookings`, { params: { ...params, per_page: 100 } }),

  // --- CHAT ---
  getConversations: () => apiService.get(`${BASE_URL}/chat`),
  getMessages: (conversationId: number | string) => apiService.get(`${BASE_URL}/chat/${conversationId}`),
  sendMessage: (data: { conversation_id: number | string, content: string, metadata?: any }) => 
    apiService.post(`${BASE_URL}/chat`, data),

  // --- PRICE RULES ---
  getPriceRules: (params?: any) => apiService.get(`${BASE_URL}/price-rules`, { params }),
  createPriceRule: (data: any) => apiService.post(`${BASE_URL}/price-rules`, data),
  updatePriceRule: (id: number | string, data: any) => apiService.put(`${BASE_URL}/price-rules/${id}`, data),
  deletePriceRule: (id: number | string) => apiService.delete(`${BASE_URL}/price-rules/${id}`),

  // --- REPORTS ---
  getPartnerReports: (params?: any) => 
    apiService.get(`${BASE_URL}/reports/kpis`, { params }),
  getKPIs: (startDate?: string, endDate?: string) => 
    apiService.get(`${BASE_URL}/reports/kpis`, { params: { start_date: startDate, end_date: endDate } }),

  // --- MAINTENANCE ---
  getMaintenances: (params?: any) => apiService.get(`${BASE_URL}/room-maintenances`, { params }),
  createMaintenance: (data: any) => apiService.post(`${BASE_URL}/room-maintenances`, data),

  // --- STAY SERVICES ---
  getStayServiceRequests: () => apiService.get(`${BASE_URL}/stay-services`),
  updateStayServiceStatus: (id: number | string, status: number) => 
    apiService.patch(`${BASE_URL}/stay-services/${id}`, { status }),

  // --- CONTRACTS ---
  getContracts: () => apiService.get(`${BASE_URL}/contracts`),
  getContractDetail: (id: number | string) => apiService.get(`${BASE_URL}/contracts/${id}`),
  createContract: (data: any) => apiService.post(`${BASE_URL}/contracts`, data),
  // --- NOTIFICATIONS ---
  getNotifications: (page: number = 1) => 
    apiService.get<PaginatedResponse<NotificationData>>(`${BASE_URL}/notifications?page=${page}`),
  markNotificationAsRead: (id: number) => 
    apiService.put(`${BASE_URL}/notifications/${id}/read`),
  markAllAsRead: () => 
    apiService.put(`${BASE_URL}/notifications/read-all`),
};

export default partnerService;

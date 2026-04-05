import apiService from './apiService';

const BASE_URL = '/api/v1/partner';

export const partnerService = {
  // --- BUILDINGS ---
  getBuildings: () => apiService.get(`${BASE_URL}/buildings/searchAll`),
  getBuildingTypes: () => apiService.get(`${BASE_URL}/buildings/types`),
  createBuilding: (data: any) => apiService.post(`${BASE_URL}/buildings`, data),
  updateBuilding: (id: number | string, data: any) => apiService.put(`${BASE_URL}/buildings/${id}`, data),
  deleteBuilding: (id: number | string) => apiService.delete(`${BASE_URL}/buildings/${id}`),

  // --- ROOMS ---
  getRooms: (params?: any) => apiService.get(`${BASE_URL}/rooms/search`, { params }),
  createRoom: (data: any) => apiService.post(`${BASE_URL}/rooms/store`, data),
  updateRoom: (id: number | string, data: any) => apiService.put(`${BASE_URL}/rooms/${id}`, data),
  deleteRoom: (id: number | string) => apiService.delete(`${BASE_URL}/rooms/${id}`),

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

  // --- MAINTENANCE ---
  getMaintenances: (params?: any) => apiService.get(`${BASE_URL}/room-maintenances`, { params }),
  createMaintenance: (data: any) => apiService.post(`${BASE_URL}/room-maintenances`, data),
};

export default partnerService;

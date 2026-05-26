import apiService from "./apiService";

export interface StayDashboardData {
  user: {
    name: string;
    email: string;
    phone: string;
    address: string;
    reward_points: number;
    membership_level: string;
  };
  stats: {
    total_stays: number;
    accumulated_spending: number;
  };
  active_booking: {
    id: number;
    start_date: string;
    end_date: string;
    status: number;
    room: {
      title: string;
      property: {
        name: string;
      };
      room_images: Array<{ image_url: string }>;
    };
  } | null;
  recent_history: Array<{
    id: string;
    hotel: string;
    date: string;
    amount: number;
    status: string;
  }>;
  has_pending_contract: boolean;
}

export interface Contract {
  id: number;
  booking_id: number;
  title: string;
  content: string;
  status: number;
  type: string;
  contract_type?: string;
  signature?: string;
  signature_date?: string;
  booking: {
    id: number;
    start_date: string;
    end_date: string;
    status: number;
    user: {
      name: string;
    };
    room: {
      title: string;
      property: {
        name: string;
        address: string;
      };
    };
    price: {
      price: number;
    };
  };
  created_at: string;
}

export interface StayCancellationReason {
  code: string;
  label: string;
  requires_note: boolean;
}

export interface BookingDetail {
  id: number;
  booking_code?: string;
  start_date: string;
  end_date: string;
  status: number;
  note: string;
  room: {
    title: string;
    property: {
      name: string;
      address: string;
    };
    images: Array<{ image_url: string }>;
    amenities?: string[];
  };
  services?: Array<{
    id: number;
    name: string;
    price: number;
  }>;
  price: {
    price: number;
  };
  created_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  stay_status?: string;
  contracts?: Array<{
    id: number;
    status: number;
    title?: string;
  }>;
}

export interface NotificationData {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const stayService = {
  getDashboard: () => {
    return apiService.get<StayDashboardData>("/api/v1/stay/dashboard");
  },
  getBookings: (page: number = 1) => {
    return apiService.get<PaginatedResponse<BookingDetail>>(`/api/v1/stay/bookings?page=${page}`);
  },
  getBookingDetail: (id: number | string) => {
    return apiService.get<BookingDetail>(`/api/v1/stay/bookings/${id}`);
  },
  getContracts: (page: number = 1) => {
    return apiService.get<PaginatedResponse<Contract>>(`/api/v1/stay/contracts?page=${page}`);
  },
  getContractDetail: (id: number | string) => {
    return apiService.get<Contract>(`/api/v1/stay/contracts/${id}`);
  },
  signContract: (id: number | string, signature: string) => {
    return apiService.put(`/api/v1/stay/contracts/${id}/sign`, { signature });
  },
  getInStayServices: (bookingId: string | number) => {
    return apiService.get(`/api/v1/stay/services/${bookingId}`);
  },
  orderService: (bookingId: string | number, serviceId: number | string, note: string = "") => {
    return apiService.post(`/api/v1/stay/services/${bookingId}`, { service_id: serviceId, note });
  },
  getNotifications: (page: number = 1, config?: any) => {
    return apiService.get<PaginatedResponse<NotificationData>>(`/api/v1/stay/notifications?page=${page}`, config);
  },
  extendBooking: (bookingId: string | number, newEndDate: string) => {
    return apiService.post(`/api/v1/stay/bookings/${bookingId}/extend`, { new_end_date: newEndDate });
  },

  getCancellationReasons: () => {
    return apiService.get<unknown>("/api/v1/stay/cancellation-reasons");
  },

  cancelBooking: (bookingId: number | string, body: { reason_code: string; reason_text?: string }) => {
    return apiService.post<unknown>(`/api/v1/stay/bookings/${bookingId}/cancel`, body);
  },

  cancelBookingRequest: (
    bookingId: number | string,
    body: { reason_code: string; reason_text?: string; idempotency_key: string },
  ) => {
    return apiService.post<unknown>(`/api/v1/stay/bookings/${bookingId}/cancel-request`, body);
  },

  withdrawCancelBookingRequest: (bookingId: number | string) => {
    return apiService.post<unknown>(`/api/v1/stay/bookings/${bookingId}/withdraw-cancel-request`);
  },

  markNotificationAsRead: (id: number) => {
    return apiService.put(`/api/v1/stay/notifications/${id}/read`);
  },
  markAllAsRead: () => {
    return apiService.put("/api/v1/stay/notifications/read-all");
  },
};

export default stayService;


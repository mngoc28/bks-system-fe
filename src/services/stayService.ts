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
      building: {
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
      building: {
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

export interface BookingDetail {
  id: number;
  start_date: string;
  end_date: string;
  status: number;
  note: string;
  room: {
    title: string;
    building: {
      name: string;
      address: string;
    };
    images: Array<{ image_url: string }>;
  };
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
  getContracts: (page: number = 1) => {
    return apiService.get<PaginatedResponse<Contract>>(`/api/v1/stay/contracts?page=${page}`);
  },
  getContractDetail: (id: number | string) => {
    return apiService.get<Contract>(`/api/v1/stay/contracts/${id}`);
  },
  getInStayServices: (bookingId: number | string) => {
    return apiService.get<any[]>(`/api/v1/stay/services/${bookingId}`);
  },
  orderService: (bookingId: number | string, serviceId: number, note?: string) => {
    return apiService.post(`/api/v1/stay/services/${bookingId}`, { service_id: serviceId, note });
  },
  getNotifications: (page: number = 1) => {
    return apiService.get<PaginatedResponse<NotificationData>>(`/api/v1/stay/notifications?page=${page}`);
  },
  markNotificationAsRead: (id: number) => {
    return apiService.put(`/api/v1/stay/notifications/${id}/read`);
  },
  markAllAsRead: () => {
    return apiService.put("/api/v1/stay/notifications/read-all");
  },
};

export default stayService;

export interface Paginator<T> {
  current_page: number;
  data: T[];
  first_page_url?: string | null;
  from?: number | null;
  last_page?: number;
  last_page_url?: string | null;
  next_page_url?: string | null;
  path?: string;
  per_page?: number;
  prev_page_url?: string | null;
  to?: number | null;
  total: number;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data?: T;
  errors: {
    [key: string]: string[];
  };
}

export interface ErrorResponse {
  code?: number;
  message?: string;
}

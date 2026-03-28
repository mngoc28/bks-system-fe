import { PaginationLink } from "./building.dataHelper";

export interface Ward {
  id: number;
  name: string;
  province_id: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export interface WardListDataResponse {
  current_page: number;
  data: Ward[];
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

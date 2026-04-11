import { ViewMode } from "@/components/LayoutToggle";

// news header props
export interface NewsHeaderProps {
  onCreateNews: () => void;
  onOpenFilter: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

// news filters
export interface NewsFilters {
  title?: string;
  content?: string;
  status?: number;
  user_name?: string;
  published_at_start?: string;
  published_at_end?: string;
  page?: number;
  per_page?: number;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}

// news response
export interface News {
  id: number;
  user_id: number;
  user_name: string | null;
  title: string;
  slug: string | null;
  summary: string | null;
  content: string | null;
  status: number;
  published_at: string | null;
  image_url: string | null;
  id_image_cloudinary: string | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// news form Create 
export interface NewsFormCreate {
  title: string;
  summary?: string;
  content: string;
  status: number;
  published_at: Date;
  image_url: string;
  id_image_cloudinary: string;
}

// news table props
export interface NewsTableProps {
  news: NewsListDataResponse | undefined;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onView: (id: number) => void;
  onSort: (key: string) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

// news list data response
export interface NewsListDataResponse {
  current_page: number;
  data: News[];
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
// pagination link
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

// news search section props
export interface NewsSearchSectionProps {
  open: boolean;
  filters: NewsFilters;
  setFilters: (filters: NewsFilters) => void;
  onReset: () => void;
  onClose: () => void;
}

// delete Props
export interface DeleteNewsDialogProps {
  news: News | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

// news table header props
export interface NewsTableHeaderProps {
  onSort: (key: string) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

// news edit Props
export interface NewsEditProps {
  news: News | null;
  isError: boolean;
}

export interface PublicNewsItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  image_url: string;
  published_at: string;
}

export interface LatestNewsResponse {
  status: string;
  message: string;
  data: PublicNewsItem[];
}

export interface NewsCard {
  id: number | string;
  title: string;
  slug: string;
  excerpt?: string;
  image: string;
  category?: string;
  publishedAt?: string;
}

export interface NewsGridProps {
  articles: NewsCard[];
  className?: string;
  heading?: string;
  description?: string;
  badgeLabel?: string;
  badgeIcon?: React.ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  footerLabel?: string;
  loading?: boolean;
  error?: boolean;
}


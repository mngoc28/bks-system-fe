import { RoomCard } from "@/dataHelper/home.dataHelper";
import React from "react";

export type User = {
  email: string;
  password: string;
};
export type UserResponse = {
  message: string;
  status: string;
  result: User[];
};
export type CategoryMenu = {
  name: string;
  hasSubMenu: boolean;
};

export type CrewResponse<T = null> = {
  code?: number;
  message: string;
  status: string;
  data: T[];
};
export type VisitorTeam = {
  id: number;
  visitor_team_id: number;
  visitor_team_name: string;
  port_name: string;
  port_name_ja: string;
  status: string;
  status_ja: string;
  boarding_date: string;
  row_num: number;
};
// src/components/type.ts
export interface VisitDetails {
  id: number;
  port_name: string;
  port_name_ja: string;
  full_name_jp: string;
  full_name_en: string;
  status: string;
  status_ja: string;
  boarding_date: string;
  scheduled_boarding_time: string;
  scheduled_disembark_time: string;
  company: string;
  barcode: string;
}
export type SelectItemProps = {
  id: number;
  name: string;
  name_ja?: string;
};
export type Role = {
  role_id: number;
};
export type RoleScreensItemProps = {
  screen_id: string;
  role: Role[];
};

export type PaginationItemProps = {
  url: string | null;
  label: string;
  active: boolean;
};

export type MenuItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  isHeader?: boolean;
  permissionKey?: string;
  defaultCollapsed?: boolean;
  badgeCount?: number;
};

export interface ClassSidebarProps {
  className?: string;
  classInfo: {
    name: string;
    acronym: string;
  };
  menuItems: MenuItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export interface LoadingProps {
  color?: string; 
  size?: "small" | "medium" | "large",
}

export interface TextareaWithEmojiProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onEmojiSelect?: (emoji: string) => void;
}

export interface ReactQuillEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export interface TipTapEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export interface EmptyPageProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export interface SearchableSelectProps{
  value: string;
  onValueChange: (value: string) => void;
  options: {value: string, label: string, name_en?: string; [key: string]: any}[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?:string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  showSearch?: boolean;
  triggerClassName?:string;
  contentClassName?:string;
}

export type PropsInput = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export interface ContactCardProps {
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  hotlineLabel?: string;
  hotline?: string;
  emailLabel?: string;
  email?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface PublicHeaderProps {
  contactHref?: string;
  rewardsHref?: string;
  favoritesHref?: string;
}

export interface RoomCarouselItemProps {
  room: RoomCard;
}

export interface RoomCarouselContainerProps {
  rooms: RoomCard[];
  heading?: string;
  description?: string;
  className?: string;
  sectionId?: string;
  ctaLabel?: string;
  ctaHref?: string;
  loading?: boolean;
}

export interface PublicFooterProps {
  className?: string;
}

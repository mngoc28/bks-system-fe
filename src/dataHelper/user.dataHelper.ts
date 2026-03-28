import { Dispatch } from "react";

// User Profile Interface and Related Types
export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  phone: string;
  status?: number | string;
  partner_id?: number;
  avatar?: string;
  id_avatar?: string;
  is_email_verified?: number;
  created_at?: string;
  updated_at?: string;
}

// Response type for user profile detail
export type UserProfileDetailResponse = {
  status: string;
  message: string | null;
  data: UserProfile;
  code?: string;
};

// Response type for user profile list
export type UserProfileResponse = {
  status: string;
  message: string | null;
  data: UserListData<UserProfile>;
  code?: string;
};

// Request type for updating user profile
export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: string;
  id_avatar?: string;
}

// Request and Response types for changing password
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

// Response type for changing password
export type ChangePasswordResponse = {
  status: string;
  message: string | null;
  data: boolean;
  code?: string;
};

// Response type for deleting a user
export type DeleteUserResponse = {
  status: string;
  message: string | null;
  data: boolean;
  code?: string;
};

// Props and Interfaces for User Management Components
export interface UserTableProps {
  users: UserProfile[];
  currentUserEmail: string;
  highlightedId: number | null;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onResetPassword: (id: number) => void;
  sortField: string | undefined;
  sortDirection: 'asc' | 'desc' | undefined;
  toggleSort: (key: "id" | "name" | "email" | "phone" | "role" | "status" | "created_at") => void;
  onViewModal: (image: string | null) => void;
  selectedImage: string | null;
  filters: UserFilters;
}

// Pagination and Filtering Interfaces
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

// Generic User List Data Interface
export interface UserListData<T> {
  current_page: number;
  data: T[];
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

// Filters Interface for User Listing
export interface UserFilters {
  q?: string;
  email?: string;
  role?: string;
  phone?: string;
  status?: string;
  created_at_from?: string;
  created_at_to?: string;
  page?: number;
  per_page: number;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}

// Props and Data Interfaces for User Forms and Dialogs
export interface UserEditFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
}

// Props for User Edit Form Component
export interface UserEditFormProps {
  user: UserProfile;
  onSubmit: (data: UserEditFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// Props for User Detail View Component
export interface UserDetailViewProps {
  user: UserProfile;
  onEdit: () => void;
  onBack: () => void;
}

// Props for Delete Confirmation Dialog Component
export interface DeleteConfirmDialogProps {
  user: UserProfile | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

// Props for Reset Password Dialog Component
export interface ResetPasswordDialogProps {
  user: UserProfile | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (newPassword: string) => void;
}

// Request type for resetting password
export interface ResetPasswordRequest {
  new_password: string;
  new_password_confirmation: string;
}

// Props for Users Empty State Component
export interface UsersEmptyStateProps {
  onOpenFilter?: () => void;
}

// Props for User Search Section Component
export interface UserSearchSectionProps {
  open: boolean;
  searchQ: string;
  setSearchQ: Dispatch<React.SetStateAction<string>>;
  searchEmail: string;
  setSearchEmail: Dispatch<React.SetStateAction<string>>;
  searchPhone: string;
  setSearchPhone: Dispatch<React.SetStateAction<string>>;
  filters: UserFilters;
  setFilters: Dispatch<React.SetStateAction<UserFilters>>;
  onReset: () => void;
  onClose: () => void;
}

// Props and Data Interfaces for Adding and Editing Users
export interface AddUserFormData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  role?: "partner" | "user";
  status?: "0" | "1" | "2";
}

// Props for Add User Dialog Component
export interface AddUserDialogProps {
  isOpen: boolean;
  isLoading?: boolean;
  serverError?: string | null;
  onClose: () => void;
  onSubmit: (data: AddUserFormData) => void;
}

// Props for Edit User Dialog Component
export interface EditUserDialogProps {
  user: UserProfile | null;
  isOpen: boolean;
  isLoading?: boolean;
  serverError?: string | null;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; phone: string; role: string }) => void;
}

// Response type for avatar upload
export interface AvatarResponse {
  status: string;
  message: string | null;
  data: {
    url: string;
  };
  code?: string;
}

// Props for Profile Info component
export type ProfileInfoProps = {
  profile: UserProfile;
  onEditClick: () => void;
  onChangePasswordClick: () => void;
  onAvatarUploadSuccess?: () => void;
};

// Props for Change Profile Dialog Component
export type ChangeProfileDialogProps = {
  open: boolean;
  onClose: () => void;
  profile: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    id_avatar?: string;
  };
  onSuccess: () => void;
};

//
// Props for Change Password Dialog Component
export type ChangePasswordDialogProps = {
  open: boolean;
  onClose: () => void;
};

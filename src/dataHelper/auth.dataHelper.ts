export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}
export interface LoginResponse {
  token: string;
  name: string;
  role: string;
  email: string;
}

export interface RefreshTokenResponse {
  status: string;
  message: string | null;
  data: {
    token: string;
  };
  code?: string;
}
export interface UserData {
  email: string;
  role: string;
  role_id: number;
  partner_id: number;
  token: string;
  first_login?: boolean;
}

export type ChangePasswordByToken = {
  token: string;
  password: string;
  password_confirmation: string;
  user_type: string;
};

export type SendMailResetPassword = {
  email: string;
  user_type: string;
};

export type SendMailResetPasswordResponse = {
  status: string;
  message: string | null;
  data: boolean;
  code?: string;
};

export type ChangePasswordResponse = {
  status: string;
  message: string | null;
  data: boolean;
  code?: string;
};

export type LogoutResponse = {
  status: string;
  message: string | null;
  data: boolean;
  code?: string;
};

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface JwtPayload {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export interface PasswordStrength {
  password: string;
}

export interface CheckPermissionResponse {
  role: string;
  name: string;
}

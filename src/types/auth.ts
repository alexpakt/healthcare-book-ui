import type { UserRole } from './common';

export interface AuthResponse {
  role: UserRole;
  profileId: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterParentRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RegisterDoctorRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  amka: string;
  email: string;
  phoneNumber?: string;
  specialization: string;
  licenseNumber: string;
}

export interface AuthUser {
  username: string;
  role: UserRole;
  profileId: number;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  registerParent: (data: RegisterParentRequest) => Promise<void>;
  registerDoctor: (data: RegisterDoctorRequest) => Promise<void>;
  logout: () => Promise<void>;
}

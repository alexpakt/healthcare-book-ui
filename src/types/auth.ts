export interface AuthResponse {
  token: string;
  role: 'ROLE_PARENT' | 'ROLE_DOCTOR' | 'ROLE_ADMIN';
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

export interface RegisterDoctorRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  specialization: string;
  licenseNumber: string;
}

export interface AuthUser {
  username: string;
  role: 'ROLE_PARENT' | 'ROLE_DOCTOR' | 'ROLE_ADMIN';
  profileId: number;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  registerParent: (data: RegisterParentRequest) => Promise<void>;
  registerDoctor: (data: RegisterDoctorRequest) => Promise<void>;
  logout: () => void;
}

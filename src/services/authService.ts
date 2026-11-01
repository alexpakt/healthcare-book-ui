import { apiClient } from './apiClient';
import type {
  AuthResponse,
  LoginRequest,
  RegisterParentRequest,
  RegisterDoctorRequest,
  ChangePasswordRequest,
  AuthUser,
} from '../types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  async registerParent(data: RegisterParentRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/register/parent',
      data
    );
    return response.data;
  },

  async registerDoctor(data: RegisterDoctorRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/register/doctor',
      data
    );
    return response.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/api/auth/change-password', data);
  },

  async me(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>('/api/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  },
};

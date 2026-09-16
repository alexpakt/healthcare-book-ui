import apiClient from './apiClient';
import type {
  AuthResponse,
  LoginRequest,
  RegisterParentRequest,
  RegisterDoctorRequest,
} from '../types/auth';

const client = apiClient.getInstance();

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  async registerParent(data: RegisterParentRequest): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>(
      '/api/auth/register/parent',
      data
    );
    return response.data;
  },

  async registerDoctor(data: RegisterDoctorRequest): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>(
      '/api/auth/register/doctor',
      data
    );
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

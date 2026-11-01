export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ErrorResponse {
  message: string;
  status: number;
  timestamp: string;
}

export type UserRole = 'ROLE_PARENT' | 'ROLE_DOCTOR';

export type AppointmentStatus = 'REQUESTED' | 'SCHEDULED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';

export type VaccinationStatus = 'COMPLETED' | 'PENDING' | 'OVERDUE';

export type Gender = 'MALE' | 'FEMALE';

export interface ApiQueryOptions {
  skip?: boolean;
  retry?: number;
  retryDelay?: number;
}

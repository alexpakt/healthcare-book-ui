import { apiClient } from './apiClient';

export interface DoctorChildRequestResponse {
  id: number;
  doctorId: number;
  doctorFirstName: string;
  doctorLastName: string;
  doctorSpecialization: string;
  childId: number;
  childFirstName: string;
  childLastName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  resolvedAt?: string;
  notes?: string;
}

export interface SendRequestDTO {
  childId: number;
  notes?: string;
}

export const doctorChildRequestService = {
  async sendConnectionRequest(data: SendRequestDTO): Promise<DoctorChildRequestResponse> {
    try {
      const response = await apiClient.post<DoctorChildRequestResponse>(
        '/api/doctor-child-requests',
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  },

  async getPendingRequests(): Promise<DoctorChildRequestResponse[]> {
    try {
      const response = await apiClient.get<DoctorChildRequestResponse[]>(
        '/api/doctor-child-requests/pending'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  },

  async getSentPendingRequests(): Promise<DoctorChildRequestResponse[]> {
    try {
      const response = await apiClient.get<DoctorChildRequestResponse[]>(
        '/api/doctor-child-requests/pending/sent'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching sent pending requests:', error);
      throw error;
    }
  },

  async approveRequest(requestId: number): Promise<DoctorChildRequestResponse> {
    try {
      const response = await apiClient.post<DoctorChildRequestResponse>(
        `/api/doctor-child-requests/${requestId}/approve`
      );
      return response.data;
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  },

  async rejectRequest(requestId: number, reason?: string): Promise<DoctorChildRequestResponse> {
    try {
      const response = await apiClient.post<DoctorChildRequestResponse>(
        `/api/doctor-child-requests/${requestId}/reject`,
        {},
        { params: { reason } }
      );
      return response.data;
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  },
};

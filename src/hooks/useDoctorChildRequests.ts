import { useState, useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import {
  doctorChildRequestService,
  type DoctorChildRequestResponse,
  type SendRequestDTO,
} from '../services/doctorChildRequestService';

export function usePendingChildRequests() {
  const fetchFn = useCallback(() => doctorChildRequestService.getPendingRequests(), []);
  return useApi(fetchFn);
}

export function useSentPendingChildRequests() {
  const fetchFn = useCallback(() => doctorChildRequestService.getSentPendingRequests(), []);
  return useApi(fetchFn);
}

export function useSendConnectionRequest() {
  return useMutation((request?: SendRequestDTO) =>
    doctorChildRequestService.sendConnectionRequest(request!)
  );
}

export function useApproveChildRequest() {
  return useMutation((requestId?: number) => doctorChildRequestService.approveRequest(requestId!));
}

export function useRejectChildRequest() {
  return useMutation((payload?: { requestId: number; reason?: string }) =>
    doctorChildRequestService.rejectRequest(payload!.requestId, payload!.reason)
  );
}

export const useDoctorChildRequests = () => {
  const [requests, setRequests] = useState<DoctorChildRequestResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await doctorChildRequestService.getPendingRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching requests');
      console.error('Error fetching doctor-child requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveRequest = useCallback(async (requestId: number) => {
    try {
      await doctorChildRequestService.approveRequest(requestId);
      setRequests(requests.filter(r => r.id !== requestId));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error approving request');
      console.error('Error approving request:', err);
      return false;
    }
  }, [requests]);

  const rejectRequest = useCallback(async (requestId: number, reason?: string) => {
    try {
      await doctorChildRequestService.rejectRequest(requestId, reason);
      setRequests(requests.filter(r => r.id !== requestId));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error rejecting request');
      console.error('Error rejecting request:', err);
      return false;
    }
  }, [requests]);

  return {
    requests,
    loading,
    error,
    fetchPendingRequests,
    approveRequest,
    rejectRequest,
  };
};

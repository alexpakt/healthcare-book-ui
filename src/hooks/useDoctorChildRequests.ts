import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import {
  doctorChildRequestService,
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

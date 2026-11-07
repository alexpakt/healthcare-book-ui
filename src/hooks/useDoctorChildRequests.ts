import { useApi, useMutation } from './useApi';
import {
  doctorChildRequestService,
  type SendRequestDTO,
} from '../services/doctorChildRequestService';

export function usePendingChildRequests() {
  return useApi(() => doctorChildRequestService.getPendingRequests(), []);
}

export function useSentPendingChildRequests() {
  return useApi(() => doctorChildRequestService.getSentPendingRequests(), []);
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

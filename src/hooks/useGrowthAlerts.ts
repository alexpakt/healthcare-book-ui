import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { growthAlertService } from '../services/growthAlertService';

export function useGrowthAlerts(childId: number) {
  const fetchFn = useCallback(() => growthAlertService.getAlerts(childId), [childId]);
  return useApi(fetchFn);
}

export interface AcknowledgeGrowthAlertPayload {
  childId: number;
  alertKey: string;
  note?: string;
}

export function useAcknowledgeGrowthAlert() {
  return useMutation((payload?: AcknowledgeGrowthAlertPayload) =>
    growthAlertService.acknowledge(payload!.childId, payload!.alertKey, payload?.note)
  );
}

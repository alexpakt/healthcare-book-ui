import { useApi, useMutation } from './useApi';
import { growthAlertService } from '../services/growthAlertService';

export function useGrowthAlerts(childId: number) {
  return useApi(() => growthAlertService.getAlerts(childId), [childId]);
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

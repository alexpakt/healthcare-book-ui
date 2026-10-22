import { useCallback } from 'react';
import { useApi } from './useApi';
import { vaccinationCatalogService } from '../services/vaccinationCatalogService';
import { childAppointmentService } from '../services/childAppointmentService';

export function useVaccinationSchedules() {
  const fetchFn = useCallback(() => vaccinationCatalogService.getVaccinationSchedules(), []);
  return useApi(fetchFn);
}

export function useChildAppointments(childId: number) {
  const fetchFn = useCallback(() => childAppointmentService.getChildAppointments(childId), [childId]);
  return useApi(fetchFn);
}

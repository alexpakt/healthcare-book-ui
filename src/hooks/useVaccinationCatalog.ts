import { useCallback } from 'react';
import { useApi } from './useApi';
import { vaccinationCatalogService } from '../services/vaccinationCatalogService';

export function useVaccinationSchedules() {
  const fetchFn = useCallback(() => vaccinationCatalogService.getVaccinationSchedules(), []);
  return useApi(fetchFn);
}

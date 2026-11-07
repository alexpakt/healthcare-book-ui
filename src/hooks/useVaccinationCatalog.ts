import { useApi } from './useApi';
import { vaccinationCatalogService } from '../services/vaccinationCatalogService';

export function useVaccinationSchedules() {
  return useApi(() => vaccinationCatalogService.getVaccinationSchedules(), []);
}

export function useAllVaccines(skip: boolean = false) {
  return useApi(() => vaccinationCatalogService.getAllVaccines(), [], { skip });
}

import type { VaccinationStatus } from '../types/common';
import type { VaccinationRecord } from '../types/parent';

/**
 * For a recorded vaccination, status is COMPLETED if it was administered.
 */
export function getVaccinationStatus(vaccination: VaccinationRecord): VaccinationStatus {
  if (vaccination.administeredDate) {
    return 'COMPLETED';
  }
  return 'PENDING';
}

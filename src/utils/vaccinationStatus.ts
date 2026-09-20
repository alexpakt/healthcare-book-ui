import type { VaccinationStatus } from '../types/common';
import type { VaccinationRecord } from '../types/parent';

/**
 * The backend has no vaccination "status" concept — it only tracks
 * administeredDate/nextDoseDate. Status is derived client-side: no next
 * dose scheduled means the series is complete, otherwise it's overdue or
 * upcoming depending on whether nextDoseDate has passed.
 */
export function getVaccinationStatus(vaccination: VaccinationRecord): VaccinationStatus {
  if (!vaccination.nextDoseDate) {
    return 'COMPLETED';
  }
  return new Date(vaccination.nextDoseDate) < new Date() ? 'OVERDUE' : 'PENDING';
}

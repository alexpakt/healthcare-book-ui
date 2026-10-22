import type { VaccinationStatus } from '../types/common';
import type { Appointment, VaccinationRecord, VaccinationSchedule } from '../types/parent';

export type DoseStatus = 'COMPLETED' | 'SCHEDULED' | 'OVERDUE' | 'PENDING' | 'FUTURE';

export interface DoseState {
  status: DoseStatus;
  recordedVaccination?: VaccinationRecord;
  scheduledAppointment?: Appointment;
}

/**
 * For a recorded vaccination, status is COMPLETED if it was administered.
 */
export function getVaccinationStatus(vaccination: VaccinationRecord): VaccinationStatus {
  if (vaccination.administeredDate) {
    return 'COMPLETED';
  }
  return 'PENDING';
}

/**
 * Schedules recommended up to 6 months ahead of the child's current age.
 */
export function getSchedulesForAge(
  schedules: VaccinationSchedule[],
  ageInMonths: number
): VaccinationSchedule[] {
  const maxAge = ageInMonths + 6;
  return schedules.filter((schedule) => schedule.recommendedAgeMonths <= maxAge);
}

/**
 * Status for a dose that is neither recorded nor scheduled, based on its
 * recommended age relative to the child's current age (±1 month is PENDING).
 */
function getAgeBasedStatus(recommendedAgeMonths: number, ageInMonths: number): DoseStatus {
  const ageMinusOne = ageInMonths - 1;
  const agePlusOne = ageInMonths + 1;

  if (recommendedAgeMonths >= ageMinusOne && recommendedAgeMonths <= agePlusOne) {
    return 'PENDING';
  }
  if (recommendedAgeMonths < ageMinusOne) {
    return 'OVERDUE';
  }
  return 'FUTURE';
}

/**
 * Single source of truth for a dose's status.
 * Precedence: recorded vaccination, then a scheduled appointment, then age.
 */
export function getDoseState(
  schedule: VaccinationSchedule,
  ageInMonths: number,
  vaccinations: VaccinationRecord[] | null,
  appointments: Appointment[] | null | undefined
): DoseState {
  const recordedVaccination = vaccinations?.find(
    (v) => v.vaccineName === schedule.vaccineName && v.doseNumber === schedule.doseNumber
  );
  if (recordedVaccination) {
    return { status: 'COMPLETED', recordedVaccination };
  }

  const scheduledReason = `${schedule.vaccineName} (${schedule.recommendedAgeMonths}μ)`;
  const scheduledAppointment = appointments?.find(
    (apt) => apt.status === 'SCHEDULED' && apt.reason?.includes(scheduledReason)
  );
  if (scheduledAppointment) {
    return { status: 'SCHEDULED', scheduledAppointment };
  }

  return { status: getAgeBasedStatus(schedule.recommendedAgeMonths, ageInMonths) };
}

export function getNextMissingDoseNumber(
  schedules: VaccinationSchedule[],
  vaccinations: VaccinationRecord[] | null,
  vaccineName: string
): number {
  const scheduled = schedules
    .filter((s) => s.vaccineName === vaccineName)
    .sort((a, b) => (a.doseNumber ?? 0) - (b.doseNumber ?? 0));
  if (scheduled.length === 0) {
    return 1;
  }

  const recorded = new Set(
    (vaccinations ?? [])
      .filter((v) => v.vaccineName === vaccineName && v.doseNumber != null)
      .map((v) => v.doseNumber)
  );
  const missing = scheduled.find((s) => s.doseNumber != null && !recorded.has(s.doseNumber));
  if (missing) {
    return missing.doseNumber!;
  }
  return Math.max(...scheduled.map((s) => s.doseNumber ?? 0)) + 1;
}

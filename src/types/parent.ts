import type { AppointmentStatus, Gender } from './common';

export interface Child {
  id: number;
  firstName: string;
  lastName: string;
  amka: string;
  dateOfBirth: string;
  gender: Gender;
  bloodType?: string;
  profilePictureUrl?: string;
}

export interface Appointment {
  id: number;
  childId: number;
  childName: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface VaccinationRecord {
  id: number;
  childId: number;
  childName: string;
  vaccineName: string;
  doseNumber?: number;
  administeredDate: string;
  nextDoseDate?: string;
  batchNumber?: string;
  administeredByDoctorName: string;
  notes?: string;
}

export interface VaccinationSchedule {
  id: number;
  vaccineName: string;
  vaccineNameGr: string;
  recommendedAgeMonths: number;
  doseNumber?: number;
  notes?: string;
}

export interface MedicalRecord {
  id: number;
  childId: number;
  childName: string;
  doctorId: number;
  doctorName: string;
  appointmentId?: number;
  recordDate: string;
  diagnosis: string;
  notes?: string;
  prescription?: string;
}

export interface AllergyRecord {
  id: number;
  childId: number;
  childName: string;
  allergen: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  reaction?: string;
  diagnosedDate: string;
  notes?: string;
}

export interface GrowthMeasurement {
  id: number;
  childId: number;
  childName: string;
  doctorId: number;
  doctorName: string;
  measurementDate: string;
  ageInMonths: number;
  heightCm?: number;
  weightKg?: number;
  headCircumferenceCm?: number;
  percentileHeight?: number;
  percentileWeight?: number;
  percentileHeadCircumference?: number;
  notes?: string;
}

export interface ParentQuickStats {
  totalChildren: number;
  upcomingAppointmentsCount: number;
  overdueVaccinationsCount: number;
}

export interface ParentDashboardData {
  children: Child[];
  upcomingAppointments: Appointment[];
  vaccinationReminders: VaccinationRecord[];
  quickStats: ParentQuickStats;
}

import type { AppointmentStatus } from './common';
import type { MedicalRecord, VaccinationRecord } from './parent';

export interface AssignedChild {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface DoctorAppointment {
  id: number;
  childId: number;
  childName: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  parentName: string;
}

export interface PatientMedicalHistory {
  childId: number;
  childName: string;
  medicalRecords: MedicalHistory[];
  vaccinations: VaccinationHistory[];
  allergies: AllergyRecord[];
}

// Same shape as the backend sends to parents (MedicalRecordResponse/VaccinationResponse) —
// reused rather than duplicated with (previously incorrect) doctor-specific field names.
export type MedicalHistory = MedicalRecord;
export type VaccinationHistory = VaccinationRecord;

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

export interface DoctorQuickStats {
  totalPatients: number;
  todayAppointmentsCount: number;
  upcomingAppointmentsCount: number;
  completedAppointmentsCount: number;
  pendingRequestsCount: number;
}

export interface DoctorDashboardData {
  assignedChildren: AssignedChild[];
  todayAppointments: DoctorAppointment[];
  upcomingAppointments: DoctorAppointment[];
  pendingAppointments: DoctorAppointment[];
  quickStats: DoctorQuickStats;
}

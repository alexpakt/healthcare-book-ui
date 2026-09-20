import type { AppointmentStatus } from './common';
import type { MedicalRecord, VaccinationRecord, AllergyRecord } from './parent';

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

export type MedicalHistory = MedicalRecord;
export type VaccinationHistory = VaccinationRecord;
export type { AllergyRecord };

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

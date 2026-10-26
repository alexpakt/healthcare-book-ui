import type { Appointment, MedicalRecord, VaccinationRecord, AllergyRecord } from './parent';

export interface AssignedChild {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface DoctorAppointment extends Appointment {
  parentName: string;
}

export interface PatientMedicalHistory {
  childId: number;
  childName: string;
  child: any;
  medicalRecords: MedicalHistory[];
  vaccinations: VaccinationHistory[];
  allergies: AllergyRecord[];
}

export type MedicalHistory = MedicalRecord;
export type VaccinationHistory = VaccinationRecord;
export type { AllergyRecord };

export interface DoctorDashboardData {
  assignedChildren: AssignedChild[];
  todayAppointments: DoctorAppointment[];
  upcomingAppointments: DoctorAppointment[];
  pendingAppointments: DoctorAppointment[];
}

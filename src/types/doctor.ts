import type { Appointment, MedicalRecord, AllergyRecord } from './parent';

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

export type MedicalHistory = MedicalRecord;
export type { AllergyRecord };

export interface DoctorDashboardData {
  assignedChildren: AssignedChild[];
  todayAppointments: DoctorAppointment[];
  upcomingAppointments: DoctorAppointment[];
  pendingAppointments: DoctorAppointment[];
}

import type { AppointmentStatus } from './common';

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
  parentContactInfo?: string;
}

export interface MedicalNotes {
  id: number;
  appointmentId: number;
  childId: number;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PatientMedicalHistory {
  childId: number;
  childName: string;
  medicalRecords: MedicalHistory[];
  vaccinations: VaccinationHistory[];
  allergies: AllergyRecord[];
}

export interface MedicalHistory {
  id: number;
  recordType: string;
  recordDate: string;
  content: string;
}

export interface VaccinationHistory {
  id: number;
  vaccineName: string;
  vaccinationDate: string;
  nextDueDate: string;
  doctorName: string;
}

export interface AllergyRecord {
  id: number;
  allergyName: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  reaction?: string;
  dateIdentified: string;
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

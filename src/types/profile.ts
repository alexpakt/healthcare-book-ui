export interface DoctorProfile {
  id: number;
  firstName: string;
  lastName: string;
  amka: string;
  email: string;
  phoneNumber?: string;
  specialization: string;
  licenseNumber: string;
  address?: string;
}

export interface UpdateDoctorProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  specialization: string;
  licenseNumber: string;
  address?: string;
}

export interface ParentProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

export interface UpdateParentProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

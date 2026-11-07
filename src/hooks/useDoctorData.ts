import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { doctorService } from '../services/doctorService';
import type { UpdateDoctorProfileRequest } from '../types/profile';
import type { MedicalRecordRequest, GrowthMeasurementRequest, BirthRecordRequest, CreateVaccinationRequest } from '../services/doctorService';

export function useDoctorDashboardData() {
  return useApi(() => doctorService.getDashboardData(), []);
}

export function useDoctorAssignedChildren() {
  return useApi(() => doctorService.getAssignedChildren(), []);
}

export function useDoctorAppointments(page: number = 1, pageSize: number = 10) {
  return useApi(() => doctorService.getAppointments(page, pageSize), [page, pageSize]);
}

export function useDoctorCreateMedicalRecord() {
  return useMutation((request?: MedicalRecordRequest) =>
    doctorService.createMedicalRecord(request!)
  );
}

export function useDoctorUpdateMedicalRecord() {
  return useMutation(
    (payload?: { recordId: number; request: MedicalRecordRequest }) =>
      doctorService.updateMedicalRecord(payload!.recordId, payload!.request)
  );
}

export function useDoctorCreateGrowthMeasurement() {
  return useMutation((request?: GrowthMeasurementRequest) =>
    doctorService.createGrowthMeasurement(request!)
  );
}

export function useDoctorCreateVaccination() {
  return useMutation((request?: CreateVaccinationRequest) =>
    doctorService.createVaccination(request!)
  );
}

export function useDoctorCreateAllergy() {
  return useMutation(
    (payload?: {
      childId: number;
      request: {
        allergen: string;
        severity: 'MILD' | 'MODERATE' | 'SEVERE';
        reaction?: string;
        diagnosedDate: string;
        notes?: string;
      };
    }) => doctorService.createAllergy(payload!.childId, payload!.request)
  );
}

export function useDoctorUpdateAllergy() {
  return useMutation(
    (payload?: {
      allergyId: number;
      request: {
        allergen: string;
        severity: 'MILD' | 'MODERATE' | 'SEVERE';
        reaction?: string;
        diagnosedDate: string;
        notes?: string;
      };
    }) => doctorService.updateAllergy(payload!.allergyId, payload!.request)
  );
}

export function useDoctorDeleteAllergy() {
  return useMutation((allergyId?: number) => doctorService.deleteAllergy(allergyId!));
}

export function useDoctorCreateBirthRecord() {
  return useMutation((request?: BirthRecordRequest) =>
    doctorService.createBirthRecord(request!)
  );
}

export function useDoctorUpdateBirthRecord() {
  return useMutation(
    (payload?: { childId: number; request: BirthRecordRequest }) =>
      doctorService.updateBirthRecord(payload!.childId, payload!.request)
  );
}

export function useDoctorProfile(skip: boolean = false) {
  return useApi(() => doctorService.getMyProfile(), [], { skip });
}

export function useDoctorUpdateProfile() {
  return useMutation((request?: UpdateDoctorProfileRequest) =>
    doctorService.updateMyProfile(request!)
  );
}

export function useDoctorDashboard() {
  const dashboardData = useDoctorDashboardData();

  const isLoading = dashboardData.loading;
  const hasError = dashboardData.error;
  const refetchDashboard = dashboardData.refetch;

  const refetch = useCallback(async () => {
    await refetchDashboard();
  }, [refetchDashboard]);

  return {
    assignedChildren: dashboardData.data?.assignedChildren || null,
    todayAppointments: dashboardData.data?.todayAppointments || null,
    upcomingAppointments: dashboardData.data?.upcomingAppointments || null,
    pendingAppointments: dashboardData.data?.pendingAppointments || null,
    isLoading,
    error: hasError,
    refetch,
  };
}

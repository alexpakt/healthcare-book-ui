import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { doctorService } from '../services/doctorService';
import type { AppointmentStatus } from '../types/common';

export function useDoctorDashboardData() {
  const fetchFn = useCallback(() => doctorService.getDashboardData(), []);
  return useApi(fetchFn);
}

export function useDoctorAssignedChildren() {
  const fetchFn = useCallback(() => doctorService.getAssignedChildren(), []);
  return useApi(fetchFn);
}

export function useDoctorTodayAppointments() {
  const fetchFn = useCallback(() => doctorService.getTodayAppointments(), []);
  return useApi(fetchFn);
}

export function useDoctorUpcomingAppointments(limit?: number) {
  const fetchFn = useCallback(() => doctorService.getUpcomingAppointments(limit), [limit]);
  return useApi(fetchFn);
}

export function useDoctorAppointments(page: number = 1, pageSize: number = 10) {
  const fetchFn = useCallback(() => doctorService.getAppointments(page, pageSize), [page, pageSize]);
  return useApi(fetchFn);
}

export function useDoctorUpdateAppointmentStatus() {
  return useMutation(
    (payload?: { appointmentId: number; status: AppointmentStatus }) =>
      doctorService.updateAppointmentStatus(payload!.appointmentId, payload!.status)
  );
}

export function useDoctorPatientMedicalHistory(childId: number) {
  const fetchFn = useCallback(() => doctorService.getPatientMedicalHistory(childId), [childId]);
  return useApi(fetchFn);
}

export function useDoctorAddMedicalNotes() {
  return useMutation(
    (payload?: { appointmentId: number; notes: string }) =>
      doctorService.addMedicalNotes(payload!.appointmentId, payload!.notes)
  );
}

export function useDoctorUpdateMedicalNotes() {
  return useMutation(
    (payload?: { notesId: number; notes: string }) =>
      doctorService.updateMedicalNotes(payload!.notesId, payload!.notes)
  );
}

export function useDoctorDashboard() {
  const dashboardData = useDoctorDashboardData();

  const isLoading = dashboardData.loading;
  const hasError = dashboardData.error;

  const refetch = useCallback(async () => {
    await dashboardData.refetch();
  }, [dashboardData.refetch]);

  return {
    dashboardData: dashboardData.data,
    assignedChildren: dashboardData.data?.assignedChildren || null,
    todayAppointments: dashboardData.data?.todayAppointments || null,
    upcomingAppointments: dashboardData.data?.upcomingAppointments || null,
    isLoading,
    error: hasError,
    refetch,
  };
}

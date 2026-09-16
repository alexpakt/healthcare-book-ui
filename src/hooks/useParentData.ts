import { useCallback } from 'react';
import { useApi } from './useApi';
import { parentService } from '../services/parentService';
import type { Appointment, VaccinationRecord } from '../types/parent';

/**
 * Hook for fetching parent dashboard data
 */
export function useParentDashboardData() {
  const fetchFn = useCallback(() => parentService.getDashboardData(), []);
  return useApi(fetchFn);
}

/**
 * Hook for fetching all children
 */
export function useParentChildren() {
  const fetchFn = useCallback(() => parentService.getChildren(), []);
  return useApi(fetchFn);
}

/**
 * Hook for fetching a specific child
 */
export function useParentChild(childId: number) {
  const fetchFn = useCallback(() => parentService.getChildById(childId), [childId]);
  return useApi(fetchFn);
}

/**
 * Hook for fetching all appointments
 */
export function useParentAppointments() {
  const fetchFn = useCallback(() => parentService.getAppointments(), []);
  return useApi(fetchFn);
}

/**
 * Hook for fetching child appointments
 */
export function useParentChildAppointments(childId: number) {
  const fetchFn = useCallback(() => parentService.getChildAppointments(childId), [childId]);
  return useApi(fetchFn);
}

/**
 * Hook for fetching child vaccinations
 */
export function useParentChildVaccinations(childId: number) {
  const fetchFn = useCallback(() => parentService.getChildVaccinations(childId), [childId]);
  return useApi(fetchFn);
}

/**
 * Hook for fetching child medical records
 */
export function useParentChildMedicalRecords(childId: number) {
  const fetchFn = useCallback(() => parentService.getChildMedicalRecords(childId), [childId]);
  return useApi(fetchFn);
}

/**
 * Combined hook that fetches all commonly used parent data
 */
export function useParentDashboard() {
  const dashboardData = useParentDashboardData();

  const isLoading = dashboardData.loading;
  const hasError = dashboardData.error;

  const refetch = useCallback(async () => {
    await dashboardData.refetch();
  }, [dashboardData.refetch]);

  return {
    dashboardData: dashboardData.data,
    children: dashboardData.data?.children || null,
    appointments: dashboardData.data?.upcomingAppointments as Appointment[] || null,
    vaccinations: dashboardData.data?.vaccinationReminders as VaccinationRecord[] || null,
    isLoading,
    error: hasError,
    refetch,
  };
}

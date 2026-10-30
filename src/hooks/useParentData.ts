import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { parentService } from '../services/parentService';
import type { Appointment } from '../types/parent';
import type { UpdateParentProfileRequest } from '../types/profile';

export function useParentDashboardData() {
  const fetchFn = useCallback(() => parentService.getDashboardData(), []);
  return useApi(fetchFn);
}

export function useParentProfile(skip: boolean = false) {
  const fetchFn = useCallback(() => parentService.getMyProfile(), []);
  return useApi(fetchFn, undefined, { skip });
}

export function useParentUpdateProfile() {
  return useMutation((request?: UpdateParentProfileRequest) =>
    parentService.updateMyProfile(request!)
  );
}

export function useParentDashboard() {
  const dashboardData = useParentDashboardData();

  const isLoading = dashboardData.loading;
  const hasError = dashboardData.error;
  const refetchDashboard = dashboardData.refetch;

  const refetch = useCallback(async () => {
    await refetchDashboard();
  }, [refetchDashboard]);

  return {
    children: dashboardData.data?.children || null,
    appointments: dashboardData.data?.upcomingAppointments as Appointment[] || null,
    isLoading,
    error: hasError,
    refetch,
  };
}

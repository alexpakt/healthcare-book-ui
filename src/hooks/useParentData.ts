import { useCallback } from 'react';
import { useApi } from './useApi';
import { parentService } from '../services/parentService';
import type { Appointment } from '../types/parent';

export function useParentDashboardData() {
  const fetchFn = useCallback(() => parentService.getDashboardData(), []);
  return useApi(fetchFn);
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

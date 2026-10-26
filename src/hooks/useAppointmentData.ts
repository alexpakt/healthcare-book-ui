import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { appointmentService, type CreateAppointmentRequest } from '../services/appointmentService';
import type { AppointmentStatus } from '../types/common';

export function useAppointments() {
  const fetchFn = useCallback(() => appointmentService.getAll(), []);
  return useApi(fetchFn);
}

export function useChildAppointments(childId: number) {
  const fetchFn = useCallback(() => appointmentService.getForChild(childId), [childId]);
  return useApi(fetchFn);
}

export function useCreateAppointment() {
  return useMutation((request?: CreateAppointmentRequest) => appointmentService.create(request!));
}

export function useUpdateAppointmentStatus() {
  return useMutation((payload?: { appointmentId: number; status: AppointmentStatus }) =>
    appointmentService.updateStatus(payload!.appointmentId, payload!.status)
  );
}

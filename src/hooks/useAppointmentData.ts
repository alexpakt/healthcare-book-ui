import { useApi, useMutation } from './useApi';
import { appointmentService, type CreateAppointmentRequest } from '../services/appointmentService';
import type { AppointmentStatus } from '../types/common';

export function useAppointments() {
  return useApi(() => appointmentService.getAll(), []);
}

export function useChildAppointments(childId: number) {
  return useApi(() => appointmentService.getForChild(childId), [childId]);
}

export function useCreateAppointment() {
  return useMutation((request?: CreateAppointmentRequest) => appointmentService.create(request!));
}

export function useUpdateAppointmentStatus() {
  return useMutation((payload?: { appointmentId: number; status: AppointmentStatus }) =>
    appointmentService.updateStatus(payload!.appointmentId, payload!.status)
  );
}

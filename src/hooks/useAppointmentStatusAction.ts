import { useState } from 'react';
import type { AppointmentStatus, ErrorResponse } from '../types/common';

export function useAppointmentStatusAction(
  updateStatus: (payload: { appointmentId: number; status: AppointmentStatus }) => Promise<unknown>,
  refetch: () => unknown
) {
  const [actionError, setActionError] = useState<string | null>(null);

  const runStatusUpdate = async (appointmentId: number, status: AppointmentStatus) => {
    setActionError(null);
    try {
      await updateStatus({ appointmentId, status });
    } catch (err) {
      setActionError((err as ErrorResponse).message);
    }
    await refetch();
  };

  const clearActionError = () => setActionError(null);

  return { actionError, clearActionError, runStatusUpdate };
}

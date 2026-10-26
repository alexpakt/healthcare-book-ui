import React from 'react';
import { Badge } from '@mantine/core';
import type { AppointmentStatus } from '../../types/common';

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  REQUESTED: 'orange',
  SCHEDULED: 'blue',
  COMPLETED: 'green',
  DECLINED: 'gray',
  CANCELLED: 'red',
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  REQUESTED: 'ΣΕ ΑΝΑΜΟΝΗ',
  SCHEDULED: 'ΠΡΟΓΡΑΜΜΑΤΙΣΜΕΝΟ',
  COMPLETED: 'ΟΛΟΚΛΗΡΩΜΕΝΟ',
  DECLINED: 'ΑΠΟΡΡΙΦΘΗΚΕ',
  CANCELLED: 'ΑΚΥΡΩΘΗΚΕ',
};

export const AppointmentStatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => (
  <Badge size="sm" color={STATUS_COLORS[status] ?? 'gray'}>
    {STATUS_LABELS[status] ?? status}
  </Badge>
);

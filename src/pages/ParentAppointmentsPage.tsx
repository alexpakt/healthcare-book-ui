import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ParentAppointments } from '../components/dashboard/ParentAppointments';

const ParentAppointmentsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <ParentAppointments />
    </DashboardLayout>
  );
};

export default ParentAppointmentsPage;

import React from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { ParentAppointments } from '../components/Dashboard/ParentAppointments';

const ParentAppointmentsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <ParentAppointments />
    </DashboardLayout>
  );
};

export default ParentAppointmentsPage;

import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DoctorAppointments } from '../components/dashboard/DoctorAppointments';

const DoctorAppointmentsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <DoctorAppointments />
    </DashboardLayout>
  );
};

export default DoctorAppointmentsPage;

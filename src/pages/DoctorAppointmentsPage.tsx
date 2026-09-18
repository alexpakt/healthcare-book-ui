import React from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { DoctorAppointments } from '../components/Dashboard/DoctorAppointments';

const DoctorAppointmentsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <DoctorAppointments />
    </DashboardLayout>
  );
};

export default DoctorAppointmentsPage;

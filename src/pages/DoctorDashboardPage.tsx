import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DoctorDashboard } from '../components/dashboard/DoctorDashboard';

const DoctorDashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <DoctorDashboard />
    </DashboardLayout>
  );
};

export default DoctorDashboardPage;

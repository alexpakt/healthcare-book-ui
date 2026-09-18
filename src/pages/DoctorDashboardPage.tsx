import React from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { DoctorDashboard } from '../components/Dashboard/DoctorDashboard';

const DoctorDashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <DoctorDashboard />
    </DashboardLayout>
  );
};

export default DoctorDashboardPage;

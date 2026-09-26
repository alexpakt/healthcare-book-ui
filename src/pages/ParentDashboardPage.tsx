import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ParentDashboard } from '../components/dashboard/ParentDashboard';

const ParentDashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <ParentDashboard />
    </DashboardLayout>
  );
};

export default ParentDashboardPage;

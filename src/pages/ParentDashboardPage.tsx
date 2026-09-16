import React from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { ParentDashboard } from '../components/Dashboard/ParentDashboard';

const ParentDashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <ParentDashboard />
    </DashboardLayout>
  );
};

export default ParentDashboardPage;

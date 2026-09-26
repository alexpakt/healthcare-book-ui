import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ChildDetail } from '../components/dashboard/ChildDetail';

const ChildDetailPage: React.FC = () => {
  return (
    <DashboardLayout>
      <ChildDetail />
    </DashboardLayout>
  );
};

export default ChildDetailPage;

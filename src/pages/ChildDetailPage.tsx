import React from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { ChildDetail } from '../components/Dashboard/ChildDetail';

const ChildDetailPage: React.FC = () => {
  return (
    <DashboardLayout>
      <ChildDetail />
    </DashboardLayout>
  );
};

export default ChildDetailPage;

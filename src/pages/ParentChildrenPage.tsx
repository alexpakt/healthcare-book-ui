import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ParentChildren } from '../components/dashboard/ParentChildren';

const ParentChildrenPage: React.FC = () => {
  return (
    <DashboardLayout>
      <ParentChildren />
    </DashboardLayout>
  );
};

export default ParentChildrenPage;

import React from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { ParentChildren } from '../components/Dashboard/ParentChildren';

const ParentChildrenPage: React.FC = () => {
  return (
    <DashboardLayout>
      <ParentChildren />
    </DashboardLayout>
  );
};

export default ParentChildrenPage;

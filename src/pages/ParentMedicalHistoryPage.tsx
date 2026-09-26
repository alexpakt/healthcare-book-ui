import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ParentMedicalHistory } from '../components/dashboard/ParentMedicalHistory';

const ParentMedicalHistoryPage: React.FC = () => {
  return (
    <DashboardLayout>
      <ParentMedicalHistory />
    </DashboardLayout>
  );
};

export default ParentMedicalHistoryPage;

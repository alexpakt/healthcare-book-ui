import React from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { ParentMedicalHistory } from '../components/Dashboard/ParentMedicalHistory';

const ParentMedicalHistoryPage: React.FC = () => {
  return (
    <DashboardLayout>
      <ParentMedicalHistory />
    </DashboardLayout>
  );
};

export default ParentMedicalHistoryPage;

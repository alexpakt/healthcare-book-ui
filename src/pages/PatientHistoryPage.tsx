import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { PatientHistory } from '../components/dashboard/PatientHistory';

const PatientHistoryPage: React.FC = () => {
  return (
    <DashboardLayout>
      <PatientHistory />
    </DashboardLayout>
  );
};

export default PatientHistoryPage;

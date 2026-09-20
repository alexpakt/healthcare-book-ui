import React from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { PatientHistory } from '../components/Dashboard/PatientHistory';

const PatientHistoryPage: React.FC = () => {
  return (
    <DashboardLayout>
      <PatientHistory />
    </DashboardLayout>
  );
};

export default PatientHistoryPage;

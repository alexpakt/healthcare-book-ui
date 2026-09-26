import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Center } from '@mantine/core';
import ParentDashboardPage from './ParentDashboardPage';
import DoctorDashboardPage from './DoctorDashboardPage';
import LoadingScreen from '../components/shared/LoadingScreen';

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Route to appropriate dashboard based on role
  if (user?.role === 'ROLE_PARENT') {
    return <ParentDashboardPage />;
  }

  if (user?.role === 'ROLE_DOCTOR') {
    return <DoctorDashboardPage />;
  }

  return (
    <Center style={{ minHeight: '100vh' }}>
      <div>Μη έγκυρος ρόλος - παρακαλώ συνδεθείτε ξανά</div>
    </Center>
  );
};

export default Dashboard;

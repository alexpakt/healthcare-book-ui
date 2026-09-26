import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Center } from '@mantine/core';
import DoctorAppointmentsPage from './DoctorAppointmentsPage';
import ParentAppointmentsPage from './ParentAppointmentsPage';
import LoadingScreen from '../components/shared/LoadingScreen';

const AppointmentsPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user?.role === 'ROLE_DOCTOR') {
    return <DoctorAppointmentsPage />;
  }

  if (user?.role === 'ROLE_PARENT') {
    return <ParentAppointmentsPage />;
  }

  return (
    <Center style={{ minHeight: '100vh' }}>
      <div>Δεν υπάρχει διαθέσιμη σελίδα ραντεβού για τον ρόλο σας</div>
    </Center>
  );
};

export default AppointmentsPage;

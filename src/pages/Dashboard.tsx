import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Center, Loader } from '@mantine/core';
import ParentDashboardPage from './ParentDashboardPage';

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  // Route to appropriate dashboard based on role
  if (user?.role === 'ROLE_PARENT') {
    return <ParentDashboardPage />;
  }

  if (user?.role === 'ROLE_DOCTOR') {
    // TODO: Implement DoctorDashboardPage
    return (
      <Center style={{ minHeight: '100vh' }}>
        <div>Το Dashboard του Γιατρού θα είναι σύντομα διαθέσιμο</div>
      </Center>
    );
  }

  if (user?.role === 'ROLE_ADMIN') {
    // TODO: Implement AdminDashboardPage
    return (
      <Center style={{ minHeight: '100vh' }}>
        <div>Το Admin Dashboard θα είναι σύντομα διαθέσιμο</div>
      </Center>
    );
  }

  // Fallback - should not reach here if auth is working correctly
  return (
    <Center style={{ minHeight: '100vh' }}>
      <div>Μη έγκυρος ρόλος - παρακαλώ συνδεθείτε ξανά</div>
    </Center>
  );
};

export default Dashboard;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { Center, Loader } from '@mantine/core';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ROLE_PARENT' | 'ROLE_DOCTOR' | 'ROLE_ADMIN';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

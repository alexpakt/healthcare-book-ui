import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Title } from '@mantine/core';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { PatientsTable } from "../components/Doctor/PatientsTable";
import { useDoctorAssignedChildren } from '../hooks/useDoctorData';

const DoctorAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: patients, loading: isLoading } = useDoctorAssignedChildren();

  const handleViewHistory = (childId: number) => {
    navigate(`/patients/${childId}`);
  };

  return (
    <DashboardLayout>
      <Stack gap="lg">
        <Title order={2}>Ασθενείς</Title>
        <PatientsTable patients={patients || null} isLoading={isLoading} onViewHistory={handleViewHistory} />
      </Stack>
    </DashboardLayout>
  );
};

export default DoctorAppointmentsPage;

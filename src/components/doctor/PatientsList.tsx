import React from 'react';
import { Grid, Text, Stack, Center, Loader } from '@mantine/core';
import { PatientCard } from './PatientCard';
import { SearchChildForm } from './SearchChildForm';
import type { AssignedChild } from '../../types/doctor';

interface PatientsListProps {
  patients: AssignedChild[] | null;
  isLoading: boolean;
  onViewHistory?: (childId: number) => void;
}

export const PatientsList: React.FC<PatientsListProps> = ({
  patients,
  isLoading,
  onViewHistory,
}) => {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Text c="dimmed" size="lg">
            Δεν έχετε ασθενείς με προγραμματισμένα ραντεβού
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <SearchChildForm patients={patients} />

      <Grid>
        {patients.map((patient) => (
          <Grid.Col key={patient.id} span={{ base: 12, sm: 6, md: 4 }}>
            <PatientCard patient={patient} onViewHistory={onViewHistory} />
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
};

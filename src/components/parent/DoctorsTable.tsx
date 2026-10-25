import React from 'react';
import { Table, Text, Stack, Center, Loader } from '@mantine/core';
import type { DoctorDirectoryEntry } from '../../services/directoryService';

interface DoctorsTableProps {
  doctors: DoctorDirectoryEntry[] | null;
  isLoading: boolean;
  emptyMessage?: string;
}

export const DoctorsTable: React.FC<DoctorsTableProps> = ({ doctors, isLoading, emptyMessage = 'Δεν βρέθηκαν ιατροί' }) => {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!doctors || doctors.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed" size="lg">
          {emptyMessage}
        </Text>
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Όνομα</Table.Th>
            <Table.Th>Ειδικότητα</Table.Th>
            <Table.Th>Τηλέφωνο</Table.Th>
            <Table.Th>Διεύθυνση</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {doctors.map((doctor) => (
            <Table.Tr key={doctor.id}>
              <Table.Td>
                <Text fw={500}>
                  {doctor.firstName} {doctor.lastName}
                </Text>
              </Table.Td>
              <Table.Td>{doctor.specialization}</Table.Td>
              <Table.Td>{doctor.phoneNumber || '-'}</Table.Td>
              <Table.Td>{doctor.address || '-'}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
};

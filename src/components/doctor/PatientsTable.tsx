import React from 'react';
import { Table, Text, Stack, Center, Loader, Badge, Button } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { getAgeDisplay } from '../../utils/ageCalculator';
import { SearchChildForm } from './SearchChildForm';
import { useSentPendingChildRequests } from '../../hooks/useDoctorChildRequests';
import type { AssignedChild } from '../../types/doctor';

interface PatientsTableProps {
  patients: AssignedChild[] | null;
  isLoading: boolean;
  onViewHistory?: (childId: number) => void;
}

export const PatientsTable: React.FC<PatientsTableProps> = ({
  patients,
  isLoading,
  onViewHistory,
}) => {
  const { data, loading: loadingRequests } = useSentPendingChildRequests();
  const pendingRequests = data ?? [];

  if (isLoading || loadingRequests) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if ((!patients || patients.length === 0) && pendingRequests.length === 0) {
    return (
      <Stack gap="lg">
        <Center py="xl">
          <Text c="dimmed" size="lg">
            Δεν έχετε ασθενείς
          </Text>
        </Center>
        <SearchChildForm patients={patients} />
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <SearchChildForm patients={patients} />

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Όνομα</Table.Th>
            <Table.Th>Ηλικία</Table.Th>
            <Table.Th>Γονέας</Table.Th>
            <Table.Th>Κατάσταση</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {/* Assigned Patients */}
          {patients?.map((patient) => {
            const ageDisplay = getAgeDisplay(patient.dateOfBirth);
            return (
              <Table.Tr key={`assigned-${patient.id}`}>
                <Table.Td>
                  <Text fw={500}>
                    {patient.firstName} {patient.lastName}
                  </Text>
                </Table.Td>
                <Table.Td>{ageDisplay}</Table.Td>
                <Table.Td>{patient.parentName}</Table.Td>
                <Table.Td>
                  <Badge size="sm" color={patient.status === 'ACTIVE' ? 'green' : 'gray'}>
                    {patient.status === 'ACTIVE' ? 'ΕΝΕΡΓΟΣ' : 'ΑΝΕΝΕΡΓΟΣ'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Button
                    size="xs"
                    variant="light"
                    rightSection={<IconArrowRight size={14} />}
                    onClick={() => onViewHistory?.(patient.id)}
                  >
                    Ιστορικό
                  </Button>
                </Table.Td>
              </Table.Tr>
            );
          })}

          {/* Pending Requests */}
          {pendingRequests.map((request) => (
            <Table.Tr key={`pending-${request.id}`} opacity={0.6}>
              <Table.Td>
                <Text fw={500}>
                  {request.childFirstName} {request.childLastName}
                </Text>
              </Table.Td>
              <Table.Td>-</Table.Td>
              <Table.Td>-</Table.Td>
              <Table.Td>
                <Badge size="sm" color="yellow">
                  ΕΚΚΡΕΜΗΣ
                </Badge>
              </Table.Td>
              <Table.Td></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
};

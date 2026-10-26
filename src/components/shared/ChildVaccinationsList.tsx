import React from 'react';
import { Stack, Table, Text, Badge, Center, Loader, Paper } from '@mantine/core';
import { IconVaccine } from '@tabler/icons-react';
import type { VaccinationRecord } from '../../types/parent';
import { getVaccinationStatus } from '../../utils/vaccinationStatus';
import { formatDate } from '../../utils/dateFormat';

interface ChildVaccinationsListProps {
  vaccinations: VaccinationRecord[] | null;
  isLoading: boolean;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'green';
    case 'PENDING':
      return 'yellow';
    case 'OVERDUE':
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'ΟΛΟΚΛΗΡΩΜΕΝΟ';
    case 'PENDING':
      return 'ΕΚΚΡΕΜΕΣ';
    case 'OVERDUE':
      return 'ΚΑΘΥΣΤΕΡΗΜΕΝΟ';
    default:
      return status;
  }
};

export const ChildVaccinationsList: React.FC<ChildVaccinationsListProps> = ({
  vaccinations,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!vaccinations || vaccinations.length === 0) {
    return (
      <Paper p="md" radius="md" withBorder>
        <Center py="xl">
          <Stack align="center" gap="md">
            <IconVaccine size={40} color="var(--mantine-color-gray-3)" />
            <Text c="dimmed">Δεν υπάρχουν καταχωρημένοι εμβολιασμοί</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper p="md" radius="md" withBorder>
      <div style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Εμβόλιο</Table.Th>
              <Table.Th>Δόση</Table.Th>
              <Table.Th>Ημερομηνία</Table.Th>
              <Table.Th>Επόμενη δόση</Table.Th>
              <Table.Th>Γιατρός</Table.Th>
              <Table.Th>Κατάσταση</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {vaccinations.map((vaccination) => {
              const status = getVaccinationStatus(vaccination);
              return (
                <Table.Tr key={vaccination.id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {vaccination.vaccineName}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {vaccination.doseNumber ? `Δόση ${vaccination.doseNumber}` : '—'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {formatDate(vaccination.administeredDate)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {vaccination.nextDoseDate
                        ? formatDate(vaccination.nextDoseDate)
                        : '—'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {vaccination.administeredByDoctorName}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" color={getStatusColor(status)}>
                      {getStatusLabel(status)}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </div>
    </Paper>
  );
};

import React from 'react';
import { Stack, Table, Text, Badge, Alert, Center, Loader, Paper, Button } from '@mantine/core';
import { IconAlertCircle, IconVaccine } from '@tabler/icons-react';
import type { VaccinationRecord } from '../../types/parent';
import { getVaccinationStatus } from '../../utils/vaccinationStatus';
import { formatDate } from '../../utils/dateFormat';

interface VaccinationRemindersProps {
  vaccinations: VaccinationRecord[] | null;
  isLoading: boolean;
  onViewDetails?: (childId: number) => void;
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
      return 'Ολοκληρωμένο';
    case 'PENDING':
      return 'Εκκρεμές';
    case 'OVERDUE':
      return 'Καθυστερημένο';
    default:
      return status;
  }
};

export const VaccinationReminders: React.FC<VaccinationRemindersProps> = ({
  vaccinations,
  isLoading,
  onViewDetails,
}) => {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  const overdueVaccinations = vaccinations?.filter((v) => getVaccinationStatus(v) === 'OVERDUE') || [];
  const pendingVaccinations = vaccinations?.filter((v) => getVaccinationStatus(v) === 'PENDING') || [];

  if (!vaccinations || vaccinations.length === 0) {
    return (
      <Paper p="md" radius="md" withBorder>
        <Center py="xl">
          <Stack align="center" gap="md">
            <IconVaccine size={40} color="var(--mantine-color-green-6)" />
            <Text c="dimmed">Δεν υπάρχει ιστορικό εμβολιασμών</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap="md">
        <div>
          <Text fw={600} size="lg">
            Εμβολιασμοί
          </Text>
          <Text size="sm" c="dimmed">
            {vaccinations?.length} {vaccinations?.length === 1 ? 'εμβολιασμός' : 'εμβολιασμοί'}
          </Text>
        </div>

        {overdueVaccinations.length > 0 && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            title="Καθυστερημένοι εμβολιασμοί"
          >
            {overdueVaccinations.length} εμβολιασμοί είναι καθυστερημένοι. Επικοινωνήστε με τον γιατρό σας.
          </Alert>
        )}

        {pendingVaccinations.length > 0 && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="yellow"
            title="Εκκρεμείς εμβολιασμοί"
          >
            {pendingVaccinations.length} εμβολιασμοί είναι εκκρεμείς.
          </Alert>
        )}

        <div style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Παιδί</Table.Th>
                <Table.Th>Εμβόλιο</Table.Th>
                <Table.Th>Ημερομηνία</Table.Th>
                <Table.Th>Επόμενη δόση</Table.Th>
                <Table.Th>Κατάσταση</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {vaccinations?.map((vaccination) => {
                const status = getVaccinationStatus(vaccination);
                return (
                  <Table.Tr key={vaccination.id}>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {vaccination.childName}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{vaccination.vaccineName}</Text>
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

        <Button variant="light" onClick={() => onViewDetails?.(0)}>
          Προβολή πλήρους ιστορικού εμβολιασμών
        </Button>
      </Stack>
    </Paper>
  );
};

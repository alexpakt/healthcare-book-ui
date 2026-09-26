import React, { useEffect, useState } from 'react';
import { Stack, Table, Text, Badge, Center, Loader, Paper, Group, Alert, Box } from '@mantine/core';
import { IconVaccine, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import type { VaccinationRecord, VaccinationSchedule } from '../../types/parent';
import { parentService } from '../../services/parentService';

interface VaccinationStatusProps {
  ageInMonths: number;
  vaccinations: VaccinationRecord[] | null;
  isLoading?: boolean;
}

interface VaccinationStatusItem {
  schedule: VaccinationSchedule;
  isCompleted: boolean;
  status: 'COMPLETED' | 'PENDING' | 'OVERDUE' | 'FUTURE';
  recordedVaccination?: VaccinationRecord;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'green';
    case 'PENDING':
      return 'yellow';
    case 'OVERDUE':
      return 'red';
    case 'FUTURE':
      return 'gray';
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
    case 'FUTURE':
      return 'Μελλοντικό';
    default:
      return status;
  }
};

export const VaccinationStatus: React.FC<VaccinationStatusProps> = ({
  ageInMonths,
  vaccinations,
  isLoading: externalLoading,
}) => {
  const [statusItems, setStatusItems] = useState<VaccinationStatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const allData = await parentService.getVaccinationSchedules();

        const maxAge = ageInMonths + 6;
        const data = allData.filter((schedule) => schedule.recommendedAgeMonths <= maxAge);

        if (vaccinations && data.length > 0) {
          const items = data.map((schedule) => {
            const recordedVaccination = vaccinations.find(
              (v) => v.vaccineName === schedule.vaccineName
            );

            const isCompleted = !!recordedVaccination;
            let status: 'COMPLETED' | 'PENDING' | 'OVERDUE' | 'FUTURE' = 'FUTURE';

            if (isCompleted) {
              // Vaccine has been administered
              status = 'COMPLETED';
            } else {
              // Vaccine not yet administered - determine based on age
              const recommendedAge = schedule.recommendedAgeMonths;
              const ageMinusOne = ageInMonths - 1;
              const agePlusOne = ageInMonths + 1;

              if (recommendedAge >= ageMinusOne && recommendedAge <= agePlusOne) {
                // Current age ± 1 month
                status = 'PENDING';
              } else if (recommendedAge < ageMinusOne) {
                // Past the recommended age by more than 1 month
                status = 'OVERDUE';
              } else {
                // Future vaccines (more than 1 month away)
                status = 'FUTURE';
              }
            }

            return {
              schedule,
              isCompleted,
              status,
              recordedVaccination,
            };
          });

          setStatusItems(items);
        } else {
          setStatusItems(
            data.map((schedule) => ({
              schedule,
              isCompleted: false,
              status: 'FUTURE',
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching vaccination schedules:', err);
        setError('Αποτυχία φόρτωσης προγράμματος εμβολιασμών');
      } finally {
        setIsLoading(false);
      }
    };

    if (ageInMonths >= 0) {
      fetchSchedules();
    }
  }, [ageInMonths, vaccinations]);

  const loading = isLoading || externalLoading;

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα">
        {error}
      </Alert>
    );
  }

  if (statusItems.length === 0) {
    return (
      <Paper p="md" radius="md" withBorder>
        <Center py="xl">
          <Stack align="center" gap="md">
            <IconVaccine size={40} color="var(--mantine-color-gray-3)" />
            <Text c="dimmed">Δεν υπάρχουν εμβολιασμοί που συνιστώνται για αυτή την ηλικία</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  const completedCount = statusItems.filter((item) => item.status === 'COMPLETED').length;
  const overdueCount = statusItems.filter((item) => item.status === 'OVERDUE').length;
  const pendingCount = statusItems.filter((item) => item.status === 'PENDING').length;
  const futureCount = statusItems.filter((item) => item.status === 'FUTURE').length;

  return (
    <Stack gap="md">
      <Group grow>
        <Paper p="sm" radius="md" withBorder>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Ολοκληρωμένα
          </Text>
          <Group gap={4} justify="flex-start">
            <IconCheck size={16} color="green" />
            <Text fw={700}>{completedCount}</Text>
          </Group>
        </Paper>
        <Paper p="sm" radius="md" withBorder>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Εκκρεμή
          </Text>
          <Group gap={4} justify="flex-start">
            <Box style={{ color: 'var(--mantine-color-yellow-6)' }} fw={700}>
              ⚠
            </Box>
            <Text fw={700}>{pendingCount}</Text>
          </Group>
        </Paper>
        <Paper p="sm" radius="md" withBorder>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Καθυστερημένα
          </Text>
          <Group gap={4} justify="flex-start">
            <Box style={{ color: 'var(--mantine-color-red-6)' }} fw={700}>
              ⚠
            </Box>
            <Text fw={700}>{overdueCount}</Text>
          </Group>
        </Paper>
        <Paper p="sm" radius="md" withBorder>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Μελλοντικά
          </Text>
          <Group gap={4} justify="flex-start">
            <Box style={{ color: 'var(--mantine-color-blue-6)' }} fw={700}>
              📅
            </Box>
            <Text fw={700}>{futureCount}</Text>
          </Group>
        </Paper>
      </Group>

      <Paper p="md" radius="md" withBorder>
        <div style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Εμβόλιο</Table.Th>
                <Table.Th>Δόση</Table.Th>
                <Table.Th>Συνιστώμενη Ηλικία</Table.Th>
                <Table.Th>Κατάσταση</Table.Th>
                <Table.Th>Ημερομηνία</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {statusItems.map((item, idx) => {
                return (
                  <Table.Tr key={`${item.schedule.id}-${idx}`}>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {item.schedule.vaccineNameGr || item.schedule.vaccineName}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {item.schedule.doseNumber ? `Δόση ${item.schedule.doseNumber}` : '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {item.schedule.recommendedAgeMonths} μήνες
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="sm" color={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {item.recordedVaccination
                          ? new Date(item.recordedVaccination.administeredDate).toLocaleDateString(
                              'el-GR'
                            )
                          : '—'}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </div>
      </Paper>

      {statusItems.some((item) => item.status === 'OVERDUE') && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Προσοχή">
          Υπάρχουν καθυστερημένοι εμβολιασμοί. Παρακαλώ επικοινωνήστε με τον/την ιατρό του παιδιού.
        </Alert>
      )}
    </Stack>
  );
};

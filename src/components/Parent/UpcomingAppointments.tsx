import React from 'react';
import { Stack, Table, Text, Badge, Button, Center, Loader, Paper } from '@mantine/core';
import { IconCalendarEvent } from '@tabler/icons-react';
import type { Appointment } from '../../types/parent';

interface UpcomingAppointmentsProps {
  appointments: Appointment[] | null;
  isLoading: boolean;
  onViewDetails?: (appointmentId: number) => void;
  title?: string;
  emptyMessage?: string;
  showViewAllButton?: boolean;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'SCHEDULED':
      return 'blue';
    case 'COMPLETED':
      return 'green';
    case 'CANCELLED':
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'SCHEDULED':
      return 'Προγραμματισμένο';
    case 'COMPLETED':
      return 'Ολοκληρωμένο';
    case 'CANCELLED':
      return 'Ακυρώθηκε';
    default:
      return status;
  }
};

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  appointments,
  isLoading,
  onViewDetails,
  title = 'Προσεχή Ραντεβού',
  emptyMessage = 'Δεν υπάρχουν προσεχή ραντεβού',
  showViewAllButton = true,
}) => {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Paper p="md" radius="md" withBorder>
        <Center py="xl">
          <Stack align="center" gap="md">
            <IconCalendarEvent size={40} color="var(--mantine-color-gray-3)" />
            <Text c="dimmed">{emptyMessage}</Text>
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
            {title}
          </Text>
          <Text size="sm" c="dimmed">
            {appointments.length} {appointments.length === 1 ? 'ραντεβού' : 'ραντεβού'}
          </Text>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Παιδί</Table.Th>
                <Table.Th>Γιατρός</Table.Th>
                <Table.Th>Ημερομηνία</Table.Th>
                <Table.Th>Ώρα</Table.Th>
                <Table.Th>Λόγος</Table.Th>
                <Table.Th>Κατάσταση</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {appointments.map((appointment) => (
                <Table.Tr key={appointment.id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {appointment.childName}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{appointment.doctorName}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {new Date(appointment.appointmentDate).toLocaleDateString('el-GR')}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{appointment.appointmentTime}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {appointment.reason}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" color={getStatusColor(appointment.status)}>
                      {getStatusLabel(appointment.status)}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>

        {showViewAllButton && (
          <Button
            variant="light"
            onClick={() => onViewDetails?.(0)}
          >
            Προβολή όλων των ραντεβού
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

import React from 'react';
import { Stack, Table, Text, Badge, Button, Center, Loader, Paper } from '@mantine/core';
import { IconCalendarEvent, IconCircleCheck } from '@tabler/icons-react';
import type { DoctorAppointment } from '../../types/doctor';

interface AppointmentsTableProps {
  title: string;
  emptyMessage: string;
  appointments: DoctorAppointment[] | null;
  isLoading: boolean;
  onMarkCompleted?: (appointmentId: number) => void;
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

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  title,
  emptyMessage,
  appointments,
  isLoading,
  onMarkCompleted,
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
                <Table.Th>Γονέας</Table.Th>
                <Table.Th>Ημερομηνία</Table.Th>
                <Table.Th>Ώρα</Table.Th>
                <Table.Th>Λόγος</Table.Th>
                <Table.Th>Κατάσταση</Table.Th>
                {onMarkCompleted && <Table.Th />}
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
                    <Text size="sm">{appointment.parentName}</Text>
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
                  {onMarkCompleted && (
                    <Table.Td>
                      {appointment.status === 'SCHEDULED' && (
                        <Button
                          size="xs"
                          variant="light"
                          color="green"
                          leftSection={<IconCircleCheck size={14} />}
                          onClick={() => onMarkCompleted(appointment.id)}
                        >
                          Ολοκλήρωση
                        </Button>
                      )}
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </Stack>
    </Paper>
  );
};

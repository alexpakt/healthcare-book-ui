import React from 'react';
import { Stack, Table, Text, Badge, Button, Center, Loader, Paper, Group } from '@mantine/core';
import { IconCalendarEvent, IconCircleCheck, IconCheck, IconX } from '@tabler/icons-react';
import type { DoctorAppointment } from '../../types/doctor';

interface AppointmentsTableProps {
  title: string;
  emptyMessage: string;
  appointments: DoctorAppointment[] | null;
  isLoading: boolean;
  onMarkCompleted?: (appointmentId: number) => void;
  onAccept?: (appointmentId: number) => void;
  onDecline?: (appointmentId: number) => void;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'REQUESTED':
      return 'orange';
    case 'SCHEDULED':
      return 'blue';
    case 'COMPLETED':
      return 'green';
    case 'DECLINED':
      return 'gray';
    case 'CANCELLED':
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'REQUESTED':
      return 'Σε αναμονή';
    case 'SCHEDULED':
      return 'Προγραμματισμένο';
    case 'COMPLETED':
      return 'Ολοκληρωμένο';
    case 'DECLINED':
      return 'Απορρίφθηκε';
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
  onAccept,
  onDecline,
}) => {
  const showActionsColumn = Boolean(onMarkCompleted || onAccept || onDecline);
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
                {showActionsColumn && <Table.Th />}
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
                    <Text size="sm">
                      {new Date(appointment.appointmentDate).toLocaleTimeString('el-GR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
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
                  {showActionsColumn && (
                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        {appointment.status === 'REQUESTED' && onAccept && (
                          <Button
                            size="xs"
                            variant="light"
                            color="green"
                            leftSection={<IconCheck size={14} />}
                            onClick={() => onAccept(appointment.id)}
                          >
                            Αποδοχή
                          </Button>
                        )}
                        {appointment.status === 'REQUESTED' && onDecline && (
                          <Button
                            size="xs"
                            variant="subtle"
                            color="red"
                            leftSection={<IconX size={14} />}
                            onClick={() => onDecline(appointment.id)}
                          >
                            Απόρριψη
                          </Button>
                        )}
                        {appointment.status === 'SCHEDULED' && onMarkCompleted && (
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
                      </Group>
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

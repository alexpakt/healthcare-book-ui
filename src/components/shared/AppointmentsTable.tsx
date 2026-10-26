import React from 'react';
import { Stack, Table, Text, Button, Center, Loader, Paper, Group } from '@mantine/core';
import { IconCalendarEvent, IconCalendarOff, IconCircleCheck, IconCheck, IconX } from '@tabler/icons-react';
import type { Appointment } from '../../types/parent';
import { formatDate } from '../../utils/dateFormat';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';

type AppointmentRow = Appointment & { parentName?: string };

interface AppointmentsTableProps {
  /** Who is looking at the table: shows the other party's column and decides what can be cancelled */
  viewer: 'parent' | 'doctor';
  title: string;
  emptyMessage: string;
  appointments: AppointmentRow[] | null;
  isLoading: boolean;
  /** Shows a "view all" button under the table */
  onViewAll?: () => void;
  onMarkCompleted?: (appointmentId: number) => void;
  onAccept?: (appointmentId: number) => void;
  onDecline?: (appointmentId: number) => void;
  onCancel?: (appointmentId: number) => void;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  viewer,
  title,
  emptyMessage,
  appointments,
  isLoading,
  onViewAll,
  onMarkCompleted,
  onAccept,
  onDecline,
  onCancel,
}) => {
  const showActionsColumn = Boolean(onMarkCompleted || onAccept || onDecline || onCancel);

  // A doctor answers a request (accept/decline) and cancels only what is scheduled;
  // a parent may also withdraw a request that has not been answered yet.
  const canCancel = (status: Appointment['status']) =>
    status === 'SCHEDULED' || (viewer === 'parent' && status === 'REQUESTED');

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
            {appointments.length} ραντεβού
          </Text>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Παιδί</Table.Th>
                <Table.Th>{viewer === 'doctor' ? 'Γονέας' : 'Γιατρός'}</Table.Th>
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
                    <Text size="sm">
                      {viewer === 'doctor' ? appointment.parentName : appointment.doctorName}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDate(appointment.appointmentDate)}</Text>
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
                    <AppointmentStatusBadge status={appointment.status} />
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
                        {canCancel(appointment.status) && onCancel && (
                          <Button
                            size="xs"
                            variant="subtle"
                            color="red"
                            leftSection={<IconCalendarOff size={14} />}
                            onClick={() => onCancel(appointment.id)}
                          >
                            Ακύρωση
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

        {onViewAll && (
          <Button variant="light" onClick={onViewAll}>
            Προβολή όλων των ραντεβού
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

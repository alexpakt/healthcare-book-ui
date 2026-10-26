import React, { useState } from 'react';
import { Stack, Title, Text, Alert, Button, Pagination, Group, Center, Loader } from '@mantine/core';
import { IconAlertCircle, IconRefresh, IconPlus } from '@tabler/icons-react';
import { useDoctorAppointments } from '../../hooks/useDoctorData';
import { useUpdateAppointmentStatus } from '../../hooks/useAppointmentData';
import { AppointmentsTable } from '../shared/AppointmentsTable';
import { NewAppointmentForm } from '../doctor/NewAppointmentForm';
import { useAppointmentStatusAction } from '../../hooks/useAppointmentStatusAction';

const PAGE_SIZE = 10;

export const DoctorAppointments: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useDoctorAppointments(page, PAGE_SIZE);
  const updateStatus = useUpdateAppointmentStatus();
  const [formOpened, setFormOpened] = useState(false);
  const { actionError, clearActionError, runStatusUpdate } = useAppointmentStatusAction(updateStatus.mutate, refetch);

  const handleMarkCompleted = (appointmentId: number) => runStatusUpdate(appointmentId, 'COMPLETED');
  const handleAccept = (appointmentId: number) => runStatusUpdate(appointmentId, 'SCHEDULED');
  const handleDecline = (appointmentId: number) => runStatusUpdate(appointmentId, 'DECLINED');
  const handleCancel = (appointmentId: number) => runStatusUpdate(appointmentId, 'CANCELLED');

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Title order={2}>Όλα τα Ραντεβού</Title>
        <Text c="dimmed">Πλήρης λίστα των ραντεβού σας</Text>
      </Stack>

      {actionError && (
        <Alert color="red" title="Η ενέργεια απέτυχε" withCloseButton onClose={clearActionError}>
          {actionError}
        </Alert>
      )}

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          title="Σφάλμα κατά τη φόρτωση δεδομένων"
        >
          <Stack gap="sm">
            <Text size="sm">Σφάλμα φόρτωσης δεδομένων. Παρακαλώ δοκιμάστε ξανά.</Text>
            <Button size="xs" onClick={refetch} leftSection={<IconRefresh size={14} />} variant="light">
              Δοκιμάστε ξανά
            </Button>
          </Stack>
        </Alert>
      )}

      <div>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setFormOpened(true)}>
          Νέο Ραντεβού
        </Button>
      </div>

      {loading && !data ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : (
        <>
          <AppointmentsTable
            viewer="doctor"
            title="Ραντεβού"
            emptyMessage="Δεν υπάρχουν ραντεβού"
            appointments={data?.content || null}
            isLoading={loading}
            onMarkCompleted={handleMarkCompleted}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onCancel={handleCancel}
          />

          {data && data.totalPages > 1 && (
            <Group justify="center">
              <Pagination value={page} onChange={setPage} total={data.totalPages} />
            </Group>
          )}
        </>
      )}

      <NewAppointmentForm
        opened={formOpened}
        onClose={() => setFormOpened(false)}
        onSuccess={() => {
          setFormOpened(false);
          refetch();
        }}
      />
    </Stack>
  );
};

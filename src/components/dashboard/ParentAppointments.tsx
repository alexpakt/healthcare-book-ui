import React, { useState } from 'react';
import { Stack, Title, Text, Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconRefresh, IconPlus } from '@tabler/icons-react';
import { useAppointments, useUpdateAppointmentStatus } from '../../hooks/useAppointmentData';
import { AppointmentsTable } from '../shared/AppointmentsTable';
import { AppointmentRequestForm } from '../parent/AppointmentRequestForm';
import { useAppointmentStatusAction } from '../../hooks/useAppointmentStatusAction';

export const ParentAppointments: React.FC = () => {
  const { data, loading, error, refetch } = useAppointments();
  const updateStatus = useUpdateAppointmentStatus();
  const [formOpened, setFormOpened] = useState(false);
  const { actionError, clearActionError, runStatusUpdate } = useAppointmentStatusAction(updateStatus.mutate, refetch);

  const handleCancel = (appointmentId: number) => runStatusUpdate(appointmentId, 'CANCELLED');

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Title order={2}>Όλα τα Ραντεβού</Title>
        <Text c="dimmed">Τα ραντεβού των παιδιών σας</Text>
      </Stack>

      {actionError && (
        <Alert color="red" title="Η ακύρωση απέτυχε" withCloseButton onClose={clearActionError}>
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
          Αίτημα Ραντεβού
        </Button>
      </div>

      <AppointmentsTable
        viewer="parent"
        title="Ραντεβού"
        emptyMessage="Δεν υπάρχουν ραντεβού"
        appointments={data}
        isLoading={loading}
        onCancel={handleCancel}
      />

      <AppointmentRequestForm
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

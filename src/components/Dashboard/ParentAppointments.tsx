import React, { useState } from 'react';
import { Stack, Title, Text, Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconRefresh, IconPlus } from '@tabler/icons-react';
import { useParentAppointments, useParentUpdateAppointmentStatus } from '../../hooks/useParentData';
import { UpcomingAppointments } from '../Parent/UpcomingAppointments';
import { AppointmentRequestForm } from '../Parent/AppointmentRequestForm';

export const ParentAppointments: React.FC = () => {
  const { data, loading, error, refetch } = useParentAppointments();
  const updateStatus = useParentUpdateAppointmentStatus();
  const [formOpened, setFormOpened] = useState(false);

  const handleCancel = async (appointmentId: number) => {
    await updateStatus.mutate({ appointmentId, status: 'CANCELLED' });
    refetch();
  };

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Title order={2}>Όλα τα Ραντεβού</Title>
        <Text c="dimmed">Τα ραντεβού των παιδιών σας</Text>
      </Stack>

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

      <UpcomingAppointments
        title="Ραντεβού"
        emptyMessage="Δεν υπάρχουν ραντεβού"
        appointments={data}
        isLoading={loading}
        showViewAllButton={false}
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

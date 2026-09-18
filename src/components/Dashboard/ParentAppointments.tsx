import React from 'react';
import { Stack, Title, Text, Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { useParentAppointments } from '../../hooks/useParentData';
import { UpcomingAppointments } from '../Parent/UpcomingAppointments';

export const ParentAppointments: React.FC = () => {
  const { data, loading, error, refetch } = useParentAppointments();

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Όλα τα Ραντεβού</Title>
        <Text c="dimmed">Τα ραντεβού των παιδιών σας</Text>
      </div>

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

      <UpcomingAppointments
        title="Ραντεβού"
        emptyMessage="Δεν υπάρχουν ραντεβού"
        appointments={data}
        isLoading={loading}
        showViewAllButton={false}
      />
    </Stack>
  );
};

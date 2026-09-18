import React, { useState } from 'react';
import { Stack, Title, Text, Alert, Button, Pagination, Group, Center, Loader } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { useDoctorAppointments, useDoctorUpdateAppointmentStatus } from '../../hooks/useDoctorData';
import { AppointmentsTable } from '../Doctor/AppointmentsTable';

const PAGE_SIZE = 10;

export const DoctorAppointments: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useDoctorAppointments(page, PAGE_SIZE);
  const updateStatus = useDoctorUpdateAppointmentStatus();

  const handleMarkCompleted = async (appointmentId: number) => {
    await updateStatus.mutate({ appointmentId, status: 'COMPLETED' });
    refetch();
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Όλα τα Ραντεβού</Title>
        <Text c="dimmed">Πλήρης λίστα των ραντεβού σας</Text>
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

      {loading && !data ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : (
        <>
          <AppointmentsTable
            title="Ραντεβού"
            emptyMessage="Δεν υπάρχουν ραντεβού"
            appointments={data?.content || null}
            isLoading={loading}
            onMarkCompleted={handleMarkCompleted}
          />

          {data && data.totalPages > 1 && (
            <Group justify="center">
              <Pagination value={page} onChange={setPage} total={data.totalPages} />
            </Group>
          )}
        </>
      )}
    </Stack>
  );
};

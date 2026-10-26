import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Title, Text, Tabs, Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { useDoctorDashboard } from '../../hooks/useDoctorData';
import { useUpdateAppointmentStatus } from '../../hooks/useAppointmentData';
import { PatientsList } from '../doctor/PatientsList';
import { AppointmentsTable } from '../doctor/AppointmentsTable';
import { useAppointmentStatusAction } from '../../hooks/useAppointmentStatusAction';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    assignedChildren,
    todayAppointments,
    upcomingAppointments,
    pendingAppointments,
    isLoading,
    error,
    refetch,
  } = useDoctorDashboard();
  const updateStatus = useUpdateAppointmentStatus();
  const { actionError, clearActionError, runStatusUpdate } = useAppointmentStatusAction(updateStatus.mutate, refetch);

  if (!user) {
    return (
      <Stack gap="lg">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Not Authenticated">
          Please log in to view your dashboard.
        </Alert>
      </Stack>
    );
  }

  const handleViewHistory = (childId: number) => {
    navigate(`/patients/${childId}`);
  };

  const handleMarkCompleted = (appointmentId: number) => runStatusUpdate(appointmentId, 'COMPLETED');
  const handleAccept = (appointmentId: number) => runStatusUpdate(appointmentId, 'SCHEDULED');
  const handleDecline = (appointmentId: number) => runStatusUpdate(appointmentId, 'DECLINED');
  const handleCancel = (appointmentId: number) => runStatusUpdate(appointmentId, 'CANCELLED');

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Καλώς ήρθατε, {user.username}!</Title>
        <Text c="dimmed">Διαχειριστείτε τους ασθενείς και τα ραντεβού σας</Text>
      </div>

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

      <Tabs defaultValue="patients" orientation="horizontal">
        <Tabs.List>
          <Tabs.Tab value="patients">Ασθενείς</Tabs.Tab>
          <Tabs.Tab value="today">Σημερινά Ραντεβού</Tabs.Tab>
          <Tabs.Tab value="upcoming">Προσεχή Ραντεβού</Tabs.Tab>
          <Tabs.Tab value="requests">
            Αιτήματα{pendingAppointments && pendingAppointments.length > 0 ? ` (${pendingAppointments.length})` : ''}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="requests" pt="md">
          <AppointmentsTable
            title="Αιτήματα Ραντεβού"
            emptyMessage="Δεν υπάρχουν εκκρεμή αιτήματα"
            appointments={pendingAppointments}
            isLoading={isLoading}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        </Tabs.Panel>

        <Tabs.Panel value="patients" pt="md">
          <PatientsList
            patients={assignedChildren}
            isLoading={isLoading}
            onViewHistory={handleViewHistory}
          />
        </Tabs.Panel>

        <Tabs.Panel value="today" pt="md">
          <AppointmentsTable
            title="Σημερινά Ραντεβού"
            emptyMessage="Δεν έχετε ραντεβού σήμερα"
            appointments={todayAppointments}
            isLoading={isLoading}
            onMarkCompleted={handleMarkCompleted}
            onCancel={handleCancel}
          />
        </Tabs.Panel>

        <Tabs.Panel value="upcoming" pt="md">
          <AppointmentsTable
            title="Προσεχή Ραντεβού"
            emptyMessage="Δεν υπάρχουν προσεχή ραντεβού"
            appointments={upcomingAppointments}
            isLoading={isLoading}
            onCancel={handleCancel}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

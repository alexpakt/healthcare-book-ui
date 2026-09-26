import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Title, Text, Tabs, Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { useDoctorDashboard, useDoctorUpdateAppointmentStatus } from '../../hooks/useDoctorData';
import { QuickStats } from '../doctor/QuickStats';
import { PatientsList } from '../doctor/PatientsList';
import { AppointmentsTable } from '../doctor/AppointmentsTable';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    dashboardData,
    assignedChildren,
    todayAppointments,
    upcomingAppointments,
    pendingAppointments,
    isLoading,
    error,
    refetch,
  } = useDoctorDashboard();
  const updateStatus = useDoctorUpdateAppointmentStatus();

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

  const handleMarkCompleted = async (appointmentId: number) => {
    await updateStatus.mutate({ appointmentId, status: 'COMPLETED' });
    refetch();
  };

  const handleAccept = async (appointmentId: number) => {
    await updateStatus.mutate({ appointmentId, status: 'SCHEDULED' });
    refetch();
  };

  const handleDecline = async (appointmentId: number) => {
    await updateStatus.mutate({ appointmentId, status: 'DECLINED' });
    refetch();
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Καλώς ήρθατε, {user.username}!</Title>
        <Text c="dimmed">Διαχειριστείτε τους ασθενείς και τα ραντεβού σας</Text>
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

      <QuickStats stats={dashboardData?.quickStats || null} isLoading={isLoading} />

      <Tabs defaultValue="patients" orientation="horizontal">
        <Tabs.List>
          <Tabs.Tab value="requests">
            Αιτήματα{pendingAppointments && pendingAppointments.length > 0 ? ` (${pendingAppointments.length})` : ''}
          </Tabs.Tab>
          <Tabs.Tab value="patients">Ασθενείς</Tabs.Tab>
          <Tabs.Tab value="today">Σημερινά Ραντεβού</Tabs.Tab>
          <Tabs.Tab value="upcoming">Προσεχή Ραντεβού</Tabs.Tab>
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
          />
        </Tabs.Panel>

        <Tabs.Panel value="upcoming" pt="md">
          <AppointmentsTable
            title="Προσεχή Ραντεβού"
            emptyMessage="Δεν υπάρχουν προσεχή ραντεβού"
            appointments={upcomingAppointments}
            isLoading={isLoading}
          />
        </Tabs.Panel>
      </Tabs>

      {!isLoading && !error && (
        <Button variant="light" onClick={refetch} leftSection={<IconRefresh size={16} />}>
          Ανανέωση δεδομένων
        </Button>
      )}
    </Stack>
  );
};

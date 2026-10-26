import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Title, Text, Tabs, Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { useParentDashboard } from '../../hooks/useParentData';
import { ChildrenList } from '../parent/ChildrenList';
import { UpcomingAppointments } from '../parent/UpcomingAppointments';
import { DoctorRequestsNotification } from '../parent/DoctorRequestsNotification';
import { ChildRegistrationForm } from '../parent/ChildRegistrationForm';

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [childFormOpened, setChildFormOpened] = useState(false);
  const {
    children,
    appointments,
    isLoading,
    error,
    refetch,
  } = useParentDashboard();

  if (!user) {
    return (
      <Stack gap="lg">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Not Authenticated">
          Please log in to view your dashboard.
        </Alert>
      </Stack>
    );
  }

  const handleAddChild = () => {
    setChildFormOpened(true);
  };

  const handleViewChildDetails = (childId: number) => {
    navigate(`/children/${childId}`);
  };

  const handleViewAllAppointments = () => {
    navigate('/appointments');
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Καλώς ήρθατε!</Title>
        <Text c="dimmed">
          Εδώ μπορείτε να διαχειριστείτε το ηλεκτρονικό αρχείο υγείας των παιδιών σας
        </Text>
      </div>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          title="Σφάλμα κατά τη φόρτωση δεδομένων"
        >
          <Stack gap="sm">
            <Text size="sm">
              Σφάλμα φόρτωσης δεδομένων. Παρακαλώ δοκιμάστε ξανά.
            </Text>
            <Button
              size="xs"
              onClick={refetch}
              leftSection={<IconRefresh size={14} />}
              variant="light"
            >
              Δοκιμάστε ξανά
            </Button>
          </Stack>
        </Alert>
      )}

      <div>
        <DoctorRequestsNotification />
      </div>

      <Tabs defaultValue="children" orientation="horizontal">
        <Tabs.List>
          <Tabs.Tab value="children">
            Τα παιδιά μου
          </Tabs.Tab>
          <Tabs.Tab value="appointments">
            Ραντεβού
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="children" pt="md">
          <ChildrenList
            items={children}
            isLoading={isLoading}
            onViewDetails={handleViewChildDetails}
            onAddChild={handleAddChild}
            showAddButton={false}
          />
        </Tabs.Panel>

        <Tabs.Panel value="appointments" pt="md">
          <UpcomingAppointments
            appointments={appointments as any}
            isLoading={isLoading}
            onViewDetails={handleViewAllAppointments}
          />
        </Tabs.Panel>
      </Tabs>

      <ChildRegistrationForm
        opened={childFormOpened}
        onClose={() => setChildFormOpened(false)}
        onSuccess={() => {
          setChildFormOpened(false);
          refetch();
        }}
      />
    </Stack>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Title, Text, Tabs, Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { useParentDashboard } from '../../hooks/useParentData';
import { ChildrenList } from '../parent/ChildrenList';
import { UpcomingAppointments } from '../parent/UpcomingAppointments';
import { VaccinationReminders } from '../parent/VaccinationReminders';
import { DoctorRequestsNotification } from '../parent/DoctorRequestsNotification';
import { ChildRegistrationForm } from '../parent/ChildRegistrationForm';

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [childFormOpened, setChildFormOpened] = useState(false);
  const {
    children,
    appointments,
    vaccinations,
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

  const handleViewVaccinationHistory = () => {
    // TODO: Navigate to vaccination history page
    console.log('View vaccination history');
  };

  return (
    <Stack gap="lg">
      {/* Welcome Section */}
      <div>
        <Title order={2}>Καλώς ήρθατε!</Title>
        <Text c="dimmed">
          Εδώ μπορείτε να διαχειριστείτε το ηλεκτρονικό αρχείο υγείας των παιδιών σας
        </Text>
      </div>

      {/* Error Alert */}
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

      {/* doctor Requests Notification */}
      <div>
        <DoctorRequestsNotification />
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="children" orientation="horizontal">
        <Tabs.List>
          <Tabs.Tab value="children">
            Τα παιδιά μου
          </Tabs.Tab>
          <Tabs.Tab value="appointments">
            Ραντεβού
          </Tabs.Tab>
          <Tabs.Tab value="vaccinations">
            Εμβολιασμοί
          </Tabs.Tab>
        </Tabs.List>

        {/* Children Tab */}
        <Tabs.Panel value="children" pt="md">
          <ChildrenList
            children={children}
            isLoading={isLoading}
            onViewDetails={handleViewChildDetails}
            onAddChild={handleAddChild}
            showAddButton={false}
          />
        </Tabs.Panel>

        {/* Appointments Tab */}
        <Tabs.Panel value="appointments" pt="md">
          <UpcomingAppointments
            appointments={appointments as any}
            isLoading={isLoading}
            onViewDetails={handleViewAllAppointments}
          />
        </Tabs.Panel>

        {/* Vaccinations Tab */}
        <Tabs.Panel value="vaccinations" pt="md">
          <VaccinationReminders
            vaccinations={vaccinations as any}
            isLoading={isLoading}
            onViewDetails={handleViewVaccinationHistory}
          />
        </Tabs.Panel>
      </Tabs>

      {/* Child Registration Form Modal */}
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

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stack, Title, Text, Tabs, Alert, Button, Paper, Group, Avatar, Badge, Center, Loader } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { getAgeDisplay } from '../../utils/ageCalculator';
import {
  useParentChild,
  useParentChildAppointments,
  useParentChildVaccinations,
  useParentChildMedicalRecords,
  useParentChildAllergies,
  useParentChildGrowthMeasurements,
  useParentUpdateAppointmentStatus,
} from '../../hooks/useParentData';
import { UpcomingAppointments } from '../Parent/UpcomingAppointments';
import { VaccinationStatusWithHistory } from '../Shared/VaccinationStatusWithHistory';
import { MedicalRecordsList } from '../Shared/MedicalRecordsList';
import { AllergiesList } from '../Shared/AllergiesList';
import { GrowthChart } from '../Shared/GrowthChart';
import { GrowthMeasurementsList } from '../Shared/GrowthMeasurementsList';

const getGenderLabel = (gender: string): string => (gender === 'MALE' ? 'Αγόρι' : 'Κορίτσι');

export const ChildDetail: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const id = Number(childId);

  const { data: child, loading: childLoading, error: childError } = useParentChild(id);
  const appointmentsQuery = useParentChildAppointments(id);
  const vaccinationsQuery = useParentChildVaccinations(id);
  const medicalRecordsQuery = useParentChildMedicalRecords(id);
  const allergiesQuery = useParentChildAllergies(id);
  const growthMeasurementsQuery = useParentChildGrowthMeasurements(id);
  const updateStatus = useParentUpdateAppointmentStatus();

  const handleCancelAppointment = async (appointmentId: number) => {
    await updateStatus.mutate({ appointmentId, status: 'CANCELLED' });
    appointmentsQuery.refetch();
  };

  if (childLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (childError || !child) {
    return (
      <Stack gap="lg">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα">
          Δεν ήταν δυνατή η φόρτωση των στοιχείων του παιδιού.
        </Alert>
        <Button
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/children')}
        >
          Επιστροφή
        </Button>
      </Stack>
    );
  }

  const ageDisplay = getAgeDisplay(child.dateOfBirth);
  const initials = `${child.firstName.charAt(0)}${child.lastName.charAt(0)}`.toUpperCase();

  return (
    <Stack gap="lg">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => navigate('/children')}
        style={{ alignSelf: 'flex-start' }}
      >
        Πίσω στα παιδιά μου
      </Button>

      <Paper p="md" radius="md" withBorder>
        <Group>
          <Avatar size="xl" radius="md" color="blue">
            {initials}
          </Avatar>
          <Stack gap={4}>
            <Title order={2}>
              {child.firstName} {child.lastName}
            </Title>
            <Text c="dimmed">
              {ageDisplay} • {getGenderLabel(child.gender)}
            </Text>
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                Γεννήθηκε: {new Date(child.dateOfBirth).toLocaleDateString('el-GR')}
              </Text>
              {child.bloodType && <Badge size="sm">{child.bloodType}</Badge>}
            </Group>
            <Text size="sm" c="dimmed">
              AMKA: <strong>{child.amka}</strong>
            </Text>
          </Stack>
        </Group>
      </Paper>

      <Tabs defaultValue="appointments" orientation="horizontal">
        <Tabs.List>
          <Tabs.Tab value="appointments">Ραντεβού</Tabs.Tab>
          <Tabs.Tab value="vaccinations">Εμβολιασμοί</Tabs.Tab>
          <Tabs.Tab value="medical-records">Ιατρικό Ιστορικό</Tabs.Tab>
          <Tabs.Tab value="allergies">Αλλεργίες</Tabs.Tab>
          <Tabs.Tab value="growth">Ανάπτυξη</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="appointments" pt="md">
          <UpcomingAppointments
            title="Ραντεβού"
            emptyMessage="Δεν υπάρχουν ραντεβού για αυτό το παιδί"
            appointments={appointmentsQuery.data}
            isLoading={appointmentsQuery.loading}
            showViewAllButton={false}
            onCancel={handleCancelAppointment}
          />
        </Tabs.Panel>

        <Tabs.Panel value="vaccinations" pt="md">
          <VaccinationStatusWithHistory
            child={child}
            vaccinations={vaccinationsQuery.data}
            isLoading={vaccinationsQuery.loading}
          />
        </Tabs.Panel>

        <Tabs.Panel value="medical-records" pt="md">
          <MedicalRecordsList
            records={medicalRecordsQuery.data}
            isLoading={medicalRecordsQuery.loading}
          />
        </Tabs.Panel>

        <Tabs.Panel value="allergies" pt="md">
          <AllergiesList allergies={allergiesQuery.data} isLoading={allergiesQuery.loading} />
        </Tabs.Panel>

        <Tabs.Panel value="growth" pt="md">
          <Stack gap="lg">
            <GrowthChart
              measurements={growthMeasurementsQuery.data}
              isLoading={growthMeasurementsQuery.loading}
              childName={`${child?.firstName} ${child?.lastName}`}
              childId={id}
            />
            <GrowthMeasurementsList
              measurements={growthMeasurementsQuery.data}
              isLoading={growthMeasurementsQuery.loading}
            />
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

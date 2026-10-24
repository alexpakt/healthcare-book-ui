import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import { Stack, Title, Text, Tabs, Alert, Button, Paper, Group, Avatar, Badge, Center, Loader } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconEdit } from '@tabler/icons-react';
import { getAgeDisplay } from '../../utils/ageCalculator';
import {
  useParentChild,
  useParentChildAppointments,
  useParentChildVaccinations,
  useParentChildMedicalRecords,
  useParentChildAllergies,
  useParentChildGrowthMeasurements,
  useParentChildBirthRecord,
  useParentUpdateAppointmentStatus,
} from '../../hooks/useParentData';
import { UpcomingAppointments } from '../parent/UpcomingAppointments';
import { AppointmentRequestForm } from '../parent/AppointmentRequestForm';
import { VaccinationStatusWithHistory } from '../shared/VaccinationStatusWithHistory';
import type { DoseSelection } from '../shared/VaccinationStatusGrid';
import { useAppointmentStatusAction } from '../../hooks/useAppointmentStatusAction';
import { useVaccinationSchedules } from '../../hooks/useVaccinationCatalog';
import { MedicalRecordsList } from '../shared/MedicalRecordsList';
import { AllergiesList } from '../shared/AllergiesList';
import { GrowthChart } from '../shared/GrowthChart';
import { GrowthMeasurementsList } from '../shared/GrowthMeasurementsList';
import { BirthRecordCard } from '../shared/BirthRecordCard';
import { ChildRegistrationForm } from '../parent/ChildRegistrationForm';
import { formatDate } from '../../utils/dateFormat';

const getGenderLabel = (gender: string): string => (gender === 'MALE' ? 'Αγόρι' : 'Κορίτσι');

export const ChildDetail: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const id = Number(childId);

  const { data: child, loading: childLoading, error: childError, refetch: refetchChild } = useParentChild(id);
  const [editOpened, setEditOpened] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 48em)');
  const appointmentsQuery = useParentChildAppointments(id);
  const vaccinationsQuery = useParentChildVaccinations(id);
  const medicalRecordsQuery = useParentChildMedicalRecords(id);
  const allergiesQuery = useParentChildAllergies(id);
  const growthMeasurementsQuery = useParentChildGrowthMeasurements(id);
  const birthRecordQuery = useParentChildBirthRecord(id);
  const schedulesQuery = useVaccinationSchedules();
  const updateStatus = useParentUpdateAppointmentStatus();
  const [bookingDose, setBookingDose] = useState<DoseSelection | null>(null);
  const { actionError, clearActionError, runStatusUpdate } = useAppointmentStatusAction(
    updateStatus.mutate,
    appointmentsQuery.refetch
  );

  const handleCancelAppointment = (appointmentId: number) => runStatusUpdate(appointmentId, 'CANCELLED');

  const handleDoseClick = (dose: DoseSelection) => {
    setBookingDose(dose);
  };

  const handleBookingSuccess = async () => {
    setBookingDose(null);
    await appointmentsQuery.refetch();
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

      {actionError && (
        <Alert color="red" title="Η ακύρωση απέτυχε" withCloseButton onClose={clearActionError}>
          {actionError}
        </Alert>
      )}

      <Paper p="md" radius="md" withBorder>
        <Stack gap="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
          <Group wrap="nowrap" gap="md" style={{ flex: 1, minWidth: 0 }}>
            <Avatar size={isDesktop ? 'xl' : 'lg'} radius="md" color="blue" style={{ flexShrink: 0 }}>
              {initials}
            </Avatar>
            <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
              <Title
                order={2}
                fz={{ base: 'h4', sm: 'h2' }}
                style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {child.firstName} {child.lastName}
              </Title>
              <Text c="dimmed">
                {ageDisplay} • {getGenderLabel(child.gender)}
              </Text>
              <Text size="sm" c="dimmed">
                Γεννήθηκε: {formatDate(child.dateOfBirth)}
              </Text>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  Ομάδα αίματος:
                </Text>
                {child.bloodType ? (
                  <Badge size="sm">{child.bloodType}</Badge>
                ) : (
                  <Text size="sm" c="dimmed">
                    Δεν έχει καταχωρηθεί
                  </Text>
                )}
              </Group>
              <Text size="sm" c="dimmed">
                AMKA: <strong>{child.amka}</strong>
              </Text>
            </Stack>
          </Group>
          <Button
            variant="light"
            size="compact-sm"
            leftSection={<IconEdit size={14} />}
            onClick={() => setEditOpened(true)}
            style={{ flexShrink: 0 }}
            visibleFrom="sm"
          >
            Επεξεργασία
          </Button>
        </Group>
        <Button
          variant="light"
          size="compact-sm"
          leftSection={<IconEdit size={14} />}
          onClick={() => setEditOpened(true)}
          hiddenFrom="sm"
        >
          Επεξεργασία
        </Button>
        </Stack>
      </Paper>

      <ChildRegistrationForm
        opened={editOpened}
        child={child}
        onClose={() => setEditOpened(false)}
        onSuccess={refetchChild}
      />

      <AppointmentRequestForm
        opened={bookingDose !== null}
        onClose={() => setBookingDose(null)}
        onSuccess={handleBookingSuccess}
        initialChildId={id}
        initialReason={
          bookingDose
            ? `Εμβολιασμός: ${bookingDose.vaccineName} (${bookingDose.recommendedAgeMonths}μ)`
            : undefined
        }
      />

      <Tabs defaultValue="appointments" orientation="horizontal">
        <Tabs.List>
          <Tabs.Tab value="appointments">Ραντεβού</Tabs.Tab>
          <Tabs.Tab value="vaccinations">Εμβολιασμοί</Tabs.Tab>
          <Tabs.Tab value="medical-records">Ιατρικό Ιστορικό</Tabs.Tab>
          <Tabs.Tab value="allergies">Αλλεργίες</Tabs.Tab>
          <Tabs.Tab value="growth">Ανάπτυξη</Tabs.Tab>
          <Tabs.Tab value="birth">Δεδομένα Γέννησης</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="birth" pt="md">
          {birthRecordQuery.loading && !birthRecordQuery.data ? (
            <Center py="xl">
              <Loader />
            </Center>
          ) : birthRecordQuery.data ? (
            <BirthRecordCard record={birthRecordQuery.data} showEditButton={false} />
          ) : (
            <Alert icon={<IconAlertCircle size={16} />} color="blue" title="Χωρίς δεδομένα">
              Δεν υπάρχουν δεδομένα γέννησης για αυτό το παιδί.
            </Alert>
          )}
        </Tabs.Panel>

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
            schedules={schedulesQuery.data}
            appointments={appointmentsQuery.data}
            viewerRole="PARENT"
            isLoading={vaccinationsQuery.loading}
            schedulesError={!!schedulesQuery.error}
            onDoseClick={handleDoseClick}
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

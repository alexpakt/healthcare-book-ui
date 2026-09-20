import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stack, Title, Text, Tabs, Alert, Button, Center, Loader, Group } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconPlus } from '@tabler/icons-react';
import {
  useDoctorPatientMedicalHistory,
  useDoctorChildGrowthMeasurements,
  useDoctorCreateGrowthMeasurement,
} from '../../hooks/useDoctorData';
import { MedicalRecordsList } from '../Shared/MedicalRecordsList';
import { ChildVaccinationsList } from '../Shared/ChildVaccinationsList';
import { AllergiesList } from '../Shared/AllergiesList';
import { GrowthChart } from '../Shared/GrowthChart';
import { GrowthMeasurementsList } from '../Shared/GrowthMeasurementsList';
import { MedicalRecordForm } from '../Doctor/MedicalRecordForm';
import { GrowthMeasurementForm, type GrowthMeasurementFormData } from '../Doctor/GrowthMeasurementForm';
import type { MedicalHistory } from '../../types/doctor';

export const PatientHistory: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const id = Number(childId);

  const { data, loading, error, refetch } = useDoctorPatientMedicalHistory(id);
  const growthMeasurementsQuery = useDoctorChildGrowthMeasurements(id);
  const { mutate: createGrowthMeasurement, loading: growthFormLoading, error: growthError } = useDoctorCreateGrowthMeasurement();

  const [formOpened, setFormOpened] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalHistory | null>(null);
  const [growthFormOpened, setGrowthFormOpened] = useState(false);

  const handleAddRecord = () => {
    setEditingRecord(null);
    setFormOpened(true);
  };

  const handleEditRecord = (record: MedicalHistory) => {
    setEditingRecord(record);
    setFormOpened(true);
  };

  const handleAddGrowthMeasurement = async (formData: GrowthMeasurementFormData) => {
    try {
      await createGrowthMeasurement(formData);
      await growthMeasurementsQuery.refetch();
      setGrowthFormOpened(false);
    } catch (err) {
      console.error('Error creating growth measurement:', err);
    }
  };

  if (loading && !data) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error || !data) {
    return (
      <Stack gap="lg">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα">
          Δεν ήταν δυνατή η φόρτωση του ιατρικού ιστορικού.
        </Alert>
        <Button variant="light" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/')}>
          Επιστροφή στο ταμπλό
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => navigate('/')}
        style={{ alignSelf: 'flex-start' }}
      >
        Πίσω στο ταμπλό
      </Button>

      <div>
        <Title order={2}>{data.childName}</Title>
        <Text c="dimmed">Ιατρικό ιστορικό ασθενή</Text>
      </div>

      <Tabs defaultValue="records" orientation="horizontal">
        <Tabs.List>
          <Tabs.Tab value="records">Ιατρικό Ιστορικό</Tabs.Tab>
          <Tabs.Tab value="vaccinations">Εμβολιασμοί</Tabs.Tab>
          <Tabs.Tab value="allergies">Αλλεργίες</Tabs.Tab>
          <Tabs.Tab value="growth">Ανάπτυξη</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="records" pt="md">
          <Stack gap="md">
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleAddRecord}
              style={{ alignSelf: 'flex-start' }}
            >
              Νέο Ιατρικό Αρχείο
            </Button>
            <MedicalRecordsList records={data.medicalRecords} isLoading={false} onEdit={handleEditRecord} />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="vaccinations" pt="md">
          <ChildVaccinationsList vaccinations={data.vaccinations} isLoading={false} />
        </Tabs.Panel>

        <Tabs.Panel value="allergies" pt="md">
          <AllergiesList allergies={data.allergies} isLoading={false} />
        </Tabs.Panel>

        <Tabs.Panel value="growth" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Ανάπτυξη</Title>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setGrowthFormOpened(true)}
                size="sm"
              >
                Νέα μέτρηση
              </Button>
            </Group>
            <GrowthChart
              measurements={growthMeasurementsQuery.data}
              isLoading={growthMeasurementsQuery.loading}
              childName={data.childName}
              childId={id}
            />
            <GrowthMeasurementsList
              measurements={growthMeasurementsQuery.data}
              isLoading={growthMeasurementsQuery.loading}
            />
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <MedicalRecordForm
        opened={formOpened}
        childId={id}
        editRecord={editingRecord}
        onClose={() => setFormOpened(false)}
        onSuccess={() => {
          setFormOpened(false);
          refetch();
        }}
      />

      <GrowthMeasurementForm
        opened={growthFormOpened}
        childId={id}
        childName={data?.childName || ''}
        onClose={() => setGrowthFormOpened(false)}
        onSubmit={handleAddGrowthMeasurement}
        isLoading={growthFormLoading}
        error={growthError?.message || null}
      />
    </Stack>
  );
};

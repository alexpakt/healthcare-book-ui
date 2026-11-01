import React, { useState } from 'react';
import { Alert, Button, Center, Group, Loader, Stack, Title } from '@mantine/core';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import {
  useDoctorCreateAllergy,
  useDoctorCreateBirthRecord,
  useDoctorCreateGrowthMeasurement,
  useDoctorDeleteAllergy,
  useDoctorUpdateAllergy,
  useDoctorUpdateBirthRecord,
} from '../../hooks/useDoctorData';
import {
  useChildAllergies,
  useChildBirthRecord,
  useChildGrowthMeasurements,
  useChildMedicalRecords,
  useChildVaccinations,
} from '../../hooks/useChildData';
import { useChildAppointments } from '../../hooks/useAppointmentData';
import { useVaccinationSchedules } from '../../hooks/useVaccinationCatalog';
import { MedicalRecordsList } from '../shared/MedicalRecordsList';
import { AllergiesList } from '../shared/AllergiesList';
import { GrowthChart } from '../shared/GrowthChart';
import { GrowthMeasurementsList } from '../shared/GrowthMeasurementsList';
import { GrowthAlertCard } from '../doctor/GrowthAlertCard';
import { BirthRecordCard } from '../shared/BirthRecordCard';
import { VaccinationStatusWithHistory } from '../shared/VaccinationStatusWithHistory';
import type { DoseSelection } from '../shared/VaccinationStatusGrid';
import { MedicalRecordForm } from '../doctor/MedicalRecordForm';
import { GrowthMeasurementForm, type GrowthMeasurementFormData } from '../doctor/GrowthMeasurementForm';
import { AllergyForm, type AllergyFormData } from '../doctor/AllergyForm';
import { NewVaccinationForm } from '../doctor/NewVaccinationForm';
import { BirthRecordForm, type BirthRecordFormData } from '../doctor/BirthRecordForm';
import { DoseActionDialog } from '../doctor/DoseActionDialog';
import { NewAppointmentForm } from '../doctor/NewAppointmentForm';
import type { MedicalHistory } from '../../types/doctor';
import type { AllergyRecord, Child } from '../../types/parent';

export const RecordsTab: React.FC<{ childId: number; dateOfBirth: string }> = ({ childId, dateOfBirth }) => {
  const { user } = useAuth();
  const records = useChildMedicalRecords(childId);
  const [formOpened, setFormOpened] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalHistory | null>(null);

  const handleAdd = () => {
    setEditingRecord(null);
    setFormOpened(true);
  };

  const handleEdit = (record: MedicalHistory) => {
    setEditingRecord(record);
    setFormOpened(true);
  };

  return (
    <Stack gap="md">
      <Button leftSection={<IconPlus size={16} />} onClick={handleAdd} style={{ alignSelf: 'flex-start' }}>
        Νέο Ιατρικό Αρχείο
      </Button>
      <MedicalRecordsList
        records={records.data}
        isLoading={records.loading}
        onEdit={handleEdit}
        canEdit={(record) => record.doctorId === user?.profileId}
      />

      <MedicalRecordForm
        opened={formOpened}
        childId={childId}
        childDateOfBirth={dateOfBirth}
        editRecord={editingRecord}
        onClose={() => setFormOpened(false)}
        onSuccess={() => {
          setFormOpened(false);
          records.refetch();
        }}
      />
    </Stack>
  );
};

export const VaccinationsTab: React.FC<{ child: Child }> = ({ child }) => {
  const childName = `${child.firstName} ${child.lastName}`;
  const vaccinations = useChildVaccinations(child.id);
  const schedules = useVaccinationSchedules();
  const appointments = useChildAppointments(child.id);
  const [formOpened, setFormOpened] = useState(false);
  const [recordVaccineName, setRecordVaccineName] = useState<string | undefined>(undefined);
  const [doseAction, setDoseAction] = useState<DoseSelection | null>(null);
  const [bookingOpened, setBookingOpened] = useState(false);
  const [bookingReason, setBookingReason] = useState<string | undefined>(undefined);

  const handleRecordFromDose = () => {
    if (!doseAction) return;
    setRecordVaccineName(doseAction.vaccineName);
    setFormOpened(true);
    setDoseAction(null);
  };

  const handleScheduleFromDose = () => {
    if (!doseAction) return;
    setBookingReason(`Εμβολιασμός: ${doseAction.vaccineName} (${doseAction.recommendedAgeMonths}μ)`);
    setBookingOpened(true);
    setDoseAction(null);
  };

  return (
    <Stack gap="md">
      <Button
        leftSection={<IconPlus size={16} />}
        onClick={() => {
          setRecordVaccineName(undefined);
          setFormOpened(true);
        }}
        style={{ alignSelf: 'flex-start' }}
      >
        Νέος Εμβολιασμός
      </Button>
      <VaccinationStatusWithHistory
        child={child}
        vaccinations={vaccinations.data}
        schedules={schedules.data}
        appointments={appointments.data}
        viewerRole="DOCTOR"
        isLoading={vaccinations.loading}
        schedulesError={!!schedules.error}
        onDoseClick={setDoseAction}
      />

      <NewVaccinationForm
        opened={formOpened}
        childId={child.id}
        childName={childName}
        childDateOfBirth={child.dateOfBirth}
        schedules={schedules.data}
        vaccinations={vaccinations.data}
        initialVaccineName={recordVaccineName}
        onClose={() => setFormOpened(false)}
        onSuccess={() => {
          setFormOpened(false);
          vaccinations.refetch();
        }}
      />

      <DoseActionDialog
        opened={doseAction !== null}
        onClose={() => setDoseAction(null)}
        vaccineLabel={doseAction?.vaccineNameGr ?? ''}
        doseLabel={doseAction?.doseNumber != null ? `Δόση ${doseAction.doseNumber}` : 'Δόση'}
        canSchedule={doseAction?.status !== 'SCHEDULED'}
        onRecord={handleRecordFromDose}
        onSchedule={handleScheduleFromDose}
      />

      <NewAppointmentForm
        opened={bookingOpened}
        childId={child.id}
        reason={bookingReason}
        onClose={() => setBookingOpened(false)}
        onSuccess={() => {
          setBookingOpened(false);
          appointments.refetch();
        }}
      />
    </Stack>
  );
};

export const AllergiesTab: React.FC<{ childId: number; childName: string; dateOfBirth: string }> = ({
  childId,
  childName,
  dateOfBirth,
}) => {
  const allergies = useChildAllergies(childId);
  const { mutate: createAllergy, loading: createLoading, error: createError } = useDoctorCreateAllergy();
  const { mutate: updateAllergy, loading: updateLoading } = useDoctorUpdateAllergy();
  const { mutate: deleteAllergy } = useDoctorDeleteAllergy();
  const [formOpened, setFormOpened] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<AllergyRecord | null>(null);

  const handleAdd = () => {
    setEditingAllergy(null);
    setFormOpened(true);
  };

  const handleEdit = (allergy: AllergyRecord) => {
    setEditingAllergy(allergy);
    setFormOpened(true);
  };

  const handleSave = async (formData: AllergyFormData) => {
    try {
      if (editingAllergy) {
        await updateAllergy({ allergyId: editingAllergy.id, request: formData });
      } else {
        await createAllergy({ childId, request: formData });
      }
      await allergies.refetch();
      setFormOpened(false);
      setEditingAllergy(null);
    } catch (err) {
      console.error('Error saving allergy:', err);
    }
  };

  const handleDelete = async (allergyId: number) => {
    if (confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την αλλεργία;')) {
      try {
        await deleteAllergy(allergyId);
        await allergies.refetch();
      } catch (err) {
        console.error('Error deleting allergy:', err);
      }
    }
  };

  return (
    <Stack gap="md">
      <Button leftSection={<IconPlus size={16} />} onClick={handleAdd} style={{ alignSelf: 'flex-start' }}>
        Νέα Αλλεργία
      </Button>
      <AllergiesList
        allergies={allergies.data}
        isLoading={allergies.loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AllergyForm
        opened={formOpened}
        onClose={() => {
          setFormOpened(false);
          setEditingAllergy(null);
        }}
        childName={childName}
        childDateOfBirth={dateOfBirth}
        onSubmit={handleSave}
        isLoading={createLoading || updateLoading}
        error={createError?.message || null}
        initialData={editingAllergy || undefined}
      />
    </Stack>
  );
};

export const GrowthTab: React.FC<{ childId: number; childName: string; dateOfBirth: string }> = ({
  childId,
  childName,
  dateOfBirth,
}) => {
  const measurements = useChildGrowthMeasurements(childId);
  const { mutate: createMeasurement, loading, error } = useDoctorCreateGrowthMeasurement();
  const [formOpened, setFormOpened] = useState(false);

  const handleAdd = async (formData: GrowthMeasurementFormData) => {
    try {
      await createMeasurement(formData);
      await measurements.refetch();
      setFormOpened(false);
    } catch (err) {
      console.error('Error creating growth measurement:', err);
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>Ανάπτυξη</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setFormOpened(true)} size="sm">
          Νέα μέτρηση
        </Button>
      </Group>
      <GrowthAlertCard childId={childId} />
      <GrowthChart
        measurements={measurements.data}
        isLoading={measurements.loading}
        childName={childName}
        childId={childId}
        dateOfBirth={dateOfBirth}
      />
      <GrowthMeasurementsList measurements={measurements.data} isLoading={measurements.loading} />

      <GrowthMeasurementForm
        opened={formOpened}
        childId={childId}
        childName={childName}
        childDateOfBirth={dateOfBirth}
        onClose={() => setFormOpened(false)}
        onSubmit={handleAdd}
        isLoading={loading}
        error={error?.message || null}
      />
    </Stack>
  );
};

export const BirthTab: React.FC<{ childId: number; childName: string }> = ({ childId, childName }) => {
  const birthRecord = useChildBirthRecord(childId);
  const { mutate: createBirthRecord, loading: createLoading, error } = useDoctorCreateBirthRecord();
  const { mutate: updateBirthRecord, loading: updateLoading } = useDoctorUpdateBirthRecord();
  const [formOpened, setFormOpened] = useState(false);

  const handleSave = async (formData: BirthRecordFormData) => {
    try {
      if (birthRecord.data) {
        await updateBirthRecord({ childId, request: formData });
      } else {
        await createBirthRecord(formData);
      }
      await birthRecord.refetch();
      setFormOpened(false);
    } catch (err) {
      console.error('Error saving birth record:', err);
    }
  };

  const content =
    birthRecord.loading && !birthRecord.data ? (
      <Center py="xl">
        <Loader />
      </Center>
    ) : birthRecord.data ? (
      <BirthRecordCard record={birthRecord.data} onEdit={() => setFormOpened(true)} showEditButton={true} />
    ) : (
      <Stack gap="md">
        <Alert icon={<IconAlertCircle size={16} />} color="blue" title="Χωρίς δεδομένα">
          Δεν υπάρχουν δεδομένα γέννησης για αυτό το παιδί. Κάντε κλικ στο κουμπί παρακάτω για να προσθέσετε.
        </Alert>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setFormOpened(true)}
          style={{ alignSelf: 'flex-start' }}
        >
          Προσθήκη δεδομένων γέννησης
        </Button>
      </Stack>
    );

  return (
    <Stack gap="md">
      {content}

      <BirthRecordForm
        opened={formOpened}
        childId={childId}
        childName={childName}
        onClose={() => setFormOpened(false)}
        onSubmit={handleSave}
        isLoading={createLoading || updateLoading}
        error={error?.message || null}
        existingRecord={birthRecord.data || null}
      />
    </Stack>
  );
};

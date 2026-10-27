import React, { useState } from 'react';
import { Alert, Center, Loader, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import {
  useChildAllergies,
  useChildBirthRecord,
  useChildGrowthMeasurements,
  useChildMedicalRecords,
  useChildVaccinations,
} from '../../hooks/useChildData';
import { useChildAppointments, useUpdateAppointmentStatus } from '../../hooks/useAppointmentData';
import { useAppointmentStatusAction } from '../../hooks/useAppointmentStatusAction';
import { useVaccinationSchedules } from '../../hooks/useVaccinationCatalog';
import { AppointmentsTable } from '../shared/AppointmentsTable';
import { AppointmentRequestForm } from '../parent/AppointmentRequestForm';
import { VaccinationStatusWithHistory } from '../shared/VaccinationStatusWithHistory';
import type { DoseSelection } from '../shared/VaccinationStatusGrid';
import { MedicalRecordsList } from '../shared/MedicalRecordsList';
import { AllergiesList } from '../shared/AllergiesList';
import { GrowthChart } from '../shared/GrowthChart';
import { GrowthMeasurementsList } from '../shared/GrowthMeasurementsList';
import { BirthRecordCard } from '../shared/BirthRecordCard';
import type { Child } from '../../types/parent';

export const AppointmentsTab: React.FC<{ childId: number }> = ({ childId }) => {
  const appointments = useChildAppointments(childId);
  const updateStatus = useUpdateAppointmentStatus();
  const { actionError, clearActionError, runStatusUpdate } = useAppointmentStatusAction(
    updateStatus.mutate,
    appointments.refetch
  );

  return (
    <Stack gap="md">
      {actionError && (
        <Alert color="red" title="Η ακύρωση απέτυχε" withCloseButton onClose={clearActionError}>
          {actionError}
        </Alert>
      )}
      <AppointmentsTable
        viewer="parent"
        title="Ραντεβού"
        emptyMessage="Δεν υπάρχουν ραντεβού για αυτό το παιδί"
        appointments={appointments.data}
        isLoading={appointments.loading}
        onCancel={(appointmentId) => runStatusUpdate(appointmentId, 'CANCELLED')}
      />
    </Stack>
  );
};

export const VaccinationsTab: React.FC<{ child: Child }> = ({ child }) => {
  const vaccinations = useChildVaccinations(child.id);
  const schedules = useVaccinationSchedules();
  const appointments = useChildAppointments(child.id);
  const [bookingDose, setBookingDose] = useState<DoseSelection | null>(null);

  const handleBookingSuccess = async () => {
    setBookingDose(null);
    await appointments.refetch();
  };

  return (
    <>
      <VaccinationStatusWithHistory
        child={child}
        vaccinations={vaccinations.data}
        schedules={schedules.data}
        appointments={appointments.data}
        viewerRole="PARENT"
        isLoading={vaccinations.loading}
        schedulesError={!!schedules.error}
        onDoseClick={setBookingDose}
      />

      <AppointmentRequestForm
        opened={bookingDose !== null}
        onClose={() => setBookingDose(null)}
        onSuccess={handleBookingSuccess}
        initialChildId={child.id}
        initialReason={
          bookingDose
            ? `Εμβολιασμός: ${bookingDose.vaccineName} (${bookingDose.recommendedAgeMonths}μ)`
            : undefined
        }
      />
    </>
  );
};

export const MedicalRecordsTab: React.FC<{ childId: number }> = ({ childId }) => {
  const records = useChildMedicalRecords(childId);
  return <MedicalRecordsList records={records.data} isLoading={records.loading} />;
};

export const AllergiesTab: React.FC<{ childId: number }> = ({ childId }) => {
  const allergies = useChildAllergies(childId);
  return <AllergiesList allergies={allergies.data} isLoading={allergies.loading} />;
};

export const GrowthTab: React.FC<{ child: Child }> = ({ child }) => {
  const measurements = useChildGrowthMeasurements(child.id);
  return (
    <Stack gap="lg">
      <GrowthChart
        measurements={measurements.data}
        isLoading={measurements.loading}
        childName={`${child.firstName} ${child.lastName}`}
        childId={child.id}
        dateOfBirth={child.dateOfBirth}
      />
      <GrowthMeasurementsList measurements={measurements.data} isLoading={measurements.loading} />
    </Stack>
  );
};

export const BirthTab: React.FC<{ childId: number }> = ({ childId }) => {
  const birthRecord = useChildBirthRecord(childId);

  if (birthRecord.loading && !birthRecord.data) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (birthRecord.data) {
    return <BirthRecordCard record={birthRecord.data} showEditButton={false} />;
  }

  return (
    <Alert icon={<IconAlertCircle size={16} />} color="blue" title="Χωρίς δεδομένα">
      Δεν υπάρχουν δεδομένα γέννησης για αυτό το παιδί.
    </Alert>
  );
};


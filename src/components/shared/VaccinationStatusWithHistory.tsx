import React from 'react';
import { Stack, Tabs } from '@mantine/core';
import type { Appointment, VaccinationRecord, VaccinationSchedule, Child } from '../../types/parent';
import { VaccinationStatusGrid } from './VaccinationStatusGrid';
import type { DoseSelection, ViewerRole } from './VaccinationStatusGrid';
import { ChildVaccinationsList } from './ChildVaccinationsList';
import { useVaccinationStatus } from '../../hooks/useVaccinationStatus';

interface VaccinationStatusWithHistoryProps {
  child: Child;
  vaccinations: VaccinationRecord[] | null;
  schedules: VaccinationSchedule[] | null;
  appointments: Appointment[] | null;
  viewerRole: ViewerRole;
  isLoading?: boolean;
  schedulesError?: boolean;
  onDoseClick?: (dose: DoseSelection) => void;
}

export const VaccinationStatusWithHistory: React.FC<VaccinationStatusWithHistoryProps> = ({
  child,
  vaccinations,
  schedules,
  appointments,
  viewerRole,
  isLoading = false,
  schedulesError = false,
  onDoseClick,
}) => {
  const { ageInMonths } = useVaccinationStatus({ child, vaccinations });

  return (
    <Stack gap="md">
      <Tabs defaultValue="status" orientation="horizontal">
        <Tabs.List>
          <Tabs.Tab value="status">Κατάσταση Εμβολιασμών</Tabs.Tab>
          <Tabs.Tab value="history">Ιστορικό Εμβολιασμών</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="status" pt="md">
          <VaccinationStatusGrid
            ageInMonths={ageInMonths}
            schedules={schedules}
            vaccinations={vaccinations}
            appointments={appointments}
            viewerRole={viewerRole}
            isLoading={isLoading}
            loadError={schedulesError}
            onDoseClick={onDoseClick}
          />
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="md">
          <ChildVaccinationsList vaccinations={vaccinations} isLoading={isLoading} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

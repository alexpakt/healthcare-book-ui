import React from 'react';
import { Stack, Tabs } from '@mantine/core';
import type { VaccinationRecord, Child } from '../../types/parent';
import { VaccinationStatusGrid } from './VaccinationStatusGrid';
import { ChildVaccinationsList } from './ChildVaccinationsList';
import { useVaccinationStatus } from '../../hooks/useVaccinationStatus';

interface VaccinationStatusWithHistoryProps {
  child: Child;
  vaccinations: VaccinationRecord[] | null;
  isLoading?: boolean;
}

export const VaccinationStatusWithHistory: React.FC<VaccinationStatusWithHistoryProps> = ({
  child,
  vaccinations,
  isLoading = false,
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
            vaccinations={vaccinations}
            childId={child.id}
            isLoading={isLoading}
          />
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="md">
          <ChildVaccinationsList vaccinations={vaccinations} isLoading={isLoading} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

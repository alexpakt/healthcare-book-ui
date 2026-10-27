import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stack, Tabs, Alert, Button, Center, Loader, Group, Badge, Text } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { useChild } from '../../hooks/useChildData';
import { useVisitedTabs } from '../../hooks/useVisitedTabs';
import { PatientCard } from '../shared/PatientCard';
import { AllergiesTab, BirthTab, GrowthTab, RecordsTab, VaccinationsTab } from './PatientHistoryTabs';

export const PatientHistory: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const id = Number(childId);

  const { data: child, loading, error } = useChild(id);
  const { active, onChange, visited } = useVisitedTabs('records');

  if (loading && !child) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error || !child) {
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

  const childName = `${child.firstName} ${child.lastName}`;

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

      <PatientCard
        child={child}
        showAmka={true}
        footer={
          child.bloodType ? (
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                Ομάδα αίματος:
              </Text>
              <Badge size="sm">{child.bloodType}</Badge>
            </Group>
          ) : undefined
        }
      />

      <Tabs value={active} onChange={onChange} orientation="horizontal" keepMountedMode="display-none">
        <Tabs.List>
          <Tabs.Tab value="records">Ιατρικό Ιστορικό</Tabs.Tab>
          <Tabs.Tab value="vaccinations">Εμβολιασμοί</Tabs.Tab>
          <Tabs.Tab value="allergies">Αλλεργίες</Tabs.Tab>
          <Tabs.Tab value="growth">Ανάπτυξη</Tabs.Tab>
          <Tabs.Tab value="birth">Δεδομένα Γέννησης</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="records" pt="md">
          {visited.has('records') && <RecordsTab childId={id} dateOfBirth={child.dateOfBirth} />}
        </Tabs.Panel>

        <Tabs.Panel value="vaccinations" pt="md">
          {visited.has('vaccinations') && <VaccinationsTab child={child} />}
        </Tabs.Panel>

        <Tabs.Panel value="allergies" pt="md">
          {visited.has('allergies') && (
            <AllergiesTab childId={id} childName={childName} dateOfBirth={child.dateOfBirth} />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="growth" pt="md">
          {visited.has('growth') && <GrowthTab childId={id} childName={childName} dateOfBirth={child.dateOfBirth} />}
        </Tabs.Panel>

        <Tabs.Panel value="birth" pt="md">
          {visited.has('birth') && <BirthTab childId={id} childName={childName} />}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

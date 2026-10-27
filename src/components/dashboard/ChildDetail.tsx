import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import { Stack, Title, Text, Tabs, Alert, Button, Paper, Group, Avatar, Badge, Center, Loader } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconEdit } from '@tabler/icons-react';
import { getAgeDisplay } from '../../utils/ageCalculator';
import { useChild } from '../../hooks/useChildData';
import { useVisitedTabs } from '../../hooks/useVisitedTabs';
import {
  AllergiesTab,
  AppointmentsTab,
  BirthTab,
  GrowthTab,
  MedicalRecordsTab,
  VaccinationsTab,
} from './ChildDetailTabs';
import { ChildRegistrationForm } from '../parent/ChildRegistrationForm';
import { formatDate } from '../../utils/dateFormat';

const getGenderLabel = (gender: string): string => (gender === 'MALE' ? 'Αγόρι' : 'Κορίτσι');

export const ChildDetail: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const id = Number(childId);

  const { data: child, loading: childLoading, error: childError, refetch: refetchChild } = useChild(id);
  const [editOpened, setEditOpened] = useState(false);
  const { active, onChange, visited } = useVisitedTabs('appointments');
  const isDesktop = useMediaQuery('(min-width: 48em)');

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

      <Tabs value={active} onChange={onChange} orientation="horizontal" keepMountedMode="display-none">
        <Tabs.List>
          <Tabs.Tab value="appointments">Ραντεβού</Tabs.Tab>
          <Tabs.Tab value="vaccinations">Εμβολιασμοί</Tabs.Tab>
          <Tabs.Tab value="medical-records">Ιατρικό Ιστορικό</Tabs.Tab>
          <Tabs.Tab value="allergies">Αλλεργίες</Tabs.Tab>
          <Tabs.Tab value="growth">Ανάπτυξη</Tabs.Tab>
          <Tabs.Tab value="birth">Δεδομένα Γέννησης</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="appointments" pt="md">
          {visited.has('appointments') && <AppointmentsTab childId={id} />}
        </Tabs.Panel>

        <Tabs.Panel value="vaccinations" pt="md">
          {visited.has('vaccinations') && <VaccinationsTab child={child} />}
        </Tabs.Panel>

        <Tabs.Panel value="medical-records" pt="md">
          {visited.has('medical-records') && <MedicalRecordsTab childId={id} />}
        </Tabs.Panel>

        <Tabs.Panel value="allergies" pt="md">
          {visited.has('allergies') && <AllergiesTab childId={id} />}
        </Tabs.Panel>

        <Tabs.Panel value="growth" pt="md">
          {visited.has('growth') && <GrowthTab child={child} />}
        </Tabs.Panel>

        <Tabs.Panel value="birth" pt="md">
          {visited.has('birth') && <BirthTab childId={id} />}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

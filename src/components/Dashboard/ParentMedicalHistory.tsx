import React, { useEffect, useState } from 'react';
import { Stack, Title, Text, Alert, Button, Grid, Center, Loader } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconRefresh } from '@tabler/icons-react';
import {
  useParentChildren,
  useParentChild,
  useParentChildMedicalRecords,
} from '../../hooks/useParentData';
import { ChildCard } from '../Parent/ChildCard';
import { MedicalRecordsList } from '../Shared/MedicalRecordsList';

interface ChildMedicalHistoryProps {
  childId: number;
  onBack?: () => void;
}

const ChildMedicalHistory: React.FC<ChildMedicalHistoryProps> = ({ childId, onBack }) => {
  const { data: child } = useParentChild(childId);
  const { data: records, loading, error, refetch } = useParentChildMedicalRecords(childId);

  return (
    <Stack gap="lg">
      {onBack && (
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={onBack}
          style={{ alignSelf: 'flex-start' }}
        >
          Επιλογή άλλου παιδιού
        </Button>
      )}

      <Stack gap="xs">
        <Title order={2}>Ιατρικό Ιστορικό</Title>
        {child && <Text c="dimmed">{child.firstName} {child.lastName}</Text>}
      </Stack>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          title="Σφάλμα κατά τη φόρτωση δεδομένων"
        >
          <Stack gap="sm">
            <Text size="sm">Σφάλμα φόρτωσης δεδομένων. Παρακαλώ δοκιμάστε ξανά.</Text>
            <Button size="xs" onClick={refetch} leftSection={<IconRefresh size={14} />} variant="light">
              Δοκιμάστε ξανά
            </Button>
          </Stack>
        </Alert>
      )}

      <MedicalRecordsList records={records} isLoading={loading} />
    </Stack>
  );
};

export const ParentMedicalHistory: React.FC = () => {
  const { data: children, loading, error } = useParentChildren();
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  useEffect(() => {
    if (children && children.length === 1 && selectedChildId === null) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα">
        Δεν ήταν δυνατή η φόρτωση των παιδιών σας.
      </Alert>
    );
  }

  if (selectedChildId !== null) {
    return (
      <ChildMedicalHistory
        childId={selectedChildId}
        onBack={children && children.length > 1 ? () => setSelectedChildId(null) : undefined}
      />
    );
  }

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Title order={2}>Ιατρικό Ιστορικό</Title>
        <Text c="dimmed">Επιλέξτε παιδί για να δείτε το ιατρικό του ιστορικό</Text>
      </Stack>

      {!children || children.length === 0 ? (
        <Text c="dimmed">Δεν έχετε καταχωρημένα παιδιά</Text>
      ) : (
        <Grid>
          {children.map((child) => (
            <Grid.Col key={child.id} span={{ base: 12, sm: 6, md: 4 }}>
              <ChildCard
                child={child}
                onViewDetails={setSelectedChildId}
                actionLabel="Προβολή ιστορικού"
              />
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Stack>
  );
};

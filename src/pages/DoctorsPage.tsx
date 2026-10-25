import React, { useState } from 'react';
import { Stack, Title, Text, Alert, Button, Group, Select, Switch } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DoctorsTable } from '../components/parent/DoctorsTable';
import { useDirectoryDoctors } from '../hooks/useDirectoryData';
import { useParentChildDoctors, useParentChildren } from '../hooks/useParentData';

const DoctorsPage: React.FC = () => {
  const { data: doctors, loading: doctorsLoading, error, refetch } = useDirectoryDoctors();
  const { data: children, loading: childrenLoading } = useParentChildren();
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  // Connected-only is the default state, so the parent sees the doctors the child is linked to.
  const [onlyConnected, setOnlyConnected] = useState(true);

  const hasChildren = (children?.length ?? 0) > 0;
  const activeChildId = selectedChildId ?? children?.[0]?.id;
  const { data: connectedDoctors, loading: connectedLoading } = useParentChildDoctors(
    hasChildren ? activeChildId : undefined
  );

  const showConnectedOnly = onlyConnected && hasChildren;
  const visibleDoctors = showConnectedOnly ? connectedDoctors : doctors;
  const isLoading = childrenLoading || doctorsLoading || (showConnectedOnly && connectedLoading);

  return (
    <DashboardLayout>
      <Stack gap="lg">
        <Title order={2}>Ιατροί</Title>

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

        {hasChildren ? (
          <Group align="flex-end" gap="lg">
            {children!.length > 1 && (
              <Select
                label="Παιδί"
                allowDeselect={false}
                data={children!.map((child) => ({
                  value: String(child.id),
                  label: `${child.firstName} ${child.lastName}`,
                }))}
                value={activeChildId ? String(activeChildId) : null}
                onChange={(value) => value && setSelectedChildId(Number(value))}
              />
            )}
            <Switch
              label="Μόνο οι συνδεδεμένοι ιατροί"
              checked={onlyConnected}
              onChange={(event) => setOnlyConnected(event.currentTarget.checked)}
            />
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            Δεν έχετε καταχωρημένα παιδιά. Εμφανίζονται όλοι οι ιατροί.
          </Text>
        )}

        <DoctorsTable
          doctors={visibleDoctors ?? null}
          isLoading={isLoading}
          emptyMessage={
            showConnectedOnly
              ? 'Δεν υπάρχει συνδεδεμένος ιατρός για αυτό το παιδί. Απενεργοποιήστε το φίλτρο για να δείτε όλους τους ιατρούς.'
              : undefined
          }
        />
      </Stack>
    </DashboardLayout>
  );
};

export default DoctorsPage;

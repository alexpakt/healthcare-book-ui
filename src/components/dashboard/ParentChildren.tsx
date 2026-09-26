import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Title, Text, Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { useParentChildren } from '../../hooks/useParentData';
import { ChildrenList } from '../parent/ChildrenList';
import { ChildRegistrationForm } from '../parent/ChildRegistrationForm';

export const ParentChildren: React.FC = () => {
  const navigate = useNavigate();
  const [childFormOpened, setChildFormOpened] = useState(false);
  const { data, loading, error, refetch } = useParentChildren();

  const handleViewDetails = (childId: number) => {
    navigate(`/children/${childId}`);
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Τα Παιδιά μου</Title>
        <Text c="dimmed">Διαχειριστείτε τα προφίλ των παιδιών σας</Text>
      </div>

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

      <ChildrenList
        children={data}
        isLoading={loading}
        onViewDetails={handleViewDetails}
        onAddChild={() => setChildFormOpened(true)}
      />

      <ChildRegistrationForm
        opened={childFormOpened}
        onClose={() => setChildFormOpened(false)}
        onSuccess={() => {
          setChildFormOpened(false);
          refetch();
        }}
      />
    </Stack>
  );
};

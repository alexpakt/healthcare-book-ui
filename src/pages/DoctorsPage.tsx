import React from 'react';
import { Stack, Title, Text, Alert, Button } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DoctorsTable } from '../components/parent/DoctorsTable';
import { useDirectoryDoctors } from '../hooks/useDirectoryData';

const DoctorsPage: React.FC = () => {
  const { data: doctors, loading: isLoading, error, refetch } = useDirectoryDoctors();

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

        <DoctorsTable doctors={doctors} isLoading={isLoading} />
      </Stack>
    </DashboardLayout>
  );
};

export default DoctorsPage;

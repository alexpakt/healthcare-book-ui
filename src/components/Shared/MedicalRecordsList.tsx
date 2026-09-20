import React from 'react';
import { Stack, Text, Center, Loader, Paper, Group, Divider, Button } from '@mantine/core';
import { IconFileDescription, IconEdit } from '@tabler/icons-react';
import type { MedicalRecord } from '../../types/parent';

interface MedicalRecordsListProps {
  records: MedicalRecord[] | null;
  isLoading: boolean;
  onEdit?: (record: MedicalRecord) => void;
}

export const MedicalRecordsList: React.FC<MedicalRecordsListProps> = ({
  records,
  isLoading,
  onEdit,
}) => {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!records || records.length === 0) {
    return (
      <Paper p="md" radius="md" withBorder>
        <Center py="xl">
          <Stack align="center" gap="md">
            <IconFileDescription size={40} color="var(--mantine-color-gray-3)" />
            <Text c="dimmed">Δεν υπάρχουν ιατρικά αρχεία</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  const sorted = [...records].sort(
    (a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
  );

  return (
    <Stack gap="md">
      {sorted.map((record) => (
        <Paper key={record.id} p="md" radius="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={600}>{record.diagnosis}</Text>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  {new Date(record.recordDate).toLocaleDateString('el-GR')}
                </Text>
                {onEdit && (
                  <Button
                    size="xs"
                    variant="subtle"
                    leftSection={<IconEdit size={14} />}
                    onClick={() => onEdit(record)}
                  >
                    Επεξεργασία
                  </Button>
                )}
              </Group>
            </Group>
            <Text size="sm" c="dimmed">
              Γιατρός: {record.doctorName}
            </Text>
            {record.prescription && (
              <>
                <Divider />
                <div>
                  <Text size="sm" fw={500}>
                    Συνταγή
                  </Text>
                  <Text size="sm">{record.prescription}</Text>
                </div>
              </>
            )}
            {record.notes && (
              <>
                <Divider />
                <div>
                  <Text size="sm" fw={500}>
                    Σημειώσεις
                  </Text>
                  <Text size="sm" c="dimmed">
                    {record.notes}
                  </Text>
                </div>
              </>
            )}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};

import React from 'react';
import { Stack, Text, Badge, Center, Loader, Paper, Group, Button } from '@mantine/core';
import { IconAlertTriangle, IconEdit, IconTrash } from '@tabler/icons-react';
import type { AllergyRecord } from '../../types/parent';

interface AllergiesListProps {
  allergies: AllergyRecord[] | null;
  isLoading: boolean;
  onEdit?: (allergy: AllergyRecord) => void;
  onDelete?: (allergyId: number) => void;
}

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'SEVERE':
      return 'red';
    case 'MODERATE':
      return 'orange';
    case 'MILD':
      return 'yellow';
    default:
      return 'gray';
  }
};

const getSeverityLabel = (severity: string): string => {
  switch (severity) {
    case 'SEVERE':
      return 'Σοβαρή';
    case 'MODERATE':
      return 'Μέτρια';
    case 'MILD':
      return 'Ελαφρά';
    default:
      return severity;
  }
};

export const AllergiesList: React.FC<AllergiesListProps> = ({
  allergies,
  isLoading,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!allergies || allergies.length === 0) {
    return (
      <Paper p="md" radius="md" withBorder>
        <Center py="xl">
          <Stack align="center" gap="md">
            <IconAlertTriangle size={40} color="var(--mantine-color-gray-3)" />
            <Text c="dimmed">Δεν έχουν καταχωρηθεί αλλεργίες</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      {allergies.map((allergy) => (
        <Paper key={allergy.id} p="md" radius="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={600}>{allergy.allergen}</Text>
              <Group gap="xs">
                <Badge size="sm" color={getSeverityColor(allergy.severity)}>
                  {getSeverityLabel(allergy.severity)}
                </Badge>
                {(onEdit || onDelete) && (
                  <Group gap={4}>
                    {onEdit && (
                      <Button
                        size="xs"
                        variant="default"
                        onClick={() => onEdit(allergy)}
                        leftSection={<IconEdit size={14} />}
                      >
                        Επεξεργασία
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="xs"
                        variant="default"
                        color="red"
                        onClick={() => onDelete(allergy.id)}
                        leftSection={<IconTrash size={14} />}
                      >
                        Διαγραφή
                      </Button>
                    )}
                  </Group>
                )}
              </Group>
            </Group>
            {allergy.reaction && (
              <Text size="sm" c="dimmed">
                Αντίδραση: {allergy.reaction}
              </Text>
            )}
            <Text size="sm" c="dimmed">
              Διαγνώστηκε: {new Date(allergy.diagnosedDate).toLocaleDateString('el-GR')}
            </Text>
            {allergy.notes && <Text size="sm">{allergy.notes}</Text>}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};

import React from 'react';
import { Card, Text, Badge, Group, Stack, Button, Avatar } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { getAgeDisplay } from '../../utils/ageCalculator';
import type { AssignedChild } from '../../types/doctor';

interface PatientCardProps {
  patient: AssignedChild;
  onViewHistory?: (childId: number) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, onViewHistory }) => {
  const ageDisplay = getAgeDisplay(patient.dateOfBirth);
  const fullName = `${patient.firstName} ${patient.lastName}`;
  const initials = `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`.toUpperCase();

  return (
    <Card p="md" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="md">
        <Group justify="space-between">
          <Group gap="md">
            <Avatar size="lg" radius="md" color="teal">
              {initials}
            </Avatar>
            <Stack gap={4}>
              <Text fw={600} size="lg">
                {fullName}
              </Text>
              <Text size="sm" c="dimmed">
                {ageDisplay}
              </Text>
            </Stack>
          </Group>
          <Badge size="sm" color={patient.status === 'ACTIVE' ? 'green' : 'gray'}>
            {patient.status === 'ACTIVE' ? 'Ενεργός' : 'Ανενεργός'}
          </Badge>
        </Group>
      </Card.Section>

      <Card.Section inheritPadding py="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Γονέας:
            </Text>
            <Text size="sm">{patient.parentName}</Text>
          </Group>
        </Stack>
      </Card.Section>

      <Card.Section inheritPadding py="md">
        <Button
          fullWidth
          variant="light"
          color="teal"
          rightSection={<IconArrowRight size={14} />}
          onClick={() => onViewHistory?.(patient.id)}
        >
          Ιατρικό ιστορικό
        </Button>
      </Card.Section>
    </Card>
  );
};

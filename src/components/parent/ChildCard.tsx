import React from 'react';
import { Card, Text, Badge, Group, Stack, Button, Avatar } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { getAgeDisplay } from '../../utils/ageCalculator';
import type { Child } from '../../types/parent';
import { formatDate } from '../../utils/dateFormat';

interface ChildCardProps {
  child: Child;
  onViewDetails?: (childId: number) => void;
  actionLabel?: string;
}

const getGenderLabel = (gender: string): string => {
  return gender === 'MALE' ? 'Αγόρι' : 'Κορίτσι';
};

export const ChildCard: React.FC<ChildCardProps> = ({
  child,
  onViewDetails,
  actionLabel = 'Περισσότερες πληροφορίες',
}) => {
  const ageDisplay = getAgeDisplay(child.dateOfBirth);
  const genderLabel = getGenderLabel(child.gender);

  const fullName = `${child.firstName} ${child.lastName}`;
  const initials = `${child.firstName.charAt(0)}${child.lastName.charAt(0)}`.toUpperCase();

  return (
    <Card p="md" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="md">
        <Group justify="space-between">
          <Group gap="md">
            <Avatar
              size="lg"
              radius="md"
              color="blue"
              src={child.profilePictureUrl}
            >
              {initials}
            </Avatar>
            <Stack gap={4}>
              <Text fw={600} size="lg">
                {fullName}
              </Text>
              <Text size="sm" c="dimmed">
                {ageDisplay} • {genderLabel}
              </Text>
            </Stack>
          </Group>
        </Group>
      </Card.Section>

      <Card.Section inheritPadding py="md">
        <Stack gap="sm">
          {child.bloodType && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Ομάδα αίματος:
              </Text>
              <Badge size="sm">{child.bloodType}</Badge>
            </Group>
          )}
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Γεννήθηκε:
            </Text>
            <Text size="sm">
              {formatDate(child.dateOfBirth)}
            </Text>
          </Group>
        </Stack>
      </Card.Section>

      <Card.Section inheritPadding py="md">
        <Button
          fullWidth
          variant="light"
          rightSection={<IconArrowRight size={14} />}
          onClick={() => onViewDetails?.(child.id)}
        >
          {actionLabel}
        </Button>
      </Card.Section>
    </Card>
  );
};

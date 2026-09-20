import React from 'react';
import { Card, Text, Badge, Group, Stack, Button, Avatar } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import type { Child } from '../../types/parent';

interface ChildCardProps {
  child: Child;
  onViewDetails?: (childId: number) => void;
  actionLabel?: string;
}

const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

const getGenderLabel = (gender: string): string => {
  return gender === 'MALE' ? 'Αγόρι' : 'Κορίτσι';
};

export const ChildCard: React.FC<ChildCardProps> = ({
  child,
  onViewDetails,
  actionLabel = 'Περισσότερες πληροφορίες',
}) => {
  const age = calculateAge(child.dateOfBirth);
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
                {age} {age === 1 ? 'ετών' : 'ετών'} • {genderLabel}
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
              {new Date(child.dateOfBirth).toLocaleDateString('el-GR')}
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

import React from 'react';
import { Card, Text, Group, Stack, Avatar } from '@mantine/core';
import { getAgeDisplay } from '../../utils/ageCalculator';
import type { ChildRecord } from '../../services/childService';

interface PatientCardProps {
  child: ChildRecord;
  showAmka?: boolean;
  footer?: React.ReactNode;
}

const getGenderLabel = (gender: string): string => {
  return gender === 'MALE' ? 'Αγόρι' : 'Κορίτσι';
};

export const PatientCard: React.FC<PatientCardProps> = ({ child, showAmka = false, footer }) => {
  const ageDisplay = getAgeDisplay(child.dateOfBirth);
  const genderLabel = getGenderLabel(child.gender);
  const fullName = `${child.firstName} ${child.lastName}`;
  const initials = `${child.firstName.charAt(0)}${child.lastName.charAt(0)}`.toUpperCase();

  return (
    <Card p="md" radius="md" withBorder>
      <Group gap="md" align="flex-start">
        <Avatar
          size="lg"
          radius="md"
          color="blue"
          src={child.profilePictureUrl}
        >
          {initials}
        </Avatar>

        <Stack gap="xs" style={{ flex: 1 }}>
          <div>
            <Text fw={600} size="lg">
              {fullName}
            </Text>
            <Text size="sm" c="dimmed">
              {ageDisplay} • {genderLabel}
            </Text>
          </div>

          <Text size="sm" c="dimmed">
            Γεννήθηκε: {new Date(child.dateOfBirth).toLocaleDateString('el-GR')}
          </Text>

          {footer}

          {showAmka && child.amka && (
            <Text size="sm" c="dimmed">
              ΑΜΚΑ: <Text component="span" fw={500}>{child.amka}</Text>
            </Text>
          )}
        </Stack>
      </Group>
    </Card>
  );
};

import React from 'react';
import { Modal, Button, Group, Stack, Text } from '@mantine/core';

interface DoseActionDialogProps {
  opened: boolean;
  onClose: () => void;
  vaccineLabel: string;
  doseLabel: string;
  canSchedule: boolean;
  onRecord: () => void;
  onSchedule: () => void;
}

export const DoseActionDialog: React.FC<DoseActionDialogProps> = ({
  opened,
  onClose,
  vaccineLabel,
  doseLabel,
  canSchedule,
  onRecord,
  onSchedule,
}) => (
  <Modal opened={opened} onClose={onClose} title="Δόση εμβολιασμού" size="sm" centered>
    <Stack gap="md">
      <Text size="sm">
        <strong>{vaccineLabel}</strong> — {doseLabel}
      </Text>
      <Group justify="flex-end">
        <Button variant="light" onClick={onClose}>
          Ακύρωση
        </Button>
        {canSchedule && (
          <Button variant="light" onClick={onSchedule}>
            Κλείσιμο ραντεβού
          </Button>
        )}
        <Button onClick={onRecord}>Καταχώρηση δόσης</Button>
      </Group>
    </Stack>
  </Modal>
);

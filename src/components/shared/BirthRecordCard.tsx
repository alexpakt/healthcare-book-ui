import React from 'react';
import { Card, Group, Stack, Text, Button, Grid } from '@mantine/core';
import { IconEdit, IconAlertCircle } from '@tabler/icons-react';
import type { BirthRecord } from '../../types/parent';

interface BirthRecordCardProps {
  record: BirthRecord;
  onEdit?: () => void;
  showEditButton?: boolean;
}

const DELIVERY_TYPE_LABELS: Record<string, string> = {
  VAGINAL: 'Κολπικός',
  CESAREAN: 'Καισαρική τομή',
  VAGINAL_ASSISTED: 'Κολπικός με βοήθεια',
};

export const BirthRecordCard: React.FC<BirthRecordCardProps> = ({
  record,
  onEdit,
  showEditButton = false,
}) => {
  return (
    <Card withBorder radius="md" p="md" className="birth-record-card">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={600} size="lg">
              Δεδομένα Γέννησης
            </Text>
            <Text size="sm" c="dimmed">
              {record.childName}
            </Text>
          </div>
          {showEditButton && onEdit && (
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconEdit size={16} />}
              onClick={onEdit}
            >
              Επεξεργασία
            </Button>
          )}
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <div>
              <Text size="xs" c="dimmed" fw={500}>
                Βάρος Γέννησης
              </Text>
              <Text fw={600}>{record.birthWeightGrams}g</Text>
            </div>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <div>
              <Text size="xs" c="dimmed" fw={500}>
                Μήκος Γέννησης
              </Text>
              <Text fw={600}>{record.birthLengthCm}cm</Text>
            </div>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <div>
              <Text size="xs" c="dimmed" fw={500}>
                Περίμετρος Κεφαλής
              </Text>
              <Text fw={600}>{record.birthHeadCircumferenceCm}cm</Text>
            </div>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <div>
              <Text size="xs" c="dimmed" fw={500}>
                Εβδομάδες Εγκυμοσύνης
              </Text>
              <Text fw={600}>{record.gestationalAgeWeeks}w</Text>
            </div>
          </Grid.Col>
        </Grid>

        <div>
          <Text size="xs" c="dimmed" fw={500}>
            Τύπος τοκετού
          </Text>
          <Text fw={600}>{DELIVERY_TYPE_LABELS[record.deliveryType] || record.deliveryType}</Text>
        </div>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <div>
              <Text size="xs" c="dimmed" fw={500}>
                Σκορ Apgar 1 Λεπτού
              </Text>
              <Text fw={600}>{record.apgarScore1Min}/10</Text>
            </div>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <div>
              <Text size="xs" c="dimmed" fw={500}>
                Σκορ Apgar 5 Λεπτών
              </Text>
              <Text fw={600}>{record.apgarScore5Min}/10</Text>
            </div>
          </Grid.Col>
        </Grid>

        {record.birthHospital && (
          <div>
            <Text size="xs" c="dimmed" fw={500}>
              Νοσοκομείο Γέννησης
            </Text>
            <Text>{record.birthHospital}</Text>
          </div>
        )}

        {record.nicuAdmission && (
          <div style={{ backgroundColor: '#fff3bf', padding: '0.75rem', borderRadius: '0.375rem' }}>
            <Group gap="xs" align="flex-start">
              <IconAlertCircle size={18} style={{ color: '#f59f00', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={600}>
                  Εισαγωγή σε ΜΕΝΝ
                </Text>
                {record.nicuDurationDays && (
                  <Text size="sm">Διάρκεια: {record.nicuDurationDays} ημέρες</Text>
                )}
              </div>
            </Group>
          </div>
        )}

        {record.notes && (
          <div>
            <Text size="xs" c="dimmed" fw={500}>
              Σημειώσεις
            </Text>
            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
              {record.notes}
            </Text>
          </div>
        )}
      </Stack>
    </Card>
  );
};

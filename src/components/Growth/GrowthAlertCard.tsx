import React, { useState } from 'react';
import { Alert, Badge, Button, Group, Paper, Stack, Text, TextInput, Loader, Center } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import type { GrowthAlert } from '../../types/growthAlert';
import { useGrowthAlerts, useAcknowledgeGrowthAlert } from '../../hooks/useGrowthAlerts';
import { formatDate } from '../../utils/dateFormat';

interface GrowthAlertCardProps {
  childId: number;
}

const measurementLabel = (type: GrowthAlert['measurementType']): string => {
  switch (type) {
    case 'HEIGHT':
      return 'Ύψος';
    case 'WEIGHT':
      return 'Βάρος';
    case 'HEAD_CIRCUMFERENCE':
      return 'Περίμετρος κεφαλής';
    default:
      return type;
  }
};

const describe = (alert: GrowthAlert): string => {
  const period = `από ${formatDate(alert.fromDate)} έως ${formatDate(alert.toDate)}`;
  const label = measurementLabel(alert.measurementType);

  if (!alert.crossedLines?.length) {
    return `${label}: μετατόπιση ${alert.bandShift} ζωνών percentile ${period}.`;
  }

  const direction = alert.direction === 'DOWN' ? 'κάτω από' : 'πάνω από';
  const lines = alert.crossedLines.map((line) => `${line}η`).join(' και ');
  return `${label}: η τιμή πέρασε ${direction} την ${lines} εκατοστιαία ${period}.`;
};

export const GrowthAlertCard: React.FC<GrowthAlertCardProps> = ({ childId }) => {
  const alertsQuery = useGrowthAlerts(childId);
  const { mutate: acknowledge, loading: acknowledging } = useAcknowledgeGrowthAlert();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [expandedOverride, setExpandedOverride] = useState<boolean | null>(null);

  const handleAcknowledge = async (alertKey: string) => {
    setActionError(null);
    try {
      await acknowledge({ childId, alertKey, note: notes[alertKey] });
      await alertsQuery.refetch();
      setExpandedOverride(null);
    } catch (err) {
      console.error('Error acknowledging growth alert:', err);
      setActionError('Η καταχώριση της ειδοποίησης απέτυχε. Δοκιμάστε ξανά.');
    }
  };

  if (alertsQuery.loading) {
    return (
      <Center py="md">
        <Loader size="sm" />
      </Center>
    );
  }

  if (alertsQuery.error) {
    return (
      <Alert color="red" icon={<IconAlertTriangle size={16} />} title="Οι ειδοποιήσεις δεν φορτώθηκαν">
        {alertsQuery.error.message}
      </Alert>
    );
  }

  const alerts = alertsQuery.data ?? [];
  if (alerts.length === 0) {
    return null;
  }

  const pendingCount = alerts.filter((alert) => !alert.acknowledged).length;
  const expanded = expandedOverride ?? pendingCount > 0;

  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs">
            <IconAlertTriangle size={18} color="var(--mantine-color-orange-6)" />
            <Text fw={600}>Ειδοποιήσεις ανάπτυξης</Text>
            <Badge color={pendingCount > 0 ? 'orange' : 'green'} variant="light">
              {pendingCount > 0 ? `${pendingCount} ΠΡΟΣ ΑΞΙΟΛΟΓΗΣΗ` : 'ΟΛΕΣ ΑΞΙΟΛΟΓΗΜΕΝΕΣ'}
            </Badge>
          </Group>
          <Button
            size="xs"
            variant="subtle"
            rightSection={expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
            onClick={() => setExpandedOverride(!expanded)}
          >
            {expanded ? 'Απόκρυψη' : 'Εμφάνιση'}
          </Button>
        </Group>

        {!expanded && (
          <Text size="xs" c="dimmed">
            {alerts.length === 1 ? '1 ειδοποίηση' : `${alerts.length} ειδοποιήσεις`}
          </Text>
        )}

        {expanded && (
          <>
        <Text size="xs" c="dimmed">
          Για κλινική αξιολόγηση. Δεν αποτελεί διάγνωση.
        </Text>

        {actionError && (
          <Alert color="red" title="Σφάλμα">
            {actionError}
          </Alert>
        )}

        {alerts.map((alert) => (
          <Paper key={alert.alertKey} p="sm" radius="sm" withBorder>
            <Stack gap={6}>
              <Text size="sm">{describe(alert)}</Text>

              {alert.acknowledged ? (
                <Group gap="xs">
                  <Badge color="green" leftSection={<IconCheck size={12} />}>
                    Αξιολογήθηκε
                  </Badge>
                  <Text size="xs" c="dimmed">
                    {alert.acknowledgedBy} · {alert.acknowledgedAt ? formatDate(alert.acknowledgedAt) : ''}
                  </Text>
                  {alert.acknowledgementNote && (
                    <Text size="xs" c="dimmed">
                      Σημείωση: {alert.acknowledgementNote}
                    </Text>
                  )}
                </Group>
              ) : (
                <Group align="flex-end" gap="xs">
                  <TextInput
                    size="xs"
                    placeholder="Σημείωση (προαιρετική)"
                    value={notes[alert.alertKey] ?? ''}
                    onChange={(e) => setNotes({ ...notes, [alert.alertKey]: e.currentTarget.value })}
                    maxLength={500}
                    style={{ flex: 1 }}
                  />
                  <Button
                    size="xs"
                    variant="light"
                    loading={acknowledging}
                    onClick={() => handleAcknowledge(alert.alertKey)}
                  >
                    Καταχώριση αξιολόγησης
                  </Button>
                </Group>
              )}
            </Stack>
          </Paper>
        ))}
          </>
        )}
      </Stack>
    </Paper>
  );
};

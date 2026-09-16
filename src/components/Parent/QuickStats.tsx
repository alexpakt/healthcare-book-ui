import React from 'react';
import { Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconUsers, IconCalendarEvent, IconAlertCircle } from '@tabler/icons-react';
import type { ParentQuickStats } from '../../types/parent';

interface QuickStatsProps {
  stats: ParentQuickStats | null;
  isLoading: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, subtext }) => (
  <Paper p="md" radius="md" withBorder>
    <Group justify="space-between">
      <Stack gap={4}>
        <Text size="sm" c="dimmed">
          {label}
        </Text>
        <Text size="lg" fw={700}>
          {value}
        </Text>
        {subtext && (
          <Text size="xs" c="dimmed">
            {subtext}
          </Text>
        )}
      </Stack>
      <ThemeIcon size="lg" radius="md" variant="light" color={color}>
        {icon}
      </ThemeIcon>
    </Group>
  </Paper>
);

export const QuickStats: React.FC<QuickStatsProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <Group grow>
        {[1, 2, 3].map((i) => (
          <Paper key={i} p="md" radius="md" withBorder>
            <div style={{ height: 60, backgroundColor: '#f0f0f0', borderRadius: 4 }} />
          </Paper>
        ))}
      </Group>
    );
  }

  return (
    <Group grow>
      <StatCard
        icon={<IconUsers size={20} />}
        label="Τα παιδιά μου"
        value={stats.totalChildren}
        color="blue"
        subtext={stats.totalChildren === 1 ? '1 παιδί' : `${stats.totalChildren} παιδιά`}
      />
      <StatCard
        icon={<IconCalendarEvent size={20} />}
        label="Προσεχή ραντεβού"
        value={stats.upcomingAppointmentsCount}
        color="green"
        subtext={
          stats.upcomingAppointmentsCount === 0
            ? 'Κανένα ραντεβού'
            : `${stats.upcomingAppointmentsCount} ραντεβού`
        }
      />
      <StatCard
        icon={<IconAlertCircle size={20} />}
        label="Καθυστερημένοι εμβολιασμοί"
        value={stats.overdueVaccinationsCount}
        color={stats.overdueVaccinationsCount > 0 ? 'red' : 'gray'}
        subtext={
          stats.overdueVaccinationsCount === 0
            ? 'Όλα ενημερωμένα'
            : 'Απαιτείται προσοχή'
        }
      />
    </Group>
  );
};

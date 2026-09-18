import React from 'react';
import { Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconUsers, IconCalendarEvent, IconClipboardCheck, IconCircleCheck } from '@tabler/icons-react';
import type { DoctorQuickStats } from '../../types/doctor';

interface QuickStatsProps {
  stats: DoctorQuickStats | null;
  isLoading: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <Paper p="md" radius="md" withBorder>
    <Group justify="space-between">
      <Stack gap={4}>
        <Text size="sm" c="dimmed">
          {label}
        </Text>
        <Text size="lg" fw={700}>
          {value}
        </Text>
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
        {[1, 2, 3, 4].map((i) => (
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
        label="Ασθενείς"
        value={stats.totalPatients}
        color="blue"
      />
      <StatCard
        icon={<IconCalendarEvent size={20} />}
        label="Σημερινά ραντεβού"
        value={stats.todayAppointmentsCount}
        color="teal"
      />
      <StatCard
        icon={<IconClipboardCheck size={20} />}
        label="Προσεχή ραντεβού"
        value={stats.upcomingAppointmentsCount}
        color="green"
      />
      <StatCard
        icon={<IconCircleCheck size={20} />}
        label="Ολοκληρωμένα"
        value={stats.completedAppointmentsCount}
        color="gray"
      />
    </Group>
  );
};

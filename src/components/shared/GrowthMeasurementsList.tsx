import React from 'react';
import { Stack, Text, Center, Loader, Paper, Badge, Group, Table, ScrollArea } from '@mantine/core';
import { IconRuler2 } from '@tabler/icons-react';
import type { GrowthMeasurement } from '../../types/parent';

interface GrowthMeasurementsListProps {
  measurements: GrowthMeasurement[] | null;
  isLoading: boolean;
}

const getPercentileColor = (percentile?: number): string => {
  if (!percentile) return 'gray';
  if (percentile < 3 || percentile > 97) return 'red';
  if (percentile < 10 || percentile > 90) return 'yellow';
  return 'green';
};

export const GrowthMeasurementsList: React.FC<GrowthMeasurementsListProps> = ({
  measurements,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!measurements || measurements.length === 0) {
    return (
      <Paper p="md" radius="md" withBorder>
        <Center py="xl">
          <Stack align="center" gap="md">
            <IconRuler2 size={40} color="var(--mantine-color-gray-3)" />
            <Text c="dimmed">Δεν υπάρχουν μετρήσεις ανάπτυξης</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  const sorted = [...measurements].sort(
    (a, b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()
  );

  return (
    <Stack gap="md">
      <ScrollArea>
        <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Ημερομηνία</Table.Th>
            <Table.Th>Ηλικία (μήνες)</Table.Th>
            <Table.Th>Ύψος (cm)</Table.Th>
            <Table.Th>Βάρος (kg)</Table.Th>
            <Table.Th>Περίμετρος κεφαλής (cm)</Table.Th>
            <Table.Th>Γιατρός</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sorted.map((m) => (
            <Table.Tr key={m.id}>
              <Table.Td>{new Date(m.measurementDate).toLocaleDateString('el-GR')}</Table.Td>
              <Table.Td>{m.ageInMonths}</Table.Td>
              <Table.Td>
                {m.heightCm ? (
                  <Group gap={6}>
                    <Text>{m.heightCm.toFixed(1)}</Text>
                    {m.percentileHeight && (
                      <Badge color={getPercentileColor(m.percentileHeight)} size="sm">
                        p{m.percentileHeight}
                      </Badge>
                    )}
                  </Group>
                ) : (
                  <Text c="dimmed">—</Text>
                )}
              </Table.Td>
              <Table.Td>
                {m.weightKg ? (
                  <Group gap={6}>
                    <Text>{m.weightKg.toFixed(1)}</Text>
                    {m.percentileWeight && (
                      <Badge color={getPercentileColor(m.percentileWeight)} size="sm">
                        p{m.percentileWeight}
                      </Badge>
                    )}
                  </Group>
                ) : (
                  <Text c="dimmed">—</Text>
                )}
              </Table.Td>
              <Table.Td>
                {m.headCircumferenceCm ? (
                  <Group gap={6}>
                    <Text>{m.headCircumferenceCm.toFixed(1)}</Text>
                    {m.percentileHeadCircumference && (
                      <Badge color={getPercentileColor(m.percentileHeadCircumference)} size="sm">
                        p{m.percentileHeadCircumference}
                      </Badge>
                    )}
                  </Group>
                ) : (
                  <Text c="dimmed">—</Text>
                )}
              </Table.Td>
              <Table.Td>{m.doctorName}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      </ScrollArea>
    </Stack>
  );
};

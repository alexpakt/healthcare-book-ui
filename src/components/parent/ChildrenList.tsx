import React from 'react';
import { Grid, Text, Stack, Button, Center, Loader, Box } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { ChildCard } from './ChildCard';
import type { Child } from '../../types/parent';

interface ChildrenListProps {
  children: Child[] | null;
  isLoading: boolean;
  onViewDetails?: (childId: number) => void;
  onAddChild?: () => void;
  showAddButton?: boolean;
}

export const ChildrenList: React.FC<ChildrenListProps> = ({
  children,
  isLoading,
  onViewDetails,
  onAddChild,
  showAddButton = true,
}) => {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!children || children.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Text c="dimmed" size="lg">
            Δεν έχετε καταχωρημένα παιδιά
          </Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={onAddChild}
          >
            Προσθήκη παιδιού
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Grid>
        {children.map((child) => (
          <Grid.Col key={child.id} span={{ base: 12, sm: 6, md: 4 }}>
            <ChildCard child={child} onViewDetails={onViewDetails} />
          </Grid.Col>
        ))}
      </Grid>
      {showAddButton && (
        <Box w="auto" mt="lg">
          <Button
            size="sm"
            leftSection={<IconPlus size={14} />}
            variant="light"
            onClick={onAddChild}
          >
            Προσθήκη παιδιού
          </Button>
        </Box>
      )}
    </Stack>
  );
};

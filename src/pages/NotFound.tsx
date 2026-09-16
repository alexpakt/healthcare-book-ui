import React from 'react';
import { Link } from 'react-router-dom';
import { Center, Stack, Title, Text, Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

const NotFound: React.FC = () => {
  return (
    <Center style={{ minHeight: '100vh' }}>
      <Stack align="center" gap="md">
        <Title order={1} size="h2">
          404
        </Title>
        <Text size="lg">
          Η σελίδα δεν βρέθηκε
        </Text>
        <Button
          component={Link}
          to="/"
          leftSection={<IconArrowLeft size={16} />}
        >
          Επιστροφή στο ταμπλό
        </Button>
      </Stack>
    </Center>
  );
};

export default NotFound;

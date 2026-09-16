import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  AppShell,
  Group,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md">
          <Title order={3}>ECHR</Title>
          <Group gap="md">
            <Text size="sm">
              Καλώς ήρθατε, {user?.username}
            </Text>
            <Button
              onClick={handleLogout}
              color="red"
              leftSection={<IconLogout size={16} />}
              size="sm"
            >
              Αποσύνδεση
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" py="lg">
          <Stack gap="lg">
            <div>
              <Title order={2}>Καλώς ήρθατε στο ECHR</Title>
              <Text c="dimmed">
                Σύστημα Ηλεκτρονικού Αρχείου Υγείας Παιδιών
              </Text>
            </div>

            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Paper p="md" radius="md" withBorder>
                  <Title order={4} mb="md">
                    Προφίλ
                  </Title>
                  <Stack gap="xs">
                    <div>
                      <Text fw={600} size="sm" inline>
                        Όνομα χρήστη:
                      </Text>
                      {' '}<Text size="sm" inline>{user?.username}</Text>
                    </div>
                    <div>
                      <Text fw={600} size="sm" inline>
                        Ρόλος:
                      </Text>
                      {' '}<Text size="sm" inline>{user?.role}</Text>
                    </div>
                    <div>
                      <Text fw={600} size="sm" inline>
                        ID Προφίλ:
                      </Text>
                      {' '}<Text size="sm" inline>{user?.profileId}</Text>
                    </div>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default Dashboard;

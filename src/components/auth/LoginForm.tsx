import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Paper, TextInput, PasswordInput, Button, Group, Text, Stack, Center, Anchor, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center style={{ minHeight: '100vh' }}>
      <Stack gap="lg" style={{ width: '100%', maxWidth: 400 }}>
        <Center>
          <Stack gap={0} align="center">
            <Text fw={700} size="xl">
              ECHR
            </Text>
            <Text size="sm" c="dimmed">
              Ηλεκτρονικό Αρχείο Υγείας Παιδιών
            </Text>
          </Stack>
        </Center>

        <Paper p="xl" radius="lg" shadow="md" withBorder>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα Σύνδεσης">
                  {error}
                </Alert>
              )}

              <TextInput
                label="Όνομα χρήστη"
                placeholder="Εισάγετε το όνομα χρήστη σας"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />

              <PasswordInput
                label="Κωδικός πρόσβασης"
                placeholder="Εισάγετε τον κωδικό σας"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <Group justify="space-between" mt="lg">
                <Button type="submit" loading={isLoading} size="lg">
                  Σύνδεση
                </Button>
                <Anchor component={Link} to="/register" size="sm">
                  Δημιουργία λογαριασμού
                </Anchor>
              </Group>
            </Stack>
          </form>
        </Paper>

        <Center>
          <Text size="xs" c="dimmed">
            © 2026 ECHR. Όλα τα δικαιώματα διατηρούνται.
          </Text>
        </Center>
      </Stack>
    </Center>
  );
};

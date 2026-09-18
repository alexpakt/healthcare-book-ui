import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Paper, TextInput, PasswordInput, Button, Group, Text, Stack, Center, Anchor, Alert, Select } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';

interface RegisterFormData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  specialization: string;
  licenseNumber: string;
}

export const RegisterForm: React.FC = () => {
  const [userType, setUserType] = useState<'parent' | 'doctor'>('parent');
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    specialization: '',
    licenseNumber: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { registerParent, registerDoctor } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (userType === 'parent') {
        await registerParent({
          username: formData.username,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber || undefined,
          address: formData.address || undefined,
        });
      } else {
        await registerDoctor({
          username: formData.username,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber || undefined,
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber,
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center style={{ minHeight: '100vh' }}>
      <Stack gap="lg" style={{ width: '100%', maxWidth: 500 }}>
        <Center>
          <Stack gap={0} align="center">
            <Text fw={700} size="xl">
              ECHR
            </Text>
            <Text size="sm" c="dimmed">
              Δημιουργία νέου λογαριασμού
            </Text>
          </Stack>
        </Center>

        <Paper p="xl" radius="lg" shadow="md" withBorder>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα Εγγραφής">
                  {error}
                </Alert>
              )}

              <Select
                label="Τύπος λογαριασμού"
                placeholder="Επιλέξτε τύπο λογαριασμού"
                value={userType}
                onChange={(value) => setUserType((value || 'parent') as 'parent' | 'doctor')}
                data={[
                  { value: 'parent', label: 'Γονέας/Κηδεμόνας' },
                  { value: 'doctor', label: 'Παιδίατρος' },
                ]}
              />

              <Group grow>
                <TextInput
                  label="Όνομα"
                  placeholder="Το όνομά σας"
                  value={formData.firstName}
                  onChange={(e) => handleChange({ target: { name: 'firstName', value: e.target.value } } as any)}
                  required
                />
                <TextInput
                  label="Επώνυμο"
                  placeholder="Το επώνυμό σας"
                  value={formData.lastName}
                  onChange={(e) => handleChange({ target: { name: 'lastName', value: e.target.value } } as any)}
                  required
                />
              </Group>

              <TextInput
                label="Email"
                placeholder="your.email@example.com"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange({ target: { name: 'email', value: e.target.value } } as any)}
                required
              />

              {userType === 'doctor' && (
                <Group grow>
                  <TextInput
                    label="Ειδικότητα"
                    placeholder="π.χ. Παιδίατρος"
                    value={formData.specialization}
                    onChange={(e) =>
                      handleChange({ target: { name: 'specialization', value: e.target.value } } as any)
                    }
                    required
                  />
                  <TextInput
                    label="Αριθμός άδειας"
                    placeholder="Αριθμός άδειας ασκήσεως επαγγέλματος"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      handleChange({ target: { name: 'licenseNumber', value: e.target.value } } as any)
                    }
                    required
                  />
                </Group>
              )}

              <TextInput
                label="Όνομα χρήστη"
                placeholder="Επιλέξτε όνομα χρήστη"
                value={formData.username}
                onChange={(e) => handleChange({ target: { name: 'username', value: e.target.value } } as any)}
                required
              />

              <PasswordInput
                label="Κωδικός πρόσβασης"
                placeholder="Δημιουργήστε ισχυρό κωδικό"
                value={formData.password}
                onChange={(e) => handleChange({ target: { name: 'password', value: e.target.value } } as any)}
                required
              />

              <Button type="submit" loading={isLoading} fullWidth size="lg" mt="md">
                Δημιουργία λογαριασμού
              </Button>

              <Center>
                <Text size="sm">
                  Έχετε ήδη λογαριασμό;{' '}
                  <Anchor component={Link} to="/login" size="sm">
                    Σύνδεση
                  </Anchor>
                </Text>
              </Center>
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

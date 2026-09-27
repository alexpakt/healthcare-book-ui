import React, { useState } from 'react';
import { Paper, PasswordInput, Button, Group, Stack, Alert, Title } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { authService } from '../../services/authService';

const EMPTY_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export const ChangePasswordForm: React.FC = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFieldChange = (field: keyof typeof EMPTY_FORM, value: string) => {
    setSuccess(false);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Οι νέοι κωδικοί δεν ταιριάζουν.');
      return;
    }

    setIsSaving(true);
    try {
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setFormData(EMPTY_FORM);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Αποτυχία αλλαγής κωδικού πρόσβασης.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Paper p="xl" radius="lg" shadow="md" withBorder maw={600}>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Title order={4}>Αλλαγή κωδικού πρόσβασης</Title>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα">
              {error}
            </Alert>
          )}

          {success && (
            <Alert icon={<IconCheck size={16} />} color="green" title="Επιτυχία">
              Ο κωδικός πρόσβασής σας άλλαξε επιτυχώς.
            </Alert>
          )}

          <PasswordInput
            label="Τρέχων κωδικός"
            value={formData.currentPassword}
            onChange={(e) => handleFieldChange('currentPassword', e.target.value)}
            required
            disabled={isSaving}
          />

          <PasswordInput
            label="Νέος κωδικός"
            value={formData.newPassword}
            onChange={(e) => handleFieldChange('newPassword', e.target.value)}
            required
            disabled={isSaving}
          />

          <PasswordInput
            label="Επιβεβαίωση νέου κωδικού"
            value={formData.confirmPassword}
            onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
            required
            disabled={isSaving}
            error={
              formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                ? 'Οι κωδικοί δεν ταιριάζουν'
                : false
            }
          />

          <Group justify="flex-end">
            <Button type="submit" loading={isSaving}>
              Αλλαγή κωδικού
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

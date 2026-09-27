import React, { useEffect, useState } from 'react';
import {Paper, TextInput, Button, Group, Stack, Alert, Center, Loader, Title} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { doctorService } from '../../services/doctorService';
import { parentService } from '../../services/parentService';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  amka: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  licenseNumber: string;
  address: string;
}

const EMPTY_FORM: ProfileFormData = {
  firstName: '',
  lastName: '',
  amka: '',
  email: '',
  phoneNumber: '',
  specialization: '',
  licenseNumber: '',
  address: '',
};

export const EditProfileForm: React.FC = () => {
  const { user } = useAuth();
  const isDoctor = user?.role === 'ROLE_DOCTOR';
  const isSupportedRole = user?.role === 'ROLE_DOCTOR' || user?.role === 'ROLE_PARENT';

  const [formData, setFormData] = useState<ProfileFormData>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadProfile = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      if (isDoctor) {
        const profile = await doctorService.getMyProfile();
        setFormData({
          ...EMPTY_FORM,
          firstName: profile.firstName,
          lastName: profile.lastName,
          amka: profile.amka,
          email: profile.email,
          phoneNumber: profile.phoneNumber || '',
          specialization: profile.specialization,
          licenseNumber: profile.licenseNumber,
          address: profile.address || '',
        });
      } else {
        const profile = await parentService.getMyProfile();
        setFormData({
          ...EMPTY_FORM,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phoneNumber: profile.phoneNumber || '',
          address: profile.address || '',
        });
      }
    } catch (err: any) {
      setLoadError(
        err.response?.data?.message || err.message || 'Αποτυχία φόρτωσης στοιχείων προφίλ.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupportedRole) {
      setIsLoading(false);
      return;
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDoctor, isSupportedRole]);

  const handleFieldChange = (field: keyof ProfileFormData, value: string) => {
    setSaveSuccess(false);
    if (field === 'amka') {
      setFormData((prev) => ({ ...prev, amka: value.replace(/\D/g, '').slice(0, 11) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      if (isDoctor) {
        await doctorService.updateMyProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          amka: formData.amka,
          email: formData.email,
          phoneNumber: formData.phoneNumber || undefined,
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber,
          address: formData.address || undefined,
        });
      } else {
        await parentService.updateMyProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber || undefined,
          address: formData.address || undefined,
        });
      }
      setSaveSuccess(true);
    } catch (err: any) {
      setSaveError(
        err.response?.data?.message || err.message || 'Αποτυχία ενημέρωσης στοιχείων προφίλ.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSupportedRole) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="blue" title="Μη διαθέσιμο">
        Δεν υπάρχει διαθέσιμη φόρμα επεξεργασίας στοιχείων για τον ρόλο σας.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (loadError) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα Φόρτωσης">
        <Stack gap="sm">
          <div>{loadError}</div>
          <Button size="xs" variant="light" onClick={loadProfile}>
            Δοκιμάστε ξανά
          </Button>
        </Stack>
      </Alert>
    );
  }

  const amkaError =
    isDoctor && formData.amka && !/^\d{11}$/.test(formData.amka)
      ? 'Πρέπει να είναι ακριβώς 11 ψηφία'
      : false;

  return (
    <Paper p="xl" radius="lg" shadow="md" withBorder maw={600}>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Title order={4}>Αλλαγή προσωπικών πληροφοριών</Title>
          {saveError && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα">
              {saveError}
            </Alert>
          )}

          {saveSuccess && (
            <Alert icon={<IconCheck size={16} />} color="green" title="Επιτυχία">
              Τα στοιχεία σας ενημερώθηκαν επιτυχώς.
            </Alert>
          )}

          <Group grow>
            <TextInput
              label="Όνομα"
              value={formData.firstName}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
              required
              disabled={isSaving}
            />
            <TextInput
              label="Επώνυμο"
              value={formData.lastName}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
              required
              disabled={isSaving}
            />
          </Group>

          <TextInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            required
            disabled={isSaving}
          />

          <TextInput
            label="Τηλέφωνο"
            value={formData.phoneNumber}
            onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
            disabled={isSaving}
          />

          {isDoctor && (
            <>
              <TextInput
                label="AMKA (Αριθμός Μητρώου Κοινωνικής Ασφάλισης)"
                description="Εισάγετε 11 ψηφία (μόνο αριθμούς)"
                value={formData.amka}
                onChange={(e) => handleFieldChange('amka', e.target.value)}
                maxLength={11}
                required
                error={amkaError}
                disabled={isSaving}
              />
              <Group grow>
                <TextInput
                  label="Ειδικότητα"
                  value={formData.specialization}
                  onChange={(e) => handleFieldChange('specialization', e.target.value)}
                  required
                  disabled={isSaving}
                />
                <TextInput
                  label="Αριθμός άδειας"
                  value={formData.licenseNumber}
                  onChange={(e) => handleFieldChange('licenseNumber', e.target.value)}
                  required
                  disabled={isSaving}
                />
              </Group>
            </>
          )}

          <TextInput
            label="Διεύθυνση"
            value={formData.address}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            disabled={isSaving}
          />

          <Group justify="flex-end">
            <Button type="submit" loading={isSaving} disabled={Boolean(amkaError)}>
              Αποθήκευση
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

import React, { useState } from 'react';
import {Paper, TextInput, Button, Group, Stack, Alert, Center, Loader, Title} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { useDoctorProfile, useDoctorUpdateProfile } from '../../hooks/useDoctorData';
import { useParentProfile, useParentUpdateProfile } from '../../hooks/useParentData';

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

  const [edits, setEdits] = useState<Partial<ProfileFormData>>({});
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const doctorProfile = useDoctorProfile(!isDoctor);
  const parentProfile = useParentProfile(isDoctor || !isSupportedRole);
  const { mutate: updateDoctorProfile, loading: isSavingDoctor } = useDoctorUpdateProfile();
  const { mutate: updateParentProfile, loading: isSavingParent } = useParentUpdateProfile();

  const activeProfile = isDoctor ? doctorProfile : parentProfile;
  const isLoading = isSupportedRole && activeProfile.loading;
  const loadError = activeProfile.error?.message || '';
  const isSaving = isSavingDoctor || isSavingParent;

  const loadedData: ProfileFormData = {
    ...EMPTY_FORM,
    ...(activeProfile.data && {
      firstName: activeProfile.data.firstName,
      lastName: activeProfile.data.lastName,
      email: activeProfile.data.email,
      phoneNumber: activeProfile.data.phoneNumber || '',
      address: activeProfile.data.address || '',
    }),
    ...(isDoctor &&
      doctorProfile.data && {
        amka: doctorProfile.data.amka,
        specialization: doctorProfile.data.specialization,
        licenseNumber: doctorProfile.data.licenseNumber,
      }),
  };
  const formData: ProfileFormData = { ...loadedData, ...edits };

  const handleFieldChange = (field: keyof ProfileFormData, value: string) => {
    setSaveSuccess(false);
    setEdits((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);

    try {
      if (isDoctor) {
        await updateDoctorProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber || undefined,
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber,
          address: formData.address || undefined,
        });
      } else {
        await updateParentProfile({
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
        err.message || 'Αποτυχία ενημέρωσης στοιχείων προφίλ.'
      );
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
          <Button size="xs" variant="light" onClick={activeProfile.refetch}>
            Δοκιμάστε ξανά
          </Button>
        </Stack>
      </Alert>
    );
  }

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
                description="Το AMKA δεν μπορεί να αλλάξει"
                value={formData.amka}
                readOnly
                disabled
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
            <Button type="submit" loading={isSaving}>
              Αποθήκευση
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

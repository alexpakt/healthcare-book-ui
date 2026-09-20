import React, { useState } from 'react';
import {
  Modal,
  Button,
  TextInput,
  Select,
  Stack,
  Alert,
  Group,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useCreateChild } from '../../hooks/useChildData';
import type { CreateChildRequest } from '../../services/childService';

interface ChildRegistrationFormProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChildRegistrationForm: React.FC<ChildRegistrationFormProps> = ({
  opened,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateChildRequest>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodType: '',
  });

  const { mutate, loading, error, reset } = useCreateChild();

  const handleChange = (field: keyof CreateChildRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      alert('Το όνομα του παιδιού είναι υποχρεωτικό');
      return;
    }
    if (!formData.lastName.trim()) {
      alert('Το επώνυμο του παιδιού είναι υποχρεωτικό');
      return;
    }
    if (!formData.dateOfBirth) {
      alert('Η ημερομηνία γέννησης είναι υποχρεωτική');
      return;
    }

    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (birthDate > today) {
      alert('Η ημερομηνία γέννησης δεν μπορεί να είναι στο μέλλον');
      return;
    }

    try {
      await mutate({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'MALE' | 'FEMALE',
        bloodType: formData.bloodType || undefined,
      });

      // Reset form on success
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'MALE',
        bloodType: '',
      });
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error creating child:', err);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'MALE',
      bloodType: '',
    });
    reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Προσθήκη Παιδιού"
      size="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* Error Alert */}
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              title="Σφάλμα"
            >
              {error.message || 'Αποτυχία δημιουργίας παιδιού. Προσπαθήστε ξανά.'}
            </Alert>
          )}

          {/* First Name */}
          <TextInput
            label="Όνομα"
            placeholder="π.χ. Παναγιώτης"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
            disabled={loading}
          />

          {/* Last Name */}
          <TextInput
            label="Επώνυμο"
            placeholder="π.χ. Παπαδόπουλος"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
            disabled={loading}
          />

          {/* Date of Birth */}
          <TextInput
            label="Ημερομηνία Γέννησης"
            placeholder="YYYY-MM-DD"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            required
            disabled={loading}
          />

          {/* Gender */}
          <Select
            label="Φύλο"
            placeholder="Επιλέξτε φύλο"
            data={[
              { value: 'MALE', label: 'Αγόρι' },
              { value: 'FEMALE', label: 'Κορίτσι' },
            ]}
            value={formData.gender}
            onChange={(value) => handleChange('gender', value || 'MALE')}
            required
            disabled={loading}
          />

          {/* Blood Type */}
          <Select
            label="Ομάδα Αίματος (Προαιρετικό)"
            placeholder="Επιλέξτε ομάδα αίματος"
            data={[
              { value: 'O+', label: 'O+' },
              { value: 'O-', label: 'O-' },
              { value: 'A+', label: 'A+' },
              { value: 'A-', label: 'A-' },
              { value: 'B+', label: 'B+' },
              { value: 'B-', label: 'B-' },
              { value: 'AB+', label: 'AB+' },
              { value: 'AB-', label: 'AB-' },
            ]}
            value={formData.bloodType}
            onChange={(value) => handleChange('bloodType', value || '')}
            disabled={loading}
            clearable
            searchable
          />

          {/* Action Buttons */}
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={handleClose}
              disabled={loading}
            >
              Ακύρωση
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!formData.firstName || !formData.lastName || !formData.dateOfBirth}
            >
              {loading ? 'Αποθήκευση...' : 'Αποθήκευση Παιδιού'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

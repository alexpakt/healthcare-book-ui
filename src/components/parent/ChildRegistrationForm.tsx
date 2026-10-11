import React, { useEffect, useState } from 'react';
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
import { useCreateChild, useUpdateChild } from '../../hooks/useChildData';
import type { ChildRecord, CreateChildRequest } from '../../services/childService';

const BLOOD_TYPE_OPTIONS = [
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
];

const EMPTY_FORM: CreateChildRequest = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  amka: '',
  gender: 'MALE',
  bloodType: '',
};

const toFormData = (child?: ChildRecord | null): CreateChildRequest =>
  child
    ? {
        firstName: child.firstName,
        lastName: child.lastName,
        dateOfBirth: child.dateOfBirth,
        amka: child.amka,
        gender: child.gender,
        bloodType: child.bloodType ?? '',
      }
    : EMPTY_FORM;

interface ChildRegistrationFormProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** When provided, the form edits this child instead of registering a new one */
  child?: ChildRecord | null;
}

export const ChildRegistrationForm: React.FC<ChildRegistrationFormProps> = ({
  opened,
  onClose,
  onSuccess,
  child,
}) => {
  const isEdit = !!child;
  const [formData, setFormData] = useState<CreateChildRequest>(toFormData(child));

  const createChild = useCreateChild();
  const updateChild = useUpdateChild();
  const { loading, error } = isEdit ? updateChild : createChild;

  // Prefill from the child each time the modal opens
  useEffect(() => {
    if (opened) {
      setFormData(toFormData(child));
      createChild.reset();
      updateChild.reset();
    }
  }, [opened, child]);

  const handleChange = (field: keyof CreateChildRequest, value: string) => {
    let processedValue = value;

    // Only allow digits for AMKA
    if (field === 'amka') {
      processedValue = value.replace(/\D/g, '').slice(0, 11);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
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
    if (!formData.amka.trim()) {
      alert('Το AMKA είναι υποχρεωτικό');
      return;
    }
    if (!/^\d{11}$/.test(formData.amka)) {
      alert('Το AMKA πρέπει να περιέχει ακριβώς 11 ψηφία');
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

    const payload: CreateChildRequest = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      amka: formData.amka.trim(),
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender as 'MALE' | 'FEMALE',
      bloodType: formData.bloodType || undefined,
    };

    try {
      if (isEdit && child) {
        await updateChild.mutate({ childId: child.id, data: payload });
      } else {
        await createChild.mutate(payload);
      }

      setFormData(toFormData(child));
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(isEdit ? 'Error updating child:' : 'Error creating child:', err);
    }
  };

  const handleClose = () => {
    setFormData(toFormData(child));
    createChild.reset();
    updateChild.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isEdit ? 'Επεξεργασία Παιδιού' : 'Προσθήκη Παιδιού'}
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
              {error.message || (isEdit ? 'Αποτυχία αποθήκευσης στοιχείων. Προσπαθήστε ξανά.' : 'Αποτυχία δημιουργίας παιδιού. Προσπαθήστε ξανά.')}
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

          {/* AMKA */}
          <TextInput
            label="AMKA (Αριθμός Μητρώου Κοινωνικής Ασφάλισης)"
            placeholder="11 ψηφία"
            description={
              isEdit
                ? undefined
                : 'Εισάγετε 11 ψηφία (μόνο αριθμούς). Το AMKA δεν μπορεί να τροποποιηθεί μετά την καταχώριση.'
            }
            value={formData.amka}
            onChange={(e) => handleChange('amka', e.target.value)}
            maxLength={11}
            required
            disabled={loading || isEdit}
            error={formData.amka && !/^\d{11}$/.test(formData.amka) ? 'Πρέπει να είναι ακριβώς 11 ψηφία' : false}
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
            data={BLOOD_TYPE_OPTIONS}
            value={formData.bloodType}
            onChange={(value) => handleChange('bloodType', value || '')}
            disabled={loading}
            clearable={!isEdit}
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
              disabled={!formData.firstName || !formData.lastName || !formData.amka || !/^\d{11}$/.test(formData.amka) || !formData.dateOfBirth}
            >
              {loading ? 'Αποθήκευση...' : 'Αποθήκευση Παιδιού'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

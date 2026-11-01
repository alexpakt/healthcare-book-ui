import React, { useState } from 'react';
import { Modal, Button, Stack, Group, TextInput, Select, Textarea, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { AllergyRecord } from '../../types/parent';
import { isBeforeBirthDate, parseLocalDate, toLocalIsoDate } from '../../utils/dateTime';

interface AllergyFormProps {
  opened: boolean;
  onClose: () => void;
  childName: string;
  childDateOfBirth?: string;
  onSubmit: (data: AllergyFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  initialData?: AllergyRecord;
}

export interface AllergyFormData {
  allergen: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  reaction?: string;
  diagnosedDate: string;
  notes?: string;
}

const EMPTY_FORM: AllergyFormData = {
  allergen: '',
  severity: 'MODERATE',
  reaction: '',
  diagnosedDate: toLocalIsoDate(),
  notes: '',
};

export const AllergyForm: React.FC<AllergyFormProps> = ({
  opened,
  onClose,
  childName,
  childDateOfBirth,
  onSubmit,
  isLoading = false,
  error = null,
  initialData,
}) => {
  const [formData, setFormData] = useState<AllergyFormData>(
    initialData
      ? {
          allergen: initialData.allergen,
          severity: initialData.severity as 'MILD' | 'MODERATE' | 'SEVERE',
          reaction: initialData.reaction || '',
          diagnosedDate: initialData.diagnosedDate.slice(0, 10),
          notes: initialData.notes || '',
        }
      : EMPTY_FORM
  );

  const handleClose = () => {
    setFormData(EMPTY_FORM);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.allergen.trim()) {
      alert('Το όνομα της αλλεργίας είναι υποχρεωτικό');
      return;
    }

    if (!formData.diagnosedDate) {
      alert('Η ημερομηνία διάγνωσης είναι υποχρεωτική');
      return;
    }

    const diagnosedDate = parseLocalDate(formData.diagnosedDate);
    if (!diagnosedDate) {
      alert('Η ημερομηνία διάγνωσης δεν είναι έγκυρη');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (diagnosedDate > today) {
      alert('Η ημερομηνία διάγνωσης δεν μπορεί να είναι στο μέλλον');
      return;
    }
    if (isBeforeBirthDate(diagnosedDate, childDateOfBirth)) {
      alert('Η ημερομηνία διάγνωσης δεν μπορεί να είναι πριν από την ημερομηνία γέννησης');
      return;
    }

    try {
      await onSubmit({
        allergen: formData.allergen.trim(),
        severity: formData.severity,
        reaction: formData.reaction?.trim() || undefined,
        diagnosedDate: formData.diagnosedDate,
        notes: formData.notes?.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={initialData ? `Επεξεργασία αλλεργίας - ${childName}` : `Νέα αλλεργία - ${childName}`}
      size="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα">
              {error}
            </Alert>
          )}

          <TextInput
            label="Αλλεργιογόνο"
            placeholder="π.χ. Φυστίκια, Γάλα, Ψάρι"
            value={formData.allergen}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                allergen: e.target.value,
              }))
            }
            required
            disabled={isLoading}
          />

          <Select
            label="Σοβαρότητα"
            placeholder="Επιλέξτε σοβαρότητα"
            data={[
              { value: 'MILD', label: 'Ελαφρά' },
              { value: 'MODERATE', label: 'Μέτρια' },
              { value: 'SEVERE', label: 'Σοβαρή' },
            ]}
            value={formData.severity}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                severity: (value as 'MILD' | 'MODERATE' | 'SEVERE') || 'MODERATE',
              }))
            }
            required
            disabled={isLoading}
          />

          <TextInput
            label="Αντίδραση (Προαιρετικό)"
            placeholder="π.χ. Φαγούρα, Πρήξιμο του προσώπου"
            value={formData.reaction}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                reaction: e.target.value,
              }))
            }
            disabled={isLoading}
          />

          <TextInput
            label="Ημερομηνία Διάγνωσης"
            type="date"
            min={childDateOfBirth?.slice(0, 10)}
            value={formData.diagnosedDate}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                diagnosedDate: e.target.value,
              }))
            }
            max={toLocalIsoDate()}
            required
            disabled={isLoading}
          />

          <Textarea
            label="Σημειώσεις (Προαιρετικό)"
            placeholder="π.χ. Διαγνώστηκε κατά τη διάρκεια προσχολικού ελέγχου"
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
            disabled={isLoading}
            minRows={3}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={handleClose} disabled={isLoading}>
              Ακύρωση
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading || !formData.allergen.trim()}
            >
              {isLoading ? 'Αποθήκευση...' : 'Αποθήκευση Αλλεργίας'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

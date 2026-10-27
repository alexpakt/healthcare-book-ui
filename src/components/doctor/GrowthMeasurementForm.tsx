import React, { useState } from 'react';
import { Modal, Button, Stack, Group, NumberInput, Textarea, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { isBeforeBirthDate, parseLocalDate, toLocalIsoDate } from '../../utils/dateTime';

interface GrowthMeasurementFormProps {
  opened: boolean;
  onClose: () => void;
  childId: number;
  childName: string;
  childDateOfBirth?: string;
  onSubmit: (data: GrowthMeasurementFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export interface GrowthMeasurementFormData {
  childId: number;
  measurementDate: string;
  heightCm?: number | null;
  weightKg?: number | null;
  headCircumferenceCm?: number | null;
  notes?: string;
}

const EMPTY_FORM: GrowthMeasurementFormData = {
  childId: 0,
  measurementDate: toLocalIsoDate(),
  heightCm: null,
  weightKg: null,
  headCircumferenceCm: null,
  notes: '',
};

export const GrowthMeasurementForm: React.FC<GrowthMeasurementFormProps> = ({
  opened,
  onClose,
  childId,
  childName,
  childDateOfBirth,
  onSubmit,
  isLoading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState<GrowthMeasurementFormData>({
    ...EMPTY_FORM,
    childId,
    measurementDate: toLocalIsoDate(),
  });

  const handleClose = () => {
    setFormData({
      ...EMPTY_FORM,
      childId,
      measurementDate: toLocalIsoDate(),
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.heightCm && !formData.weightKg && !formData.headCircumferenceCm) {
      return;
    }

    if (formData.measurementDate > toLocalIsoDate()) {
      alert('Η ημερομηνία μέτρησης δεν μπορεί να είναι στο μέλλον');
      return;
    }

    const measurementDate = parseLocalDate(formData.measurementDate);
    if (measurementDate && isBeforeBirthDate(measurementDate, childDateOfBirth)) {
      alert('Η ημερομηνία μέτρησης δεν μπορεί να είναι πριν από την ημερομηνία γέννησης');
      return;
    }

    try {
      await onSubmit({
        ...formData,
        childId,
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
      title={`Νέα μέτρηση ανάπτυξης - ${childName}`}
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

          <input
            type="date"
            min={childDateOfBirth?.slice(0, 10)}
            value={formData.measurementDate}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                measurementDate: e.target.value,
              }))
            }
            max={toLocalIsoDate()}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ced4da',
              fontFamily: 'inherit',
            }}
            required
          />

          <NumberInput
            label="Ύψος (cm)"
            placeholder="π.χ. 75.5"
            value={formData.heightCm ?? ''}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                heightCm: value === '' || value === null ? null : Number(value),
              }))
            }
            decimalScale={1}
            step={0.1}
            disabled={isLoading}
            allowNegative={false}
          />

          <NumberInput
            label="Βάρος (kg)"
            placeholder="π.χ. 10.5"
            value={formData.weightKg ?? ''}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                weightKg: value === '' || value === null ? null : Number(value),
              }))
            }
            decimalScale={1}
            step={0.1}
            disabled={isLoading}
            allowNegative={false}
          />

          <NumberInput
            label="Περίμετρος κεφαλής (cm)"
            placeholder="π.χ. 48.5"
            value={formData.headCircumferenceCm ?? ''}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                headCircumferenceCm: value === '' || value === null ? null : Number(value),
              }))
            }
            decimalScale={1}
            step={0.1}
            disabled={isLoading}
            allowNegative={false}
          />

          <Textarea
            label="Σημειώσεις (Προαιρετικό)"
            placeholder="π.χ. Παιδί ήταν συνεργάσιμο, κανονικές μετρήσεις"
            value={formData.notes || ''}
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
              disabled={
                isLoading ||
                (!formData.heightCm &&
                  !formData.weightKg &&
                  !formData.headCircumferenceCm)
              }
            >
              {isLoading ? 'Αποθήκευση...' : 'Καταχώρηση μέτρησης'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

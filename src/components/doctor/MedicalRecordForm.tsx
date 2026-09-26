import React, { useState } from 'react';
import { Modal, Button, TextInput, Textarea, Stack, Alert, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import {
  useDoctorCreateMedicalRecord,
  useDoctorUpdateMedicalRecord,
} from '../../hooks/useDoctorData';
import type { MedicalHistory } from '../../types/doctor';

interface MedicalRecordFormProps {
  opened: boolean;
  childId: number;
  editRecord?: MedicalHistory | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const emptyForm = (record?: MedicalHistory | null) => ({
  recordDate: record?.recordDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
  diagnosis: record?.diagnosis || '',
  notes: record?.notes || '',
  prescription: record?.prescription || '',
});

export const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({
  opened,
  childId,
  editRecord,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState(emptyForm(editRecord));
  const createRecord = useDoctorCreateMedicalRecord();
  const updateRecord = useDoctorUpdateMedicalRecord();
  const { loading, error } = editRecord ? updateRecord : createRecord;

  const handleChange = (field: keyof ReturnType<typeof emptyForm>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setFormData(emptyForm());
    createRecord.reset();
    updateRecord.reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.diagnosis.trim() || !formData.recordDate) {
      return;
    }

    const request = {
      childId,
      recordDate: formData.recordDate,
      diagnosis: formData.diagnosis.trim(),
      notes: formData.notes || undefined,
      prescription: formData.prescription || undefined,
    };

    try {
      if (editRecord) {
        await updateRecord.mutate({ recordId: editRecord.id, request });
      } else {
        await createRecord.mutate(request);
      }
      setFormData(emptyForm());
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error saving medical record:', err);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={editRecord ? 'Επεξεργασία Ιατρικού Αρχείου' : 'Νέο Ιατρικό Αρχείο'}
      size="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα">
              {error.message || 'Αποτυχία αποθήκευσης. Προσπαθήστε ξανά.'}
            </Alert>
          )}

          <TextInput
            label="Ημερομηνία"
            type="date"
            value={formData.recordDate}
            onChange={(e) => handleChange('recordDate', e.target.value)}
            required
            disabled={loading}
          />

          <TextInput
            label="Διάγνωση"
            placeholder="π.χ. Οξεία φαρυγγίτιδα"
            value={formData.diagnosis}
            onChange={(e) => handleChange('diagnosis', e.target.value)}
            required
            disabled={loading}
          />

          <Textarea
            label="Συνταγή (Προαιρετικό)"
            placeholder="π.χ. Αμοξικιλλίνη 250mg, 3 φορές/ημέρα για 7 ημέρες"
            value={formData.prescription}
            onChange={(e) => handleChange('prescription', e.target.value)}
            disabled={loading}
          />

          <Textarea
            label="Σημειώσεις (Προαιρετικό)"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            disabled={loading}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={handleClose} disabled={loading}>
              Ακύρωση
            </Button>
            <Button type="submit" loading={loading} disabled={!formData.diagnosis || !formData.recordDate}>
              {loading ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

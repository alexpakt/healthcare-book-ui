import React, { useState } from 'react';
import { Modal, Button, TextInput, Select, Stack, Alert, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useParentChildren, useParentCreateAppointment } from '../../hooks/useParentData';
import { useDirectoryDoctors } from '../../hooks/useDirectoryData';
import { getMinDateTimeLocal, isNotInFuture } from '../../utils/dateTime';

interface AppointmentRequestFormProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EMPTY_FORM = {
  childId: '',
  doctorId: '',
  appointmentDate: '',
  reason: '',
};

export const AppointmentRequestForm: React.FC<AppointmentRequestFormProps> = ({
  opened,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [dateError, setDateError] = useState('');
  const { data: children } = useParentChildren();
  const { data: doctors } = useDirectoryDoctors();
  const { mutate, loading, error, reset } = useParentCreateAppointment();

  const handleChange = (field: keyof typeof EMPTY_FORM, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setFormData(EMPTY_FORM);
    setDateError('');
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.childId || !formData.doctorId || !formData.appointmentDate) {
      return;
    }
    if (isNotInFuture(formData.appointmentDate)) {
      setDateError('Επιλέξτε μια μελλοντική ημερομηνία και ώρα.');
      return;
    }
    setDateError('');

    try {
      await mutate({
        childId: Number(formData.childId),
        doctorId: Number(formData.doctorId),
        appointmentDate:
          formData.appointmentDate.length === 16 ? `${formData.appointmentDate}:00` : formData.appointmentDate,
        reason: formData.reason || undefined,
      });
      setFormData(EMPTY_FORM);
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error requesting appointment:', err);
    }
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Αίτημα Ραντεβού" size="md" centered>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα">
              {error.message || 'Αποτυχία υποβολής αιτήματος. Προσπαθήστε ξανά.'}
            </Alert>
          )}

          <Select
            label="Παιδί"
            placeholder="Επιλέξτε παιδί"
            data={(children || []).map((c) => ({ value: String(c.id), label: `${c.firstName} ${c.lastName}` }))}
            value={formData.childId}
            onChange={(value) => handleChange('childId', value || '')}
            required
            disabled={loading}
          />

          <Select
            label="Γιατρός"
            placeholder="Επιλέξτε γιατρό"
            data={(doctors || []).map((d) => ({
              value: String(d.id),
              label: `${d.firstName} ${d.lastName} — ${d.specialization}`,
            }))}
            value={formData.doctorId}
            onChange={(value) => handleChange('doctorId', value || '')}
            required
            disabled={loading}
            searchable
          />

          <TextInput
            label="Ημερομηνία & Ώρα"
            type="datetime-local"
            min={getMinDateTimeLocal()}
            value={formData.appointmentDate}
            onChange={(e) => {
              setDateError('');
              handleChange('appointmentDate', e.target.value);
            }}
            error={dateError}
            required
            disabled={loading}
          />

          <TextInput
            label="Λόγος (Προαιρετικό)"
            placeholder="π.χ. Τακτικός έλεγχος"
            value={formData.reason}
            onChange={(e) => handleChange('reason', e.target.value)}
            disabled={loading}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={handleClose} disabled={loading}>
              Ακύρωση
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!formData.childId || !formData.doctorId || !formData.appointmentDate}
            >
              {loading ? 'Αποστολή...' : 'Υποβολή Αιτήματος'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

import React, { useState } from 'react';
import { useSyncStateToProps } from '../../hooks/useSyncStateToProps';
import { Modal, Button, TextInput, Select, Stack, Alert, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { useDoctorAssignedChildren } from '../../hooks/useDoctorData';
import { useCreateAppointment } from '../../hooks/useAppointmentData';
import { getMinDateTimeLocal, isNotInFuture } from '../../utils/dateTime';

interface NewAppointmentFormProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  childId?: number;
  reason?: string;
}

const EMPTY_FORM = {
  childId: '',
  appointmentDate: '',
  reason: '',
};

export const NewAppointmentForm: React.FC<NewAppointmentFormProps> = ({
  opened,
  onClose,
  onSuccess,
  childId,
  reason,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [dateError, setDateError] = useState('');
  const { data: patients } = useDoctorAssignedChildren();
  const { mutate, loading, error, reset } = useCreateAppointment();

  useSyncStateToProps([opened, childId, reason], () => {
    if (opened) {
      setFormData({
        childId: childId !== undefined ? String(childId) : '',
        appointmentDate: '',
        reason: reason ?? '',
      });
    }
  });

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
    if (!formData.childId || !formData.appointmentDate || !user?.profileId) {
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
        doctorId: user.profileId,
        appointmentDate:
          formData.appointmentDate.length === 16 ? `${formData.appointmentDate}:00` : formData.appointmentDate,
        reason: formData.reason || undefined,
      });
      setFormData(EMPTY_FORM);
      reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error creating appointment:', err);
    }
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Νέο Ραντεβού" size="md" centered>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα">
              {error.message || 'Αποτυχία δημιουργίας ραντεβού. Προσπαθήστε ξανά.'}
            </Alert>
          )}

          <Select
            label="Ασθενής"
            placeholder="Επιλέξτε ασθενή"
            data={(patients || []).map((p) => ({ value: String(p.id), label: `${p.firstName} ${p.lastName}` }))}
            value={formData.childId}
            onChange={(value) => handleChange('childId', value || '')}
            required
            disabled={loading || childId !== undefined}
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
            description={reason !== undefined ? 'Ο λόγος ορίζεται από τον εμβολιασμό και δεν αλλάζει.' : undefined}
            value={formData.reason}
            onChange={(e) => handleChange('reason', e.target.value)}
            disabled={loading || reason !== undefined}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={handleClose} disabled={loading}>
              Ακύρωση
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!formData.childId || !formData.appointmentDate}
            >
              {loading ? 'Αποθήκευση...' : 'Δημιουργία Ραντεβού'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

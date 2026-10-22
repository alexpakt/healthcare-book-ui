import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Stack,
  Group,
  TextInput,
  Select,
  Alert,
  Text,
  Loader,
  Center,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { doctorService, type CreateVaccinationRequest } from '../../services/doctorService';
import { parentService } from '../../services/parentService';
import { parseLocalDate, toLocalIsoDate } from '../../utils/dateTime';

interface NewVaccinationFormProps {
  opened: boolean;
  onClose: () => void;
  childId: number;
  childName: string;
  onSuccess?: () => void;
  isLoading?: boolean;
}

export interface VaccinationFormData extends CreateVaccinationRequest {
  vaccineName: string;
  administeredDate: string;
}

const EMPTY_FORM: Omit<VaccinationFormData, 'childId'> = {
  administeredByDoctorId: undefined,
  vaccineName: '',
  administeredDate: toLocalIsoDate(),
  nextDoseDate: '',
  batchNumber: '',
  notes: '',
};

export const NewVaccinationForm: React.FC<NewVaccinationFormProps> = ({
  opened,
  onClose,
  childId,
  childName,
  onSuccess,
  isLoading: externalLoading,
}) => {
  const [formData, setFormData] = useState<Omit<VaccinationFormData, 'childId'>>(EMPTY_FORM);
  const [vaccineOptions, setVaccineOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        setLoadingSchedules(true);

        // Get current doctor ID from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setFormData((prev) => ({ ...prev, administeredByDoctorId: user.profileId }));
        }

        const vaccines = await parentService.getAllVaccines();

        // Convert vaccines to dropdown options
        const options = vaccines.map((v) => ({
          value: v.vaccineName,
          label: v.vaccineNameGr || v.vaccineName,
        }));

        setVaccineOptions(options.sort((a, b) => a.label.localeCompare(b.label)));
      } catch (err) {
        console.error('Error loading vaccines:', err);
        setError('Αποτυχία φόρτωσης καταλόγου εμβολίων');
      } finally {
        setLoadingSchedules(false);
      }
    };

    if (opened) {
      fetchVaccines();
    }
  }, [opened]);

  const handleChange = (field: string, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value || '' }));
  };

  const handleClose = () => {
    setFormData(EMPTY_FORM);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vaccineName.trim()) {
      setError('Το όνομα του εμβολίου είναι υποχρεωτικό');
      return;
    }

    if (!formData.administeredDate) {
      setError('Η ημερομηνία χορήγησης είναι υποχρεωτική');
      return;
    }

    const adminDate = parseLocalDate(formData.administeredDate);
    if (!adminDate) {
      setError('Η ημερομηνία χορήγησης δεν είναι έγκυρη');
      return;
    }
    const today = new Date();
    today.setHours(23, 59, 59, 0);
    if (adminDate > today) {
      setError('Η ημερομηνία χορήγησης δεν μπορεί να είναι στο μέλλον');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await doctorService.createVaccination({
        childId,
        ...formData,
      });

      setFormData(EMPTY_FORM);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error creating vaccination:', err);
      setError('Αποτυχία καταχώρησης εμβολιασμού. Προσπαθήστε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading || externalLoading;

  return (
    <Modal opened={opened} onClose={handleClose} title="Καταχώρηση Εμβολιασμού" size="md" centered>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text size="sm" fw={600} c="dimmed">
            Παιδί: <strong>{childName}</strong>
          </Text>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα">
              {error}
            </Alert>
          )}

          {loadingSchedules ? (
            <Center py="md">
              <Loader size="sm" />
            </Center>
          ) : (
            <>
              <Select
                label="Εμβόλιο"
                placeholder="Επιλέξτε εμβόλιο"
                searchable
                data={vaccineOptions}
                value={formData.vaccineName}
                onChange={(value) => handleChange('vaccineName', value)}
                required
                disabled={isSubmitting}
              />

              <TextInput
                label="Ημερομηνία Χορήγησης"
                type="date"
                max={toLocalIsoDate()}
                value={formData.administeredDate}
                onChange={(e) => handleChange('administeredDate', e.target.value)}
                required
                disabled={isSubmitting}
              />

              <TextInput
                label="Ημερομηνία Επόμενης Δόσης (Προαιρετικό)"
                type="date"
                value={formData.nextDoseDate}
                onChange={(e) => handleChange('nextDoseDate', e.target.value)}
                disabled={isSubmitting}
              />

              <TextInput
                label="Σειρά Παρτίδας (Προαιρετικό)"
                placeholder="π.χ. ABC123456"
                value={formData.batchNumber}
                onChange={(e) => handleChange('batchNumber', e.target.value)}
                disabled={isSubmitting}
              />

              <TextInput
                label="Σημειώσεις (Προαιρετικό)"
                placeholder="π.χ. Χορηγήθηκε στο πλάι του δεξιού χεριού"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={isSubmitting}
              />
            </>
          )}

          <Group justify="flex-end">
            <Button variant="light" onClick={handleClose} disabled={isSubmitting}>
              Ακύρωση
            </Button>
            <Button type="submit" loading={isSubmitting} disabled={!formData.vaccineName || !formData.administeredDate || loadingSchedules}>
              Καταχώρηση Εμβολιασμού
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

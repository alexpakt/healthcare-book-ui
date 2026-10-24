import React, { useState, useEffect } from 'react';
import { useSyncStateToProps } from '../../hooks/useSyncStateToProps';
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
import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import { doctorService, type CreateVaccinationRequest } from '../../services/doctorService';
import { vaccinationCatalogService, type VaccineCatalogEntry } from '../../services/vaccinationCatalogService';
import type { VaccinationRecord, VaccinationSchedule } from '../../types/parent';
import { getNextMissingDoseNumber } from '../../utils/vaccinationStatus';
import { parseLocalDate, toLocalIsoDate } from '../../utils/dateTime';

interface NewVaccinationFormProps {
  opened: boolean;
  onClose: () => void;
  childId: number;
  childName: string;
  schedules: VaccinationSchedule[] | null;
  vaccinations: VaccinationRecord[] | null;
  initialVaccineName?: string;
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
  batchNumber: '',
  notes: '',
};

interface PlannedDose {
  vaccineName: string;
  label: string;
  doseNumber: number;
  recommendedAgeMonths?: number;
}

export const NewVaccinationForm: React.FC<NewVaccinationFormProps> = ({
  opened,
  onClose,
  childId,
  childName,
  schedules,
  vaccinations,
  initialVaccineName,
  onSuccess,
  isLoading: externalLoading,
}) => {
  const [formData, setFormData] = useState<Omit<VaccinationFormData, 'childId'>>(EMPTY_FORM);
  const [catalog, setCatalog] = useState<VaccineCatalogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        setLoadingCatalog(true);

        // Get current doctor ID from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setFormData((prev) => ({ ...prev, administeredByDoctorId: user.profileId }));
        }

        setCatalog(await vaccinationCatalogService.getAllVaccines());
      } catch (err) {
        console.error('Error loading vaccines:', err);
        setError('Αποτυχία φόρτωσης καταλόγου εμβολίων');
      } finally {
        setLoadingCatalog(false);
      }
    };

    if (opened) {
      fetchVaccines();
    }
  }, [opened]);

  useSyncStateToProps([opened, initialVaccineName], () => {
    if (opened && initialVaccineName) {
      setFormData((prev) => ({ ...prev, vaccineName: initialVaccineName }));
    }
  });

  const vaccineOptions = catalog
    .map((v) => ({ value: v.vaccineName, label: v.vaccineNameGr || v.vaccineName }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const plannedDoses = (): PlannedDose[] => {
    const entry = catalog.find((v) => v.vaccineName === formData.vaccineName);
    if (!entry || !schedules) {
      return [];
    }
    const components = entry.componentVaccineNames ?? [];
    const names = components.length > 0 ? components : [entry.vaccineName];
    return names.map((name) => {
      const doseNumber = getNextMissingDoseNumber(schedules, vaccinations, name);
      const scheduled = schedules.find((s) => s.vaccineName === name && s.doseNumber === doseNumber);
      return {
        vaccineName: name,
        label: catalog.find((v) => v.vaccineName === name)?.vaccineNameGr || name,
        doseNumber,
        recommendedAgeMonths: scheduled?.recommendedAgeMonths,
      };
    });
  };
  const planned = plannedDoses();

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

          {loadingCatalog ? (
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

              {planned.length > 0 && (
                <Alert icon={<IconInfoCircle size={16} />} color="blue" title="Θα καταχωρηθεί">
                  <Stack gap={2}>
                    {planned.map((dose) => (
                      <Text key={dose.vaccineName} size="sm">
                        {dose.label}: <strong>Δόση {dose.doseNumber}</strong>
                        {dose.recommendedAgeMonths !== undefined && ` (${dose.recommendedAgeMonths} μήνες)`}
                      </Text>
                    ))}
                  </Stack>
                </Alert>
              )}

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
            <Button type="submit" loading={isSubmitting} disabled={!formData.vaccineName || !formData.administeredDate || loadingCatalog}>
              Καταχώρηση Εμβολιασμού
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

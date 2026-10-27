
import React, { useState } from 'react';
import { useSyncStateToProps } from '../../hooks/useSyncStateToProps';
import { Modal, Button, Stack, Group, NumberInput, TextInput, Select, Checkbox, Textarea, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { BirthRecord } from '../../types/parent';

interface BirthRecordFormProps {
  opened: boolean;
  onClose: () => void;
  childId: number;
  childName: string;
  onSubmit: (data: BirthRecordFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  existingRecord?: BirthRecord | null;
}

export interface BirthRecordFormData {
  childId: number;
  birthWeightGrams: number;
  birthLengthCm: number;
  birthHeadCircumferenceCm: number;
  gestationalAgeWeeks: number;
  deliveryType: 'VAGINAL' | 'CESAREAN' | 'VAGINAL_ASSISTED';
  apgarScore1Min: number;
  apgarScore5Min: number;
  birthHospital?: string;
  nicuAdmission: boolean;
  nicuDurationDays?: number;
  notes?: string;
}

const EMPTY_FORM: BirthRecordFormData = {
  childId: 0,
  birthWeightGrams: 3500,
  birthLengthCm: 50,
  birthHeadCircumferenceCm: 35,
  gestationalAgeWeeks: 40,
  deliveryType: 'VAGINAL',
  apgarScore1Min: 9,
  apgarScore5Min: 10,
  birthHospital: '',
  nicuAdmission: false,
  nicuDurationDays: undefined,
  notes: '',
};

export const BirthRecordForm: React.FC<BirthRecordFormProps> = ({
  opened,
  onClose,
  childId,
  childName,
  onSubmit,
  isLoading = false,
  error = null,
  existingRecord = null,
}) => {
  const [formData, setFormData] = useState<BirthRecordFormData>({
    ...EMPTY_FORM,
    childId,
  });

  useSyncStateToProps([existingRecord, childId, opened], () => {
    if (existingRecord) {
      setFormData({
        childId: existingRecord.childId,
        birthWeightGrams: existingRecord.birthWeightGrams,
        birthLengthCm: existingRecord.birthLengthCm,
        birthHeadCircumferenceCm: existingRecord.birthHeadCircumferenceCm,
        gestationalAgeWeeks: existingRecord.gestationalAgeWeeks,
        deliveryType: existingRecord.deliveryType,
        apgarScore1Min: existingRecord.apgarScore1Min,
        apgarScore5Min: existingRecord.apgarScore5Min,
        birthHospital: existingRecord.birthHospital || '',
        nicuAdmission: existingRecord.nicuAdmission || false,
        nicuDurationDays: existingRecord.nicuDurationDays,
        notes: existingRecord.notes || '',
      });
    } else {
      setFormData({
        ...EMPTY_FORM,
        childId,
      });
    }
  });

  const handleClose = () => {
    setFormData({
      ...EMPTY_FORM,
      childId,
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.birthWeightGrams ||
      !formData.birthLengthCm ||
      !formData.birthHeadCircumferenceCm ||
      !formData.gestationalAgeWeeks ||
      formData.apgarScore1Min === null ||
      formData.apgarScore1Min === undefined ||
      formData.apgarScore5Min === null ||
      formData.apgarScore5Min === undefined
    ) {
      alert('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία');
      return;
    }

    // Validate Apgar scores
    if (formData.apgarScore1Min < 0 || formData.apgarScore1Min > 10) {
      alert('Το σκορ Apgar 1 λεπτού πρέπει να είναι μεταξύ 0 και 10');
      return;
    }

    if (formData.apgarScore5Min < 0 || formData.apgarScore5Min > 10) {
      alert('Το σκορ Apgar 5 λεπτών πρέπει να είναι μεταξύ 0 και 10');
      return;
    }

    // Validate gestational age
    if (formData.gestationalAgeWeeks < 22 || formData.gestationalAgeWeeks > 45) {
      alert('Η εγκυμοσύνη πρέπει να είναι μεταξύ 22 και 45 εβδομάδων');
      return;
    }

    // Validate weight range
    if (formData.birthWeightGrams < 500 || formData.birthWeightGrams > 6000) {
      alert('Το βάρος γέννησης πρέπει να είναι μεταξύ 500g και 6000g');
      return;
    }

    // Validate length range
    if (formData.birthLengthCm < 30 || formData.birthLengthCm > 60) {
      alert('Το μήκος γέννησης πρέπει να είναι μεταξύ 30cm και 60cm');
      return;
    }

    // Validate head circumference range
    if (formData.birthHeadCircumferenceCm < 20 || formData.birthHeadCircumferenceCm > 45) {
      alert('Η περίμετρος κεφαλής πρέπει να είναι μεταξύ 20cm και 45cm');
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={existingRecord ? `Επεξεργασία δεδομένων γέννησης - ${childName}` : `Νέα εγγραφή γέννησης - ${childName}`}
      size="lg"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα">
              {error}
            </Alert>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <NumberInput
              label="Βάρος γέννησης (g)"
              placeholder="3500"
              value={formData.birthWeightGrams}
              onChange={(val) => setFormData({ ...formData, birthWeightGrams: val as number })}
              min={500}
              max={6000}
              required
            />
            <NumberInput
              label="Μήκος γέννησης (cm)"
              placeholder="50"
              value={formData.birthLengthCm}
              onChange={(val) => setFormData({ ...formData, birthLengthCm: val as number })}
              min={30}
              max={60}
              step={0.1}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <NumberInput
              label="Περίμετρος κεφαλής (cm)"
              placeholder="35"
              value={formData.birthHeadCircumferenceCm}
              onChange={(val) => setFormData({ ...formData, birthHeadCircumferenceCm: val as number })}
              min={20}
              max={45}
              step={0.1}
              required
            />
            <NumberInput
              label="Εβδομάδες εγκυμοσύνης"
              placeholder="40"
              value={formData.gestationalAgeWeeks}
              onChange={(val) => setFormData({ ...formData, gestationalAgeWeeks: val as number })}
              min={22}
              max={45}
              required
            />
          </div>

          <Select
            label="Τύπος τοκετού"
            placeholder="Επιλέξτε τύπο τοκετού"
            value={formData.deliveryType}
            onChange={(val) => setFormData({ ...formData, deliveryType: val as BirthRecordFormData['deliveryType'] })}
            data={[
              { value: 'VAGINAL', label: 'Κολπικός' },
              { value: 'CESAREAN', label: 'Καισαρική τομή' },
              { value: 'VAGINAL_ASSISTED', label: 'Κολπικός με βοήθεια' },
            ]}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <NumberInput
              label="Σκορ Apgar 1 λεπτού"
              placeholder="9"
              value={formData.apgarScore1Min}
              onChange={(val) => setFormData({ ...formData, apgarScore1Min: val as number })}
              min={0}
              max={10}
              required
            />
            <NumberInput
              label="Σκορ Apgar 5 λεπτών"
              placeholder="10"
              value={formData.apgarScore5Min}
              onChange={(val) => setFormData({ ...formData, apgarScore5Min: val as number })}
              min={0}
              max={10}
              required
            />
          </div>

          <TextInput
            label="Νοσοκομείο γέννησης"
            placeholder="π.χ. Νοσοκομείο Αγία Σοφία"
            value={formData.birthHospital || ''}
            onChange={(e) => setFormData({ ...formData, birthHospital: e.currentTarget.value })}
          />

          <Checkbox
            label="Εισαγωγή σε ΜΕΝΝ (μονάδα φροντίδας νεογνών)"
            checked={formData.nicuAdmission}
            onChange={(e) => setFormData({ ...formData, nicuAdmission: e.currentTarget.checked })}
          />

          {formData.nicuAdmission && (
            <NumberInput
              label="Διάρκεια νοσηλείας ΜΕΝΝ (ημέρες)"
              placeholder="5"
              value={formData.nicuDurationDays}
              onChange={(val) => setFormData({ ...formData, nicuDurationDays: val as number })}
              min={0}
            />
          )}

          <Textarea
            label="Σημειώσεις"
            placeholder="Πρόσθετες πληροφορίες σχετικά με τη γέννηση..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.currentTarget.value })}
            minRows={3}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={handleClose}>
              Ακύρωση
            </Button>
            <Button type="submit" loading={isLoading}>
              {existingRecord ? 'Ενημέρωση' : 'Δημιουργία'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

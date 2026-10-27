import React, { useState } from 'react';
import { Table, Text, Stack, Center, Loader, Button, Modal, Group } from '@mantine/core';
import type { DoctorDirectoryEntry } from '../../services/directoryService';

interface DoctorsTableProps {
  doctors: DoctorDirectoryEntry[] | null;
  isLoading: boolean;
  emptyMessage?: string;
  onUnassign?: (doctor: DoctorDirectoryEntry) => Promise<void>;
}

export const DoctorsTable: React.FC<DoctorsTableProps> = ({ doctors, isLoading, emptyMessage = 'Δεν βρέθηκαν ιατροί', onUnassign }) => {
  const [doctorToRemove, setDoctorToRemove] = useState<DoctorDirectoryEntry | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleConfirm = async () => {
    if (!doctorToRemove || !onUnassign) return;
    setRemoving(true);
    try {
      await onUnassign(doctorToRemove);
      setDoctorToRemove(null);
    } finally {
      setRemoving(false);
    }
  };

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!doctors || doctors.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed" size="lg">
          {emptyMessage}
        </Text>
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Όνομα</Table.Th>
            <Table.Th>Ειδικότητα</Table.Th>
            <Table.Th>Τηλέφωνο</Table.Th>
            <Table.Th>Διεύθυνση</Table.Th>
            {onUnassign && <Table.Th />}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {doctors.map((doctor) => (
            <Table.Tr key={doctor.id}>
              <Table.Td>
                <Text fw={500}>
                  {doctor.firstName} {doctor.lastName}
                </Text>
              </Table.Td>
              <Table.Td>{doctor.specialization}</Table.Td>
              <Table.Td>{doctor.phoneNumber || '-'}</Table.Td>
              <Table.Td>{doctor.address || '-'}</Table.Td>
              {onUnassign && (
                <Table.Td>
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    onClick={() => setDoctorToRemove(doctor)}
                  >
                    Αποσύνδεση
                  </Button>
                </Table.Td>
              )}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={doctorToRemove !== null}
        onClose={() => setDoctorToRemove(null)}
        title="Αποσύνδεση ιατρού"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Είστε σίγουροι ότι θέλετε να αποσυνδέσετε τον ιατρό {doctorToRemove?.firstName}{' '}
            {doctorToRemove?.lastName} από το παιδί;
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setDoctorToRemove(null)} disabled={removing}>
              Ακύρωση
            </Button>
            <Button color="red" onClick={handleConfirm} loading={removing}>
              Αποσύνδεση
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

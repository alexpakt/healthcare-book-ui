import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextInput,
  Button,
  Stack,
  Alert,
  Group,
  Card,
  Text,
  Badge,
  Modal,
  Textarea,
  Center,
  Loader,
} from '@mantine/core';
import { IconAlertCircle, IconSearch } from '@tabler/icons-react';
import { childService } from '../../services/childService';
import { doctorChildRequestService } from '../../services/doctorChildRequestService';
import type { ChildRecord } from '../../services/childService';
import type { AssignedChild } from '../../types/doctor';
import { formatDate } from '../../utils/dateFormat';

interface SearchChildFormProps {
  patients: AssignedChild[] | null;
}

export const SearchChildForm: React.FC<SearchChildFormProps> = ({ patients }) => {
  const navigate = useNavigate();
  const [amka, setAmka] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundChild, setFoundChild] = useState<ChildRecord | null>(null);
  const [requestOpened, setRequestOpened] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAlreadyPatient = foundChild && patients?.some(p => p.id === foundChild.id);

  const handleAmkaChange = (value: string) => {
    const filtered = value.replace(/\D/g, '').slice(0, 11);
    setAmka(filtered);
  };

  const handleSearch = async () => {
    if (!/^\d{11}$/.test(amka)) {
      setError('Το AMKA πρέπει να είναι ακριβώς 11 ψηφία');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const child = await childService.searchByAmka(amka);
      setFoundChild(child);
    } catch {
      setError('Δεν υπάρχει αυτός ο ΑΜΚΑ καταχωρημένος στην βάση δεδομένων.');
      setFoundChild(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!foundChild) return;

    setSubmitting(true);
    try {
      await doctorChildRequestService.sendConnectionRequest({
        childId: foundChild.id,
        notes: requestNotes || undefined,
      });
      alert('Αίτηση σύνδεσης στάλθηκε επιτυχώς');
      setFoundChild(null);
      setAmka('');
      setRequestNotes('');
      setRequestOpened(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Σφάλμα κατά την αποστολή της αίτησης'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack gap="lg">
      <Card p="md" radius="md" withBorder>
        <Stack gap="md">
          <Text fw={600} size="lg">
            Αναζήτηση Παιδιού
          </Text>

          <Group grow align="flex-end">
            <TextInput
              label="AMKA Παιδιού"
              placeholder="11 ψηφία"
              description="Εισάγετε το AMKA του παιδιού (μόνο αριθμούς)"
              value={amka}
              onChange={(e) => handleAmkaChange(e.target.value)}
              maxLength={11}
              disabled={loading}
              error={amka && !/^\d{11}$/.test(amka) ? 'Πρέπει να είναι ακριβώς 11 ψηφία' : false}
            />
            <Button
              onClick={handleSearch}
              loading={loading}
              disabled={!/^\d{11}$/.test(amka)}
              leftSection={<IconSearch size={16} />}
            >
              Αναζήτηση
            </Button>
          </Group>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              title="Σφάλμα"
            >
              {error}
            </Alert>
          )}
        </Stack>
      </Card>

      {loading && (
        <Center>
          <Loader />
        </Center>
      )}

      {foundChild && (
        <Card p="md" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text fw={600} size="lg">
                  {foundChild.firstName} {foundChild.lastName}
                </Text>
                <Text size="sm" c="dimmed">
                  AMKA: {foundChild.amka}
                </Text>
                <Text size="sm" c="dimmed">
                  Γεννήθηκε: {formatDate(foundChild.dateOfBirth)}
                </Text>
                {foundChild.bloodType && (
                  <Text size="sm" c="dimmed">
                    Ομάδα αίματος: <Badge size="sm">{foundChild.bloodType}</Badge>
                  </Text>
                )}
              </div>
            </Group>

            <Button
              fullWidth
              onClick={() => isAlreadyPatient ? navigate(`/patients/${foundChild.id}`) : setRequestOpened(true)}
              color="blue"
            >
              {isAlreadyPatient ? "Ιατρικό ιστορικό" : "Αίτηση Σύνδεσης"}
            </Button>
          </Stack>
        </Card>
      )}

      <Modal
        opened={requestOpened}
        onClose={() => setRequestOpened(false)}
        title="Αίτηση Σύνδεσης Ασθενή"
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Θα σταλεί αίτηση σύνδεσης στον γονέα του παιδιού. Ο γονέας θα πρέπει να εγκρίνει τη σύνδεση.
          </Text>

          <Textarea
            label="Σημειώσεις (Προαιρετικό)"
            placeholder="π.χ. Λόγος αίτησης σύνδεσης"
            value={requestNotes}
            onChange={(e) => setRequestNotes(e.target.value)}
            rows={3}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setRequestOpened(false)} disabled={submitting}>
              Ακύρωση
            </Button>
            <Button
              onClick={handleSendRequest}
              loading={submitting}
              disabled={!foundChild}
            >
              Αποστολή Αίτησης
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

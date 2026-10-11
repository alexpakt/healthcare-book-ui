import React, { useEffect, useState } from 'react';
import {
  Card,
  Text,
  Stack,
  Group,
  Button,
  Grid,
  Alert,
  Center,
  Loader,
  Modal,
  Textarea,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { doctorChildRequestService, type DoctorChildRequestResponse } from '../../services/doctorChildRequestService';
import { formatDate } from '../../utils/dateFormat';

export const DoctorConnectionRequests: React.FC = () => {
  const [requests, setRequests] = useState<DoctorChildRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectModalOpened, setRejectModalOpened] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await doctorChildRequestService.getPendingRequests();
      setRequests(data);
      setError('');
    } catch (err: any) {
      setError('Σφάλμα κατά τη φόρτωση των αιτήσεων');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      await doctorChildRequestService.approveRequest(requestId);
      setRequests(requests.filter(r => r.id !== requestId));
      alert('Η σύνδεση εγκρίθηκε επιτυχώς');
    } catch (err: any) {
      alert('Σφάλμα κατά την έγκριση της σύνδεσης');
      console.error('Error approving request:', err);
    }
  };

  const handleRejectClick = (requestId: number) => {
    setSelectedRequestId(requestId);
    setRejectReason('');
    setRejectModalOpened(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequestId) return;

    setRejecting(true);
    try {
      await doctorChildRequestService.rejectRequest(selectedRequestId, rejectReason || undefined);
      setRequests(requests.filter(r => r.id !== selectedRequestId));
      setRejectModalOpened(false);
      alert('Η σύνδεση απορρίφθηκε');
    } catch (err: any) {
      alert('Σφάλμα κατά την απόρριψη της σύνδεσης');
      console.error('Error rejecting request:', err);
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα">
        {error}
      </Alert>
    );
  }

  if (requests.length === 0) {
    return (
      <Card p="md" radius="md" withBorder>
        <Center py="xl">
          <Text c="dimmed">Δεν έχετε εκκρεμείς αιτήσεις σύνδεσης</Text>
        </Center>
      </Card>
    );
  }

  return (
    <>
      <Stack gap="md">
        {requests.map((request) => (
          <Card key={request.id} p="md" radius="md" withBorder>
            <Grid align="center">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Stack gap="md">
                  <div>
                    <Text fw={600} size="lg">
                      {request.doctorFirstName} {request.doctorLastName}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {request.doctorSpecialization}
                    </Text>
                  </div>
                  <div>
                    <Text size="sm" c="dimmed">
                      Αίτηση για: <strong>{request.childFirstName} {request.childLastName}</strong>
                    </Text>
                    <Text size="sm" c="dimmed">
                      Ημερομηνία: {formatDate(request.requestedAt)}
                    </Text>
                  </div>
                  {request.notes && (
                    <Alert color="blue" title="Σημειώσεις">
                      {request.notes}
                    </Alert>
                  )}
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group grow justify="flex-end">
                  <Button
                    color="green"
                    onClick={() => handleApprove(request.id)}
                  >
                    Έγκριση
                  </Button>
                  <Button
                    color="red"
                    variant="light"
                    onClick={() => handleRejectClick(request.id)}
                  >
                    Απόρριψη
                  </Button>
                </Group>
              </Grid.Col>
            </Grid>
          </Card>
        ))}
      </Stack>

      <Modal
        opened={rejectModalOpened}
        onClose={() => setRejectModalOpened(false)}
        title="Απόρριψη Αίτησης Σύνδεσης"
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Ο γονέας θα λάβει ειδοποίηση για την απόρριψη της αίτησης.
          </Text>

          <Textarea
            label="Λόγος Απόρριψης (Προαιρετικό)"
            placeholder="π.χ. Δεν θέλω σύνδεση με αυτόν τον γιατρό"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setRejectModalOpened(false)} disabled={rejecting}>
              Ακύρωση
            </Button>
            <Button
              color="red"
              onClick={handleRejectConfirm}
              loading={rejecting}
            >
              Απόρριψη
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

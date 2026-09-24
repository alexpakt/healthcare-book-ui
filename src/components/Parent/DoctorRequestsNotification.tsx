import React, { useEffect, useState } from 'react';
import { Badge, Button, Modal, Stack } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { DoctorConnectionRequests } from './DoctorConnectionRequests';
import { doctorChildRequestService } from '../../services/doctorChildRequestService';

export const DoctorRequestsNotification: React.FC = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchPendingCount();
    // Poll for new requests every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const requests = await doctorChildRequestService.getPendingRequests();
      setPendingCount(requests.length);
    } catch (error) {
      console.error('Error fetching pending requests count:', error);
    }
  };

  return (
    <>
      <Button
        variant="subtle"
        size="lg"
        onClick={() => setModalOpened(true)}
        rightSection={
          pendingCount > 0 && (
            <Badge size="lg" circle color="red">
              {pendingCount}
            </Badge>
          )
        }
        leftSection={<IconBell size={20} />}
      >
        Αιτήσεις Γιατρών
      </Button>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          fetchPendingCount();
        }}
        title="Αιτήσεις Σύνδεσης από Γιατρούς"
        size="lg"
        centered
      >
        <Stack gap="md">
          <DoctorConnectionRequests />
        </Stack>
      </Modal>
    </>
  );
};

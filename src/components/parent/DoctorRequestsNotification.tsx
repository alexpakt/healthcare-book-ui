import React, { useEffect, useState } from 'react';
import { Badge, Button, Modal, Stack } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { DoctorConnectionRequests } from './DoctorConnectionRequests';
import { usePendingChildRequests } from '../../hooks/useDoctorChildRequests';

export const DoctorRequestsNotification: React.FC = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const { data, refetch } = usePendingChildRequests();
  const pendingCount = data?.length ?? 0;

  useEffect(() => {
    // Poll for new requests every 30 seconds
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (pendingCount === 0) {
    return null;
  }

  return (
    <>
      <Button
        variant="subtle"
        size="lg"
        onClick={() => setModalOpened(true)}
        rightSection={
          <Badge size="lg" circle color="red">
            {pendingCount}
          </Badge>
        }
        leftSection={<IconBell size={20} />}
      >
        Αιτήσεις Γιατρών
      </Button>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          refetch();
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

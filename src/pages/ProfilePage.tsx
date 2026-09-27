import React from 'react';
import { Stack, Title } from '@mantine/core';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { EditProfileForm } from '../components/dashboard/EditProfileForm';
import { ChangePasswordForm } from '../components/dashboard/ChangePasswordForm';

const ProfilePage: React.FC = () => {
  return (
    <DashboardLayout>
      <Stack gap="lg">
        <Title order={2}>Ρυθμίσεις</Title>
        <EditProfileForm />
        <ChangePasswordForm />
      </Stack>
    </DashboardLayout>
  );
};

export default ProfilePage;

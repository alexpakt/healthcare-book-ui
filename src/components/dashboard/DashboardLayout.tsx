import React from 'react';
import type { ReactNode } from 'react';
import {
  AppShell,
  Group,
  Button,
  Text,
  Menu,
  Avatar,
  Stack,
  NavLink,
  Title,
  Loader,
  Center,
} from '@mantine/core';
import {
  IconLogout,
  IconHome,
  IconUsers,
  IconCalendar,
  IconMedicalCross,
  IconSettings,
  IconServerCog,
  IconStethoscope,
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '../../types/common';

interface DashboardLayoutProps {
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const getNavItemsByRole = (role: UserRole): NavItem[] => {
  const baseItems: Record<UserRole, NavItem[]> = {
    ROLE_PARENT: [
      { label: 'Αρχική σελίδα', icon: <IconHome size={16} />, path: '/' },
      { label: 'Τα παιδιά μου', icon: <IconUsers size={16} />, path: '/children' },
      { label: 'Ραντεβού', icon: <IconCalendar size={16} />, path: '/appointments' },
      { label: 'Ιστορικό Υγείας', icon: <IconMedicalCross size={16} />, path: '/medical-history' },
      { label: 'Ιατροί', icon: <IconStethoscope size={16} />, path: '/doctors' },
    ],
    ROLE_DOCTOR: [
      { label: 'Αρχική σελίδα', icon: <IconHome size={16} />, path: '/' },
      { label: 'Ασθενείς', icon: <IconUsers size={16} />, path: '/patients' },
      { label: 'Ραντεβού', icon: <IconCalendar size={16} />, path: '/appointments' },
      { label: 'Σημειώσεις', icon: <IconMedicalCross size={16} />, path: '/notes' },
    ],
    ROLE_ADMIN: [
      { label: 'Αρχική σελίδα', icon: <IconHome size={16} />, path: '/' },
      { label: 'Χρήστες', icon: <IconUsers size={16} />, path: '/users' },
      { label: 'Σύστημα', icon: <IconServerCog size={16} />, path: '/system' },
      { label: 'Ρυθμίσεις', icon: <IconSettings size={16} />, path: '/settings' },
    ],
  };

  return baseItems[role] || [];
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  isLoading = false,
  error = null,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = getNavItemsByRole(user?.role as UserRole);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Stack align="center">
          <Text c="red" fw={600}>
            Σφάλμα Φόρτωσης
          </Text>
          <Text c="dimmed">{error}</Text>
          <Button onClick={() => window.location.reload()}>Δοκιμάστε ξανά</Button>
        </Stack>
      </Center>
    );
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: true },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md">
          <Title order={3}>ECHR</Title>
          <Group gap="md">
            <Menu position="bottom-end" shadow="md">
              <Menu.Target>
                <Group gap="xs" style={{ cursor: 'pointer' }}>
                  <div style={{ textAlign: 'right' }}>
                    <Text size="sm" fw={500}>
                      {user?.username}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {user?.role?.replace('ROLE_', '')}
                    </Text>
                  </div>
                  <Avatar color="blue" radius="xl">
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </Group>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item disabled>
                    Ρυθμίσεις
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  onClick={handleLogout}
                  color="red"
                >
                  Αποσύνδεση
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap={0}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              label={item.label}
              leftSection={item.icon}
              onClick={() => navigate(item.path)}
              style={{ cursor: 'pointer', borderRadius: 4 }}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

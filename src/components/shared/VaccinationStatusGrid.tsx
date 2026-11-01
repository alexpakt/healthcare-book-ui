import React, { useMemo } from 'react';
import { Stack, Table, Text, Center, Loader, Paper, Alert, Box } from '@mantine/core';
import { IconVaccine, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import type { Appointment, VaccinationRecord, VaccinationSchedule } from '../../types/parent';
import { getDoseState, getSchedulesForAge } from '../../utils/vaccinationStatus';
import type { DoseStatus } from '../../utils/vaccinationStatus';
import { formatDate } from '../../utils/dateFormat';

export type ViewerRole = 'PARENT' | 'DOCTOR';

export interface DoseSelection {
  vaccineName: string;
  vaccineNameGr: string;
  doseNumber: number | null;
  recommendedAgeMonths: number;
  status: DoseStatus;
}

interface VaccinationStatusGridProps {
  ageInMonths: number;
  schedules: VaccinationSchedule[] | null;
  vaccinations: VaccinationRecord[] | null;
  appointments: Appointment[] | null;
  viewerRole: ViewerRole;
  isLoading?: boolean;
  loadError?: boolean;
  onDoseClick?: (dose: DoseSelection) => void;
}

interface VaccineRow {
  vaccineName: string;
  vaccineNameGr: string;
  doses: {
    doseNumber: number | null;
    recommendedAgeMonths: number;
    status: DoseStatus;
    recordedVaccination?: VaccinationRecord;
    scheduledAppointment?: Appointment;
  }[];
}

const isActionable = (status: DoseStatus, role: ViewerRole): boolean => {
  if (role === 'DOCTOR') {
    return status !== 'COMPLETED';
  }
  return status === 'OVERDUE' || status === 'PENDING' || status === 'FUTURE';
};

export const VaccinationStatusGrid: React.FC<VaccinationStatusGridProps> = ({
  ageInMonths,
  schedules,
  vaccinations,
  appointments,
  viewerRole,
  isLoading: externalLoading,
  loadError = false,
  onDoseClick,
}) => {
  const vaccineRows = useMemo<VaccineRow[]>(() => {
    if (!schedules || ageInMonths < 0) {
      return [];
    }

    const data = getSchedulesForAge(schedules, ageInMonths);
    const vaccineMap = new Map<string, VaccineRow>();

    data.forEach((schedule) => {
      const key = schedule.vaccineName;
      if (!vaccineMap.has(key)) {
        vaccineMap.set(key, {
          vaccineName: schedule.vaccineName,
          vaccineNameGr: schedule.vaccineNameGr || schedule.vaccineName,
          doses: [],
        });
      }

      const { status, recordedVaccination, scheduledAppointment } = getDoseState(
        schedule,
        ageInMonths,
        vaccinations,
        appointments
      );

      vaccineMap.get(key)!.doses.push({
        doseNumber: schedule.doseNumber ?? null,
        recommendedAgeMonths: schedule.recommendedAgeMonths,
        status,
        recordedVaccination,
        scheduledAppointment,
      });
    });

    vaccineMap.forEach((row) => {
      row.doses.sort((a, b) => (a.doseNumber || 0) - (b.doseNumber || 0));
    });

    return Array.from(vaccineMap.values()).sort((a, b) =>
      a.vaccineNameGr.localeCompare(b.vaccineNameGr)
    );
  }, [schedules, ageInMonths, vaccinations, appointments]);

  if (loadError) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Σφάλμα">
        Αποτυχία φόρτωσης προγράμματος εμβολιασμών
      </Alert>
    );
  }

  if (externalLoading || !schedules) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (vaccineRows.length === 0) {
    return (
      <Paper p="md" radius="md" withBorder>
        <Center py="xl">
          <Stack align="center" gap="md">
            <IconVaccine size={40} color="var(--mantine-color-gray-3)" />
            <Text c="dimmed">Δεν υπάρχουν εμβολιασμοί που συνιστώνται για αυτή την ηλικία</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  const allDoseNumbers = new Set<number>();
  vaccineRows.forEach((row) => {
    row.doses.forEach((dose) => {
      if (dose.doseNumber) allDoseNumbers.add(dose.doseNumber);
    });
  });
  const sortedDoseNumbers = Array.from(allDoseNumbers).sort((a, b) => a - b);

  const hasOverdue = vaccineRows.some((row) => row.doses.some((d) => d.status === 'OVERDUE'));
  const actionHint = viewerRole === 'DOCTOR' ? 'Κλικ για ενέργεια' : 'Κλικ για ραντεβού';

  return (
    <Stack gap="md">
      <Paper p="md" radius="md" withBorder style={{ overflowX: 'auto' }}>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ minWidth: '200px' }}>Εμβόλιο</Table.Th>
              {sortedDoseNumbers.map((doseNum) => (
                <Table.Th key={`dose-${doseNum}`} style={{ minWidth: '120px', textAlign: 'center' }}>
                  Δόση {doseNum}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {vaccineRows.map((row) => (
              <Table.Tr key={row.vaccineName}>
                <Table.Td>
                  <Text size="sm" fw={600}>
                    {row.vaccineNameGr}
                  </Text>
                </Table.Td>
                {sortedDoseNumbers.map((doseNum) => {
                  const dose = row.doses.find((d) => d.doseNumber === doseNum);

                  if (!dose) {
                    return (
                      <Table.Td key={`${row.vaccineName}-${doseNum}`}>
                        <Box style={{ opacity: 0.3 }}>—</Box>
                      </Table.Td>
                    );
                  }

                  const clickable = !!onDoseClick && isActionable(dose.status, viewerRole);
                  const bgColor = {
                    COMPLETED: 'var(--mantine-color-green-1)',
                    PENDING: 'var(--mantine-color-yellow-1)',
                    OVERDUE: 'var(--mantine-color-red-1)',
                    SCHEDULED: 'var(--mantine-color-blue-1)',
                    FUTURE: 'var(--mantine-color-gray-1)',
                  }[dose.status];

                  const borderColor = {
                    COMPLETED: 'var(--mantine-color-green-6)',
                    PENDING: 'var(--mantine-color-yellow-6)',
                    OVERDUE: 'var(--mantine-color-red-6)',
                    SCHEDULED: 'var(--mantine-color-blue-6)',
                    FUTURE: 'var(--mantine-color-gray-4)',
                  }[dose.status];

                  const cellContent = (
                    <Box
                      style={{
                        padding: '12px',
                        backgroundColor: bgColor,
                        border: `2px solid ${borderColor}`,
                        borderRadius: '8px',
                        cursor: clickable ? 'pointer' : 'default',
                        textAlign: 'center',
                        minHeight: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '4px',
                        transition: clickable ? 'all 0.2s' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (clickable) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (clickable) {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                      onClick={() => {
                        if (clickable) {
                          onDoseClick!({
                            vaccineName: row.vaccineName,
                            vaccineNameGr: row.vaccineNameGr,
                            doseNumber: dose.doseNumber,
                            recommendedAgeMonths: dose.recommendedAgeMonths,
                            status: dose.status,
                          });
                        }
                      }}
                    >
                      {dose.status === 'COMPLETED' && dose.recordedVaccination ? (
                        <>
                          <IconCheck size={20} color="green" />
                          <Text size="xs" fw={600} c="green">
                            Ολοκληρωμένο
                          </Text>
                          <Text size="xs" c="dimmed">
                            {formatDate(dose.recordedVaccination.administeredDate)}
                          </Text>
                        </>
                      ) : dose.status === 'SCHEDULED' ? (
                        <>
                          <Text size="sm" fw={700} c="blue">
                            ✓ Προγραμματισμένο
                          </Text>
                          <Text size="xs" c="dimmed">
                            {dose.scheduledAppointment
                              ? formatDate(dose.scheduledAppointment.appointmentDate)
                              : 'Ραντεβού κλείστηκε'}
                          </Text>
                          {clickable && (
                            <Text size="xs" fw={600} c="blue" style={{ marginTop: '4px' }}>
                              {actionHint}
                            </Text>
                          )}
                        </>
                      ) : dose.status === 'OVERDUE' ? (
                        <>
                          <Text size="sm" fw={700} c="red">
                            ⚠ Καθυστερημένο
                          </Text>
                          <Text size="xs" c="dimmed">
                            {dose.recommendedAgeMonths} μήνες
                          </Text>
                          {clickable && (
                            <Text size="xs" fw={600} c="red" style={{ marginTop: '4px' }}>
                              {actionHint}
                            </Text>
                          )}
                        </>
                      ) : dose.status === 'PENDING' ? (
                        <>
                          <Text size="sm" fw={700} c="orange">
                            ⏳ Εκκρεμές
                          </Text>
                          <Text size="xs" c="dimmed">
                            {dose.recommendedAgeMonths} μήνες
                          </Text>
                          {clickable && (
                            <Text size="xs" fw={600} c="orange" style={{ marginTop: '4px' }}>
                              {actionHint}
                            </Text>
                          )}
                        </>
                      ) : (
                        <>
                          <Text size="sm" fw={600} c="gray">
                            📅 Μελλοντικό
                          </Text>
                          <Text size="xs" c="dimmed">
                            {dose.recommendedAgeMonths} μήνες
                          </Text>
                          {clickable && (
                            <Text size="xs" fw={600} c="gray" style={{ marginTop: '4px' }}>
                              {actionHint}
                            </Text>
                          )}
                        </>
                      )}
                    </Box>
                  );

                  return (
                    <Table.Td key={`${row.vaccineName}-${doseNum}`} style={{ padding: '4px' }}>
                      {cellContent}
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {hasOverdue && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Προσοχή">
          {viewerRole === 'DOCTOR'
            ? 'Υπάρχουν καθυστερημένοι εμβολιασμοί. Καταχωρήστε τη δόση ή κλείστε ραντεβού από τον πίνακα.'
            : 'Υπάρχουν καθυστερημένοι εμβολιασμοί. Παρακαλώ επικοινωνήστε με τον ιατρό του παιδιού ή κάντε κλικ στο εμβόλιο για να κλείσετε ραντεβού.'}
        </Alert>
      )}
    </Stack>
  );
};

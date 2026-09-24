import React, { useEffect, useState } from 'react';
import { Stack, Table, Text, Center, Loader, Paper, Alert, Box } from '@mantine/core';
import { IconVaccine, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import type { VaccinationRecord, VaccinationSchedule } from '../../types/parent';
import { parentService } from '../../services/parentService';
import { AppointmentRequestForm } from '../Parent/AppointmentRequestForm';
import { useParentChildAppointments } from '../../hooks/useParentData';

interface VaccinationStatusGridProps {
  ageInMonths: number;
  vaccinations: VaccinationRecord[] | null;
  childId: number;
  isLoading?: boolean;
  onScheduleClick?: (vaccineInfo: { vaccineName: string; recommendedAgeMonths: number }) => void;
}

interface VaccineRow {
  vaccineName: string;
  vaccineNameGr: string;
  doses: {
    doseNumber: number | null;
    recommendedAgeMonths: number;
    schedule: VaccinationSchedule;
    status: 'COMPLETED' | 'PENDING' | 'OVERDUE' | 'FUTURE' | 'SCHEDULED';
    recordedVaccination?: VaccinationRecord;
  }[];
}


export const VaccinationStatusGrid: React.FC<VaccinationStatusGridProps> = ({
  ageInMonths,
  vaccinations,
  childId,
  isLoading: externalLoading,
  onScheduleClick,
}) => {
  const [vaccineRows, setVaccineRows] = useState<VaccineRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointmentFormOpen, setAppointmentFormOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState<{ vaccineName: string; recommendedAgeMonths: number } | null>(null);

  const appointmentsQuery = useParentChildAppointments(childId);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const allData = await parentService.getVaccinationSchedules();
        const maxAge = ageInMonths + 6;
        const data = allData.filter((schedule) => schedule.recommendedAgeMonths <= maxAge);

        // Group vaccines by name
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

          const row = vaccineMap.get(key)!;

          // Check if THIS SPECIFIC DOSE has been recorded (by dose number)
          const recordedVaccination = vaccinations?.find(
            (v) => v.vaccineName === schedule.vaccineName && v.doseNumber === schedule.doseNumber
          );

          const isCompleted = !!recordedVaccination;
          let status: 'COMPLETED' | 'PENDING' | 'OVERDUE' | 'FUTURE' | 'SCHEDULED' = 'FUTURE';

          if (isCompleted) {
            status = 'COMPLETED';
          } else {
            // Check if there's a scheduled appointment for this specific vaccine dose
            // Match by vaccine name AND recommended age to avoid matching all doses
            const ageMonthsStr = `${schedule.recommendedAgeMonths}μ`;
            const scheduledAppointment = appointmentsQuery.data?.find(
              (apt) =>
                apt.status === 'SCHEDULED' &&
                apt.reason?.includes(schedule.vaccineName) &&
                apt.reason?.includes(ageMonthsStr)
            );

            if (scheduledAppointment) {
              status = 'SCHEDULED';
            } else {
              const recommendedAge = schedule.recommendedAgeMonths;
              const ageMinusOne = ageInMonths - 1;
              const agePlusOne = ageInMonths + 1;

              if (recommendedAge >= ageMinusOne && recommendedAge <= agePlusOne) {
                status = 'PENDING';
              } else if (recommendedAge < ageMinusOne) {
                status = 'OVERDUE';
              } else {
                status = 'FUTURE';
              }
            }
          }

          row.doses.push({
            doseNumber: schedule.doseNumber ?? null,
            recommendedAgeMonths: schedule.recommendedAgeMonths,
            schedule,
            status,
            recordedVaccination,
          });
        });

        // Sort doses by dose number
        vaccineMap.forEach((row) => {
          row.doses.sort((a, b) => (a.doseNumber || 0) - (b.doseNumber || 0));
        });

        // Convert map to sorted array
        const rows = Array.from(vaccineMap.values()).sort((a, b) =>
          a.vaccineNameGr.localeCompare(b.vaccineNameGr)
        );

        setVaccineRows(rows);
      } catch (err) {
        console.error('Error fetching vaccination schedules:', err);
        setError('Αποτυχία φόρτωσης προγράμματος εμβολιασμών');
      } finally {
        setIsLoading(false);
      }
    };

    if (ageInMonths >= 0) {
      fetchSchedules();
    }
  }, [ageInMonths, vaccinations, appointmentsQuery.data]);

  const loading = isLoading || externalLoading;

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

  // Get all unique dose numbers across all vaccines
  const allDoseNumbers = new Set<number>();
  vaccineRows.forEach((row) => {
    row.doses.forEach((dose) => {
      if (dose.doseNumber) allDoseNumbers.add(dose.doseNumber);
    });
  });
  const sortedDoseNumbers = Array.from(allDoseNumbers).sort((a, b) => a - b);

  const hasOverdue = vaccineRows.some((row) => row.doses.some((d) => d.status === 'OVERDUE'));

  const handleCellClick = (vaccineInfo: { vaccineName: string; recommendedAgeMonths: number }) => {
    setSelectedVaccine(vaccineInfo);
    setAppointmentFormOpen(true);
    onScheduleClick?.(vaccineInfo);
  };

  const handleAppointmentSuccess = async () => {
    // Refetch appointments to show the newly scheduled appointment
    await appointmentsQuery.refetch();
    setAppointmentFormOpen(false);
    setSelectedVaccine(null);
  };

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

                  const isClickable = dose.status === 'OVERDUE' || dose.status === 'PENDING' || dose.status === 'FUTURE';
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
                        cursor: isClickable ? 'pointer' : 'default',
                        textAlign: 'center',
                        minHeight: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '4px',
                        transition: isClickable ? 'all 0.2s' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (isClickable) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isClickable) {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                      onClick={() => {
                        if (isClickable) {
                          handleCellClick({
                            vaccineName: row.vaccineName,
                            recommendedAgeMonths: dose.recommendedAgeMonths,
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
                            {new Date(dose.recordedVaccination.administeredDate).toLocaleDateString('el-GR')}
                          </Text>
                        </>
                      ) : dose.status === 'SCHEDULED' ? (
                        <>
                          <Text size="sm" fw={700} c="blue">
                            ✓ Προγραμματισμένο
                          </Text>
                          <Text size="xs" c="dimmed">
                            {(() => {
                              const ageMonthsStr = `${dose.recommendedAgeMonths}μ`;
                              const appointment = appointmentsQuery.data?.find(
                                (apt) =>
                                  apt.status === 'SCHEDULED' &&
                                  apt.reason?.includes(row.vaccineName) &&
                                  apt.reason?.includes(ageMonthsStr)
                              );
                              return appointment
                                ? new Date(appointment.appointmentDate).toLocaleDateString('el-GR')
                                : 'Ραντεβού κλείστηκε';
                            })()}
                          </Text>
                        </>
                      ) : dose.status === 'OVERDUE' ? (
                        <>
                          <Text size="sm" fw={700} c="red">
                            ⚠ Καθυστερημένο
                          </Text>
                          <Text size="xs" c="dimmed">
                            {dose.recommendedAgeMonths} μήνες
                          </Text>
                          <Text size="xs" fw={600} c="red" style={{ marginTop: '4px' }}>
                            Κλικ για ραντεβού
                          </Text>
                        </>
                      ) : dose.status === 'PENDING' ? (
                        <>
                          <Text size="sm" fw={700} c="orange">
                            ⏳ Εκκρεμές
                          </Text>
                          <Text size="xs" c="dimmed">
                            {dose.recommendedAgeMonths} μήνες
                          </Text>
                          <Text size="xs" fw={600} c="orange" style={{ marginTop: '4px' }}>
                            Κλικ για ραντεβού
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text size="sm" fw={600} c="gray">
                            📅 Μελλοντικό
                          </Text>
                          <Text size="xs" c="dimmed">
                            {dose.recommendedAgeMonths} μήνες
                          </Text>
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
          Υπάρχουν καθυστερημένοι εμβολιασμοί. Παρακαλώ επικοινωνήστε με το ιατρό του παιδιού ή κάντε κλικ στο καθυστερημένο εμβόλιο για να κλείσετε ραντεβού.
        </Alert>
      )}

      <AppointmentRequestForm
        opened={appointmentFormOpen}
        onClose={() => {
          setAppointmentFormOpen(false);
          setSelectedVaccine(null);
        }}
        onSuccess={handleAppointmentSuccess}
        initialChildId={childId}
        initialReason={selectedVaccine ? `Εμβολιασμός: ${selectedVaccine.vaccineName} (${selectedVaccine.recommendedAgeMonths}μ)` : undefined}
      />
    </Stack>
  );
};

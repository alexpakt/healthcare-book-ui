import React, { useState } from 'react';
import { ActionIcon, Button, Group, Input, ScrollArea, Table, Text, UnstyledButton } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { formatDate } from '../../utils/dateFormat';
import classes from './SlotPicker.module.css';
import {
  DAYS_PER_PAGE,
  addDays,
  generateDaySlots,
  getWorkDays,
  isSlotInPast,
  startOfDay,
  toSlotValue,
} from '../../utils/slots';

interface SlotPickerProps {
  value: string;
  onChange: (value: string) => void;
  /** Slots that cannot be picked, in the same format as `value`. */
  disabledSlots?: Set<string>;
  disabled?: boolean;
  label?: string;
  error?: string;
  required?: boolean;
}

const SLOTS = generateDaySlots();

const weekdayFormat = new Intl.DateTimeFormat('el-GR', { weekday: 'short' });
const longFormat = new Intl.DateTimeFormat('el-GR', { weekday: 'long', day: 'numeric', month: 'long' });

export const SlotPicker: React.FC<SlotPickerProps> = ({
  value,
  onChange,
  disabledSlots,
  disabled,
  label,
  error,
  required,
}) => {
  const [today] = useState(() => startOfDay(new Date()));
  const [weekOffset, setWeekOffset] = useState(0);

  // Skip today's column once nothing is left to pick in it.
  const todayHasSlots = SLOTS.some(
    (time) => !isSlotInPast(today, time) && !disabledSlots?.has(toSlotValue(today, time))
  );
  const firstDay = todayHasSlots ? today : addDays(today, 1);
  const days = getWorkDays(firstDay, (weekOffset + 1) * DAYS_PER_PAGE).slice(weekOffset * DAYS_PER_PAGE);
  const weekStart = days[0];
  const weekEnd = days[days.length - 1];
  const selectedDay = value ? new Date(value) : null;

  return (
    <Input.Wrapper label={label} error={error} required={required}>
      <Group justify="space-between" mt={4} mb="xs">
        <Group gap="xs">
          <ActionIcon
            variant="light"
            aria-label="Προηγούμενη εβδομάδα"
            onClick={() => setWeekOffset((w) => w - 1)}
            disabled={disabled || weekOffset === 0}
          >
            <IconChevronLeft size={16} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            aria-label="Επόμενη εβδομάδα"
            onClick={() => setWeekOffset((w) => w + 1)}
            disabled={disabled}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
        </Group>
        <Text size="sm" fw={500}>
          {formatDate(weekStart)} – {formatDate(weekEnd)}
        </Text>
        <Button variant="subtle" size="compact-sm" onClick={() => setWeekOffset(0)} disabled={disabled || weekOffset === 0}>
          Σήμερα
        </Button>
      </Group>

      <ScrollArea h={360} type="auto" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 4 }}>
        <Table stickyHeader withColumnBorders miw={480} style={{ textAlign: 'center', tableLayout: 'fixed' }}>
          <Table.Thead>
            <Table.Tr>
              {days.map((day) => (
                <Table.Th key={day.toISOString()} style={{ textAlign: 'center' }}>
                  {weekdayFormat.format(day)}
                  <br />
                  {`${day.getDate()}/${day.getMonth() + 1}`}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {SLOTS.map((time) => (
              <Table.Tr key={time}>
                {days.map((day) => {
                  const slot = toSlotValue(day, time);
                  if (isSlotInPast(day, time)) {
                    return <Table.Td key={slot} p={2} />;
                  }
                  const unavailable = disabled || disabledSlots?.has(slot);
                  const selected = slot === value;
                  return (
                    <Table.Td key={slot} p={2}>
                      <UnstyledButton
                        type="button"
                        className={classes.slot}
                        aria-label={`${longFormat.format(day)}, ${time}`}
                        aria-pressed={selected}
                        disabled={unavailable}
                        onClick={() => onChange(slot)}
                        w="100%"
                        h={28}
                        style={{
                          borderRadius: 4,
                          background: selected ? 'var(--mantine-primary-color-filled)' : undefined,
                          opacity: unavailable ? 0.3 : 1,
                          cursor: unavailable ? 'not-allowed' : 'pointer',
                          color: selected ? 'var(--mantine-primary-color-contrast)' : undefined,
                          fontSize: 'var(--mantine-font-size-xs)',
                          textAlign: 'center',
                        }}
                      >
                        {time}
                      </UnstyledButton>
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {selectedDay && (
        <Text size="sm" mt="xs">
          Επιλέχθηκε: {longFormat.format(selectedDay)}, {value.slice(11, 16)}
        </Text>
      )}
    </Input.Wrapper>
  );
};

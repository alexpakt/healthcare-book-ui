import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Appointment } from '../../types/parent';
import { addDays, generateDaySlots, getBookedSlots, getWorkDays, isSlotInPast, toSlotValue } from '../slots';

describe('generateDaySlots', () => {
  it('returns 24 half-hour slots from 08:00 to 19:30', () => {
    const slots = generateDaySlots();
    expect(slots).toHaveLength(24);
    expect(slots.slice(0, 3)).toEqual(['08:00', '08:30', '09:00']);
    expect(slots[slots.length - 1]).toBe('19:30');
  });
});

describe('getWorkDays', () => {
  const format = (days: Date[]) => days.map((d) => toSlotValue(d, '08:00').slice(0, 10));

  it('returns consecutive weekdays across a month and year boundary', () => {
    expect(format(getWorkDays(new Date(2026, 11, 29), 5))).toEqual([
      '2026-12-29',
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-04',
    ]);
  });

  it('skips weekends, starting from the next weekday when given a weekend day', () => {
    expect(format(getWorkDays(new Date(2026, 9, 31), 2))).toEqual(['2026-11-02', '2026-11-03']);
    expect(format(getWorkDays(new Date(2026, 10, 1), 1))).toEqual(['2026-11-02']);
  });
});

describe('addDays', () => {
  it('keeps local midnight across the October DST change in Athens', () => {
    const next = addDays(new Date(2026, 9, 24), 2);
    expect(next.getDate()).toBe(26);
    expect(next.getHours()).toBe(0);
  });
});

describe('toSlotValue', () => {
  it('pads month and day', () => {
    expect(toSlotValue(new Date(2026, 0, 5), '09:30')).toBe('2026-01-05T09:30');
  });
});

describe('isSlotInPast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 31, 10, 0));
  });
  afterEach(() => vi.useRealTimers());

  it('treats the current and earlier slots as past', () => {
    const day = new Date(2026, 9, 31);
    expect(isSlotInPast(day, '09:30')).toBe(true);
    expect(isSlotInPast(day, '10:00')).toBe(true);
    expect(isSlotInPast(day, '10:30')).toBe(false);
  });
});

describe('getBookedSlots', () => {
  const base: Appointment = {
    id: 1,
    childId: 1,
    childName: 'A',
    doctorId: 5,
    doctorName: 'D',
    appointmentDate: '2026-11-02T09:30:00',
    reason: '',
    status: 'REQUESTED',
  };

  it('includes active appointments with the doctor, normalised to minutes', () => {
    const booked = getBookedSlots([base, { ...base, id: 2, status: 'SCHEDULED', appointmentDate: '2026-11-03T10:00' }], 5);
    expect([...booked]).toEqual(['2026-11-02T09:30', '2026-11-03T10:00']);
  });

  it('ignores other doctors and inactive statuses', () => {
    const booked = getBookedSlots(
      [
        { ...base, doctorId: 6 },
        { ...base, id: 2, status: 'CANCELLED' },
        { ...base, id: 3, status: 'DECLINED' },
        { ...base, id: 4, status: 'COMPLETED' },
      ],
      5
    );
    expect(booked.size).toBe(0);
  });

  it('handles missing data', () => {
    expect(getBookedSlots(null, 5).size).toBe(0);
  });
});

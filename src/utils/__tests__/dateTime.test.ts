import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getMinDateTimeLocal, isBeforeBirthDate, isNotInFuture, parseLocalDate, toLocalIsoDate } from '../dateTime';

describe('toLocalIsoDate', () => {
  it('returns the local calendar date as YYYY-MM-DD', () => {
    expect(toLocalIsoDate(new Date(2026, 9, 21, 9, 30))).toBe('2026-10-21');
  });

  it('pads single-digit month and day', () => {
    expect(toLocalIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('uses the local date just after midnight, when the UTC date is still the day before', () => {
    const original = process.env.TZ;
    process.env.TZ = 'Europe/Athens';
    try {
      expect(toLocalIsoDate(new Date(2026, 9, 21, 0, 30))).toBe('2026-10-21');
    } finally {
      process.env.TZ = original;
    }
  });
});

describe('parseLocalDate', () => {
  it('returns local midnight on the given calendar date', () => {
    const date = parseLocalDate('2015-03-10');
    expect(date).toBeInstanceOf(Date);
    expect(date?.getFullYear()).toBe(2015);
    expect(date?.getMonth()).toBe(2);
    expect(date?.getDate()).toBe(10);
    expect(date?.getHours()).toBe(0);
  });

  it('keeps the calendar date in a timezone west of UTC', () => {
    const original = process.env.TZ;
    process.env.TZ = 'America/New_York';
    try {
      const date = parseLocalDate('2015-03-10');
      expect(date?.getDate()).toBe(10);
      expect(date?.getHours()).toBe(0);
    } finally {
      process.env.TZ = original;
    }
  });

  it('accepts 29 February in a leap year', () => {
    expect(parseLocalDate('2024-02-29')?.getDate()).toBe(29);
  });

  it('accepts 29 February in a century year divisible by 400', () => {
    expect(parseLocalDate('2000-02-29')?.getDate()).toBe(29);
  });

  it('accepts 28 February in a non-leap year', () => {
    expect(parseLocalDate('2025-02-28')?.getDate()).toBe(28);
  });

  it('rejects 29 February in a non-leap year', () => {
    expect(parseLocalDate('2025-02-29')).toBeNull();
  });

  it('rejects 29 February in a century year not divisible by 400', () => {
    expect(parseLocalDate('1900-02-29')).toBeNull();
  });

  it('rejects a day beyond the end of the month', () => {
    expect(parseLocalDate('2025-02-30')).toBeNull();
    expect(parseLocalDate('2025-04-31')).toBeNull();
  });

  it('rejects a month outside 01 to 12', () => {
    expect(parseLocalDate('2025-13-01')).toBeNull();
    expect(parseLocalDate('2025-00-10')).toBeNull();
  });

  it('rejects a day of 00', () => {
    expect(parseLocalDate('2025-01-00')).toBeNull();
  });

  it('rejects years below 100, which the Date constructor would map to 19xx', () => {
    expect(parseLocalDate('0029-02-01')).toBeNull();
  });

  it('rejects values that are not YYYY-MM-DD', () => {
    expect(parseLocalDate('10/03/2015')).toBeNull();
    expect(parseLocalDate('2015-3-10')).toBeNull();
    expect(parseLocalDate('2015-03-10T00:00:00')).toBeNull();
    expect(parseLocalDate('2015-03-10Z')).toBeNull();
    expect(parseLocalDate(' 2015-03-10')).toBeNull();
    expect(parseLocalDate('not a date')).toBeNull();
  });

  it('rejects an empty value', () => {
    expect(parseLocalDate('')).toBeNull();
  });
});

describe('getMinDateTimeLocal', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats the current local time as a datetime-local value', () => {
    vi.setSystemTime(new Date(2026, 9, 21, 8, 5, 0));
    expect(getMinDateTimeLocal()).toBe('2026-10-21T08:05');
  });

  it('pads single-digit month, day, hour and minute', () => {
    vi.setSystemTime(new Date(2026, 0, 3, 4, 7, 0));
    expect(getMinDateTimeLocal()).toBe('2026-01-03T04:07');
  });
});

describe('isNotInFuture', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 21, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts a time in the past', () => {
    expect(isNotInFuture('2026-10-20T10:00')).toBe(true);
  });

  it('accepts the current time', () => {
    expect(isNotInFuture('2026-10-21T12:00')).toBe(true);
  });

  it('rejects a time in the future', () => {
    expect(isNotInFuture('2026-10-21T12:01')).toBe(false);
  });

  it('treats an empty value as not in the future', () => {
    expect(isNotInFuture('')).toBe(false);
  });
});

describe('isBeforeBirthDate', () => {
  it('is true for a date before the date of birth', () => {
    expect(isBeforeBirthDate(new Date(2025, 4, 31), '2025-06-01')).toBe(true);
  });

  it('is false for the date of birth itself', () => {
    expect(isBeforeBirthDate(new Date(2025, 5, 1), '2025-06-01')).toBe(false);
  });

  it('accepts an ISO timestamp for the date of birth', () => {
    expect(isBeforeBirthDate(new Date(2025, 4, 31), '2025-06-01T00:00:00.000Z')).toBe(true);
  });

  it('is false when no date of birth is known', () => {
    expect(isBeforeBirthDate(new Date(2025, 4, 31))).toBe(false);
  });
});

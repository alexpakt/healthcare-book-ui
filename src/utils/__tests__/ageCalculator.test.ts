import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAgeDisplay } from '../ageCalculator';

// Fixed "today" at local noon so the day-of-month comparison is not affected by time of day.
const TODAY = new Date(2026, 9, 21, 12, 0, 0); // 21 October 2026

describe('getAgeDisplay', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows years from two years of age, in Greek', () => {
    expect(getAgeDisplay('2024-10-21')).toBe('2 ετών');
  });

  it('shows months with the plural form under two years', () => {
    expect(getAgeDisplay('2025-09-21')).toBe('13 μηνών');
  });

  it('uses the singular form for exactly one month', () => {
    expect(getAgeDisplay('2026-09-21')).toBe('1 μηνός');
  });

  it('shows months for a child a few months old', () => {
    expect(getAgeDisplay('2026-02-10')).toBe('8 μηνών');
  });

  it('shows years once the second birthday has passed', () => {
    expect(getAgeDisplay('2024-10-20')).toBe('2 ετών');
  });

  it('does not reach two years before the second birthday', () => {
    // Born 22 October 2024: on 21 October 2026 the child is 23 months old, not two years.
    expect(getAgeDisplay('2024-10-22')).not.toBe('2 ετών');
  });

  it('does not count a month until the birth day has been reached', () => {
    // Born 22 October 2025: on 21 October 2026 the child is 11 months and 29 days old.
    expect(getAgeDisplay('2025-10-22')).toBe('11 μηνών');
  });

  it('shows 0 months for a child who is less than a month old', () => {
    // Born 30 September 2026: on 21 October 2026 the child is 21 days old.
    expect(getAgeDisplay('2026-09-30')).toBe('0 μηνών');
  });

  it('reads the birth date in local time, so the age is right west of UTC', () => {
    // Born 20 October 2024, viewed on 19 October 2026 in New York: 23 months, not yet two years.
    const original = process.env.TZ;
    process.env.TZ = 'America/New_York';
    try {
      vi.setSystemTime(new Date(2026, 9, 19, 12, 0, 0));
      expect(getAgeDisplay('2024-10-20')).toBe('23 μηνών');
    } finally {
      process.env.TZ = original;
    }
  });
});

import { describe, expect, it } from 'vitest';
import { formatDate } from '../dateFormat';

describe('formatDate', () => {
  it('formats a YYYY-MM-DD string as DD/MM/YYYY without timezone shift', () => {
    expect(formatDate('2026-10-01')).toBe('01/10/2026');
    expect(formatDate('2024-02-29')).toBe('29/02/2024');
  });

  it('formats a Date object in local time', () => {
    expect(formatDate(new Date(2026, 9, 21, 9, 30))).toBe('21/10/2026');
  });

  it('pads single-digit days and months', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('05/01/2026');
  });

  it('formats an ISO date-time string in local time', () => {
    expect(formatDate(new Date(2026, 9, 21, 23, 59).toISOString())).toBe('21/10/2026');
  });
});

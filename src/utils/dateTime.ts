export function isNotInFuture(datetimeLocalValue: string): boolean {
  if (!datetimeLocalValue) return false;
  return new Date(datetimeLocalValue).getTime() <= Date.now();
}

export function isBeforeBirthDate(date: Date, dateOfBirth?: string): boolean {
  const birthDate = dateOfBirth ? parseLocalDate(dateOfBirth.slice(0, 10)) : null;
  return birthDate !== null && date < birthDate;
}

/**
 * Returns the local calendar date as YYYY-MM-DD.
 */
export function toLocalIsoDate(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Parses a YYYY-MM-DD string as local midnight, so the calendar date is the same in every timezone.
 * Returns null when the value is not a real calendar date (e.g. '10/03/2015' or '2025-02-30').
 */
export function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }
  return date;
}

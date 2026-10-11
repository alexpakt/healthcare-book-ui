const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Formats a date for display as DD/MM/YYYY (ΗΗ/ΜΜ/ΕΕΕΕ).
 */
export function formatDate(value: string | Date): string {
  if (typeof value === 'string') {
    const match = DATE_ONLY.exec(value);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
  }

  const date = value instanceof Date ? value : new Date(value);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

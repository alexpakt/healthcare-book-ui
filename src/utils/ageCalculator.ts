import { parseLocalDate } from './dateTime';

export const getAgeDisplay = (dateOfBirth: string): string => {
  const today = new Date();
  const birthDate = parseLocalDate(dateOfBirth);
  if (!birthDate) return '—';

  // Completed months: the calendar month difference, minus one if this month's
  // day has not yet reached the birth day.
  let months =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth());
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  const years = Math.floor(months / 12);
  if (years < 2) {
    const monthLabel = months === 1 ? 'μηνός' : 'μηνών';
    return `${months} ${monthLabel}`;
  }

  return `${years} ετών`;
};

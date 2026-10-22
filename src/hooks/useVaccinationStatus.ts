import { useMemo } from 'react';
import type { VaccinationRecord, Child } from '../types/parent';
import { parseLocalDate } from '../utils/dateTime';

interface UseVaccinationStatusProps {
  child: Child;
  vaccinations: VaccinationRecord[] | null;
}

/**
 * Calculate child's age in months based on date of birth
 */
export const calculateAgeInMonths = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = parseLocalDate(dateOfBirth);
  if (!birthDate) return 0;

  let months = today.getMonth() - birthDate.getMonth();
  let years = today.getFullYear() - birthDate.getFullYear();

  if (months < 0) {
    years--;
    months += 12;
  }

  return years * 12 + months;
};

/**
 * Custom hook for vaccination status calculation
 * Returns child's age in months for use with VaccinationStatus component
 */
export const useVaccinationStatus = ({ child, vaccinations }: UseVaccinationStatusProps) => {
  const ageInMonths = useMemo(
    () => calculateAgeInMonths(child.dateOfBirth),
    [child.dateOfBirth]
  );

  return {
    ageInMonths,
    vaccinations,
  };
};

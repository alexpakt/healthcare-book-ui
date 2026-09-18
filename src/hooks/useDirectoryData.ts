import { useCallback } from 'react';
import { useApi } from './useApi';
import { directoryService } from '../services/directoryService';

/**
 * Hook for fetching the list of doctors (e.g. to pick one when requesting an appointment)
 */
export function useDirectoryDoctors() {
  const fetchFn = useCallback(() => directoryService.getDoctors(), []);
  return useApi(fetchFn);
}

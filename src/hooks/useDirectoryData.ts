import { useCallback } from 'react';
import { useApi } from './useApi';
import { directoryService } from '../services/directoryService';

export function useDirectoryDoctors() {
  const fetchFn = useCallback(() => directoryService.getDoctors(), []);
  return useApi(fetchFn);
}

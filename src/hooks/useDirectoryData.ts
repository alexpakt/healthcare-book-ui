import { useApi } from './useApi';
import { directoryService } from '../services/directoryService';

export function useDirectoryDoctors() {
  return useApi(() => directoryService.getDoctors(), []);
}

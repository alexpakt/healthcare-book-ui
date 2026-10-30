import { useMutation } from './useApi';
import { authService } from '../services/authService';
import type { ChangePasswordRequest } from '../types/auth';

export function useChangePassword() {
  return useMutation((request?: ChangePasswordRequest) =>
    authService.changePassword(request!)
  );
}

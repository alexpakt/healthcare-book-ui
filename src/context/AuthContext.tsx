import React, { useEffect, useState } from 'react';
import type {
  AuthContextType,
  AuthUser,
  RegisterParentRequest,
  RegisterDoctorRequest,
} from '../types/auth';
import { authService } from '../services/authService';
import { AuthContext } from './AuthContextObject';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authService
      .me()
      .then((current) => {
        if (!cancelled) setUser(current);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const authenticate = async (
    request: () => Promise<{ role: AuthUser['role']; profileId: number }>,
    username: string
  ) => {
    setIsLoading(true);
    try {
      const response = await request();
      setUser({ username, role: response.role, profileId: response.profileId });
    } finally {
      setIsLoading(false);
    }
  };

  const login = (username: string, password: string) =>
    authenticate(() => authService.login({ username, password }), username);

  const registerParent = (data: RegisterParentRequest) =>
    authenticate(() => authService.registerParent(data), data.username);

  const registerDoctor = (data: RegisterDoctorRequest) =>
    authenticate(() => authService.registerDoctor(data), data.username);

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
    }
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    registerParent,
    registerDoctor,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

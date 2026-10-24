import React, { useState } from 'react';
import type {
  AuthContextType,
  AuthUser,
  RegisterParentRequest,
  RegisterDoctorRequest,
} from '../types/auth';
import { authService } from '../services/authService';
import { AuthContext } from './AuthContextObject';

const readStoredSession = (): { user: AuthUser; token: string } | null => {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  if (!storedToken || !storedUser) return null;

  try {
    return { user: JSON.parse(storedUser), token: storedToken };
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [storedSession] = useState(readStoredSession);
  const [user, setUser] = useState<AuthUser | null>(storedSession?.user ?? null);
  const [token, setToken] = useState<string | null>(storedSession?.token ?? null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ username, password });
      setToken(response.token);
      const userData: AuthUser = {
        username,
        role: response.role,
        profileId: response.profileId,
      };
      setUser(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const registerParent = async (data: RegisterParentRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.registerParent(data);
      setToken(response.token);
      const userData: AuthUser = {
        username: data.username,
        role: response.role,
        profileId: response.profileId,
      };
      setUser(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const registerDoctor = async (data: RegisterDoctorRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.registerDoctor(data);
      setToken(response.token);
      const userData: AuthUser = {
        username: data.username,
        role: response.role,
        profileId: response.profileId,
      };
      setUser(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    authService.logout();
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    registerParent,
    registerDoctor,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

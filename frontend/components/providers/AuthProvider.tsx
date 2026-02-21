"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, User } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'manager' | 'dispatcher') => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const storedUser = authApi.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await authApi.login({ email, password });
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'manager' | 'dispatcher' = 'dispatcher'
  ) => {
    try {
      const userData = await authApi.register({ name, email, password, role });
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthUser, UserRole, authApi } from "@/lib/api-client";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department?: string;
    region?: string;
    hub_location?: string;
    certification_id?: string;
    finance_unit?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = authApi.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user: authUser } = await authApi.login({ email, password });
    setUser(authUser);
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department?: string;
    region?: string;
    hub_location?: string;
    certification_id?: string;
    finance_unit?: string;
  }) => {
    await authApi.register(data);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const updateUser = (userData: AuthUser) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

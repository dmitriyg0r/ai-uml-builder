import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, clearAuthToken, getAuthToken, setAuthToken } from '../services/apiClient';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthError {
  message: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch('/auth/me');
        setUser(data.user ?? null);
      } catch (err) {
        clearAuthToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(data.token);
      setUser(data.user ?? null);
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      return { error: { message } as AuthError };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(data.token);
      setUser(data.user ?? null);
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Register failed.';
      return { error: { message } as AuthError };
    }
  };

  const signOut = async () => {
    clearAuthToken();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

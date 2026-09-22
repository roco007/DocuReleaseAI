import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Credentials } from '../types';
import * as db from '../db';

interface AuthState {
  credentials: Credentials | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  saveCredentials: (creds: Credentials) => Promise<void>;
  clearCredentials: () => Promise<void>;
  updateCredentials: (updates: Partial<Credentials>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    credentials: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const creds = await db.getCredentials();
      setState({
        credentials: creds,
        isLoading: false,
        isAuthenticated: !!creds?.geminiApiKey,
      });
    } catch {
      setState({ credentials: null, isLoading: false, isAuthenticated: false });
    }
  };

  const saveCredentials = useCallback(async (creds: Credentials) => {
    await db.saveCredentials(creds);
    setState({ credentials: creds, isLoading: false, isAuthenticated: true });
  }, []);

  const clearCredentials = useCallback(async () => {
    await db.clearCredentials();
    setState({ credentials: null, isLoading: false, isAuthenticated: false });
  }, []);

  const updateCredentials = useCallback(async (updates: Partial<Credentials>) => {
    const current = await db.getCredentials();
    if (current) {
      const updated = { ...current, ...updates };
      await db.saveCredentials(updated);
      setState({ credentials: updated, isLoading: false, isAuthenticated: true });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, saveCredentials, clearCredentials, updateCredentials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

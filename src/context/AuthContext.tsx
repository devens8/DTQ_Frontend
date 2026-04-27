'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useFingerprint } from '@/hooks/useFingerprint';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, token: null, isLoading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fingerprint = useFingerprint();

  useEffect(() => {
    async function init() {
      try {
        const existingToken = localStorage.getItem('dtq_token');
        const existingUser = localStorage.getItem('dtq_user');

        if (existingToken && existingUser) {
          try {
            const freshUser = await api.auth.me() as unknown as User;
            setUser(freshUser);
            setToken(existingToken);
            localStorage.setItem('dtq_user', JSON.stringify(freshUser));
            setIsLoading(false);
            return;
          } catch {
            localStorage.removeItem('dtq_token');
            localStorage.removeItem('dtq_user');
          }
        }

        // Create anonymous session
        const result = await api.auth.anonymous(fingerprint) as unknown as { token: string; user: User };
        localStorage.setItem('dtq_token', result.token);
        localStorage.setItem('dtq_user', JSON.stringify(result.user));
        setToken(result.token);
        setUser(result.user);
      } catch (err) {
        console.error('Auth init failed:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (fingerprint !== 'server') init();
  }, [fingerprint]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

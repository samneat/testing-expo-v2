import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthUser, IAuthService } from '../services/auth/IAuthService';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type ProviderProps = {
  children: React.ReactNode;
  authService: IAuthService;
};

export function AuthProvider({ children, authService }: ProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, [authService]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    signIn: async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const u = await authService.signIn(email, password);
        setUser(u);
      } catch (e: any) {
        setError(e?.message ?? 'Sign in failed');
      } finally {
        setIsLoading(false);
      }
    },
    signUp: async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const u = await authService.signUp(email, password);
        setUser(u);
      } catch (e: any) {
        setError(e?.message ?? 'Sign up failed');
      } finally {
        setIsLoading(false);
      }
    },
    signOut: async () => {
      setIsLoading(true);
      setError(null);
      try {
        await authService.signOut();
        setUser(null);
      } catch (e: any) {
        setError(e?.message ?? 'Sign out failed');
      } finally {
        setIsLoading(false);
      }
    }
  }), [user, isLoading, error, authService]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

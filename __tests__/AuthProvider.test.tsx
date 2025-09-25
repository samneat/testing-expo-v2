import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock service implementation
const mockService = {
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  getCurrentUser: jest.fn(),
  onAuthStateChanged: jest.fn()
};

jest.mock('../src/context/AuthContext', () => {
  const original = jest.requireActual('../src/context/AuthContext');
  return {
    ...original,
    useAuth: original.useAuth,
    AuthProvider: original.AuthProvider
  };
});

import { AuthProvider, useAuth } from '../src/context/AuthContext';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider authService={mockService as any}>{children}</AuthProvider>
  );
}

let lastCtx: ReturnType<typeof useAuth> | null = null;
function Probe() {
  const ctx = useAuth();
  lastCtx = ctx;
  const { user, isAuthenticated, isLoading, error, signIn, signOut } = ctx;
  return (
    <>
      <Text>{isLoading ? 'loading' : 'ready'}</Text>
      <Text>{isAuthenticated ? 'authed' : 'anon'}</Text>
      <Text>{user?.email ?? 'no-user'}</Text>
      <Text>{error ?? 'no-error'}</Text>
      <Text>{typeof signIn === 'function' ? 'has-signin' : 'no-signin'}</Text>
      <Text>{typeof signOut === 'function' ? 'has-signout' : 'no-signout'}</Text>
    </>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockService.getCurrentUser.mockReturnValue(null);
    mockService.onAuthStateChanged.mockImplementation((_cb: any) => () => {});
  });

  test('provides initial anon state and methods', () => {
    render(
      <Wrapper>
        <Probe />
      </Wrapper>
    );
    expect(screen.getByText('ready')).toBeTruthy();
    expect(screen.getByText('anon')).toBeTruthy();
    expect(screen.getByText('no-user')).toBeTruthy();
    expect(screen.getByText('no-error')).toBeTruthy();
    expect(screen.getByText('has-signin')).toBeTruthy();
    expect(screen.getByText('has-signout')).toBeTruthy();
  });

  test('updates state on auth change', () => {
    const listeners: Array<(u: any) => void> = [];
    mockService.onAuthStateChanged.mockImplementation((cb: any) => {
      listeners.push(cb);
      return () => {};
    });

    render(
      <Wrapper>
        <Probe />
      </Wrapper>
    );

    act(() => listeners.forEach((cb) => cb({ uid: '1', email: 'a@b.com' })));
    expect(screen.getByText('authed')).toBeTruthy();
    expect(screen.getByText('a@b.com')).toBeTruthy();
  });

  test('signIn calls service and clears error', async () => {
    mockService.signIn.mockResolvedValue({ uid: '2', email: 'c@d.com' });

    render(
      <Wrapper>
        <Probe />
      </Wrapper>
    );

    await act(async () => {
      await lastCtx!.signIn('c@d.com', 'XyZ!123');
    });

    expect(mockService.signIn).toHaveBeenCalledWith('c@d.com', 'XyZ!123');
    expect(screen.getByText('no-error')).toBeTruthy();
  });
});

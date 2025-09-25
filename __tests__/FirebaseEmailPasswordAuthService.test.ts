import { jest } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn()
}));

const mockGetAuth = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();

jest.mock('firebase/auth', () => ({
  getAuth: () => mockGetAuth(),
  signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: any[]) => mockCreateUserWithEmailAndPassword(...args),
  signOut: (...args: any[]) => mockSignOut(...args),
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args)
}));

// Import after mocks
import { FirebaseEmailPasswordAuthService, TOKEN_KEY } from '../src/services/auth/FirebaseEmailPasswordAuthService';

describe('FirebaseEmailPasswordAuthService', () => {
  const service = new FirebaseEmailPasswordAuthService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('signIn stores token and returns user', async () => {
    const fakeUser = {
      uid: 'uid-123',
      email: 'test@example.com',
      getIdToken: jest.fn().mockResolvedValue('jwt-token-abc')
    };

    mockSignInWithEmailAndPassword.mockResolvedValue({ user: fakeUser });

    const result = await service.signIn('test@example.com', 'Passw0rd!');

    expect(fakeUser.getIdToken).toHaveBeenCalled();
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(TOKEN_KEY, 'jwt-token-abc');
    expect(result).toEqual({ uid: 'uid-123', email: 'test@example.com' });
  });

  test('signUp stores token and returns user', async () => {
    const fakeUser = {
      uid: 'uid-999',
      email: 'new@example.com',
      getIdToken: jest.fn().mockResolvedValue('new-jwt-token')
    };

    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: fakeUser });

    const result = await service.signUp('new@example.com', 'StrongP@ss1');

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(TOKEN_KEY, 'new-jwt-token');
    expect(result).toEqual({ uid: 'uid-999', email: 'new@example.com' });
  });

  test('signOut clears token', async () => {
    await service.signOut();
    expect(mockSignOut).toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(TOKEN_KEY);
  });

  test('getCurrentUser maps firebase user', () => {
    const currentUser = { uid: 'abc', email: 'a@b.com' };
    mockGetAuth.mockReturnValue({ currentUser });

    const result = service.getCurrentUser();
    expect(result).toEqual({ uid: 'abc', email: 'a@b.com' });
  });

  test('onAuthStateChanged maps user and returns unsubscribe', () => {
    const unsubscribe = jest.fn();
    mockOnAuthStateChanged.mockImplementation((auth: any, cb: any) => {
      cb({ uid: 'u1', email: 'u@e.com' });
      return unsubscribe;
    });

    const callback = jest.fn();
    const stop = service.onAuthStateChanged(callback);

    expect(callback).toHaveBeenCalledWith({ uid: 'u1', email: 'u@e.com' });

    stop();
    expect(unsubscribe).toHaveBeenCalled();
  });

  test('maps firebase error codes to friendly messages (example: invalid-email)', async () => {
    const error = Object.assign(new Error('invalid'), { code: 'auth/invalid-email' });
    mockSignInWithEmailAndPassword.mockRejectedValue(error);

    await expect(service.signIn('bad', 'x')).rejects.toThrow('The email address is invalid.');
  });
});



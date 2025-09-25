import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';

// Mock useAuth to control behavior
const mockSignIn = jest.fn();
const mockSignUp = jest.fn();
jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: jest.fn()
  })
}));

import SignInScreen from '../src/screens/SignInScreen';
import SignUpScreen from '../src/screens/SignUpScreen';

describe('Authentication Screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('SignInScreen validates email and calls signIn', async () => {
    render(<SignInScreen />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const inputs = screen.UNSAFE_queryAllByType(require('react-native').TextInput);
    const passwordInput = inputs[1];
    const button = screen.getAllByText('Sign In')[1];

    // Invalid email blocks
    fireEvent.changeText(emailInput, 'bad');
    fireEvent.changeText(passwordInput, 'secret');
    fireEvent.press(button);
    expect(mockSignIn).not.toHaveBeenCalled();

    // Fix email -> should call
    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.press(button);
    expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'secret');
  });

  test('SignUpScreen validates email and password and calls signUp', async () => {
    render(<SignUpScreen />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    // password field has no placeholder; query by role not available; use getAllByDisplayValue
    const inputs = screen.UNSAFE_queryAllByType(require('react-native').TextInput);
    const passwordInput = inputs[1];
    const button = screen.getByText('Create Account');

    // Weak password blocks
    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.changeText(passwordInput, 'weak');
    fireEvent.press(button);
    expect(mockSignUp).not.toHaveBeenCalled();

    // Strong password proceeds
    fireEvent.changeText(passwordInput, 'Aa1!aaaa');
    fireEvent.press(button);
    expect(mockSignUp).toHaveBeenCalledWith('user@example.com', 'Aa1!aaaa');
  });
});

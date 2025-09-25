import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import AuthInput from '../components/AuthInput';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, validatePasswordStrength } from '../utils/validation';

export default function SignUpScreen() {
  const { signUp, error, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const onSubmit = async () => {
    const emailOk = isValidEmail(email);
    const passOk = validatePasswordStrength(password);
    setEmailError(emailOk ? null : 'Invalid email');
    setPasswordError(passOk ? null : 'Password too weak');
    if (!emailOk || !passOk) return;
    await signUp(email, password);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Sign Up</Text>
      <AuthInput label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" error={emailError} />
      <AuthInput label="Password" value={password} onChangeText={setPassword} secureTextEntry error={passwordError} />
      {!!error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button title={isLoading ? 'Creating...' : 'Create Account'} onPress={onSubmit} />
    </View>
  );
}

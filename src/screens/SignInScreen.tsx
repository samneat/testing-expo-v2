import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthInput from '../components/AuthInput';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/validation';

export default function SignInScreen() {
  const { signIn, error, isLoading } = useAuth();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const onSubmit = async () => {
    const valid = isValidEmail(email);
    setEmailError(valid ? null : 'Invalid email');
    if (!valid) return;
    if (!password) {
      // Avoid sending empty password to Firebase which leads to 400
      return;
    }
    await signIn(email, password);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Sign In</Text>
      <AuthInput label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" error={emailError} />
      <AuthInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {!!error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button title={isLoading ? 'Signing in...' : 'Sign In'} onPress={onSubmit} />
      <Button title="Go to Sign Up" onPress={() => navigation.navigate('SignUp')} />
    </View>
  );
}

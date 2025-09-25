import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { user, signOut, isLoading } = useAuth();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Welcome</Text>
      <Text>{user?.email ?? 'Unknown user'}</Text>
      <Button title={isLoading ? 'Signing out...' : 'Sign Out'} onPress={signOut} />
    </View>
  );
}

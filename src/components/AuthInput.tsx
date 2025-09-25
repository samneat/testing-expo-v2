import React from 'react';
import { TextInput, View, Text } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  error?: string | null;
  placeholder?: string;
};

export default function AuthInput({ label, value, onChangeText, secureTextEntry, error, placeholder }: Props) {
  return (
    <View style={{ width: '90%', marginVertical: 8 }}>
      <Text style={{ marginBottom: 4 }}>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        onChangeText={onChangeText}
        autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: error ? 'red' : '#ccc', padding: 12, borderRadius: 6 }}
      />
      {!!error && <Text style={{ color: 'red', marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

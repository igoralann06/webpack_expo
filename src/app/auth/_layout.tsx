import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="welcome"
        options={{ headerShown: false, title: 'Welcome' }}
      />
      <Stack.Screen
        name="login"
        options={{ headerShown: false, title: 'Login' }}
      />
      <Stack.Screen
        name="signup"
        options={{ headerShown: false, title: 'Sign Up' }}
      />
      <Stack.Screen
        name="verify-phone"
        options={{ headerShown: false, title: 'Verify Phonenumber' }}
      />
    </Stack>
  );
}

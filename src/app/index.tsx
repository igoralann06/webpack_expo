import { useRootNavigationState, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

import { useAuth } from '@/core';
import { Text } from '@/ui';

export default function Login() {
  const rootNavigationState = useRootNavigationState();
  const router = useRouter();
  const status = useAuth.use.status();

  useEffect(() => {
    if (rootNavigationState.key) {
      if (status === 'signIn') {
        router.replace('/auth/login');
      } else {
        // router.replace('/auth/login');
        router.push('/tab/my-devices');
      }
    }
  }, [rootNavigationState.key, router, status]);

  return (
    <>
      <Text>Loading...</Text>
    </>
  );
}

/* eslint-disable react/no-unstable-nested-components */
import { SplashScreen, Stack, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';

import { useAuth } from '@/core';

export default function TabLayout() {
  const status = useAuth.use.status();
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (status !== 'idle') {
      setTimeout(() => {
        hideSplash();
      }, 1000);
    }
  }, [hideSplash, status]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs
        initialRouteName="my-devices"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="phone"
          options={{
            title: 'Calls',
            tabBarIcon: ({ color, size }) => (
              <Feather name="phone" color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="my-devices"
          options={{
            title: 'My Devices',
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="notes"
          options={{
            title: 'Notes',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <SimpleLineIcon name="notebook" color={color} size={size} />
            ),
            tabBarTestID: 'settings-tab',
          }}
        />
      </Tabs>
    </>
  );
}

// const CreateNewPostLink = () => {
//   return (
//     <Link href="/feed/add-post" asChild>
//       <Pressable>
//         <Text className="px-3 text-primary-300">Create</Text>
//       </Pressable>
//     </Link>
//   );
// };

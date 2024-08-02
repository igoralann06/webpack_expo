/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import { Stack, useRouter } from 'expo-router';
import { type QueryDocumentSnapshot } from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native';
import type MapView from 'react-native-maps';
import Feather from 'react-native-vector-icons/Feather';

import { DeviceOptionPicker } from '@/components/device-option-picker';
import { useAuthStore } from '@/core/hooks/use-auth';
import { useDeviceStore } from '@/core/hooks/use-device';
import {
  changePrimaryDevice,
  deleteDevice,
  getLinkedDevices,
} from '@/firebase/firestore';
import type { IDevice } from '@/types';
import { ScrollView, Text, View } from '@/ui';

const MyDevicesScreen = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { deviceInfo } = useDeviceStore();

  const [linkedDevices, setLinkedDevices] = useState<QueryDocumentSnapshot[]>();
  const [currentDevice, setCurrentDevice] =
    useState<QueryDocumentSnapshot | null>(null);

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = getLinkedDevices(user.uid, setLinkedDevices);
      return () => unsubscribe && unsubscribe();
    }
  }, [user?.uid]);

  const onPressDevice = (deviceData: QueryDocumentSnapshot) => {
    if (deviceData.data().location) {
      mapRef.current?.animateToRegion(
        {
          latitude: deviceData.data().location.latitude,
          longitude: deviceData.data().location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
        1000
      );
    }
    setCurrentDevice(deviceData);
  };

  const onDeleteDevice = async (deviceData: QueryDocumentSnapshot) => {
    if (Platform.OS === 'web') {
      try {
        await deleteDevice(deviceData);
      } catch (e) {
        console.log('=====> error ', e);
      }
    } else {
      Alert.alert('Confirmation', 'Are you sure to remove this device?', [
        { text: 'No', onPress: () => {} },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await deleteDevice(deviceData);
            } catch (e) {}
          },
        },
      ]);
    }
  };

  const onSetAsPrimary = useCallback(
    async (deviceData: QueryDocumentSnapshot) => {
      if (linkedDevices) {
        setCurrentDevice(null);
        if (Platform.OS === 'web') {
          try {
            await changePrimaryDevice(
              linkedDevices,
              deviceData.data() as IDevice
            );
          } catch (e) {
            console.log('====> error ', e);
          }
        } else {
          Alert.alert(
            'Confirmation',
            'Are you sure to set this device as primary?',
            [
              { text: 'No', onPress: () => {} },
              {
                text: 'Yes',
                onPress: async () => {
                  try {
                    await changePrimaryDevice(
                      linkedDevices,
                      deviceData.data() as IDevice
                    );
                  } catch (e) {
                    console.log('====> error ', e);
                  }
                },
              },
            ]
          );
        }
      }
    },
    [linkedDevices]
  );

  return deviceInfo ? (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 10 }}
              onPress={() => router.navigate('/settings')}
            >
              <Feather name="settings" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={{ backgroundColor: 'white', flex: 1 }}>
        <View
          style={{
            alignItems: 'center',
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              width: '100%',
              height: 300,
              marginBottom: 30,
              borderRadius: 1,
              borderColor: 'gray',
              borderWidth: 1,
            }}
          >
            {/* <MapView
              ref={mapRef}
              initialRegion={{
                latitude: deviceInfo?.location?.latitude ?? 0,
                longitude: deviceInfo?.location?.longitude ?? 0,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              showsUserLocation={true}
              showsMyLocationButton={true}
              style={{ width: '100%', height: '100%' }}
            >
              {linkedDevices &&
                linkedDevices
                  .filter((e) => !!e.data().location)
                  .map((item, index) => {
                    return (
                      <Marker
                        title={item.data().deviceName}
                        key={index}
                        coordinate={{
                          latitude: item.data().location.latitude,
                          longitude: item.data().location.longitude,
                        }}
                        pinColor={item.data().isPrimary ? 'red' : '#224065'}
                      />
                    );
                  })}
            </MapView> */}
          </View>

          {linkedDevices &&
            linkedDevices.map((item, index) => {
              return (
                <TouchableHighlight
                  key={index}
                  style={{ width: '100%', marginBottom: 5, borderRadius: 20 }}
                  onPress={() => onPressDevice(item)}
                >
                  <View
                    style={{
                      backgroundColor: item.data().isPrimary
                        ? '#6BC4EA'
                        : '#224065',
                      borderRadius: 20,
                      height: 60,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: 'white',
                        fontFamily: 'Roboto-Medium',
                        fontSize: 16,
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.data().deviceName}
                    </Text>
                  </View>
                </TouchableHighlight>
              );
            })}
        </View>
      </ScrollView>
      <DeviceOptionPicker
        showPicker={currentDevice !== null}
        hidePicker={() => setCurrentDevice(null)}
        onDeleteDevice={onDeleteDevice}
        onSetAsPrimary={onSetAsPrimary}
        deviceData={currentDevice}
      />
    </SafeAreaView>
  ) : (
    <></>
  );
};

export default MyDevicesScreen;

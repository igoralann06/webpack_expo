/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import DialogInput from 'react-native-dialog-input';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import { useAuthStore } from '@/core/hooks/use-auth';
import { useDeviceStore } from '@/core/hooks/use-device';
import { signout } from '@/firebase/auth';

import { updateDeviceName } from '../../firebase/firestore';
import type { FormListItem } from './profile';

const SettingsScreen = () => {
  const router = useRouter();
  const { setUserData } = useAuthStore();
  const { deviceInfo } = useDeviceStore();
  const [showDeviceNameDlg, setShowDeviceNameDlg] = useState(false);

  const settingsList: FormListItem[] = [
    {
      title: 'Privacy and Policy',
      icon: <MaterialIcon name="privacy-tip" color="#848FA6" size={24} />,
    },
    {
      title: 'Subscription',
      icon: <FontAwesome5 name="search-dollar" color="#848FA6" size={24} />,
    },
    {
      title: 'About MobileyMe',
      icon: <FontAwesome5 name="info-circle" color="#848FA6" size={24} />,
    },
    {
      title: 'Log out',
      icon: <FontAwesome5 name="sign-out-alt" color="#848FA6" size={24} />,
      marginTop: 30,
      textColor: 'gray',
      onPress: () => {
        Alert.alert(
          'Log out?',
          'Do you really want to log out?\n\nYou can log into your account from another device.',
          [
            {
              text: 'Log out',
              onPress: () => {
                signout().then(() => setUserData(null));
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      },
    },
  ];

  const settingButton = (item: FormListItem, index: number) => {
    return (
      <TouchableHighlight
        key={index}
        style={{
          width: '100%',
          marginTop: item.marginTop ? item.marginTop : 10,
          borderRadius: 15,
        }}
        onPress={() => item.onPress && item.onPress()}
        underlayColor="#f2f3f5"
      >
        <View
          style={{
            paddingVertical: 15,
            paddingHorizontal: 15,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderWidth: 0.8,
            borderRadius: 15,
            borderColor: '#DFDFDF',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {item.icon}
            <Text
              style={{
                color: item.textColor ? item.textColor : 'black',
                fontFamily: 'Roboto-Medium',
                fontSize: 16,
                marginLeft: 10,
              }}
            >
              {item.title}
            </Text>
          </View>
          <Entypo name="chevron-right" color="#DFDFDF" size={22} />
        </View>
      </TouchableHighlight>
    );
  };

  const onChangeDeviceName = (newName: string) => {
    if (!newName) {
      Alert.alert('Please input valid device name');
      return;
    }
    if (deviceInfo) {
      updateDeviceName(deviceInfo.id, newName);
      setShowDeviceNameDlg(false);
    }
  };

  if (!deviceInfo) return null;

  return (
    <ScrollView style={{ backgroundColor: 'white' }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 10 }}
              onPress={() => router.navigate('/profile')}
            >
              <FontAwesome name="user-circle-o" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <View
        style={{
          alignItems: 'center',
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <TouchableHighlight
          style={{
            width: '100%',
            marginBottom: 10,
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderRadius: 15,
          }}
          onPress={() => setShowDeviceNameDlg(true)}
          underlayColor="#f2f3f5"
        >
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <Text
                style={{
                  color: 'black',
                  fontFamily: 'Roboto-Medium',
                  fontSize: 16,
                }}
              >
                {deviceInfo.deviceName}
              </Text>
              <Text
                style={{ color: 'gray', fontFamily: 'Roboto', fontSize: 12 }}
              >{`Linked at ${deviceInfo.linkedAt.toLocaleString()}`}</Text>
            </View>
            <Entypo name="chevron-right" color="#DFDFDF" size={22} />
          </View>
        </TouchableHighlight>
        {settingsList.map((item, index) => {
          return settingButton(item, index);
        })}
      </View>
      <DialogInput
        isDialogVisible={showDeviceNameDlg}
        title={'Input device name'}
        initValueTextInput={deviceInfo.deviceName}
        hintInput={'Device name'}
        submitInput={(inputText) => onChangeDeviceName(inputText)}
        closeDialog={() => setShowDeviceNameDlg(false)}
      />
    </ScrollView>
  );
};

export default SettingsScreen;

/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Linking,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { IMessage } from 'react-native-gifted-chat';
import { GiftedChat } from 'react-native-gifted-chat';
import { Divider } from 'react-native-paper';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuthStore } from '@/core/hooks/use-auth';
import { useDeviceStore } from '@/core/hooks/use-device';
import { useServerStore } from '@/core/hooks/use-server-data';
import { showErrorMessage } from '@/ui';

import Avatar from '../../components/avatar';
import { createOutgoingCall, sendTwilioSMS } from '../../twilio/twilio';
import {
  checkRecordAudioPermission,
  formatPhoneNumber,
  getContactName,
  isPhoneEqual,
  sendSystemSMS,
  trimPhone,
} from '../../util';

const SmsDetailScreen = () => {
  const { address } = useLocalSearchParams<{ address?: string }>();
  const router = useRouter();
  const { user, userData } = useAuthStore();
  const { serverSMSLogs, serverContacts } = useServerStore();

  console.log('====> address ', address);

  const { deviceInfo } = useDeviceStore();
  const [messages, setMessages] = useState<IMessage[]>([]);
  useEffect(() => {
    if (serverSMSLogs && serverContacts && address) {
      const myLogs = serverSMSLogs.filter((e) =>
        isPhoneEqual(e.address, address)
      );
      if (myLogs.length > 0) {
        let initialMessages: IMessage[] = [];
        for (const sms of myLogs) {
          initialMessages.push({
            _id: sms._id,
            text: sms.body,
            createdAt: new Date(Number(sms.date)),
            user: {
              _id: sms.type,
              name:
                sms.type === 2 ? '' : getContactName(address, serverContacts),
            },
          });
        }
        setMessages(initialMessages);
      }
    }
  }, [address, serverContacts, serverSMSLogs]);

  const onSend = useCallback(
    async (newMessages: IMessage[]) => {
      if (user && address) {
        if (deviceInfo?.isPrimary && Platform.OS === 'android') {
          sendSystemSMS(newMessages[0].text, address, () =>
            setMessages((previousMessages) =>
              GiftedChat.append(previousMessages, newMessages)
            )
          );
        } else {
          const result = await sendTwilioSMS(
            address,
            user.uid,
            newMessages[0].text
          );
          if (result) {
            setMessages((previousMessages) =>
              GiftedChat.append(previousMessages, newMessages)
            );
          } else {
            showErrorMessage('Failed to send message');
          }
        }
      }
    },
    [address, deviceInfo?.isPrimary, user]
  );

  const onCallOther = useCallback(async () => {
    if (deviceInfo?.isPrimary) {
      Linking.openURL(`tel:${address}`);
    } else {
      const isGranted = await checkRecordAudioPermission();
      if (isGranted && serverContacts && userData && address) {
        createOutgoingCall(
          trimPhone(address),
          getContactName(address, serverContacts) ?? '',
          userData.fullname
        );
        //navigation.navigate("ActiveCall", {number: address});
      } else {
        showErrorMessage('You should allow record audio to make call');
      }
    }
  }, [address, deviceInfo?.isPrimary, serverContacts, userData]);

  console.log('======> messages ', messages);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', paddingTop: 20 }}>
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 10,
          marginBottom: 10,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcon name="arrow-left" color="black" size={24} />
          </TouchableOpacity>
          <View style={{ marginLeft: 5 }}>
            <Avatar
              placeholder={
                serverContacts && address
                  ? getContactName(address, serverContacts) ?? ''
                  : ''
              }
              width={40}
              height={40}
            />
          </View>
          <Text
            style={{
              fontFamily: 'Roboto',
              color: 'black',
              fontSize: 16,
              marginLeft: 5,
            }}
          >
            {formatPhoneNumber(
              serverContacts && address
                ? getContactName(address, serverContacts) ?? address
                : address
            )}
          </Text>
        </View>
        <TouchableOpacity onPress={onCallOther}>
          <Feather name="phone" color="black" size={24} />
        </TouchableOpacity>
      </View>
      <Divider />
      <GiftedChat
        messages={messages}
        onSend={(ms) => onSend(ms)}
        user={{
          _id: 2,
        }}
        renderAvatar={() => {
          return (
            <Avatar
              placeholder={
                serverContacts && address
                  ? getContactName(address, serverContacts) ?? ''
                  : ''
              }
              width={40}
              height={40}
            />
          );
        }}
      />
    </SafeAreaView>
  );
};

export default SmsDetailScreen;

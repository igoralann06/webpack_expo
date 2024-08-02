/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TouchableHighlight, View } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

import { useAuthStore } from '@/core/hooks/use-auth';
import { useDeviceStore } from '@/core/hooks/use-device';
import { useServerStore } from '@/core/hooks/use-server-data';
import { ACTION_ADD, batchSMSLogsSync } from '@/firebase/firestore';
import type { ISMSLog } from '@/types';
import {
  dateToMoment,
  formatPhoneNumber,
  getAllSMSLogs,
  getContactName,
  isPhoneEqual,
} from '@/util';

import Avatar from './avatar';

const SMSLogView = ({ searchText }: { searchText: string }) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { deviceInfo } = useDeviceStore();
  const { serverSMSLogs, serverContacts } = useServerStore();
  const [phoneSMSLogs, setPhoneSMSLogs] = useState<ISMSLog[]>([]);
  const [syncing, setSyncing] = useState(false);
  const isFocused = useIsFocused();

  const groupedSMSLogs = useMemo(() => {
    let smsLogs = serverSMSLogs;
    if (smsLogs) {
      if (searchText && smsLogs) {
        smsLogs = smsLogs.filter((e) => {
          if (e.address?.includes(searchText)) return true;
          if (e.body?.includes(searchText)) return true;
          return false;
        });
      }
      let groupedArray = [];
      for (const smsLog of smsLogs) {
        const fIndex = groupedArray.findIndex((e) =>
          isPhoneEqual(e[0].address, smsLog.address)
        );
        if (fIndex === -1) {
          const grouped = smsLogs?.filter((e) =>
            isPhoneEqual(e.address, smsLog.address)
          );
          groupedArray.push(grouped);
        }
      }
      return groupedArray;
    }
  }, [serverSMSLogs, searchText]);

  useEffect(() => {
    if (deviceInfo?.isPrimary && isFocused) {
      getAllSMSLogs(setPhoneSMSLogs);
    }
  }, [deviceInfo?.isPrimary, isFocused]);

  const onNewMessage = () => {
    router.navigate('/new-sms');
  };

  const syncSMSLogs = useCallback(async () => {
    if (syncing || !user || !deviceInfo) return;
    setSyncing(true);
    let batchArray = [];
    for (const smsLog of phoneSMSLogs) {
      const fIndex = serverSMSLogs?.findIndex(
        (e) => e._id === `${deviceInfo?.deviceId}_${smsLog._id}`
      );
      if (fIndex === -1) {
        batchArray.push({ action: ACTION_ADD, data: smsLog });
      }
    }
    if (batchArray.length > 0) {
      await batchSMSLogsSync(user.uid, deviceInfo.deviceId, batchArray);
    }
    setSyncing(false);
  }, [deviceInfo, phoneSMSLogs, serverSMSLogs, syncing, user]);

  useEffect(() => {
    if (phoneSMSLogs && serverSMSLogs) {
      syncSMSLogs();
    }
  }, [phoneSMSLogs, serverSMSLogs, syncSMSLogs]);

  const onGotoDetail = (smsItem: ISMSLog[]) => {
    router.navigate({
      pathname: '/sms-details',
      params: { address: smsItem[0].address },
    });
  };

  const renderSMSLogItem = ({ item }: { item: ISMSLog[] }) => {
    return (
      <TouchableHighlight
        onPress={() => onGotoDetail(item)}
        underlayColor="#f2f3f5"
        style={{ borderRadius: 20 }}
      >
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingVertical: 15,
            alignItems: 'center',
          }}
        >
          <Avatar
            placeholder={
              getContactName(item[0].address, serverContacts ?? []) ?? ''
            }
            width={40}
            height={40}
          />
          <View style={{ flex: 1, marginLeft: 20 }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text
                style={{ fontFamily: 'Roboto', fontSize: 15, color: 'black' }}
              >
                {formatPhoneNumber(
                  getContactName(item[0].address, serverContacts ?? []) ??
                    item[0].address
                )}
              </Text>
              <Text
                style={{ marginLeft: 5, fontFamily: 'Roboto', color: 'gray' }}
              >
                {dateToMoment(item[0].date)}
              </Text>
            </View>
            <Text
              style={{ fontFamily: 'Roboto', fontSize: 13, color: 'black' }}
            >{`${item[0].type === 2 ? 'You: ' : ''}${item[0].body}`}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <>
      <FlatList
        style={{ flex: 1 }}
        renderItem={renderSMSLogItem}
        data={groupedSMSLogs}
        showsVerticalScrollIndicator={false}
        keyExtractor={(_item, index) => `${index}`}
      />
      <TouchableHighlight
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          borderRadius: 25,
        }}
        onPress={onNewMessage}
      >
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#6BC4EA',
            justifyContent: 'center',
            elevation: 3,
            alignItems: 'center',
            shadowColor: 'black',
            shadowOffset: {
              width: 0,
              height: -0.5,
            },
            shadowRadius: 4,
            shadowOpacity: 0.4,
          }}
        >
          <Entypo name="plus" size={26} color="white" />
        </View>
      </TouchableHighlight>
    </>
  );
};

export default SMSLogView;

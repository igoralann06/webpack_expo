/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Linking,
  Platform,
  Pressable,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import { useAuthStore } from '@/core/hooks/use-auth';
import { useDeviceStore } from '@/core/hooks/use-device';
import { useServerStore } from '@/core/hooks/use-server-data';
import { createOutgoingCall } from '@/twilio/twilio';
import type { ICallLog } from '@/types';
import { showErrorMessage } from '@/ui';

// import Avatar from '../../components/Avatar';
// import { createOutgoingCall } from '../../twilio/twilio';
import {
  ACTION_ADD,
  batchCallLogSync,
  getServerUserData,
} from '../firebase/firestore';
import {
  checkRecordAudioPermission,
  dateToMoment,
  formatPhoneNumber,
  getAllCallLogs,
  // getAllCallLogs,
  getContactName,
} from '../util';
import Avatar from './avatar';
import { DialPad } from './dial-pad';

interface CallLogViewProps {
  searchText: string;
}

const CallLogView = (props: CallLogViewProps) => {
  const router = useRouter();
  const { searchText } = props;
  const { user, userData } = useAuthStore();
  const { deviceInfo } = useDeviceStore();
  const { serverCallLogs, serverContacts } = useServerStore();

  const [phoneCallLogs, setPhoneCallLogs] = useState<ICallLog[] | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [showDialPad, setShowDialPad] = useState(!deviceInfo?.isPrimary);
  const [callNumber, setCallNumber] = useState<string>('');
  const isFocused = useIsFocused();

  const groupedLogs = useMemo(() => {
    let callLogs = serverCallLogs;
    if (!callLogs) {
      return [];
    }
    const searchContent = searchText ? searchText : callNumber;
    if (searchContent && serverContacts) {
      callLogs = callLogs.filter((e) => {
        const contactName = getContactName(e.phoneNumber, serverContacts);
        if (contactName && contactName.includes(searchContent)) {
          return true;
        }
        if (e.phoneNumber.includes(searchContent)) {
          return true;
        }
        return false;
      });
    }
    let groupedArray = [];
    for (const callLog of callLogs) {
      const fIndex = groupedArray.findIndex(
        (e) => e[0].phoneNumber === callLog.phoneNumber
      );
      if (fIndex === -1) {
        const grouped = callLogs.filter(
          (e) => e.phoneNumber === callLog.phoneNumber
        );
        groupedArray.push(grouped);
      }
    }
    return groupedArray;
  }, [serverCallLogs, searchText, callNumber, serverContacts]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setShowDialPad(false);
    });

    return () => {
      showSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (deviceInfo?.isPrimary && isFocused) {
      getAllCallLogs().then((callLogs) => {
        setPhoneCallLogs(callLogs);
      });
    }
  }, [deviceInfo?.isPrimary, isFocused]);

  const syncCallLogs = useCallback(async () => {
    if (syncing) {
      return;
    }
    if (phoneCallLogs) {
      setSyncing(true);
      let batchArray = [];
      for (const phoneLog of phoneCallLogs) {
        const fIndex = serverCallLogs?.findIndex(
          (e) =>
            e.phoneNumber === phoneLog.phoneNumber &&
            e.timestamp === phoneLog.timestamp
        );
        if (fIndex === -1) {
          batchArray.push({ action: ACTION_ADD, data: phoneLog });
        }
      }

      if (user && batchArray.length > 0) {
        await batchCallLogSync(user.uid, batchArray);
      }
      setSyncing(false);
    }
  }, [phoneCallLogs, serverCallLogs, syncing, user]);

  useEffect(() => {
    if (phoneCallLogs && serverCallLogs) {
      syncCallLogs();
    }
  }, [phoneCallLogs, serverCallLogs, syncCallLogs]);

  const onCallNumber = async (phoneNumber: string, callType?: string) => {
    if (callType === 'twilioMMCall') {
      const isGranted = await checkRecordAudioPermission();
      if (isGranted && userData) {
        const otherUserData = await getServerUserData(phoneNumber);
        otherUserData &&
          otherUserData.twilioCallID &&
          createOutgoingCall(
            otherUserData.twilioCallID,
            otherUserData.fullname,
            userData.fullname
          );
        if (Platform.OS === 'ios' && otherUserData) {
          router.push({
            pathname: '/active-call',
            params: {
              contactName: otherUserData.fullname,
              placeHolder: otherUserData.fullname,
            },
          });
        }
      }
    } else {
      if (deviceInfo?.isPrimary && Platform.OS === 'android') {
        Linking.openURL(`tel:${phoneNumber}`);
      } else {
        if (!phoneNumber) {
          Keyboard.dismiss();
          setShowDialPad(true);
        } else {
          const isGranted = await checkRecordAudioPermission();
          if (isGranted && serverContacts && userData) {
            await createOutgoingCall(
              phoneNumber,
              getContactName(phoneNumber, serverContacts) ?? '',
              userData.fullname
            );
            if (Platform.OS === 'ios') {
              router.push({
                pathname: '/active-call',
                params: {
                  contactName:
                    getContactName(phoneNumber, serverContacts) ??
                    formatPhoneNumber(phoneNumber) ??
                    phoneNumber,
                  placeHolder: '',
                },
              });
            }
          } else {
            showErrorMessage('You should allow record audio to make call');
          }
        }
      }
    }
  };

  const onAddDial = (value: string) => {
    setCallNumber(`${callNumber}${value}`);
  };

  const onRemoveDial = () => {
    setCallNumber(
      callNumber.length > 0
        ? callNumber.slice(0, callNumber.length - 1)
        : callNumber
    );
  };

  const onVoIPCall = () => {
    if (callNumber) {
      onCallNumber(callNumber);
      setCallNumber('');
    }
  };

  const renderCallLogItem = ({ item }: { item: ICallLog[] }) => {
    return (
      <TouchableHighlight
        onPress={() => {}}
        underlayColor="#f2f3f5"
        style={{ borderRadius: 20 }}
      >
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingVertical: 15,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar
              placeholder={
                item[0].callType === 'twilioMMCall'
                  ? item[0].displayName
                  : getContactName(item[0].phoneNumber, serverContacts ?? []) ??
                    ''
              }
              width={40}
              height={40}
            />
            <View style={{ marginLeft: 20 }}>
              <Text
                style={{ fontFamily: 'Roboto', fontSize: 15, color: 'black' }}
              >
                {item[0].callType === 'twilioMMCall'
                  ? item[0].displayName
                  : formatPhoneNumber(
                      getContactName(
                        item[0].phoneNumber,
                        serverContacts ?? []
                      ) ?? item[0].phoneNumber
                    )}
                <Text>{` (${item.length})`}</Text>
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 3,
                }}
              >
                {item[0].type === 'INCOMING' ? (
                  <Feather name="phone-incoming" color="gray" size={14} />
                ) : item[0].type === 'OUTGOING' ? (
                  <Feather name="phone-outgoing" color="gray" size={14} />
                ) : (
                  <Feather name="phone-missed" color="red" size={14} />
                )}
                <Text
                  style={{ marginLeft: 5, fontFamily: 'Roboto', color: 'gray' }}
                >
                  {dateToMoment(BigInt(item[0].timestamp))}
                </Text>
              </View>
            </View>
          </View>
          <Pressable
            style={{ marginRight: 10 }}
            onPress={() => onCallNumber(item[0].phoneNumber, item[0].callType)}
          >
            <Feather name="phone" color="#6BC4EA" size={23} />
          </Pressable>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <>
      <FlatList
        style={{ flex: 1 }}
        renderItem={renderCallLogItem}
        data={groupedLogs}
        showsVerticalScrollIndicator={false}
        keyExtractor={(_item, index) => index.toString()}
        onScrollBeginDrag={() => setShowDialPad(false)}
      />
      <TouchableHighlight
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          borderRadius: 25,
        }}
        onPress={() => onCallNumber('')}
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
          <MaterialIcon name="dialpad" size={26} color="white" />
        </View>
      </TouchableHighlight>
      {showDialPad && (
        <View
          style={{
            backgroundColor: '#EFEFEF',
            shadowColor: 'black',
            shadowOffset: {
              width: 0,
              height: -0.5,
            },
            shadowRadius: 9,
            shadowOpacity: 0.3,
            elevation: 5,
          }}
        >
          <View
            style={{
              paddingVertical: 10,
              alignItems: 'center',
              borderBottomWidth: 0.5,
              borderColor: 'lightgray',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: 'black', fontSize: 28, minHeight: 40 }}>
              {callNumber}
            </Text>
            <TouchableOpacity
              style={{ position: 'absolute', right: 30, top: 20 }}
              onPress={onRemoveDial}
              disabled={!callNumber}
            >
              <MaterialIcon
                name="backspace"
                size={23}
                color={callNumber ? 'gray' : 'lightgray'}
              />
            </TouchableOpacity>
          </View>
          <DialPad disabled={false} onPress={onAddDial} />
          <TouchableHighlight
            style={{
              alignSelf: 'center',
              marginVertical: 15,
              borderRadius: 30,
            }}
            onPress={onVoIPCall}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#00B64B',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Feather name="phone" color="white" size={23} />
            </View>
          </TouchableHighlight>
        </View>
      )}
    </>
  );
};

export default CallLogView;

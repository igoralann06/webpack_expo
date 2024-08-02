/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import { Divider } from 'react-native-paper';
import Ionicon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { SelectItemModal } from '@/components/select-item-modal';
import { useServerStore } from '@/core/hooks/use-server-data';
import type { IContactData, IPhoneNumber } from '@/types';

import Avatar from '../../components/avatar';
import { formatPhoneNumber, makeFirstUppercase } from '../../util';

const NewSmsScreen = () => {
  const router = useRouter();
  const { serverContacts } = useServerStore();
  const [searchText, setSearchText] = useState('');
  const [showNumberPad, setShowNumberPad] = useState(false);
  const [selectNumberData, setSelectNumberData] = useState<
    IPhoneNumber[] | null
  >(null);

  const filteredData = useMemo(() => {
    let filteredArray = [];
    let trimmedText = searchText.replace(/\D/g, '');
    if (trimmedText) {
      const customData = {
        title: `Send to ${trimmedText}`,
        description: trimmedText,
        label: 'Custom',
        phoneNumbers: [{ number: trimmedText }],
        isCustom: true,
      };
      const filtered = serverContacts?.flatMap((e) => {
        let arr = [];
        if (e.data.phoneNumbers) {
          for (const phoneNumber of e.data.phoneNumbers) {
            const trimmedNumber = ('' + phoneNumber.number).replace(/\D/g, '');
            if (trimmedNumber.includes(trimmedText)) {
              arr.push({
                title: e.data.displayName,
                description: phoneNumber.number,
                label: makeFirstUppercase(phoneNumber.label ?? ''),
                phoneNumbers: [phoneNumber],
              });
            }
          }
        }
        return arr;
      });
      filteredArray = filtered ? [customData, ...filtered] : [customData];
    } else {
      const filtered = searchText
        ? serverContacts?.filter((e) => {
            if (!e.data.phoneNumbers || e.data.phoneNumbers.length === 0)
              return false;
            if (
              searchText &&
              e.data.givenName?.toLowerCase().includes(searchText.toLowerCase())
            )
              return true;
            if (
              searchText &&
              e.data.familyName
                ?.toLowerCase()
                .includes(searchText.toLowerCase())
            )
              return true;
            if (
              e.data.emailAddresses &&
              e.data.emailAddresses.findIndex((item) =>
                item.email.toLowerCase().includes(searchText.toLowerCase())
              ) > -1
            )
              return true;
            return false;
          })
        : serverContacts;

      if (filtered) {
        for (const contact of filtered) {
          if (contact.data.phoneNumbers) {
            filteredArray.push({
              title: contact.data.displayName,
              description: `${contact.data.phoneNumbers[0].number}${
                contact.data.phoneNumbers.length > 1
                  ? `(${contact.data.phoneNumbers.length - 1} more)`
                  : ''
              }`,
              label:
                contact.data.phoneNumbers.length === 1
                  ? contact.data.phoneNumbers[0].label
                  : 'Multiple',
              phoneNumbers: contact.data?.phoneNumbers,
            });
          }
        }
      }
    }
    return filteredArray;
  }, [serverContacts, searchText]);

  const onSelectItem = (item: IContactData) => {
    if (item.phoneNumbers) {
      if (item.phoneNumbers.length > 1) {
        setSelectNumberData(item.phoneNumbers);
      } else {
        sendSMS(item.phoneNumbers[0].number);
      }
    }
  };

  const sendSMS = (address: string) => {
    router.push({ pathname: '/sms-details', params: { address: address } });
    // navigation.dispatch(
    //   StackActions.replace('SmsDetail', {
    //     address: address,
    //   })
    // );
  };

  const renderContactItem = ({
    item,
  }: {
    item: IContactData;
    // | {
    //     title: string | undefined;
    //     description: string;
    //     label: string;
    //     phoneNumbers: IPhoneNumber[];
    //   }
    // | {
    //     title: string;
    //     description: string;
    //     label: string;
    //     phoneNumbers: {
    //       number: string;
    //     }[];
    //     isCustom: boolean;
    //   };
  }) => {
    return (
      <TouchableHighlight
        onPress={() => onSelectItem(item)}
        underlayColor="#f2f3f5"
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
            placeholder={item.isCustom ? '' : item.title ?? ''}
            width={40}
            height={40}
          />
          <View style={{ flex: 1, marginLeft: 20 }}>
            <Text
              style={{ fontFamily: 'Roboto', fontSize: 15, color: 'black' }}
            >
              {formatPhoneNumber(item.title ?? '')}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontFamily: 'Roboto', color: 'gray' }}>
                {item.description}
              </Text>
              <Text
                style={{ fontFamily: 'Roboto', fontSize: 13, color: 'gray' }}
              >
                {makeFirstUppercase(item.label ?? '')}
              </Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', paddingTop: 20 }}>
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 10,
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcon name="arrow-left" color="black" size={24} />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: 'Roboto',
            color: 'black',
            fontSize: 18,
            marginLeft: 5,
          }}
        >
          New message
        </Text>
      </View>
      <View style={[styles.row, { paddingVertical: 10 }]}>
        <Text style={{ fontFamily: 'Roboto', color: 'gray', fontSize: 16 }}>
          To
        </Text>
        <TextInput
          style={{ flex: 1, marginLeft: 30 }}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Type a name, phone number, or email"
          keyboardType={showNumberPad ? 'phone-pad' : 'default'}
        />
        <TouchableOpacity onPress={() => setShowNumberPad(!showNumberPad)}>
          {showNumberPad ? (
            <Ionicon name="keypad" size={24} color="black" />
          ) : (
            <MaterialCommunityIcon
              name="keyboard-outline"
              size={24}
              color="black"
            />
          )}
        </TouchableOpacity>
      </View>
      <Divider />
      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => `${index}`}
        renderItem={renderContactItem}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="always"
      />
      <SelectItemModal
        visible={selectNumberData ? true : false}
        setVisible={() => setSelectNumberData(null)}
        title={'Choose phone number'}
        dataArray={
          selectNumberData
            ? selectNumberData.flatMap((e) => [
                { title: e.number, label: e.label ?? '' },
              ])
            : []
        }
        onSelected={(item) => sendSMS(item.title)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
});

export default NewSmsScreen;

/* eslint-disable react-native/no-inline-styles */

import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, View } from 'react-native';

import CallLogView from '@/components/call-log-view';
import ContactsView from '@/components/contacts-view';
import { MySearchBar } from '@/components/my-search-bar';
import SMSLogView from '@/components/sms-log-view';

const ITEMS_LIST = ['Calls', 'Contacts', 'Messages'];

const PhoneScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [searchText, setSearchText] = useState('');

  const onSearch = (text: string) => {
    setSearchText(text);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Stack.Screen
        options={
          currentIndex === 1
            ? { title: ITEMS_LIST[currentIndex] }
            : {
                title: ITEMS_LIST[currentIndex],
                headerRight: undefined,
              }
        }
      />
      <View style={{ paddingHorizontal: 20, marginBottom: 10, paddingTop: 5 }}>
        <SegmentedControl
          values={ITEMS_LIST}
          selectedIndex={currentIndex}
          onChange={(event) => {
            setCurrentIndex(event.nativeEvent.selectedSegmentIndex);
          }}
          tintColor="#6BC4EA"
          fontStyle={{ color: 'gray', fontFamily: 'Roboto' }}
          activeFontStyle={{ color: 'white' }}
          style={{ marginBottom: 10 }}
        />
        <MySearchBar
          placeholder="Search"
          searchText={searchText}
          onChangeText={(text: string) => onSearch(text)}
        />
      </View>
      {currentIndex === 0 ? (
        <CallLogView searchText={searchText} />
      ) : currentIndex === 1 ? (
        <ContactsView searchText={searchText} />
      ) : (
        <SMSLogView searchText={searchText} />
      )}
    </SafeAreaView>
  );
};

export default PhoneScreen;

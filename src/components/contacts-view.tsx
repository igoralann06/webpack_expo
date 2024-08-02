/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable max-lines-per-function */

import { Stack, useRouter } from 'expo-router';
import { groupBy } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Progress from 'react-native-progress';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useAuthStore } from '@/core/hooks/use-auth';
import { useContactStore } from '@/core/hooks/use-contact';
import { useDeviceStore } from '@/core/hooks/use-device';
import { useServerStore } from '@/core/hooks/use-server-data';
import {
  ACTION_ADD,
  batchContactSync,
  deleteServerContact,
  updateServerContact,
} from '@/firebase/firestore';
import type { IContact, IContactData } from '@/types';
import {
  addContact,
  checkWriteContactPermission,
  deleteContact,
  getAllPhoneContacts,
  isContactEqual,
  openExistContact,
} from '@/util';

import Avatar from './avatar';
import ContactListItem from './contact-list-item';

const ContactsView = ({ searchText }: { searchText: string }) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setCurrentContact } = useContactStore();
  const { serverContacts } = useServerStore();
  const { deviceInfo } = useDeviceStore();

  const [phoneContacts, setPhoneContacts] = useState<IContactData[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [pushing, setPushing] = useState(false);

  const sectionedContacts = useMemo(() => {
    const filteredContacts = !searchText
      ? serverContacts
      : serverContacts?.filter((e) => {
          if (
            e.data.givenName?.toLowerCase().includes(searchText.toLowerCase())
          ) {
            return true;
          }
          if (
            e.data.familyName?.toLowerCase().includes(searchText.toLowerCase())
          ) {
            return true;
          }
          let bMatched = false;
          if (e.data.phoneNumbers) {
            for (const phoneNumber of e.data.phoneNumbers) {
              const trimmedNumber = ('' + phoneNumber.number).replace(
                /\D/g,
                ''
              );
              if (trimmedNumber.includes(searchText)) {
                bMatched = true;
                break;
              }
            }
          }
          return bMatched;
        });

    const lexicalData = groupBy(filteredContacts, (item) => {
      const userName = `${item.data.givenName} ${item.data.familyName}`.trim();
      return userName.charAt(0).match(/[a-z]/i) // isLetter
        ? userName.charAt(0).toUpperCase()
        : '#';
    });
    return Object.keys(lexicalData)
      .map((k) => {
        return {
          title: k,
          data: lexicalData[k],
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [serverContacts, searchText]);

  const syncContacts = useCallback(
    async (contacts: IContactData[]) => {
      if (syncing || !serverContacts || !deviceInfo) {
        return;
      }
      setSyncing(true);
      let batch = [];
      const deviceId = deviceInfo.deviceId;
      for (const phoneContact of contacts) {
        const serverContact = serverContacts.find((e) =>
          isContactEqual(e.data, phoneContact)
        );
        if (!serverContact) {
          batch.push({ action: ACTION_ADD, data: phoneContact });
        }
      }

      if (user && batch.length > 0) {
        await batchContactSync(user.uid, deviceId, batch);
      }
      setSyncing(false);
    },
    [deviceInfo, serverContacts, syncing, user]
  );

  // TODO: solve conversion problem
  const onRefresh = useCallback(async () => {
    const contacts = await getAllPhoneContacts();
    const isGranted = await checkWriteContactPermission();
    isGranted &&
      contacts &&
      setPhoneContacts(contacts.map((item) => (item as unknown as IContact)!));
    syncContacts(contacts as IContactData[]);
  }, [syncContacts]);

  useEffect(() => {
    if (deviceInfo?.isPrimary) {
      onRefresh();
    }
  }, [deviceInfo?.isPrimary, onRefresh]);

  const onAddContact = async () => {
    router.navigate('/edit-contact');
    // if (deviceInfo?.isPrimary) {
    // const newContact = await openNewContact();
    // if (newContact) {
    //   setPhoneContacts([...phoneContacts, newContact]);
    // }
    // } else {
    // navigation.navigate('EditContact');
    // }
  };

  const onEditContact = async (contact: IContact) => {
    if (deviceInfo?.isPrimary) {
      const result = await openExistContact(contact.data);
      if (result) {
        const updateData: IContact = {
          ...contact,
          data: result,
          updated: false,
        };
        await updateServerContact(updateData);
      }
    } else {
      router.navigate({
        pathname: '/edit-contact',
        params: {
          contact: contact.data,
          dataId: contact.id,
        },
      });
      // navigation.navigate('EditContact', {
      //   contact: contact.data,
      //   dataId: contact.id,
      // });
    }
  };

  const onViewContact = async (contact: IContact) => {
    setCurrentContact(contact);
    router.navigate('/view-contact');
    // navigation.navigate('ViewContact');
    // if (deviceInfo.isPrimary) {
    //   await viewContact(contact.data);
    // } else {
    // }
  };

  const onDeleteContact = useCallback(
    async (contact: IContact) => {
      if (deviceInfo) {
        setSyncing(true);
        await deleteServerContact(contact, deviceInfo.isPrimary);
        if (deviceInfo.isPrimary) {
          deleteContact(contact.data);
          setPhoneContacts(
            phoneContacts.filter((e) => e.recordID !== contact.data.recordID)
          );
        }
        setSyncing(false);
      }
    },
    [deviceInfo, phoneContacts]
  );

  const pushContactsToPhone = useCallback(async () => {
    if (serverContacts) {
      setPushing(true);
      for (const serverContact of serverContacts) {
        const phoneContact = phoneContacts.find((e) =>
          isContactEqual(e, serverContact.data)
        );
        if (!phoneContact) {
          const addedContact = await addContact(serverContact.data);
          setPhoneContacts([...phoneContacts, addedContact]);
        }
      }
      setPushing(false);
    }
  }, [serverContacts, phoneContacts]);

  const renderContactItem = ({ item }: { item: IContact }) => {
    return (
      <ContactListItem
        leftElement={
          <Avatar
            img={null}
            placeholder={`${item.data.givenName} ${item.data.familyName}`}
            width={40}
            height={40}
          />
        }
        title={`${item.data.givenName} ${item.data.familyName}`}
        description={`${item.data.company ?? ''}`}
        onLongPress={() => onEditContact(item)}
        onPress={() => onViewContact(item)}
        onDelete={() => onDeleteContact(item)}
        rightElement={undefined}
        rightText={''}
        disabled={false}
      />
    );
  };

  const renderSectionHeader = ({ section }: { section: any }) => {
    return (
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionHeaderLabel}>{section.title}</Text>
      </View>
    );
  };

  if (!deviceInfo) {
    return null;
  }

  return serverContacts ? (
    <>
      <Stack.Screen
        options={{
          headerRight: () =>
            deviceInfo.isPrimary ? (
              pushing ? (
                <Progress.Circle
                  indeterminate
                  size={20}
                  style={{ marginRight: 20 }}
                  color={'gray'}
                />
              ) : (
                <TouchableOpacity
                  style={{ marginRight: 20 }}
                  onPress={() => pushContactsToPhone()}
                >
                  <Feather name="upload" size={24} color="#6BC4EA" />
                </TouchableOpacity>
              )
            ) : null,
        }}
      />
      <SectionList
        sections={sectionedContacts}
        // itemHeight={65}
        // alphabetListOptions={{ itemHeight: 18 }}
        renderItem={renderContactItem}
        renderSectionHeader={renderSectionHeader}
        maxToRenderPerBatch={20}
        initialNumToRender={20}
        keyExtractor={(item: IContact) => item.id}
      />
      <TouchableHighlight
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          borderRadius: 25,
        }}
        onPress={onAddContact}
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
          <Ionicons name="person-add" size={26} color="white" />
        </View>
      </TouchableHighlight>
    </>
  ) : (
    <View style={{ alignItems: 'center', flex: 1, paddingTop: 20 }}>
      <Progress.Circle indeterminate size={30} color={'gray'} borderWidth={2} />
      <Text style={{ fontFamily: 'Roboto', color: 'gray', marginTop: 5 }}>
        Loading contacts...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeaderContainer: {
    height: 30,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },

  sectionHeaderLabel: {
    color: 'black',
  },
});

export default ContactsView;

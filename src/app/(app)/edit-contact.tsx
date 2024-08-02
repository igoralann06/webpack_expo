/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import { Picker as RNPickerSelect } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import React, { createRef, forwardRef, useRef, useState } from 'react';
import type {
  KeyboardTypeOptions,
  TextInput as NativeTextInput,
} from 'react-native';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import { Divider, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Octicon from 'react-native-vector-icons/Octicons';

import { useAuthStore } from '@/core/hooks/use-auth';
import { useContactStore } from '@/core/hooks/use-contact';
import { useServerStore } from '@/core/hooks/use-server-data';
import type { IEmailAddress, IPhoneNumber } from '@/types';

import { setServerContact } from '../../firebase/firestore';

const GROUP_ICON_SIZE = 40;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface MyTextInputProps {
  label: string;
  value: string;
  setValue: (value: string) => void;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  keyboardType?: KeyboardTypeOptions;
  nextRef?: React.MutableRefObject<NativeTextInput | null>;
}

const MyTextInput = forwardRef<NativeTextInput, MyTextInputProps>(
  (
    {
      label,
      value,
      setValue,
      marginLeft = 0,
      marginTop = 0,
      marginRight = 0,
      keyboardType = 'default',
      nextRef,
      ...props
    },
    ref
  ) => {
    return (
      <TextInput
        ref={ref}
        label={label}
        value={value}
        onChangeText={(data) => setValue(data)}
        mode="outlined"
        style={{ flex: 1, marginLeft, marginTop, marginRight }}
        keyboardType={keyboardType}
        returnKeyType={nextRef ? 'next' : 'done'}
        blurOnSubmit={nextRef ? false : true}
        onSubmitEditing={() =>
          nextRef && nextRef.current && nextRef.current.focus()
        }
        {...props}
      />
    );
  }
);

const EditContactScreen = () => {
  const router = useRouter();
  const { dataId } = useLocalSearchParams<{ dataId?: string }>();
  const { user } = useAuthStore();
  const { setCurrentContact } = useContactStore();
  const { serverContacts } = useServerStore();

  const existingContact = serverContacts?.find(
    (item) => item.id === dataId
  )?.data;

  // const existingContact = route?.params?.contact ?? null;
  // const dataId = route?.params?.dataId ?? null;

  const [showTopDivider, setShowTopDivider] = useState(false);
  const [givenName, setGivenName] = useState(existingContact?.givenName ?? '');
  const givenNameRef = useRef<NativeTextInput>(null);
  const [familyName, setFamilyName] = useState(
    existingContact?.familyName ?? ''
  );
  const familyNameRef = useRef<NativeTextInput>(null);
  const [company, setCompany] = useState(existingContact?.company ?? '');
  const companyRef = useRef<NativeTextInput>(null);

  const [phoneNumbers, setPhoneNumbers] = useState(
    existingContact && existingContact.phoneNumbers
      ? [
          ...existingContact.phoneNumbers.flatMap((e: IPhoneNumber) => [
            { label: e.label, number: e.number, ref: createRef() },
          ]),
          { label: 'mobile', number: '', ref: createRef() },
        ]
      : [{ label: 'mobile', number: '', ref: createRef() }]
  );
  const phoneLabels = [
    { label: 'Mobile', value: 'mobile' },
    { label: 'Home', value: 'home' },
    { label: 'Work', value: 'work' },
    { label: 'Other', value: 'other' },
  ];

  const [emails, setEmails] = useState(
    existingContact &&
      existingContact.emailAddresses &&
      existingContact.emailAddresses.length > 0
      ? [
          ...existingContact.emailAddresses.flatMap((e: IEmailAddress) => [
            { label: e.label, email: e.email, ref: createRef() },
          ]),
          { label: 'home', email: '', ref: createRef() },
        ]
      : [{ label: 'home', email: '', ref: createRef() }]
  );

  const emailLabels = [
    { label: 'Home', value: 'home' },
    { label: 'Work', value: 'work' },
    { label: 'Mobile', value: 'mobile' },
    { label: 'Other', value: 'other' },
  ];

  // const [birthday, setBirthday] = useState(existingContact && existingContact.birthday ?
  //   new Date(existingContact.birthday.year, existingContact.birthday.month - 1, existingContact.birthday.day) : null);
  // const [openDatePicker, setOpenDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const GroupIcon = ({ children }: { children: ReactNode }) => {
    return (
      <View
        style={{
          width: GROUP_ICON_SIZE,
          height: GROUP_ICON_SIZE,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </View>
    );
  };

  const CloseIcon = ({ onPress }: { onPress: () => void }) => {
    return (
      <Pressable
        style={{
          width: GROUP_ICON_SIZE,
          height: GROUP_ICON_SIZE,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onPress}
      >
        <MaterialIcon name="close" color="black" size={22} />
      </Pressable>
    );
  };

  const onSaveContact = async () => {
    setSaving(true);
    let newData = existingContact ? { ...existingContact } : {};
    newData.givenName = givenName;
    newData.familyName = familyName;
    newData.company = company;
    newData.displayName =
      givenName && familyName
        ? `${givenName} ${familyName}`
        : givenName
        ? givenName
        : familyName;

    let newPhoneNumbers = [];
    for (let i = 0; i < phoneNumbers.length - 1; i++) {
      newPhoneNumbers.push({
        label: phoneNumbers[i].label,
        number: phoneNumbers[i].number,
      });
    }
    newData.phoneNumbers = newPhoneNumbers;

    let newEmails = [];
    for (let i = 0; i < emails.length - 1; i++) {
      newEmails.push({ label: emails[i].label, email: emails[i].email });
    }
    newData.emailAddresses = newEmails;

    // if(birthday){
    //   newData.birthday = {year: birthday.getFullYear(), month: birthday.getMonth() + 1, day: birthday.getDate()};
    // }

    user && dataId && (await setServerContact(user?.uid, dataId, newData));

    dataId && setCurrentContact({ id: dataId, data: newData });

    setSaving(false);
    router.back();
  };

  const onSetPhoneNumber = (value: string, index: number) => {
    let cleaned = ('' + value).replace(/\D/g, '');
    var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      const intlCode = match[1] ? '+1 ' : '';
      cleaned = [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join(
        ''
      );
    }

    let newPhoneNumbers = Object.assign([], phoneNumbers, {
      [index]: { ...phoneNumbers[index], number: cleaned },
    });
    if (cleaned && index === phoneNumbers.length - 1) {
      const newLabel = phoneLabels.find(
        (e) => phoneNumbers.findIndex((ee) => ee.label === e.value) === -1
      );
      newPhoneNumbers.push({
        label: newLabel ? newLabel.value : phoneLabels[0].value,
        number: '',
        ref: createRef(),
      });
    }
    setPhoneNumbers(newPhoneNumbers);
  };

  const onSetPhoneLabel = (index: number, value: string) => {
    setPhoneNumbers(
      Object.assign([], phoneNumbers, {
        [index]: { ...phoneNumbers[index], label: value },
      })
    );
  };

  const onRemovePhone = (removeIndex: number) => {
    setPhoneNumbers(phoneNumbers.filter((e, index) => index !== removeIndex));
  };

  const onSetEmail = (value: string, index: number) => {
    let newEmails = Object.assign([], emails, {
      [index]: { ...emails[index], email: value },
    });
    if (value && index === emails.length - 1) {
      const newLabel = emailLabels.find(
        (e) => emails.findIndex((ee) => ee.label === e.value) === -1
      );
      newEmails.push({
        label: newLabel ? newLabel.value : emailLabels[0].value,
        email: '',
        ref: createRef(),
      });
    }
    setEmails(newEmails);
  };

  const onRemoveEmail = (removeIndex: number) => {
    setEmails(emails.filter((e, index) => index !== removeIndex));
  };

  const onSetEmailLabel = (index: number, value: string) => {
    setEmails(
      Object.assign([], emails, { [index]: { ...emails[index], label: value } })
    );
  };

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
          <TouchableOpacity onPress={() => router.back()} disabled={saving}>
            <MaterialCommunityIcon name="close" color="black" size={24} />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: 'Roboto-Medium',
              color: 'black',
              fontSize: 18,
              marginLeft: 10,
            }}
          >
            {existingContact ? 'Edit contact' : 'Create contact'}
          </Text>
        </View>
        <TouchableHighlight
          style={{ borderRadius: 20 }}
          underlayColor="#f2f3f5"
          onPress={onSaveContact}
          disabled={saving}
        >
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
              backgroundColor: '#6BC4EA',
            }}
          >
            <Text
              style={{ fontFamily: 'Roboto', color: 'white', fontSize: 14 }}
            >
              Save
            </Text>
          </View>
        </TouchableHighlight>
      </View>
      {showTopDivider && <Divider />}
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="always"
        onScroll={(e) => setShowTopDivider(e.nativeEvent.contentOffset.y > 0)}
      >
        <View
          style={{
            paddingVertical: 20,
            paddingHorizontal: 10,
            minHeight: SCREEN_HEIGHT,
          }}
        >
          <View style={[styles.row, { marginRight: GROUP_ICON_SIZE }]}>
            <GroupIcon>
              <Feather name="user" color="black" size={22} />
            </GroupIcon>
            <MyTextInput
              label={'First name'}
              value={givenName}
              setValue={setGivenName}
              ref={givenNameRef}
              nextRef={familyNameRef}
            />
          </View>
          <View style={styles.row}>
            <MyTextInput
              ref={familyNameRef}
              nextRef={companyRef}
              label={'Last name'}
              value={familyName}
              setValue={setFamilyName}
              marginLeft={GROUP_ICON_SIZE}
              marginTop={5}
              marginRight={GROUP_ICON_SIZE}
            />
          </View>
          <View
            style={[styles.row, { marginTop: 5, marginRight: GROUP_ICON_SIZE }]}
          >
            <GroupIcon>
              <Octicon name="organization" color="black" size={22} />
            </GroupIcon>
            <MyTextInput
              label={'Company'}
              value={company}
              setValue={setCompany}
              ref={companyRef}
              nextRef={phoneNumbers[0].ref}
            />
          </View>
          {phoneNumbers.map((item, index) => {
            return (
              <View key={`phone-${index}`}>
                {index === 0 ? (
                  <View
                    style={[
                      styles.row,
                      {
                        marginTop: 5,
                        marginRight:
                          index === phoneNumbers.length - 1
                            ? GROUP_ICON_SIZE
                            : 0,
                      },
                    ]}
                  >
                    <GroupIcon>
                      <Feather name="phone" color="black" size={22} />
                    </GroupIcon>
                    <MyTextInput
                      label={'Phone'}
                      value={item.number}
                      setValue={(value) => onSetPhoneNumber(value, index)}
                      keyboardType="phone-pad"
                      ref={item.ref}
                      nextRef={
                        index < phoneNumbers.length - 1
                          ? phoneNumbers[index + 1].ref
                          : emails[0].ref
                      }
                    />
                    {index < phoneNumbers.length - 1 && (
                      <CloseIcon onPress={() => onRemovePhone(index)} />
                    )}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.row,
                      {
                        marginTop: 5,
                        marginLeft: GROUP_ICON_SIZE,
                        marginRight:
                          index === phoneNumbers.length - 1
                            ? GROUP_ICON_SIZE
                            : 0,
                      },
                    ]}
                  >
                    <MyTextInput
                      label={'Phone'}
                      value={item.number}
                      setValue={(value) => onSetPhoneNumber(value, index)}
                      keyboardType="phone-pad"
                      ref={item.ref}
                      nextRef={
                        index < phoneNumbers.length - 1
                          ? phoneNumbers[index + 1].ref
                          : emails[0].ref
                      }
                    />
                    {index < phoneNumbers.length - 1 && (
                      <CloseIcon onPress={() => onRemovePhone(index)} />
                    )}
                  </View>
                )}
                <View
                  style={{
                    marginTop: 10,
                    marginLeft: GROUP_ICON_SIZE,
                    width: 200,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: 'gray',
                  }}
                >
                  <RNPickerSelect
                    onValueChange={(value) => onSetPhoneLabel(index, value)}
                    // items={phoneLabels}
                    selectedValue={item.label}
                    placeholder={'Select a label'}
                    style={
                      {
                        // inputAndroid: {
                        //   backgroundColor: 'transparent',
                        // },
                        // inputIOS: {
                        //   minHeight: 45,
                        //   paddingLeft: 10,
                        // },
                      }
                    }
                  >
                    {phoneLabels.map((phoneLabel) => (
                      <RNPickerSelect.Item
                        label={phoneLabel.label}
                        value={phoneLabel.value}
                      />
                    ))}
                  </RNPickerSelect>
                </View>
              </View>
            );
          })}
          {emails.map((item, index) => {
            return (
              <View key={`email-${index}`}>
                {index === 0 ? (
                  <View
                    style={[
                      styles.row,
                      {
                        marginTop: 5,
                        marginRight:
                          index === emails.length - 1 ? GROUP_ICON_SIZE : 0,
                      },
                    ]}
                    key={`email-${index}`}
                  >
                    <GroupIcon>
                      <MaterialCommunityIcon
                        name="email-outline"
                        color="black"
                        size={22}
                      />
                    </GroupIcon>
                    <MyTextInput
                      label={'Email'}
                      value={item.email}
                      setValue={(value) => onSetEmail(value, index)}
                      keyboardType="email-address"
                      ref={item.ref}
                      nextRef={
                        index < emails.length - 1 ? emails[index + 1].ref : null
                      }
                    />
                    {index < emails.length - 1 && (
                      <CloseIcon onPress={() => onRemoveEmail(index)} />
                    )}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.row,
                      {
                        marginTop: 5,
                        marginLeft: GROUP_ICON_SIZE,
                        marginRight:
                          index === emails.length - 1 ? GROUP_ICON_SIZE : 0,
                      },
                    ]}
                    key={`email-${index}`}
                  >
                    <MyTextInput
                      label={'Email'}
                      value={item.email}
                      setValue={(value) => onSetEmail(value, index)}
                      keyboardType="email-address"
                      ref={item.ref}
                      nextRef={
                        index < emails.length - 1 ? emails[index + 1].ref : null
                      }
                    />
                    {index < emails.length - 1 && (
                      <CloseIcon onPress={() => onRemoveEmail(index)} />
                    )}
                  </View>
                )}
                <View
                  style={{
                    marginTop: 10,
                    marginLeft: GROUP_ICON_SIZE,
                    width: 200,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: 'gray',
                  }}
                >
                  <RNPickerSelect
                    onValueChange={(value: string) =>
                      onSetEmailLabel(index, value)
                    }
                    // items={emailLabels}
                    // value={item.label}
                    placeholder={'Select a label'}
                    style={
                      {
                        // inputAndroid: {
                        //   backgroundColor: 'transparent',
                        // },
                        // inputIOS: {
                        //   minHeight: 45,
                        //   paddingLeft: 10,
                        // },
                      }
                    }
                  >
                    {emailLabels.map((l) => (
                      <RNPickerSelect.Item label={l.label} value={l.value} />
                    ))}
                  </RNPickerSelect>
                </View>
              </View>
            );
          })}
          {/* <View style={[styles.row, {marginRight: GROUP_ICON_SIZE, marginTop: 5}]}>
            <GroupIcon><Feather name="calendar" color="black" size={22} /></GroupIcon>
            <Pressable style={{flex: 1, flexDirection: "row"}} onPress={() => setOpenDatePicker(true)}>
              <MyTextInput 
                label={"Birthday"}  
                value={birthday ? birthday.toLocaleDateString() : ""} 
                editable={false} 
              />
            </Pressable>
          </View>
          <DatePicker
            modal
            open={openDatePicker}
            date={birthday ? birthday : new Date()}
            onConfirm={(date) => {
              setOpenDatePicker(false);
              setBirthday(date);
            }}
            onCancel={() => {
              setOpenDatePicker(false);
            }}
          /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default EditContactScreen;

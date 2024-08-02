/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import { Divider } from 'react-native-paper';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Octicon from 'react-native-vector-icons/Octicons';

import { useAuthStore } from '@/core/hooks/use-auth';
import { useContactStore } from '@/core/hooks/use-contact';
import { useDeviceStore } from '@/core/hooks/use-device';
import {
  useVideoCallStore,
  VIDEO_CALL_TYPE,
} from '@/core/hooks/use-video-call';
import type { IUserData } from '@/types';
import { showErrorMessage } from '@/ui';

import Avatar from '../../components/avatar';
import { SelectItemModal } from '../../components/select-item-modal';
import { fetchUserDataByPhone } from '../../firebase/firestore';
import {
  checkRecordAudioPermission,
  makeFirstUppercase,
  trimAndRemoveAreaCode,
  trimPhone,
} from '../../util';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface ActionItem {
  text: string;
  icon: ReactNode;
  iconDisabled: ReactNode;
  onPress?: () => void;
  disabled: boolean;
}

const ViewContactScreen = () => {
  const router = useRouter();
  const { user, userData } = useAuthStore();
  const { deviceInfo } = useDeviceStore();
  const { setVideoCallData } = useVideoCallStore();
  const { currentContact } = useContactStore();
  const contact = currentContact?.data;
  const [showTopDivider, setShowTopDivider] = useState(false);
  const [showSelectNumberModal, setShowSelectNumberModal] = useState(false);
  const [showSelectSmsNumberModal, setShowSelectSmsNumberModal] =
    useState(false);
  const [showSelectEmailModal, setShowSelectEmailModal] = useState(false);
  const [otherUserData, setOtherUserData] = useState<IUserData | null>();

  useEffect(() => {
    if (user && contact) {
      const phoneNumbers = contact.phoneNumbers?.flatMap((e) =>
        trimAndRemoveAreaCode(e.number)
      );
      if (phoneNumbers && phoneNumbers.length > 0) {
        console.log('====> contact ', contact);
        fetchUserDataByPhone(['9046019799'], user.uid).then((uData) => {
          console.log('====> udata ', uData);
          setOtherUserData(uData);
        });
      }
    }
  }, [contact, contact?.phoneNumbers, user, user?.uid]);

  const actionIcons: ActionItem[] = [
    {
      text: 'Call',
      icon: <Feather name="phone" color="#224065" size={22} />,
      iconDisabled: <Feather name="phone" color="gray" size={22} />,
      onPress:
        contact && contact.phoneNumbers
          ? () => {
              contact.phoneNumbers!.length > 1
                ? setShowSelectNumberModal(true)
                : onCallPhoneNumber(
                    parseInt(trimPhone(contact.phoneNumbers![0].number), 10)
                  );
            }
          : undefined,
      disabled: !contact?.phoneNumbers || !contact.phoneNumbers.length,
    },
    {
      text: 'MM Call',
      icon: (
        <MaterialCommunityIcon name="phone-voip" color="#224065" size={22} />
      ),
      iconDisabled: (
        <MaterialCommunityIcon name="phone-voip" color="gray" size={22} />
      ),
      onPress: () => {
        if (otherUserData?.twilioCallID) {
          otherUserData && onCallNumber(Number(otherUserData.twilioCallID));
        }
      },
      disabled: !(otherUserData && otherUserData.twilioCallID),
    },
    {
      text: 'Video',
      icon: <Feather name="video" color="#224065" size={22} />,
      iconDisabled: <Feather name="video" color="gray" size={22} />,
      onPress: () => {
        onVideoCall();
      },
      disabled: !otherUserData,
    },
    {
      text: 'Message',
      icon: <Feather name="message-square" color="#224065" size={22} />,
      iconDisabled: <Feather name="message-square" color="gray" size={22} />,
      onPress:
        contact && contact.phoneNumbers
          ? () => {
              contact.phoneNumbers!.length > 1
                ? setShowSelectSmsNumberModal(true)
                : onSendSMS(contact.phoneNumbers![0].number);
            }
          : undefined,
      disabled: !contact?.phoneNumbers || !contact.phoneNumbers.length,
    },
    {
      text: 'Email',
      icon: <Feather name="mail" color="#224065" size={22} />,
      iconDisabled: <Feather name="mail" color="gray" size={22} />,
      onPress: contact?.emailAddresses
        ? () => {
            contact.emailAddresses!.length > 1
              ? setShowSelectEmailModal(true)
              : onSendEmail(contact.emailAddresses![0].email);
          }
        : undefined,
      disabled: !contact?.emailAddresses || !contact.emailAddresses.length,
    },
  ];

  const actionButton = ({
    text,
    icon,
    iconDisabled,
    onPress,
    disabled,
  }: ActionItem) => {
    return (
      <TouchableHighlight
        underlayColor="#f2f3f5"
        style={{ borderRadius: 10, flex: 1 }}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={{ paddingVertical: 15, alignItems: 'center' }}>
          {disabled ? iconDisabled : icon}
          <Text
            style={{
              fontFamily: 'Roboto',
              fontSize: 14,
              color: disabled ? 'gray' : '#224065',
              marginTop: 5,
            }}
          >
            {text}
          </Text>
        </View>
      </TouchableHighlight>
    );
  };

  const onEditContact = () => {
    router.navigate({
      pathname: '/edit-contact',
      params: {
        dataId: currentContact?.id,
      },
    });
    // navigation.navigate('EditContact', {
    //   contact: currentContact.data,
    //   dataId: currentContact.id,
    // });
  };

  const onCallPhoneNumber = async (number: number) => {
    if (deviceInfo?.isPrimary) {
      Linking.openURL(`tel:${number}`);
    } else {
      await onCallNumber(number);
    }
  };

  const onCallNumber = async (number: number) => {
    const isGranted = await checkRecordAudioPermission();
    if (userData && isGranted) {
      console.log('===> number ', number);
      try {
        const contactDisplayName = `${contact?.givenName} ${contact?.familyName}`;
        contact?.phoneNumbers &&
          router.navigate({
            pathname: '/active-call',
            params: {
              phoneNumber: number,
              contactName: contactDisplayName,
              placeHolder: contactDisplayName,
            },
          });
      } catch (error) {
        showErrorMessage("Can't make a call");
      }
      // navigation.navigate("ActiveCall", {number: number});
    } else {
      showErrorMessage('You should allow record audio to make call');
    }
  };

  const onVideoCall = async () => {
    console.log('======> onVideoCall ');
    if (otherUserData) {
      setVideoCallData({
        type: VIDEO_CALL_TYPE.OUTGOING,
        otherUser: otherUserData,
      });
    }
    router.navigate('/video-call');
  };

  const onSendSMS = (number: string) => {
    router.navigate({ pathname: '/sms-details', params: { address: number } });
  };

  const onSendEmail = (emailAddress: string) => {
    Linking.openURL(`mailto:${emailAddress}`);
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
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcon name="arrow-left" color="black" size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onEditContact}>
          <MaterialIcon name="edit" color="black" size={24} />
        </TouchableOpacity>
      </View>
      {showTopDivider && <Divider />}
      <ScrollView
        style={{ flex: 1 }}
        onScroll={(e) => setShowTopDivider(e.nativeEvent.contentOffset.y > 0)}
      >
        <View style={{ paddingVertical: 30, minHeight: SCREEN_HEIGHT }}>
          <View style={{ alignSelf: 'center' }}>
            <Avatar
              img={
                otherUserData && otherUserData.profilePhoto
                  ? { uri: otherUserData.profilePhoto }
                  : undefined
              }
              placeholder={`${contact?.givenName} ${contact?.familyName}`}
              width={100}
              height={100}
            />
          </View>
          <Text
            style={{
              fontFamily: 'Roboto',
              fontSize: 30,
              color: 'black',
              alignSelf: 'center',
              marginTop: 30,
            }}
          >{`${contact?.givenName} ${contact?.familyName}`}</Text>
          {contact?.company && (
            <Text
              style={{
                fontFamily: 'Roboto',
                fontSize: 16,
                marginTop: 10,
                color: 'gray',
                alignSelf: 'center',
              }}
            >
              {contact.company}
            </Text>
          )}
          <Divider style={{ marginTop: 15 }} />
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 10,
              paddingHorizontal: 10,
              justifyContent: 'space-between',
            }}
          >
            {actionButton(actionIcons[0])}
            {actionButton(actionIcons[1])}
            {actionButton(actionIcons[2])}
            {actionButton(actionIcons[3])}
            {actionButton(actionIcons[4])}
          </View>
          <Divider style={{ marginBottom: 15 }} />
          <View
            style={{
              marginHorizontal: 20,
              paddingVertical: 15,
              borderRadius: 10,
              backgroundColor: '#e7eff5',
            }}
          >
            <Text
              style={{
                fontFamily: 'Roboto-Medium',
                color: 'black',
                fontSize: 16,
                marginLeft: 20,
                marginBottom: 20,
              }}
            >
              Contact info
            </Text>
            {contact?.phoneNumbers && contact.phoneNumbers.length > 0 ? (
              <>
                {contact.phoneNumbers.map((item, index) => {
                  return (
                    <TouchableHighlight
                      underlayColor="#f2f3f5"
                      onPress={() =>
                        onCallNumber(Number(trimPhone(item.number)))
                      }
                      style={{ paddingVertical: 15, paddingHorizontal: 20 }}
                      key={`phone-${index}`}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingLeft: index === 0 ? 0 : 22,
                          }}
                        >
                          {index === 0 && (
                            <Feather name="phone" color="#224065" size={22} />
                          )}
                          <View style={{ marginLeft: 10 }}>
                            <Text
                              style={{
                                fontFamily: 'Roboto',
                                color: '#224065',
                                fontSize: 16,
                              }}
                            >
                              {item.number}
                            </Text>
                            <Text
                              style={{ fontFamily: 'Roboto', color: '#224065' }}
                            >
                              {makeFirstUppercase(item.label ?? '')}
                            </Text>
                          </View>
                        </View>
                        <Pressable onPress={() => onSendSMS(item.number)}>
                          <Feather
                            name="message-square"
                            color="#224065"
                            size={22}
                          />
                        </Pressable>
                      </View>
                    </TouchableHighlight>
                  );
                })}
              </>
            ) : (
              <TouchableHighlight
                underlayColor="#f2f3f5"
                onPress={onEditContact}
                style={{ paddingHorizontal: 20, paddingVertical: 15 }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Feather name="phone" color="#224065" size={22} />
                  <Text
                    style={{
                      fontFamily: 'Roboto',
                      color: '#224065',
                      marginLeft: 10,
                    }}
                  >
                    Add phone number
                  </Text>
                </View>
              </TouchableHighlight>
            )}
            {contact?.emailAddresses && contact.emailAddresses.length > 0 ? (
              <>
                {contact.emailAddresses.map((item, index) => {
                  return (
                    <TouchableHighlight
                      underlayColor="#f2f3f5"
                      onPress={() => onSendEmail(item.email)}
                      style={{ paddingVertical: 15, paddingHorizontal: 20 }}
                      key={`email-${index}`}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingLeft: index === 0 ? 0 : 22,
                        }}
                      >
                        {index === 0 && (
                          <Feather name="mail" color="#224065" size={22} />
                        )}
                        <View style={{ marginLeft: 10 }}>
                          <Text
                            style={{
                              fontFamily: 'Roboto',
                              color: '#224065',
                              fontSize: 16,
                            }}
                          >
                            {item.email}
                          </Text>
                          <Text
                            style={{ fontFamily: 'Roboto', color: '#224065' }}
                          >
                            {makeFirstUppercase(item.label)}
                          </Text>
                        </View>
                      </View>
                    </TouchableHighlight>
                  );
                })}
              </>
            ) : (
              <TouchableHighlight
                underlayColor="#f2f3f5"
                onPress={onEditContact}
                style={{ paddingHorizontal: 20, paddingVertical: 15 }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Feather name="mail" color="#224065" size={22} />
                  <Text
                    style={{
                      fontFamily: 'Roboto',
                      color: '#224065',
                      marginLeft: 10,
                    }}
                  >
                    Add email
                  </Text>
                </View>
              </TouchableHighlight>
            )}
          </View>
          {(contact?.company || contact?.birthday) && (
            <View
              style={{
                marginHorizontal: 20,
                paddingVertical: 15,
                borderRadius: 10,
                marginTop: 20,
                backgroundColor: '#e7eff5',
                paddingHorizontal: 20,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Roboto-Medium',
                  color: 'black',
                  fontSize: 16,
                  marginBottom: 20,
                }}
              >{`About ${contact.givenName}`}</Text>
              {contact.company && (
                <View style={{ flexDirection: 'row', paddingVertical: 15 }}>
                  <Octicon name="organization" color="#224065" size={22} />
                  <Text
                    style={{
                      fontFamily: 'Roboto',
                      color: '#224065',
                      marginLeft: 10,
                    }}
                  >
                    {contact.company}
                  </Text>
                </View>
              )}
              {contact.birthday && (
                <View style={{ flexDirection: 'row', paddingVertical: 15 }}>
                  <Feather name="calendar" color="#224065" size={22} />
                  <Text
                    style={{
                      fontFamily: 'Roboto',
                      color: '#224065',
                      marginLeft: 10,
                    }}
                  >
                    {new Date(
                      contact.birthday.year,
                      contact.birthday.month - 1,
                      contact.birthday.day
                    ).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <SelectItemModal
        visible={showSelectNumberModal}
        setVisible={setShowSelectNumberModal}
        title={'Choose phone number'}
        dataArray={
          contact?.phoneNumbers
            ? contact.phoneNumbers.flatMap((e) => [
                { title: e.number, label: e.label ?? '' },
              ])
            : []
        }
        onSelected={(item) => onCallPhoneNumber(Number(trimPhone(item.title)))}
      />
      <SelectItemModal
        visible={showSelectSmsNumberModal}
        setVisible={setShowSelectSmsNumberModal}
        title={'Choose phone number'}
        dataArray={
          contact?.phoneNumbers
            ? contact.phoneNumbers.flatMap((e) => [
                { title: e.number, label: e.label ?? '' },
              ])
            : []
        }
        onSelected={(item) => onSendSMS(item.title)}
      />
      <SelectItemModal
        visible={showSelectEmailModal}
        setVisible={setShowSelectEmailModal}
        title={'Choose email address'}
        dataArray={
          contact?.emailAddresses
            ? contact.emailAddresses.flatMap((e) => [
                { title: e.email, label: e.label },
              ])
            : []
        }
        onSelected={(item) => onSendEmail(item.title)}
      />
    </SafeAreaView>
  );
};

export default ViewContactScreen;

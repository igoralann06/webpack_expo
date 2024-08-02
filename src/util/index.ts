/* eslint-disable max-params */
import { Audio } from 'expo-av';
import Contacts, { PermissionStatus } from 'expo-contacts';
import SMS from 'expo-sms';
import { Platform } from 'react-native';

import type { IContact, IContactData, ISMSLog } from '@/types';
// import Contacts from 'react-native-contacts';
// import Geolocation from 'react-native-geolocation-service';
// import appConfig from '../app.json';

// export const showErrorMessage = (toast, message: string) => {
//   const toastOptions = {
//     placement: 'top',
//     duration: 2500,
//   };
//   toast.show(message, toastOptions);
// };

export const getAvatarInitials = (textString: string) => {
  if (!textString) return '';

  const text = textString.trim();

  const textSplit = text.split(' ');

  if (textSplit.length <= 1) return text.charAt(0);

  const initials =
    textSplit[0].charAt(0) + textSplit[textSplit.length - 1].charAt(0);

  return initials;
};

export const stringToColor = (textString: string) => {
  const mainColors = {
    defaultColor: '#b2b2b2',
    backgroundTransparent: 'transparent',
    defaultBlue: '#0084ff',
    leftBubbleBackground: '#f0f0f0',
    black: '#000',
    white: '#fff',
    carrot: '#e67e22',
    emerald: '#2ecc71',
    peterRiver: '#3498db',
    wisteria: '#8e44ad',
    alizarin: '#e74c3c',
    turquoise: '#1abc9c',
    midnightBlue: '#2c3e50',
    optionTintColor: '#007AFF',
    timeTextColor: '#aaa',
  };
  if (!textString) return mainColors.carrot;
  const {
    carrot,
    emerald,
    peterRiver,
    wisteria,
    alizarin,
    turquoise,
    midnightBlue,
  } = mainColors;
  const colors = [
    carrot,
    emerald,
    peterRiver,
    wisteria,
    alizarin,
    turquoise,
    midnightBlue,
  ];
  let sumChars = 0;
  for (let i = 0; i < textString.length; i += 1) {
    sumChars += textString.charCodeAt(i);
  }
  return colors[sumChars % colors.length];
};

const secToMoment = (seconds: number) => {
  if (seconds < 0) return 'Expired';
  else if (seconds < 60) return `Just now`;
  else if (seconds < 3600) {
    const time = (seconds / 60).toFixed(0);
    return `${time} min${parseInt(time, 10) === 1 ? '' : 's'} ago`;
  } else if (seconds < 86400) {
    const time = (seconds / 3600).toFixed(0);
    return `${time} hour${parseInt(time, 10) === 1 ? '' : 's'} ago`;
  } else {
    const time = (seconds / 86400).toFixed(0);
    return `${time} day${parseInt(time, 10) === 1 ? '' : 's'} ago`;
  }
};

export const dateToMoment = (pastDate: bigint) => {
  return secToMoment(
    (new Date().getTime() - new Date(Number(pastDate)).getTime()) / 1000
  );
};

export const isContactEqual = (
  contact1: IContactData,
  contact2: IContactData
) => {
  let isEqual = true;
  if (contact1.givenName !== contact2.givenName) {
    return false;
  }
  if (contact1.familyName !== contact2.familyName) {
    return false;
  }

  if (contact1.phoneNumbers && contact2.phoneNumbers) {
    isEqual = eqSet<string>(
      new Set(contact1.phoneNumbers.map((item) => trimPhone(item.number))),
      new Set(contact2.phoneNumbers.map((item) => trimPhone(item.number)))
    );
  }
  return isEqual;
};

export const makeFirstUppercase = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatPhoneNumber = (phoneNumberString?: string) => {
  var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    var intlCode = match[1] ? '+1 ' : '';
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
  }
  return phoneNumberString;
};

export const getTimeString = (currentTime: number) => {
  if (currentTime <= 0) return '';
  const seconds = parseInt((currentTime % 60).toString(), 10);
  const minutes = parseInt(((currentTime / 60) % 60).toString(), 10);
  const s = seconds < 10 ? '0' + seconds : seconds;
  const m = minutes < 10 ? '0' + minutes : minutes;
  return m + ':' + s;
};

export const isPhoneEqual = (address1: string, address2: string) => {
  const trimmed1 = ('' + address1).replace(/\D/g, '');
  const trimmed2 = ('' + address2).replace(/\D/g, '');
  if (trimmed1.includes(trimmed2)) return true;
  if (trimmed2.includes(trimmed1)) return true;
  return false;
};

export const trimAndRemoveAreaCode = (phoneNumber: string) => {
  let trimmed = ('' + phoneNumber).replace(/\D/g, '');
  if (trimmed.at(0) === '1') trimmed = trimmed.slice(1);
  return trimmed;
};

export const trimPhone = (value: string) => {
  return ('' + value).replace(/\D/g, '');
};

export const getContactName = (
  currentNumber: string,
  serverContacts: IContact[]
) => {
  const currentTrimmed = trimAndRemoveAreaCode(currentNumber);
  const existsContact = serverContacts.find(
    (contact) =>
      !!contact.data.phoneNumbers?.find(
        (phone) => trimAndRemoveAreaCode(phone.number) === currentTrimmed
      )
  );
  return existsContact
    ? `${existsContact.data.givenName} ${existsContact.data.familyName}`
    : undefined;
};

export const checkWriteContactPermission = async () => {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    const permission = await Contacts.getPermissionsAsync();
    if (permission.status === PermissionStatus.GRANTED) return true;
    const result = await Contacts.requestPermissionsAsync();
    return result.status === PermissionStatus.GRANTED;
  } else {
    return true;
  }
};

export const getAllPhoneContacts = async () => {
  try {
    if (Platform.OS === 'web') {
      return [];
      // const isGranted = await PermissionsAndroid.check(
      //   PermissionsAndroid.PERMISSIONS.READ_CONTACTS
      // );
      // if (isGranted) {
      //   return (await Contacts.getContactsAsync()).data;
      // } else {
      //   const status = await PermissionsAndroid.request(
      //     PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      //     {
      //       title: 'Contacts',
      //       message:
      //         'This app would like to view your contacts to sync between your devices.',
      //       buttonPositive: 'Allow',
      //     }
      //   );
      //   if (status === 'granted') {
      //     return (await Contacts.getContactsAsync()).data;
      //   } else {
      //     return [];
      //   }
      // }
    } else {
      return (await Contacts.getContactsAsync()).data;
    }
  } catch (err) {
    console.log(err);
  }
  return [];
};

export const deleteContact = async (contact: IContactData) => {
  return;
  // await Contacts.removeContactAsync(contact);
};

// export const updateContact = async (contact) => {
//   Contacts.updateContact(contact);
// };

export const addContact = async (contact: IContactData) => {
  return contact;
  // return await Contacts.addContactAsync({ ...contact });
};

export const openNewContact = async () => {
  return false;
  // return await Contacts.openContactForm({});
};

export const openExistContact = async (contact: IContactData) => {
  return contact;
  // return await Contacts.openExistingContact(contact);
};

// export const viewContact = async (contact) => {
//   try {
//     return await Contacts.viewExistingContact(contact);
//   } catch {
//     return null;
//   }
// };

export const getAllCallLogs = async () => {
  if (Platform.OS === 'ios') return [];
  // try {
  //   let isGranted = await PermissionsAndroid.check(
  //     PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
  //   );
  //   if (!isGranted) {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
  //       {
  //         title: 'Call Log Example',
  //         message: 'Access your call logs to sync between your devices',
  //         buttonNeutral: 'Ask Me Later',
  //         buttonNegative: 'Cancel',
  //         buttonPositive: 'OK',
  //       }
  //     );
  //     isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
  //   }
  //   if (isGranted) {
  //     return await CallLogs.loadAll();
  //   } else {
  //     console.log('Call Log permission denied');
  //     return [];
  //   }
  // } catch (err) {
  //   console.log(err);
  // }
  return [];
};

export const checkSMSPermissions = async () => {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'ios') return false;
  const isAvailable = await SMS.isAvailableAsync();
  return isAvailable;
};

export const getAllSMSLogs = async (
  setPhoneSMSLogs: (value: ISMSLog[]) => void
) => {
  if (Platform.OS === 'ios') {
    setPhoneSMSLogs([]);
    return;
  }
  setPhoneSMSLogs([]);
  return;

  // const checkPermission = await checkSMSPermissions();
  // if (!checkPermission) {
  //   const granted = await PermissionsAndroid.requestMultiple([
  //     PermissionsAndroid.PERMISSIONS.READ_SMS,
  //     PermissionsAndroid.PERMISSIONS.SEND_SMS,
  //   ]);
  //   if (
  //     granted[PermissionsAndroid.PERMISSIONS.READ_SMS] !== 'granted' ||
  //     granted[PermissionsAndroid.PERMISSIONS.SEND_SMS] !== 'granted'
  //   ) {
  //     setPhoneSMSLogs([]);
  //   }
  // }

  // var filter = {
  //   box: '',
  //   maxCount: 1000,
  // };

  // SmsAndroid.list(
  //   JSON.stringify(filter),
  //   (fail) => setPhoneSMSLogs([]),
  //   (count, smsList) => setPhoneSMSLogs(JSON.parse(smsList))
  // );
};

export const sendSystemSMS = (
  text: string,
  phoneNumber: string,
  onSuccess?: () => void,
  onFail?: () => void
) => {
  if (Platform.OS === 'web') {
    return;
  }

  console.log(text, phoneNumber, onSuccess, onFail);
  // let phoneNumbers = {
  //   addressList: [phoneNumber],
  // };
  // SmsAndroid.autoSend(
  //   JSON.stringify(phoneNumbers), // phone number to send sms to
  //   text, // sms body
  //   (fail) => {
  //     onFail && onFail();
  //   },
  //   (status) => {
  //     onSuccess && onSuccess();
  //   }
  // );
};

export const checkRecordAudioPermission = async () => {
  if (Platform.OS === 'web') return true;
  if (Platform.OS === 'android') {
    const { status } = await Audio.getPermissionsAsync();
    return status === PermissionStatus.GRANTED;
  }
  return true;
};

// const hasLocationPermissionIOS = async () => {
//   const openSetting = () => {
//     Linking.openSettings().catch(() => {
//       Alert.alert('Unable to open settings');
//     });
//   };
//   const status = await Geolocation.requestAuthorization('whenInUse');

//   if (status === 'granted') {
//     return true;
//   }

//   if (status === 'denied') {
//     Alert.alert('Location permission denied');
//   }

//   if (status === 'disabled') {
//     Alert.alert(
//       `Turn on Location Services to allow "${appConfig.name}" to determine your location.`,
//       '',
//       [
//         { text: 'Go to Settings', onPress: openSetting },
//         { text: "Don't Use Location", onPress: () => {} },
//       ]
//     );
//   }

//   return false;
// };

// export const hasLocationPermission = async () => {
//   if (Platform.OS === 'ios') {
//     const hasPermission = await hasLocationPermissionIOS();
//     return hasPermission;
//   }

//   if (Platform.OS === 'android' && Platform.Version < 23) {
//     return true;
//   }

//   const hasPermission = await PermissionsAndroid.check(
//     PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
//   );

//   if (hasPermission) {
//     return true;
//   }

//   const status = await PermissionsAndroid.request(
//     PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
//   );

//   if (status === PermissionsAndroid.RESULTS.GRANTED) {
//     return true;
//   }

//   if (status === PermissionsAndroid.RESULTS.DENIED) {
//     ToastAndroid.show('Location permission denied by user.', ToastAndroid.LONG);
//   } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
//     ToastAndroid.show(
//       'Location permission revoked by user.',
//       ToastAndroid.LONG
//     );
//   }

//   return false;
// };

function eqSet<T>(xs: Set<T>, ys: Set<T>) {
  return xs.size === ys.size && [...xs].every((x) => ys.has(x));
}

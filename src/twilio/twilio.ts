// import { Voice, Call as TwilioCall, AudioDevice as TwilioAudioDevice } from '@twilio/voice-react-native-sdk';
import { httpsCallable } from 'firebase/functions';
import { Platform } from 'react-native';
// import RNCallKeep from 'react-native-callkeep';
import { RNTwilioPhone } from 'react-native-twilio-phone';

import { functions } from '@/firebase/init';
import type { CreateVideoCallChannelRes, IUserData } from '@/types';

// const twilioVoice = new Voice();
// var twilioAudioDevices = null;

// export const CALL_STATE = Call.EventName;
// export const AUDIO_DEVICE_TYPE = TwilioAudioDevice.Type;
export const AGORA_APP_ID = '32e10b1b95e445bfbd0ee4e62cd69ee1';

export const getAccessToken = async (userIdentify: string) => {
  const createTokenFunc = httpsCallable<
    { identity: string; platform: string },
    { success: boolean; token: string }
  >(functions, 'createTwilioToken');
  const result = await createTokenFunc({
    identity: userIdentify,
    platform: Platform.OS,
  });
  if (result.data.success) {
    return result.data.token;
  } else {
    return null;
  }
};

export const getCurrentAudioDeviceType = async () => {
  // try{
  //   const devices = await twilioVoice.getAudioDevices();
  //   twilioAudioDevices = devices.audioDevices;
  //   return devices.selectedDevice ? devices.selectedDevice.type : null;
  // }catch(err){
  //   console.log(err);
  //   return null;
  // }
};

export const setCurrentAudioDevice = async (newType: string) => {
  console.log(newType);
  // try{
  //   const newDevice = twilioAudioDevices.find(e => e.type === newType);
  //   await newDevice.select();
  //   return true;
  // }catch(err){
  //   console.log(err);
  //   return false;
  // }
};

export const createOutgoingCall = async (
  callNumber: string,
  contactName: string,
  myName: string
) => {
  await RNTwilioPhone.startCall(callNumber, contactName, myName);
};

export const sendTwilioSMS = async (
  to: string,
  userId: string,
  message: string
) => {
  const sendSMSFunc = httpsCallable<
    { to: string; message: string; userId: string },
    { success: boolean }
  >(functions, 'twilioSendSMS');
  const result = await sendSMSFunc({
    to,
    message,
    userId,
  });
  if (result.data.success) {
    return true;
  } else {
    return false;
  }
};

export const createVideoCallChannel = async (params: {
  caller: IUserData;
  receiver: IUserData;
}) => {
  const createChannelFunc = httpsCallable(functions, 'createVideoCallChannel');
  const dataResponse = await createChannelFunc(params);
  return dataResponse.data as CreateVideoCallChannelRes;
};

export const endVideoCall = async (dataId: string, params: any) => {
  const endVideoCallFunc = httpsCallable(functions, 'endVideoCall');
  const dataResponse = await endVideoCallFunc({ id: dataId, ...params });
  return dataResponse.data;
};

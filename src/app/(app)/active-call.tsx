/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import type { Call } from '@twilio/voice-sdk';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import Avatar from '@/components/avatar';
import { useTwilioDeviceStore } from '@/core/hooks/use-twilio-device';
import { showErrorMessage } from '@/ui';

import { DialPad } from '../../components/dial-pad';
// import { hangupCall, muteCall, sendDigits } from '../../twilio/twilio';
import { getTimeString } from '../../util';

type CallStateType =
  | 'Ringing'
  | 'Disconnected'
  | 'Connected'
  | 'Cancelled'
  | 'Reconnecting'
  | 'Reconnected'
  | 'Reject'
  | 'Error';

const ActiveCallScreen = () => {
  const router = useRouter();
  const { contactName, placeHolder, phoneNumber } = useLocalSearchParams<{
    contactName: string;
    placeHolder: string;
    phoneNumber: string;
  }>();
  const { device: twilioDevice } = useTwilioDeviceStore();
  const [twilioCall, setTwilioCall] = useState<Call>();
  const [mute, setMute] = useState(false);
  const [showDial, setShowDial] = useState(false);
  // const [currentAudioDeviceType, setCurrentAudioDeviceType] = useState(null);

  const [dialNumber, setDialNumber] = useState('');

  const intervalId = useRef<NodeJS.Timeout>();
  const [currentTime, setCurrentTime] = useState(0);

  const [callStatus, setCallStatus] = useState<CallStateType>();
  const endCallTimeout = useRef<NodeJS.Timeout>();

  const timeStr = useMemo(() => {
    if (!currentTime) {
      return '00:00';
    }
    return getTimeString(currentTime);
  }, [currentTime]);

  useEffect(() => {}, []);

  const endedCall = useCallback(() => {
    endCallTimeout.current = setTimeout(() => {
      router.back();
    }, 1000);
  }, [router]);

  // useEffect(() => {
  //   const onBackPress = () => {
  //     return true;
  //   };
  //   BackHandler.addEventListener('hardwareBackPress', onBackPress);

  //   const subscriptions = [
  //     twilioPhoneEmitter.addListener(EventType.CallRinging, () => {
  //       setCallStatus(EventType.CallRinging);
  //     }),
  //     twilioPhoneEmitter.addListener(EventType.CallConnected, () => {
  //       setCallStatus(EventType.CallConnected);
  //       endedCall();
  //     }),
  //     twilioPhoneEmitter.addListener(EventType.CallDisconnected, () => {
  //       setCallStatus(EventType.CallDisconnected);
  //     }),
  //     twilioPhoneEmitter.addListener(
  //       EventType.CallDisconnectedError,
  //       (data) => {
  //         console.log(data);
  //         setCallStatus(EventType.CallDisconnectedError);
  //       }
  //     ),
  //   ];

  //   startCallTimer();
  //   // fetchAudioDevices();
  //   return () => {
  //     BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  //     intervalId.current && clearInterval(intervalId.current);
  //     endCallTimeout.current && clearTimeout(endCallTimeout.current);
  //     subscriptions.map((subscription) => {
  //       subscription.remove();
  //     });
  //   };
  // }, [endedCall]);

  useEffect(() => {
    if (callStatus === 'Connected') {
      startCallTimer();
    } else if (callStatus === 'Disconnected') {
      endedCall();
    }
  }, [callStatus, endedCall]);

  const onMute = async () => {
    if (twilioCall) {
      twilioCall.mute();
      setMute(!mute);
    }
  };

  const onShowDial = () => {
    setShowDial(!showDial);
  };

  const onAddDial = (value: string) => {
    if (twilioCall) {
      twilioCall.sendDigits(value);
      setDialNumber(`${dialNumber}${value}`);
    }
  };

  const onEndCall = async () => {
    if (twilioCall) {
      twilioCall.disconnect();
      endedCall();
    }
  };

  const startCallTimer = () => {
    const startTime = Date.now();
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
    intervalId.current = setInterval(() => {
      const dt = Math.round((Date.now() - startTime) / 1000);
      setCurrentTime(dt);
    }, 1000);
  };

  useEffect(() => {
    twilioDevice
      ?.connect({
        params: {
          To: `${phoneNumber}`,
        },
      })
      .then((call) => {
        call
          .on('accept', (c) => {
            console.log('===> accept ', c);
          })
          .on('audio', (c) => {
            console.log('===> audio ', c);
          })
          .on('cancel', (c) => {
            console.log('===> cancel ', c);
            setCallStatus('Cancelled');
            endedCall();
          })
          .on('disconnect', (c) => {
            console.log('===> disconnect ', c);
            setCallStatus('Disconnected');
            endedCall();
          })
          .on('error', (e) => {
            console.log('===> error ', e);
            setCallStatus('Error');
            showErrorMessage('Error is happened');
          })
          .on('messageReceived', (m) => {
            console.log('===> messageReceived ', m);
          })
          .on('messageSent', (m) => {
            console.log('===> messageSent ', m);
          })
          .on('mute', (isMuted, c) => {
            console.log('===> mute ', isMuted, c);
          })
          .on('reconnected', () => {
            setCallStatus('Reconnected');
            console.log('===> reconnected ');
          })
          .on('reconnecting', (twilioError) => {
            console.log('===> reconnecting ', twilioError);
            setCallStatus('Reconnecting');
          })
          .on('reject', () => {
            console.log('===> reject ');
            setCallStatus('Reject');
            endedCall();
          })
          .on('ringing', (hasEarlyMedia) => {
            console.log('===> ringing ', hasEarlyMedia);
          })
          .on('sample', (sample) => {
            console.log('===> sample ', sample);
          });
        setTwilioCall(call);
      });
    return () => twilioCall && twilioCall.disconnect();
  }, [endedCall, phoneNumber, twilioCall, twilioDevice]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ alignItems: 'center', paddingTop: 100 }}>
        <Avatar placeholder={placeHolder} width={120} height={120} />
        <Text
          style={{
            fontFamily: 'Roboto',
            fontSize: 18,
            color: 'black',
            marginTop: 10,
          }}
        >
          {callStatus}
        </Text>
        <Text
          style={{
            fontFamily: 'Roboto',
            fontSize: 24,
            color: 'black',
            marginTop: 10,
          }}
        >
          {contactName}
        </Text>
        <Text
          style={{
            fontFamily: 'Roboto',
            fontSize: 18,
            color: 'black',
            marginTop: 10,
          }}
        >
          {callStatus === 'Connected' ? timeStr : ''}
        </Text>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 30 }}
        >
          <TouchableHighlight onPress={onMute} style={{ borderRadius: 30 }}>
            <View
              style={mute ? styles.buttonBackActive : styles.buttonDeactive}
            >
              <MaterialIcon
                name={mute ? 'mic-off' : 'mic'}
                size={30}
                color={mute ? 'white' : '#484848'}
              />
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={onShowDial}
            style={{ marginLeft: 40, borderRadius: 30 }}
          >
            <View
              style={showDial ? styles.buttonBackActive : styles.buttonDeactive}
            >
              <MaterialIcon
                name="dialpad"
                size={30}
                color={showDial ? 'white' : '#484848'}
              />
            </View>
          </TouchableHighlight>
          {/* <TouchableHighlight onPress={onSpeaker} style={{ marginLeft: 40, borderRadius: 30 }}>
            <View style={currentAudioDeviceType === AUDIO_DEVICE_TYPE.Speaker ? styles.buttonBackActive : styles.buttonDeactive}>
              <MaterialIcon name="volume-up" size={30} color={currentAudioDeviceType === AUDIO_DEVICE_TYPE.Speaker ? "white" : "#484848"} />
            </View>
          </TouchableHighlight> */}
        </View>
      </View>

      {showDial && (
        <View
          style={{
            backgroundColor: '#EFEFEF',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            paddingBottom: 130,
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
              {dialNumber}
            </Text>
            <TouchableOpacity
              style={{ position: 'absolute', left: 30, top: 20 }}
              onPress={() => setShowDial(false)}
            >
              <MaterialCommunityIcon name="close" size={23} color="gray" />
            </TouchableOpacity>
          </View>
          <DialPad disabled={false} onPress={onAddDial} />
        </View>
      )}

      <View
        style={{
          position: 'absolute',
          width: '100%',
          bottom: 50,
          alignItems: 'center',
        }}
      >
        <TouchableHighlight style={{ borderRadius: 30 }} onPress={onEndCall}>
          <View style={[styles.buttonBackActive, { backgroundColor: 'red' }]}>
            <MaterialCommunityIcon
              name="phone-hangup"
              color="white"
              size={30}
            />
          </View>
        </TouchableHighlight>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  buttonBackActive: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#484848',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: -0.5,
    },
    shadowRadius: 9,
    shadowOpacity: 0.3,
  },
  buttonDeactive: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ActiveCallScreen;

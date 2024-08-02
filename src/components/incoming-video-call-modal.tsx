/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import Modal from 'react-native-modal';
import Foundation from 'react-native-vector-icons/Foundation';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  useVideoCallStore,
  VIDEO_CALL_TYPE,
} from '@/core/hooks/use-video-call';

import { updateVideoCallStatus } from '../firebase/firestore';
// import { useVideoCallStore, VIDEO_CALL_TYPE } from '../hooks/useVideoCall';
import { endVideoCall } from '../twilio/twilio';
import Avatar from './avatar';

export const IncomingVideoCallModal = () => {
  const router = useRouter();
  const { videoCallData, setVideoCallData } = useVideoCallStore();
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    if (videoCallData && videoCallData.type === VIDEO_CALL_TYPE.INCOMING) {
      setVisible(true);
    }
  }, [videoCallData]);

  const onAcceptCall = async () => {
    if (videoCallData && videoCallData.dataId) {
      setVisible(false);
      await updateVideoCallStatus(videoCallData.dataId, 'Connected');
      router.navigate('/video-call');
    }
  };

  const onDeclineCall = () => {
    if (videoCallData && videoCallData.dataId) {
      setVisible(false);
      setVideoCallData(null);
      endVideoCall(videoCallData.dataId, { duration: 0, reason: 'Reject' });
    }
  };

  if (!videoCallData) return null;

  return (
    <Modal
      isVisible={isVisible}
      style={styles.view}
      animationIn="slideInDown"
      animationOut="slideOutUp"
      backdropOpacity={0.3}
    >
      <View
        style={{
          backgroundColor: 'white',
          paddingHorizontal: 20,
          paddingVertical: 15,
          borderRadius: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View>
            <Avatar
              placeholder={videoCallData.otherUser.fullname}
              width={50}
              height={50}
            />
            <View
              style={{
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
                right: -1,
                bottom: -1,
                width: 18,
                height: 18,
                borderRadius: 15,
                backgroundColor: 'white',
              }}
            >
              <Foundation name="video" color="gray" size={12} />
            </View>
          </View>
          <View style={{ marginLeft: 20 }}>
            <Text style={{ fontSize: 16, color: 'black' }}>
              {videoCallData.otherUser.fullname}
            </Text>
            <Text>Incoming video call</Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 10,
            paddingHorizontal: 20,
          }}
        >
          <TouchableHighlight onPress={onDeclineCall} style={styles.buttonWrap}>
            <View style={[styles.button, { backgroundColor: 'red' }]}>
              <MaterialCommunityIcon
                name="phone-hangup"
                color="white"
                size={22}
              />
              <Text style={{ color: 'white', marginLeft: 10 }}>Decline</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={onAcceptCall} style={styles.buttonWrap}>
            <View style={[styles.button, { backgroundColor: '#1C873B' }]}>
              <MaterialCommunityIcon name="phone" color="white" size={22} />
              <Text style={{ color: 'white', marginLeft: 10 }}>Accept</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  view: {
    justifyContent: 'flex-start',
    marginTop: 30,
  },
  button: {
    borderRadius: 30,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonWrap: {
    flex: 1,
    borderRadius: 30,
    marginHorizontal: 10,
  },
});

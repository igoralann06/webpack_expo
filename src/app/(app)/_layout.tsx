/* eslint-disable max-lines-per-function */

import { Device } from '@twilio/voice-sdk';
import { Redirect, SplashScreen, Stack } from 'expo-router';
import type { Unsubscribe } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';

import { IncomingVideoCallModal } from '@/components/incoming-video-call-modal';
import { useAuth, useIsFirstTime } from '@/core';
import { useAuthStore } from '@/core/hooks/use-auth';
import { useDeviceStore } from '@/core/hooks/use-device';
import { useServerStore } from '@/core/hooks/use-server-data';
import { useTwilioDeviceStore } from '@/core/hooks/use-twilio-device';
import {
  useVideoCallStore,
  VIDEO_CALL_TYPE,
} from '@/core/hooks/use-video-call';
import {
  getServerCallLogs,
  getServerContacts,
  getServerSMSLogs,
  getSeverNotes,
  getVideoCallSubscriber,
  registerDeviceInfo,
} from '@/firebase/firestore';
import { getAccessToken } from '@/twilio/twilio';

export default function StackLayout() {
  const { user, userData } = useAuthStore();
  const { deviceInfo, setDeviceInfo } = useDeviceStore();
  const { setDevice } = useTwilioDeviceStore();
  const { setVideoCallData } = useVideoCallStore();

  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();
  const userId = user ? user.uid : null;
  const deviceId = deviceInfo ? deviceInfo.deviceId : null;
  const userName = userData ? userData.fullname : null;
  const [token, setToken] = useState<string>();

  const {
    setServerContacts,
    setServerCallLogs,
    setServerSMSLogs,
    setServerNotes,
  } = useServerStore();

  const [deviceInfoSubscribe, setDeviceInfoSubscribe] = useState<Unsubscribe>();

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (userId && deviceId && userName) {
      const identity = `${userId}_${deviceId}_${userName.replace(' ', '-')}`;
      getAccessToken(identity).then((value) => value && setToken(value));
    }
  }, [deviceId, userId, userName]);

  useEffect(() => {
    console.log('=====> token ', new Date().toISOString(), token);
    if (token) {
      const newDevice = new Device(token);
      newDevice.on('ready', () =>
        console.log('======> Twilio.Device Ready!', new Date().toISOString())
      );
      newDevice.on('error', (error) =>
        console.error('=====> ERROR ', new Date().toISOString(), error)
      );
      newDevice.on('incoming', (connection) => {
        console.log('=====> Incoming call from: ', connection.parameters.From);
        // Automatically accept the call
        connection.accept();
      });
      setDevice(newDevice);
      // return () => device?.destroy();
    }
  }, [setDevice, token]);

  useEffect(() => {
    if (deviceInfo && user) {
      const contactSubScriber = getServerContacts(
        'gAnQEjPXQ0UvRa5G8sizDfjPdd92', // user.uid
        deviceInfo.isPrimary,
        setServerContacts
      );
      const callLogsSubscriber = getServerCallLogs(
        'pazGDQKs3LhH40CCKMzO6rotqwQ2', // user.uid
        setServerCallLogs
      );
      const smsLogsSubscriber = getServerSMSLogs(
        'pazGDQKs3LhH40CCKMzO6rotqwQ2', // user.uid
        setServerSMSLogs
      );
      const notesSubscriber = getSeverNotes(user.uid, setServerNotes);
      return () => {
        contactSubScriber && contactSubScriber();
        callLogsSubscriber && callLogsSubscriber();
        smsLogsSubscriber && smsLogsSubscriber();
        notesSubscriber && notesSubscriber();
      };
    }
  }, [
    deviceInfo,
    deviceInfo?.isPrimary,
    setServerCallLogs,
    setServerContacts,
    setServerNotes,
    setServerSMSLogs,
    user,
  ]);

  useEffect(() => {
    if (user && userData) {
      deviceInfoSubscribe && deviceInfoSubscribe();
      registerDeviceInfo(user.uid, userData.fullname, setDeviceInfo).then(
        (value) => setDeviceInfoSubscribe(value)
      );
      return () => deviceInfoSubscribe && deviceInfoSubscribe();
    }
    return () => deviceInfoSubscribe && deviceInfoSubscribe();
  }, [deviceInfoSubscribe, setDeviceInfo, user, userData]);

  useEffect(() => {
    if (user) {
      const subscriber = getVideoCallSubscriber(user.uid, (callData) => {
        if (callData) {
          setVideoCallData({
            type: VIDEO_CALL_TYPE.INCOMING,
            channelData: callData.channelData,
            otherUser: { fullname: callData.callerName, id: callData.caller },
            dataId: callData.id,
          });
        }
      });
      return () => {
        subscriber && subscriber();
      };
    }
  }, [setVideoCallData, user]);

  useEffect(() => {
    if (status !== 'idle') {
      setTimeout(() => {
        hideSplash();
      }, 1000);
    }
  }, [hideSplash, status]);

  if (isFirstTime) {
    return <Redirect href="/auth/welcome" />;
  }

  if (status === 'signOut' || !user || !userData) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <>
      <Stack />
      <IncomingVideoCallModal />
    </>
  );
}

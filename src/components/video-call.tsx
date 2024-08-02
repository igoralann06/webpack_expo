/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import {
  LocalUser,
  RemoteUser,
  useClientEvent,
  useCurrentUID,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  useRemoteUsers,
  useRTCClient,
} from 'agora-rtc-react';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {
  useVideoCallStore,
  VIDEO_CALL_TYPE,
} from '@/core/hooks/use-video-call';
import { getVideoCallStatus } from '@/firebase/firestore';
import { endVideoCall } from '@/twilio/twilio';
import { Text } from '@/ui';

const screenWidth = Dimensions.get('screen').width;

type VideoCallProps = {
  appid: string;
  channel: string;
  token: string;
  videoChannelDataId?: string;
  onEndCall?: () => void;
};

const VCALL_STATUS_CONNECTING = 'Connecting...';
const VCALL_STATUS_WAITING = 'Waiting...';
const VCALL_STATUS_CONNECTED = 'Connected';

// const cover = require('../../assets/images/Welcome1.png');

export default function VideoCall(props: VideoCallProps) {
  const router = useRouter();
  const { appid, channel, token, videoChannelDataId } = props;
  const audioTrack = useLocalMicrophoneTrack(true, { ANS: true, AEC: true });
  const { videoCallData, setVideoCallData } = useVideoCallStore();
  const { localMicrophoneTrack } = useLocalMicrophoneTrack();
  const { localCameraTrack } = useLocalCameraTrack();
  const remoteUsers = useRemoteUsers();
  const uid = useCurrentUID();

  const client = useRTCClient();
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | string>(0);
  const [callStatus, setCallStatus] = useState(
    videoCallData && videoCallData.type === VIDEO_CALL_TYPE.OUTGOING
      ? VCALL_STATUS_CONNECTING
      : VCALL_STATUS_CONNECTED
  );
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();
  const [timeText, setTimeText] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  const startTimeCounter = () => {
    const startTime = Date.now();
    setIntervalId(
      setInterval(() => {
        const dt = Math.round((Date.now() - startTime) / 1000);
        const hours = Math.floor(dt / 3600);
        const minutes = Math.floor((dt % 3600) / 60);
        const seconds = dt % 60;

        const s = seconds.toString().padStart(2, '0');
        const m = minutes.toString().padStart(2, '0');
        const h = hours.toString().padStart(2, '0');
        setTimeText(hours > 0 ? h + ':' + m + ':' + s : m + ':' + s);
        setCallDuration(dt);
      }, 1000)
    );
  };

  const onEndCall = useCallback(
    (isCaller: boolean = true) => {
      setRemoteUid(0);
      setIsJoined(false);
      setTimeout(() => {
        router.back();
        isCaller &&
          endVideoCall(videoChannelDataId, { duration: callDuration });
        setVideoCallData(null);
      }, 1000);
      intervalId ?? clearTimeout(intervalId);
    },
    [callDuration, intervalId, router, setVideoCallData, videoChannelDataId]
  );

  useClientEvent(client, 'user-joined', (user) => {
    console.log('Remote user joined with uid ' + user.uid);
    setRemoteUid(user.uid);
    if (videoCallData.type === VIDEO_CALL_TYPE.OUTGOING)
      setCallStatus(VCALL_STATUS_CONNECTED);
    startTimeCounter();
  });

  useClientEvent(client, 'user-left', (user) => {
    console.log('Remote user left the channel. uid: ' + user.uid);
    setRemoteUid(0);
  });

  useClientEvent(client, 'connection-state-change', (curState) => {
    if (curState === 'CONNECTED') {
      console.log(
        'Successfully joined the channel ' + channel + ' localUid: ' + uid
      );
      setIsJoined(true);
      if (videoCallData.type === VIDEO_CALL_TYPE.OUTGOING)
        setCallStatus(VCALL_STATUS_WAITING);
    } else if (curState === 'DISCONNECTED') {
      console.log(
        'Disconnected from the channel ' + channel + ' localUid: ' + uid
      );
      setIsJoined(false);
    }
  });

  useJoin(
    {
      appid,
      channel,
      token,
    },
    true
  );

  useEffect(() => {
    if (videoChannelDataId) {
      const subscriber = getVideoCallStatus(videoChannelDataId, (newStatus) => {
        if (newStatus === 'Completed') {
          onEndCall(false);
        }
      });
      return () => subscriber && subscriber();
    }
  }, [onEndCall, videoChannelDataId]);

  const onEnableAudio = () => {
    if (remoteUid === 0) return;
    if (soundOn) {
      remoteUsers.map((ru) => ru.hasAudio && ru.audioTrack.setVolume(0));
    } else {
      remoteUsers.map((ru) => ru.hasAudio && ru.audioTrack.setVolume(100));
    }
    setSoundOn(!soundOn);
  };

  const onEnableMic = () => {
    if (!isJoined) return;
    localMicrophoneTrack.setEnabled(!micOn);
    setMicOn(!micOn);
  };

  const onEnableVideo = () => {
    if (!isJoined) return;
    localCameraTrack.setEnabled(!videoOn);
    setVideoOn(!videoOn);
  };

  return (
    <View style={styles.container}>
      <LocalUser
        audioTrack={audioTrack.localMicrophoneTrack}
        cameraOn
        cover={'../../assets/images/Welcome1.png'}
        micOn
        playAudio
        playVideo
        videoTrack={localCameraTrack}
        style={styles.localVideoView}
      />
      {isJoined && remoteUsers.length > 0 ? (
        remoteUsers.map((user) => (
          <RemoteUser
            key={user.uid}
            user={user}
            style={styles.remoteVideoView}
            cover={'../../assets/images/Welcome1.png'}
          />
        ))
      ) : (
        <View style={{ ...styles.remoteVideoView, backgroundColor: 'black' }} />
      )}

      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.nameText}>
            {videoCallData?.otherUser.fullname ?? ''}
          </Text>
          <TouchableOpacity onPress={onEnableAudio}>
            <MaterialIcon
              name={soundOn ? 'volume-up' : 'volume-off'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.timeText}>
          {callStatus === VCALL_STATUS_CONNECTED ? timeText : callStatus}
        </Text>
      </View>

      <View
        style={{
          position: 'absolute',
          flexDirection: 'row',
          width: screenWidth,
          bottom: 60,
          justifyContent: 'center',
        }}
      >
        <TouchableOpacity onPress={onEnableMic}>
          <View style={styles.actionButton}>
            <MaterialIcon
              name={micOn ? 'mic' : 'mic-off'}
              size={24}
              color="black"
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 20 }} onPress={onEnableVideo}>
          <View style={styles.actionButton}>
            <Feather
              name={videoOn ? 'video' : 'video-off'}
              size={24}
              color="black"
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginLeft: 20 }}
          onPress={() => onEndCall()}
        >
          <View style={[styles.actionButton, { backgroundColor: 'red' }]}>
            <MaterialCommunityIcon
              name="phone-hangup"
              size={24}
              color="white"
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6BC4EA',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  nameText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: 'white',
  },
  timeText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: 'white',
    marginTop: 10,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoView: {
    width: screenWidth / 2,
    height: screenWidth / 3,
    // position: 'absolute',
    // right: 20,
    // top: 70,
    borderRadius: 4,
  },
  remoteVideoView: {
    marginTop: 40,
    width: screenWidth - 80,
    height: (screenWidth - 80) / 1.5,
    // position: 'absolute',
    left: 0,
    top: 0,
  },
});

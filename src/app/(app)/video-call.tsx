/* eslint-disable react-native/no-inline-styles */
/* eslint-disable max-lines-per-function */
import AgoraRTC, { AgoraRTCProvider } from 'agora-rtc-react';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import VideoCall from '@/components/video-call';
import { useAuthStore } from '@/core/hooks/use-auth';
import {
  useVideoCallStore,
  VIDEO_CALL_TYPE,
} from '@/core/hooks/use-video-call';
import { Text } from '@/ui';

import {
  AGORA_APP_ID,
  createVideoCallChannel,
  endVideoCall,
} from '../../twilio/twilio';

const VideoCallScreen = ({}) => {
  const { userData } = useAuthStore();
  const { videoCallData } = useVideoCallStore();
  const [channelName, setChannelName] = useState<string>();
  const [videoChannelDataId, setVideoChannelDataId] = useState<string>();
  const [token, setToken] = useState<string>();
  // const [videoCallDataId, setVideoCallDataId] = useState(videoCallData.dataId);
  const [client] = useState(() =>
    AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
  );

  useEffect(() => {
    const fetchToken = async () => {
      if (userData && videoCallData) {
        if (videoCallData?.type === VIDEO_CALL_TYPE.OUTGOING) {
          const channelData = await createVideoCallChannel({
            caller: userData,
            receiver: videoCallData.otherUser,
          });
          if (channelData.status === 1) {
            setVideoChannelDataId(channelData.dataId);
            return {
              channelName: channelData.channelName,
              token: channelData.token,
            };
          } else {
            return undefined;
          }
        } else {
          return {
            channelName: videoCallData.channelData.channelName,
            token: videoCallData.channelData.token,
          };
        }
      }
    };

    fetchToken().then((value) => {
      if (value) {
        console.log('====> value', value);
        setChannelName(value.channelName);
        setToken(value.token);
      }
    });
    return () => {
      videoChannelDataId && endVideoCall(videoChannelDataId, { duration: 0 });
    };
  });

  return (
    <AgoraRTCProvider client={client}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#6BC4EA',
          paddingHorizontal: 20,
          paddingVertical: 20,
        }}
      >
        {channelName && token ? (
          <VideoCall
            appid={AGORA_APP_ID}
            channel={channelName}
            token={token}
            videoChannelDataId={videoChannelDataId}
            // onEndCall={handleEndCall}
          />
        ) : (
          <Text>Loading</Text>
        )}
      </View>
    </AgoraRTCProvider>
  );
};

export default VideoCallScreen;

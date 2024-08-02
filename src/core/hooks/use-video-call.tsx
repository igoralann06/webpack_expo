import { create } from 'zustand';

import type { IVideoCallData } from '@/types';

export const VIDEO_CALL_TYPE = {
  INCOMING: 1,
  OUTGOING: 2,
};

interface VideoCallStore {
  videoCallData: IVideoCallData | null;
  setVideoCallData: (value: IVideoCallData | null) => void;
}

export const useVideoCallStore = create<VideoCallStore>((set) => ({
  videoCallData: null,
  setVideoCallData: (videoCallData) => set(() => ({ videoCallData })),
}));

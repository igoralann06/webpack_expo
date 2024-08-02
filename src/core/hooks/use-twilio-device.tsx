import type { Device } from '@twilio/voice-sdk';
import { create } from 'zustand';

interface TwilioDeviceStore {
  device: Device | null;
  setDevice: (device: Device | null) => void;
}

export const useTwilioDeviceStore = create<TwilioDeviceStore>((set) => ({
  device: null,
  setDevice: (device: Device | null) => set(() => ({ device })),
}));

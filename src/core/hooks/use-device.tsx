import { create } from 'zustand';

import type { IDevice } from '@/types';

interface DeviceStore {
  deviceInfo: IDevice | null;
  setDeviceInfo: (deviceInfo: IDevice | null) => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  deviceInfo: null,
  setDeviceInfo: (deviceInfo) => set(() => ({ deviceInfo })),
}));

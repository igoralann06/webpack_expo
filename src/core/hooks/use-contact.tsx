import { create } from 'zustand';

import type { IContact } from '@/types';

interface ContactStore {
  currentContact: IContact | null;
  setCurrentContact: (contact: IContact) => void;
}

export const useContactStore = create<ContactStore>((set) => ({
  currentContact: null,
  setCurrentContact: (currentContact) => set(() => ({ currentContact })),
}));

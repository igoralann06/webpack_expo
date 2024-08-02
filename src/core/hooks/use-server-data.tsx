import { create } from 'zustand';

import type { ICallLog, IContact, INote, ISMSLog } from '@/types';

interface ServerStore {
  serverContacts: IContact[] | null;
  serverCallLogs: ICallLog[] | null;
  serverSMSLogs: ISMSLog[] | null;
  serverNotes: INote[] | null;
  setServerContacts: (serverContacts: IContact[]) => void;
  setServerCallLogs: (serverCallLogs: ICallLog[]) => void;
  setServerSMSLogs: (serverSMSLogs: ISMSLog[]) => void;
  setServerNotes: (serverNotes: INote[]) => void;
}

export const useServerStore = create<ServerStore>((set) => ({
  serverContacts: null,
  serverCallLogs: null,
  serverSMSLogs: null,
  serverNotes: null,
  setServerContacts: (serverContacts) => set(() => ({ serverContacts })),
  setServerCallLogs: (serverCallLogs) => set(() => ({ serverCallLogs })),
  setServerSMSLogs: (serverSMSLogs) => set(() => ({ serverSMSLogs })),
  setServerNotes: (serverNotes) => set(() => ({ serverNotes })),
}));

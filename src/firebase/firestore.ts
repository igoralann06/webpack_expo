import DeviceDetector from 'device-detector-js';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import type {
  ICallLog,
  IContact,
  IContactData,
  IDevice,
  ILocation,
  INote,
  ISMSLog,
  IUserData,
  IVideoChannel,
} from '@/types';

import { db } from './init';

export const ACTION_DELETE = 'delete';
export const ACTION_ADD = 'add';
export const ACTION_UPDATE = 'update';
export const ACTION_RESET_UPDATE = 'resetUpdate';

// export const initFirestore = async () => {
//   await settings({ persistence: false });
// };

export const getServerUserData = async (
  uid: string | null
): Promise<IUserData | null> => {
  if (!uid) {
    return null;
  }
  try {
    const userSnap = await getDoc(doc(db, `Users/${uid}`));
    return userSnap.data() as IUserData;
  } catch (error) {
    console.log('User data fetch error', error);
  }
  return null;
};

export const createServerUserData = async (id: string, userData: IUserData) => {
  await setDoc(doc(db, `Users/${id}`), {
    ...userData,
    userCreated: serverTimestamp(),
  });
};

export const fetchUserDataByPhone = async (
  phoneNumbers: string[],
  uid: string
) => {
  try {
    const q = query(
      collection(db, 'Users'),
      where('trimPhoneNumber', 'in', phoneNumbers)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length > 0) {
      const filters = querySnapshot.docs.filter((e) => e.data().id !== uid);
      return filters.length > 0 ? (filters[0].data() as IUserData) : null;
    }
  } catch {}
  return null;
};

export const updateServerUserData = async (
  id: string,
  updateData: Partial<IUserData>
) => {
  const docRef = doc(db, `Users/${id}`);
  await updateDoc(docRef, { ...updateData });
};

export const registerDeviceInfo = async (
  userId: string,
  userFullName: string,
  setDeviceData: (device: IDevice | null) => void
) => {
  const deviceId = generateUUID();
  try {
    const dataId = `${userId}_${deviceId}`;
    const deviceDataRef = doc(db, `Devices/${dataId}`);
    const deviceSnap = await getDoc(deviceDataRef);

    if (!deviceSnap.exists()) {
      const deviceData = {
        userId,
        deviceName: getDeviceInfo(),
        deviceId: deviceId ?? '',
        linkedAt: serverTimestamp(),
      };
      await setDoc(deviceDataRef, deviceData, { merge: true });
      setDeviceData({
        ...deviceData,
        linkedAt: Timestamp.fromDate(new Date()),
        id: dataId,
        isPrimary: true,
      });
    } else {
      // TODO
      const data = deviceSnap.data() as IDevice;
      setDeviceData({
        ...data,
        id: dataId,
      });
    }

    await updateDoc(doc(db, `Users/${userId}`), {
      twilioCallID: `${userId}_${deviceId}_${userFullName.replace(' ', '-')}`,
    });

    // TODO:
    return onSnapshot(deviceDataRef, (snapshot) => {
      if (!snapshot.exists) {
        setDeviceData(null);
      } else {
        const data = snapshot.data() as IDevice;
        setDeviceData({
          ...data,
          linkedAt: data.linkedAt
            ? data.linkedAt
            : Timestamp.fromDate(new Date()),
          id: dataId,
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

export const updateDeviceName = async (id: string, newName: string) => {
  const ref = doc(db, `Devices/${id}`);
  await updateDoc(ref, { deviceName: newName });
};

export const updateDeviceLocation = async (id: string, location: ILocation) => {
  const ref = doc(db, `Devices/${id}`);
  await updateDoc(ref, { location });
};

export const deleteDevice = async (data: QueryDocumentSnapshot) => {
  await deleteDoc(data.ref);
};

export const changePrimaryDevice = async (
  deviceList: QueryDocumentSnapshot[],
  newPrimaryDevice: IDevice
) => {
  const batch = writeBatch(db);
  console.log;
  for (const deviceData of deviceList) {
    if (deviceData.data().deviceId === newPrimaryDevice.deviceId) {
      batch.update(deviceData.ref, { isPrimary: true });
    } else {
      batch.update(deviceData.ref, { isPrimary: false });
    }
  }
  await batch.commit();
};

export const getLinkedDevices = (
  userId: string,
  setDevices: (devices: QueryDocumentSnapshot[]) => void
) => {
  const q = query(
    collection(db, 'Devices'),
    where('userId', '==', userId),
    orderBy('linkedAt', 'asc')
  );
  return onSnapshot(q, (data) => {
    setDevices(data && data.docs ? data.docs : []);
  });
};

export const getServerContacts = (
  userId: string,
  isPrimary: boolean,
  setServerContacts: (value: IContact[]) => void
) => {
  const whereClosure = !isPrimary
    ? [where('userId', '==', userId), where('deleted', '==', false)]
    : [where('userId', '==', userId)];
  const q = query(collection(db, 'Contacts'), ...whereClosure);

  return onSnapshot(q, (data) => {
    const dataArray =
      data && data.docs ? data.docs.flatMap((e) => e.data() as IContact) : [];
    setServerContacts(
      dataArray.sort((a, b) =>
        a.data.givenName
          ? b.data.givenName
            ? a.data.givenName.localeCompare(b.data.givenName)
            : 1
          : b.data.givenName
          ? -1
          : 0
      )
    );
  });
};

export const batchContactSync = async (
  userId: string,
  deviceId: string,
  batchArray: { action: string; data: IContactData }[]
) => {
  const batch = writeBatch(db);
  for (const batchData of batchArray) {
    if (batchData.action === ACTION_DELETE) {
      const ref = doc(db, `Contacts/${batchData.data.id}`);
      batch.delete(ref);
    } else if (batchData.action === ACTION_ADD) {
      const ref = doc(collection(db, 'Contacts'));
      batch.set(ref, {
        data: batchData.data,
        userId,
        deleted: false,
        id: ref.id,
      });
    } else if (batchData.action === ACTION_UPDATE) {
      const ref = doc(db, `Contacts/${batchData.data.id}`);
      batch.update(ref, {
        ...batchData.data,
        updated: false,
      });
    } else if (batchData.action === ACTION_RESET_UPDATE) {
      const ref = doc(db, `Contacts/${batchData.data.id}`);
      batch.update(ref, { updated: false });
    }
  }
  await batch.commit();
};

export const updateServerContact = async (newData: IContact) => {
  await updateDoc(doc(db, `Contacts/${newData.id}`), { ...newData });
};

export const setServerContact = async (
  userId: string,
  dataId: string,
  contactData: IContactData
) => {
  if (!dataId) {
    const ref = doc(collection(db, 'Contacts'));
    await setDoc(ref, {
      userId,
      data: contactData,
      deleted: false,
      id: ref.id,
    });
  } else {
    await updateDoc(doc(db, `Contacts/${dataId}`), {
      data: contactData,
      updated: true,
    });
  }
};

export const deleteServerContact = async (
  contactData: IContact,
  isPrimary: boolean
) => {
  if (isPrimary) {
    await deleteDoc(doc(db, `Contacts/${contactData.id}`));
  } else {
    await updateDoc(doc(db, `Contacts/${contactData.id}`), { deleted: true });
  }
};

export const getServerCallLogs = (
  userId: string,
  setServerCallLogs: (value: ICallLog[]) => void
) => {
  const q = query(collection(db, 'CallLogs'), where('userId', '==', userId));
  return onSnapshot(q, (data) => {
    const dataArray =
      data && data.docs ? data.docs.flatMap((e) => e.data() as ICallLog) : [];
    setServerCallLogs(
      dataArray.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    );
  });
};

export const batchCallLogSync = async (
  userId: string,
  batchArray: { action: string; data: ICallLog }[]
) => {
  const batch = writeBatch(db);
  for (const batchData of batchArray) {
    if (batchData.action === ACTION_DELETE) {
      const ref = doc(db, `CallLogs/${batchData.data.id}`);
      batch.delete(ref);
    } else if (batchData.action === ACTION_ADD) {
      const ref = doc(collection(db, 'CallLogs'));
      batch.set(ref, {
        ...batchData.data,
        userId,
        id: ref.id,
      });
    }
  }
  await batch.commit();
};

export const getServerSMSLogs = (
  userId: string,
  setServerSMSLogs: (value: ISMSLog[]) => void
) => {
  const q = query(collection(db, 'SMSLogs'), where('userId', '==', userId));
  return onSnapshot(q, (data) => {
    const dataArray =
      data && data.docs ? data.docs.flatMap((e) => e.data() as ISMSLog) : [];
    setServerSMSLogs(
      dataArray.sort((a, b) =>
        a.date ? (b.date ? Number(b.date - a.date) : -1) : b.date ? 1 : 0
      )
    );
  });
};

export const batchSMSLogsSync = async (
  userId: string,
  deviceId: string,
  batchArray: { action: string; data: ISMSLog }[]
) => {
  const batch = writeBatch(db);
  for (const batchData of batchArray) {
    if (batchData.action === ACTION_ADD) {
      const ref = doc(collection(db, 'SMSLogs'));
      batch.set(ref, {
        ...batchData.data,
        _id: `${deviceId}_${batchData.data._id}`,
        userId,
        id: ref.id,
      });
    }
  }
  await batch.commit();
};

export const getSeverNotes = (
  userId: string,
  setNotes: (value: INote[]) => void
) => {
  const q = query(collection(db, 'Notes'), where('userId', '==', userId));
  return onSnapshot(q, (data) => {
    const dataArray =
      data && data.docs ? data.docs.flatMap((e) => e.data() as INote) : [];
    setNotes(dataArray);
  });
};

export const editNote = async (
  id: string | null,
  userId: string,
  noteData: Partial<INote>
) => {
  if (id) {
    await updateDoc(doc(db, `Notes/${id}`), { ...noteData });
  } else {
    const ref = doc(collection(db, 'Notes'));
    await setDoc(ref, {
      ...noteData,
      userId,
      createdAt: new Date(),
      id: ref.id,
    });
  }
};

export const deleteNote = async (id: string) => {
  await deleteDoc(doc(db, `Notes/${id}`));
};

export const getVideoCallSubscriber = (
  userId: string,
  setVideoCall: (value: IVideoChannel | null) => void
) => {
  const q = query(
    collection(db, 'VideoChannels'),
    where('receiver', '==', userId),
    where('status', '==', 'Calling'),
    limit(1)
  );
  return onSnapshot(q, (data) => {
    data && data.docs && data.docs.length > 0
      ? setVideoCall(data.docs[0].data() as IVideoChannel)
      : setVideoCall(null);
  });
};

export const getVideoCallStatus = (
  dataId: string,
  setStatus: (value: string) => void
) => {
  const ref = doc(collection(db, 'VideoChannels'), dataId);
  return onSnapshot(ref, (snapshot) => {
    setStatus((snapshot?.data() as IVideoChannel).status);
  });
};

export const updateVideoCallStatus = async (dataId: string, status: string) => {
  await updateDoc(doc(db, `VideoChannels/${dataId}`), { status });
};

function generateUUID() {
  if (!localStorage.getItem('device-uuid')) {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    let uuid = '';
    for (let i = 0; i < array.length; i++) {
      uuid += array[i].toString(16).padStart(8, '0');
    }
    localStorage.setItem('device-uuid', uuid);
  }
  return localStorage.getItem('device-uuid');
}

function getDeviceInfo() {
  const deviceDetector = new DeviceDetector();
  const ua = navigator.userAgent;
  const device = deviceDetector.parse(ua);

  return `${device.os?.name} - ${device.device?.type} - ${device.device?.brand}`;
}

import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

import { updateServerUserData } from './firestore';
import { storage } from './init';

export const upload = async (
  file: Blob,
  path: string,
  callback: ((value: number) => void) | null = null
) => {
  const storageRef = ref(storage, `${path}`);
  // const uploadTask = storageRef.putFile(graphicUrl);

  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on('state_changed', (snapshot) => {
    callback && callback(snapshot.bytesTransferred / snapshot.totalBytes);
  });
  const downloadUrl = await getDownloadURL((await uploadTask).ref);
  callback && callback(1.1);
  return downloadUrl;
};

export const uploadProfilePic = async (
  userId: string,
  file: Blob,
  needUpdateServer = true
) => {
  const url = await upload(file, `profilePics/${userId}/avatar.jpg`);
  needUpdateServer &&
    (await updateServerUserData(userId, { profilePhoto: url }));
  return url;
};

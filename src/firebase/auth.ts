import type { FirebaseError } from 'firebase/app';
import type { NextOrObserver, User } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';

import type { IUserData, SignupDto } from '@/types';

import { trimAndRemoveAreaCode } from '../util';
import { createServerUserData } from './firestore';
import { auth, functions } from './init';
import { uploadProfilePic } from './storage';

export const trackUserState = (callback: NextOrObserver<User>) => {
  return onAuthStateChanged(auth, callback);
};

export const signinWithEmail = async (email: string, password: string) => {
  let errMessage: string | undefined;

  const userCredentials = await signInWithEmailAndPassword(
    auth,
    email,
    password
  ).catch((error: FirebaseError) => {
    if (error.code) {
      errMessage = error.message;
    } else {
      errMessage = 'Unknown error';
    }
  });
  if (errMessage) {
    return { status: 0, message: errMessage };
  } else if (!userCredentials || !userCredentials.user) {
    return { status: 0, message: 'Unknown error' };
  } else {
    return { status: 1, user: userCredentials.user };
  }
};

export const signupWithEmail = async (signupData: SignupDto) => {
  // try {
  let errMessage: string | null = null; // 'Unknown error';
  const userCredentials = await createUserWithEmailAndPassword(
    auth,
    signupData.email,
    signupData.password
  ).catch((error: FirebaseError) => {
    if (error.code) {
      errMessage = error.message;
    } else {
      errMessage = 'Unknown error.';
    }
  });

  if (errMessage !== null) {
    return { status: 0, message: errMessage };
  }

  if (!userCredentials || !userCredentials.user) {
    return { status: 0, message: 'Unknown error' };
  }

  const uid = userCredentials.user.uid;
  const avatarURL = signupData.photo
    ? await uploadProfilePic(uid, signupData.photo, false)
    : '';
  const userData: IUserData = {
    id: userCredentials.user.uid,
    fullname: signupData.fullname,
    email: signupData.email,
    phoneNumber: signupData.phoneNumber,
    profilePhoto: avatarURL,
    trimPhoneNumber: trimAndRemoveAreaCode(signupData.phoneNumber),
  };
  await createServerUserData(userCredentials?.user.uid, userData);

  return { status: 1, userData };
};

export const verifyPhoneNumber = async (phoneNumber: string) => {
  try {
    const verifyPhoneFunc = httpsCallable(
      functions,
      'twilioSendVerificationCode'
    );
    const result = await verifyPhoneFunc({ To: phoneNumber });
    return (result.data as any).success;
  } catch {
    return false;
  }
};

export const confirmVerifyCode = async (phoneNumber: string, code: string) => {
  try {
    const verifyPhoneFunc = httpsCallable(functions, 'twilioVerifyCode');
    const result = await verifyPhoneFunc({ To: phoneNumber, Code: code });
    return (result.data as any).success;
  } catch {
    return false;
  }
};

export const sendForgotPasswordEmail = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

export const changePassword = async (password: string, newPassword: string) => {
  if (auth.currentUser && auth.currentUser?.email) {
    const email = auth.currentUser!.email!;
    const emailCred = EmailAuthProvider.credential(email, password);
    let errMessage: string | undefined; // 'Unknown error';
    // try {
    await reauthenticateWithCredential(auth.currentUser, emailCred).catch(
      (error) => {
        if (error.code === 'auth/user-mismatch') {
          errMessage = error.message;
        } else {
          errMessage = 'Unknown error.';
        }
      }
    );
    await updatePassword(auth.currentUser, newPassword).catch(
      (error: FirebaseError) => {
        if (error.code) {
          errMessage = error.message;
        } else {
          errMessage = 'Unknown Error';
        }
      }
    );

    if (errMessage) {
      return { status: 0, message: errMessage };
    }
    return { status: 1 };
  } else {
    return { status: 0, message: 'Unknown error' };
  }
};

export const signout = async () => {
  await signOut(auth);
};

// Import the functions you need from the SDKs you need
import type { FirebaseOptions } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyAdjTm9mmZXSeSX962M7FAbI9Dis-uSfRw',
  authDomain: 'mobileyme-c9588.firebaseapp.com',
  databaseURL: 'https://mobileyme-c9588-default-rtdb.firebaseio.com',
  projectId: 'mobileyme-c9588',
  storageBucket: 'mobileyme-c9588.appspot.com',
  messagingSenderId: '661643349274',
  appId: '1:661643349274:web:06b34a24b8994006bb70a3',
  measurementId: 'G-XXM98F34M3',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const functions = getFunctions(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

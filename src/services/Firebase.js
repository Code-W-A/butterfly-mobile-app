/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const REQUIRED_FIREBASE_KEYS = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const cleanString = value => (typeof value === 'string' ? value.trim() : '');

const readFirebaseConfig = () => {
  const extra =
    Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
  const firebase = extra?.firebase || {};

  const config = {
    apiKey: cleanString(firebase.apiKey),
    authDomain: cleanString(firebase.authDomain),
    projectId: cleanString(firebase.projectId),
    storageBucket: cleanString(firebase.storageBucket),
    messagingSenderId: cleanString(firebase.messagingSenderId),
    appId: cleanString(firebase.appId),
    measurementId: cleanString(firebase.measurementId),
  };

  if (!config.measurementId) {
    delete config.measurementId;
  }

  return config;
};

const firebaseConfig = readFirebaseConfig();

export const firebaseMissingConfigKeys = REQUIRED_FIREBASE_KEYS.filter(
  key => !firebaseConfig[key],
);

export const isFirebaseConfigured = firebaseMissingConfigKeys.length === 0;

export let firebaseApp = null;
export let firebaseAuth = null;
export let firebaseDb = null;
export let firebaseStorage = null;

export const initializeFirebase = () => {
  if (!isFirebaseConfigured) {
    return {
      isConfigured: false,
      missingKeys: firebaseMissingConfigKeys,
      app: null,
      auth: null,
      db: null,
      storage: null,
      error: null,
    };
  }

  if (firebaseApp && firebaseAuth && firebaseDb && firebaseStorage) {
    return {
      isConfigured: true,
      missingKeys: [],
      app: firebaseApp,
      auth: firebaseAuth,
      db: firebaseDb,
      storage: firebaseStorage,
      error: null,
    };
  }

  try {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

    try {
      firebaseAuth = initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch (_error) {
      firebaseAuth = getAuth(firebaseApp);
    }

    firebaseDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);

    return {
      isConfigured: true,
      missingKeys: [],
      app: firebaseApp,
      auth: firebaseAuth,
      db: firebaseDb,
      storage: firebaseStorage,
      error: null,
    };
  } catch (error) {
    return {
      isConfigured: true,
      missingKeys: [],
      app: null,
      auth: null,
      db: null,
      storage: null,
      error,
    };
  }
};

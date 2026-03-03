/** @format */

import Constants from 'expo-constants';

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

const loadFirebaseModules = () => {
  // Load Firebase lazily to avoid pulling browser-only code paths during app
  // startup when Firebase config is missing.
  const AsyncStorage =
    require('@react-native-async-storage/async-storage').default;
  const { getApp, getApps, initializeApp } = require('firebase/app');
  const { getAuth } = require('firebase/auth');
  const {
    getReactNativePersistence,
    initializeAuth,
  } = require('firebase/auth/react-native');
  const { getFirestore, initializeFirestore } = require('firebase/firestore');
  const { getStorage } = require('firebase/storage');

  return {
    AsyncStorage,
    getApp,
    getApps,
    initializeApp,
    getAuth,
    getReactNativePersistence,
    initializeAuth,
    getFirestore,
    initializeFirestore,
    getStorage,
  };
};

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
    const {
      AsyncStorage,
      getApp,
      getApps,
      initializeApp,
      getAuth,
      getReactNativePersistence,
      initializeAuth,
      getFirestore,
      initializeFirestore,
      getStorage,
    } = loadFirebaseModules();

    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

    try {
      firebaseAuth = initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch (_error) {
      firebaseAuth = getAuth(firebaseApp);
    }

    try {
      // RN + Firebase JS SDK can hit gRPC transport issues on some networks.
      // Force long polling for better compatibility on Android/dev builds.
      firebaseDb = initializeFirestore(firebaseApp, {
        experimentalForceLongPolling: true,
        useFetchStreams: false,
      });
    } catch (_error) {
      firebaseDb = getFirestore(firebaseApp);
    }
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

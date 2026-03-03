/** @format */

import ReactNativeConstants from 'expo-constants';

import rootReducer, { PERSIST_BLACKLIST } from '@redux';
import { Constants } from '@common';
import createAppStore from './createAppStore';
import { attachPersistence, hydrateStore } from './persistence';
import './../../ReactotronConfig';

const DEV_ENV =
  typeof __DEV__ !== 'undefined'
    ? __DEV__
    : Boolean(ReactNativeConstants?.expoConfig?.extra);

const PERSIST_DEBOUNCE_MS = 250;

const configureStore = () => {
  const store = createAppStore(rootReducer);

  if (DEV_ENV && !Constants.useReactotron) {
    global.XMLHttpRequest = global.originalXMLHttpRequest
      ? global.originalXMLHttpRequest
      : global.XMLHttpRequest;
    global.FormData = global.originalFormData
      ? global.originalFormData
      : global.FormData;
  }

  return store;
};

const store = configureStore();
let persistenceCleanup = null;

export const initializeStorePersistence = async () => {
  await hydrateStore({
    store,
    blacklist: PERSIST_BLACKLIST,
  });

  if (typeof persistenceCleanup === 'function') {
    persistenceCleanup();
  }

  persistenceCleanup = attachPersistence({
    store,
    blacklist: PERSIST_BLACKLIST,
    debounceMs: PERSIST_DEBOUNCE_MS,
  });

  return persistenceCleanup;
};

export default store;

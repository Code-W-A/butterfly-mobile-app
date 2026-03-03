/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@app_state_v1';
const STATE_MIGRATION_MARKER_KEY = '@state_migrated_v1';
const LEGACY_REDUX_PERSIST_KEY = 'persist:root';

const toPersistableState = (state, blacklist = []) => {
  return Object.keys(state).reduce((accumulator, key) => {
    if (blacklist.includes(key)) {
      return accumulator;
    }

    accumulator[key] = state[key];
    return accumulator;
  }, {});
};

const ensureLegacyMigration = async () => {
  const alreadyMigrated = await AsyncStorage.getItem(
    STATE_MIGRATION_MARKER_KEY,
  );

  if (alreadyMigrated) {
    return;
  }

  await AsyncStorage.removeItem(LEGACY_REDUX_PERSIST_KEY);
  await AsyncStorage.setItem(STATE_MIGRATION_MARKER_KEY, '1');
};

export const hydrateStore = async ({ store, blacklist = [] }) => {
  await ensureLegacyMigration();

  const serializedState = await AsyncStorage.getItem(STORAGE_KEY);

  if (!serializedState) {
    return { restored: false };
  }

  let persistedState = null;

  try {
    persistedState = JSON.parse(serializedState);
  } catch (_error) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return { restored: false };
  }

  if (!persistedState || typeof persistedState !== 'object') {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return { restored: false };
  }

  const currentState = store.getState();
  const restoredState = {
    ...currentState,
    ...toPersistableState(persistedState, blacklist),
  };

  store.replaceState(restoredState);
  return { restored: true };
};

export const attachPersistence = ({
  store,
  blacklist = [],
  debounceMs = 250,
}) => {
  let timeoutId = null;

  const save = async () => {
    try {
      const state = store.getState();
      const persistableState = toPersistableState(state, blacklist);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persistableState));
    } catch (_error) {
      // Ignore persistence write errors to avoid crashing the UI.
    }
  };

  const unsubscribe = store.subscribe(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(save, debounceMs);
  });

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    unsubscribe();
  };
};

export const persistenceKeys = {
  storageKey: STORAGE_KEY,
  migrationMarkerKey: STATE_MIGRATION_MARKER_KEY,
  legacyKey: LEGACY_REDUX_PERSIST_KEY,
};

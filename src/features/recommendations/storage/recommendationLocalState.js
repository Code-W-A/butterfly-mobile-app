/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  FAVORITES_KEY,
  PACKAGE_FAVORITES_KEY,
  resetFavoritesStorageState,
} from './favoritesStorage';
import { HISTORY_KEY, resetHistoryStorageState } from './historyStorage';

export const clearRecommendationLocalState = async () => {
  resetHistoryStorageState();
  resetFavoritesStorageState();

  await Promise.all([
    AsyncStorage.removeItem(HISTORY_KEY),
    AsyncStorage.removeItem(FAVORITES_KEY),
    AsyncStorage.removeItem(PACKAGE_FAVORITES_KEY),
  ]);
};

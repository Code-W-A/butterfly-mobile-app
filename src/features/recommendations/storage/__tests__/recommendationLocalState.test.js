/** @format */

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    removeItem: jest.fn(async () => undefined),
  },
}));

jest.mock('../historyStorage', () => ({
  HISTORY_KEY: '@recommendations:history:v1',
  resetHistoryStorageState: jest.fn(),
}));

jest.mock('../favoritesStorage', () => ({
  FAVORITES_KEY: '@recommendations:favorites:v1',
  PACKAGE_FAVORITES_KEY: '@recommendations:package-favorites:v1',
  resetFavoritesStorageState: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  FAVORITES_KEY,
  PACKAGE_FAVORITES_KEY,
  resetFavoritesStorageState,
} from '../favoritesStorage';
import { HISTORY_KEY, resetHistoryStorageState } from '../historyStorage';
import { clearRecommendationLocalState } from '../recommendationLocalState';

describe('recommendationLocalState', () => {
  beforeEach(() => {
    AsyncStorage.removeItem.mockClear();
    resetHistoryStorageState.mockClear();
    resetFavoritesStorageState.mockClear();
  });

  it('șterge cheile locale și resetează cache-urile in-memory', async () => {
    await clearRecommendationLocalState();

    expect(resetHistoryStorageState).toHaveBeenCalledTimes(1);
    expect(resetFavoritesStorageState).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(3);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(HISTORY_KEY);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(FAVORITES_KEY);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(PACKAGE_FAVORITES_KEY);
  });
});

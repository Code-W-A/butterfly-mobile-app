/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const FAVORITES_KEY = '@recommendations:favorites:v1';
export const PACKAGE_FAVORITES_KEY = '@recommendations:package-favorites:v1';
const REMOTE_SYNC_TTL_MS = 60 * 1000;
const REMOTE_FAVORITES_LIMIT = 200;
const REMOTE_PRODUCT_FAVORITES_COLLECTION = 'favorites';
const REMOTE_PACKAGE_FAVORITES_COLLECTION = 'favoritePackages';

let lastRemoteFavoritesSyncAt = 0;
let lastRemotePackageFavoritesSyncAt = 0;

const parseFavorites = value => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

const normalizeFavoriteItem = item => {
  const productId =
    typeof item?.productId === 'string'
      ? item.productId
      : typeof item?.id === 'string'
      ? item.id
      : '';

  if (!productId) {
    return null;
  }

  const productSnapshot =
    item?.productSnapshot && typeof item.productSnapshot === 'object'
      ? item.productSnapshot
      : item?.product && typeof item.product === 'object'
      ? item.product
      : {};

  return {
    productId,
    createdAt: Number(item?.createdAt || 0) || Date.now(),
    productSnapshot,
  };
};

const normalizeFavorites = favorites => {
  return [...favorites]
    .map(normalizeFavoriteItem)
    .filter(Boolean)
    .sort((first, second) => second.createdAt - first.createdAt);
};

const mergeFavorites = (localFavorites, remoteFavorites) => {
  const map = new Map();

  [...localFavorites, ...remoteFavorites].forEach(item => {
    const normalizedItem = normalizeFavoriteItem(item);

    if (!normalizedItem) {
      return;
    }

    const existing = map.get(normalizedItem.productId);

    if (
      !existing ||
      Number(normalizedItem.createdAt || 0) >= Number(existing.createdAt || 0)
    ) {
      map.set(normalizedItem.productId, normalizedItem);
    }
  });

  return normalizeFavorites(Array.from(map.values()));
};

const getRemoteContext = async () => {
  try {
    const { initializeFirebase } = require('@services/Firebase');
    const {
      requireRecommendationUser,
    } = require('../services/firebaseRecommendationAuth');
    const firestore = require('firebase/firestore');
    const firebaseSetup = initializeFirebase();

    if (!firebaseSetup?.db || !firebaseSetup?.auth) {
      return null;
    }

    const user = await requireRecommendationUser(firebaseSetup.auth);

    if (!user?.uid) {
      return null;
    }

    return {
      db: firebaseSetup.db,
      userId: user.uid,
      firestore,
    };
  } catch (_error) {
    return null;
  }
};

const shouldSyncFromRemote = (lastSyncAt, forceRemote) => {
  if (forceRemote) {
    return true;
  }

  return Date.now() - lastSyncAt > REMOTE_SYNC_TTL_MS;
};

const readRemoteFavorites = async () => {
  const context = await getRemoteContext();

  if (!context) {
    return null;
  }

  const { collection, getDocs, limit, query } = context.firestore;
  const favoritesRef = collection(
    context.db,
    'users',
    context.userId,
    REMOTE_PRODUCT_FAVORITES_COLLECTION,
  );
  const favoritesQuery = query(favoritesRef, limit(REMOTE_FAVORITES_LIMIT));
  const snapshot = await getDocs(favoritesQuery);

  return normalizeFavorites(
    snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data() || {};

      return {
        productId: data.productId || docSnapshot.id,
        createdAt: Number(data.createdAt || data.updatedAt || 0) || Date.now(),
        productSnapshot: data.productSnapshot || {},
      };
    }),
  );
};

const upsertRemoteFavorite = async favoriteItem => {
  const context = await getRemoteContext();

  if (!context || !favoriteItem?.productId) {
    return false;
  }

  const { doc, setDoc } = context.firestore;
  const favoriteRef = doc(
    context.db,
    'users',
    context.userId,
    REMOTE_PRODUCT_FAVORITES_COLLECTION,
    favoriteItem.productId,
  );

  await setDoc(
    favoriteRef,
    {
      productId: favoriteItem.productId,
      createdAt: Number(favoriteItem.createdAt || Date.now()),
      updatedAt: Date.now(),
      productSnapshot: favoriteItem.productSnapshot || {},
    },
    { merge: true },
  );

  return true;
};

const deleteRemoteFavorite = async productId => {
  const context = await getRemoteContext();

  if (!context || !productId) {
    return false;
  }

  const { deleteDoc, doc } = context.firestore;
  const favoriteRef = doc(
    context.db,
    'users',
    context.userId,
    REMOTE_PRODUCT_FAVORITES_COLLECTION,
    productId,
  );
  await deleteDoc(favoriteRef);
  return true;
};

export const getFavoriteProducts = async (options = {}) => {
  const { forceRemote = false } = options;
  const storedValue = await AsyncStorage.getItem(FAVORITES_KEY);
  const localFavorites = normalizeFavorites(parseFavorites(storedValue));

  if (!shouldSyncFromRemote(lastRemoteFavoritesSyncAt, forceRemote)) {
    return localFavorites;
  }

  try {
    const remoteFavorites = await readRemoteFavorites();

    if (!Array.isArray(remoteFavorites)) {
      return localFavorites;
    }

    const mergedFavorites = mergeFavorites(localFavorites, remoteFavorites);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(mergedFavorites));
    lastRemoteFavoritesSyncAt = Date.now();

    return mergedFavorites;
  } catch (_error) {
    return localFavorites;
  }
};

export const saveFavoriteProducts = async favorites => {
  const normalizedFavorites = normalizeFavorites(favorites);
  await AsyncStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(normalizedFavorites),
  );
  return normalizedFavorites;
};

export const resetFavoritesStorageState = () => {
  lastRemoteFavoritesSyncAt = 0;
  lastRemotePackageFavoritesSyncAt = 0;
};

export const isProductFavorite = (favorites, productId) => {
  return favorites.some(item => item.productId === productId);
};

export const toggleFavoriteProduct = async ({ favorites, product }) => {
  if (!product || !product.id) {
    return favorites;
  }

  const alreadyFavorite = isProductFavorite(favorites, product.id);

  const nextFavorites = normalizeFavorites(
    alreadyFavorite
      ? favorites.filter(item => item.productId !== product.id)
      : [
          {
            productId: product.id,
            createdAt: Date.now(),
            productSnapshot: product,
          },
          ...favorites,
        ],
  );

  await saveFavoriteProducts(nextFavorites);

  if (alreadyFavorite) {
    deleteRemoteFavorite(product.id).catch(() => null);
  } else {
    const favoriteItem = nextFavorites.find(
      item => item.productId === product.id,
    );
    upsertRemoteFavorite(favoriteItem).catch(() => null);
  }

  return nextFavorites;
};

export const removeFavoriteProduct = async ({ favorites, productId }) => {
  const nextFavorites = normalizeFavorites(
    favorites.filter(item => item.productId !== productId),
  );
  await saveFavoriteProducts(nextFavorites);
  deleteRemoteFavorite(productId).catch(() => null);
  return nextFavorites;
};

const normalizePackageFavoriteItem = item => {
  const packageId =
    typeof item?.packageId === 'string'
      ? item.packageId
      : typeof item?.id === 'string'
      ? item.id
      : '';

  if (!packageId) {
    return null;
  }

  const packageSnapshot =
    item?.packageSnapshot && typeof item.packageSnapshot === 'object'
      ? item.packageSnapshot
      : item?.package && typeof item.package === 'object'
      ? item.package
      : {};

  return {
    packageId,
    createdAt: Number(item?.createdAt || 0) || Date.now(),
    packageSnapshot,
  };
};

const normalizePackageFavorites = favorites => {
  return [...favorites]
    .map(normalizePackageFavoriteItem)
    .filter(Boolean)
    .sort((first, second) => second.createdAt - first.createdAt);
};

const mergePackageFavorites = (localFavorites, remoteFavorites) => {
  const map = new Map();

  [...localFavorites, ...remoteFavorites].forEach(item => {
    const normalizedItem = normalizePackageFavoriteItem(item);

    if (!normalizedItem) {
      return;
    }

    const existing = map.get(normalizedItem.packageId);

    if (
      !existing ||
      Number(normalizedItem.createdAt || 0) >= Number(existing.createdAt || 0)
    ) {
      map.set(normalizedItem.packageId, normalizedItem);
    }
  });

  return normalizePackageFavorites(Array.from(map.values()));
};

const readRemotePackageFavorites = async () => {
  const context = await getRemoteContext();

  if (!context) {
    return null;
  }

  const { collection, getDocs, limit, query } = context.firestore;
  const favoritesRef = collection(
    context.db,
    'users',
    context.userId,
    REMOTE_PACKAGE_FAVORITES_COLLECTION,
  );
  const favoritesQuery = query(favoritesRef, limit(REMOTE_FAVORITES_LIMIT));
  const snapshot = await getDocs(favoritesQuery);

  return normalizePackageFavorites(
    snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data() || {};

      return {
        packageId: data.packageId || docSnapshot.id,
        createdAt: Number(data.createdAt || data.updatedAt || 0) || Date.now(),
        packageSnapshot: data.packageSnapshot || data.package || {},
      };
    }),
  );
};

const upsertRemotePackageFavorite = async favoriteItem => {
  const context = await getRemoteContext();

  if (!context || !favoriteItem?.packageId) {
    return false;
  }

  const { doc, setDoc } = context.firestore;
  const favoriteRef = doc(
    context.db,
    'users',
    context.userId,
    REMOTE_PACKAGE_FAVORITES_COLLECTION,
    favoriteItem.packageId,
  );

  await setDoc(
    favoriteRef,
    {
      packageId: favoriteItem.packageId,
      createdAt: Number(favoriteItem.createdAt || Date.now()),
      updatedAt: Date.now(),
      packageSnapshot: favoriteItem.packageSnapshot || {},
    },
    { merge: true },
  );

  return true;
};

const deleteRemotePackageFavorite = async packageId => {
  const context = await getRemoteContext();

  if (!context || !packageId) {
    return false;
  }

  const { deleteDoc, doc } = context.firestore;
  const favoriteRef = doc(
    context.db,
    'users',
    context.userId,
    REMOTE_PACKAGE_FAVORITES_COLLECTION,
    packageId,
  );
  await deleteDoc(favoriteRef);
  return true;
};

export const getFavoritePackages = async (options = {}) => {
  const { forceRemote = false } = options;
  const storedValue = await AsyncStorage.getItem(PACKAGE_FAVORITES_KEY);
  const localFavorites = normalizePackageFavorites(parseFavorites(storedValue));

  if (!shouldSyncFromRemote(lastRemotePackageFavoritesSyncAt, forceRemote)) {
    return localFavorites;
  }

  try {
    const remoteFavorites = await readRemotePackageFavorites();

    if (!Array.isArray(remoteFavorites)) {
      return localFavorites;
    }

    const mergedFavorites = mergePackageFavorites(
      localFavorites,
      remoteFavorites,
    );
    await AsyncStorage.setItem(
      PACKAGE_FAVORITES_KEY,
      JSON.stringify(mergedFavorites),
    );
    lastRemotePackageFavoritesSyncAt = Date.now();

    return mergedFavorites;
  } catch (_error) {
    return localFavorites;
  }
};

export const saveFavoritePackages = async favorites => {
  const normalizedFavorites = normalizePackageFavorites(favorites);
  await AsyncStorage.setItem(
    PACKAGE_FAVORITES_KEY,
    JSON.stringify(normalizedFavorites),
  );
  return normalizedFavorites;
};

export const isPackageFavorite = (favorites, packageId) => {
  return favorites.some(item => item.packageId === packageId);
};

export const toggleFavoritePackage = async ({ favorites, packageMatch }) => {
  const packageId = packageMatch?.package?.id;
  if (!packageId) {
    return favorites;
  }

  const alreadyFavorite = isPackageFavorite(favorites, packageId);

  const nextFavorites = normalizePackageFavorites(
    alreadyFavorite
      ? favorites.filter(item => item.packageId !== packageId)
      : [
          {
            packageId,
            createdAt: Date.now(),
            packageSnapshot: packageMatch.package,
          },
          ...favorites,
        ],
  );

  await saveFavoritePackages(nextFavorites);

  if (alreadyFavorite) {
    deleteRemotePackageFavorite(packageId).catch(() => null);
  } else {
    const favoriteItem = nextFavorites.find(
      item => item.packageId === packageId,
    );
    upsertRemotePackageFavorite(favoriteItem).catch(() => null);
  }

  return nextFavorites;
};

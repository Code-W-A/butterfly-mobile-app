/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@recommendations:favorites:v1';
const PACKAGE_FAVORITES_KEY = '@recommendations:package-favorites:v1';
const REMOTE_SYNC_TTL_MS = 60 * 1000;
const REMOTE_FAVORITES_LIMIT = 200;

let lastRemoteFavoritesSyncAt = 0;

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
      ensureRecommendationAuth,
    } = require('../services/firebaseRecommendationAuth');
    const firestore = require('firebase/firestore');
    const firebaseSetup = initializeFirebase();

    if (!firebaseSetup?.db || !firebaseSetup?.auth) {
      return null;
    }

    const user = await ensureRecommendationAuth(firebaseSetup.auth);

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
    'favorites',
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
    'favorites',
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
    'favorites',
    productId,
  );
  await deleteDoc(favoriteRef);
  return true;
};

const shouldSyncFromRemote = forceRemote => {
  if (forceRemote) {
    return true;
  }

  return Date.now() - lastRemoteFavoritesSyncAt > REMOTE_SYNC_TTL_MS;
};

export const getFavoriteProducts = async (options = {}) => {
  const { forceRemote = false } = options;
  const storedValue = await AsyncStorage.getItem(FAVORITES_KEY);
  const localFavorites = normalizeFavorites(parseFavorites(storedValue));

  if (!shouldSyncFromRemote(forceRemote)) {
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

export const getFavoritePackages = async () => {
  const storedValue = await AsyncStorage.getItem(PACKAGE_FAVORITES_KEY);
  return normalizePackageFavorites(parseFavorites(storedValue));
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
  return nextFavorites;
};

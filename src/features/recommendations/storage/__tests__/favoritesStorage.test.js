/** @format */

const store = {};
const remoteDocs = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async key => (key in store ? store[key] : null)),
    setItem: jest.fn(async (key, value) => {
      store[key] = value;
    }),
  },
}));

jest.mock('@services/Firebase', () => ({
  initializeFirebase: jest.fn(() => ({
    auth: {
      currentUser: {
        uid: 'user_1',
        isAnonymous: false,
      },
    },
    db: { id: 'db_1' },
  })),
}));

jest.mock('../../services/firebaseRecommendationAuth', () => ({
  requireRecommendationUser: jest.fn(async auth => auth.currentUser),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn((_db, ...segments) => ({
    path: segments.join('/'),
  })),
  getDocs: jest.fn(async reference => {
    const prefix = `${reference.path}/`;
    const docs = Object.entries(remoteDocs)
      .filter(([path]) => path.startsWith(prefix))
      .map(([path, data]) => ({
        id: path.slice(prefix.length),
        data: () => data,
      }));

    return { docs };
  }),
  limit: jest.fn(value => value),
  query: jest.fn(reference => reference),
  doc: jest.fn((_db, ...segments) => ({
    path: segments.join('/'),
  })),
  setDoc: jest.fn(async (reference, data) => {
    remoteDocs[reference.path] = data;
  }),
  deleteDoc: jest.fn(async reference => {
    delete remoteDocs[reference.path];
  }),
}));

import {
  PACKAGE_FAVORITES_KEY,
  getFavoritePackages,
  getFavoriteProducts,
  resetFavoritesStorageState,
  toggleFavoritePackage,
  toggleFavoriteProduct,
} from '../favoritesStorage';

describe('favoritesStorage', () => {
  beforeEach(() => {
    Object.keys(store).forEach(key => {
      delete store[key];
    });
    Object.keys(remoteDocs).forEach(key => {
      delete remoteDocs[key];
    });
    resetFavoritesStorageState();
  });

  it('serializează și deserializează favoritele de produse', async () => {
    const product = { id: 'prod_99', name: 'Produs test' };
    const added = await toggleFavoriteProduct({ favorites: [], product });

    expect(added).toHaveLength(1);
    expect(added[0].productId).toBe('prod_99');

    const loaded = await getFavoriteProducts();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].productSnapshot.name).toBe('Produs test');
  });

  it('elimină produsul când este deja favorit', async () => {
    const product = { id: 'prod_1', name: 'Produs' };
    const firstToggle = await toggleFavoriteProduct({ favorites: [], product });
    const secondToggle = await toggleFavoriteProduct({
      favorites: firstToggle,
      product,
    });

    expect(secondToggle).toEqual([]);
  });

  it('serializează și deserializează favoritele de pachete', async () => {
    const packageMatch = {
      package: { id: 'pkg_1', title: 'Pachet test' },
    };
    const added = await toggleFavoritePackage({
      favorites: [],
      packageMatch,
    });

    expect(added).toHaveLength(1);
    expect(added[0].packageId).toBe('pkg_1');

    const loaded = await getFavoritePackages();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].packageSnapshot.title).toBe('Pachet test');
  });

  it('resincronizează favoritele de pachete din remote după cleanup local', async () => {
    remoteDocs['users/user_1/favoritePackages/pkg_remote'] = {
      packageId: 'pkg_remote',
      createdAt: 1710000000000,
      packageSnapshot: {
        id: 'pkg_remote',
        title: 'Pachet remote',
      },
    };

    const loaded = await getFavoritePackages({ forceRemote: true });

    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toMatchObject({
      packageId: 'pkg_remote',
      packageSnapshot: {
        id: 'pkg_remote',
        title: 'Pachet remote',
      },
    });
    expect(store[PACKAGE_FAVORITES_KEY]).toContain('pkg_remote');
  });
});

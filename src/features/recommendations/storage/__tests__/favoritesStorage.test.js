/** @format */

const store = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async key => (key in store ? store[key] : null)),
    setItem: jest.fn(async (key, value) => {
      store[key] = value;
    }),
  },
}));

import {
  getFavoriteProducts,
  toggleFavoriteProduct,
} from '../favoritesStorage';

describe('favoritesStorage', () => {
  beforeEach(() => {
    Object.keys(store).forEach(key => {
      delete store[key];
    });
  });

  it('serializează și deserializează favoritele', async () => {
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
});

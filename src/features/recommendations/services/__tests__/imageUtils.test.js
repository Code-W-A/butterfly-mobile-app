/** @format */

import {
  buildProductByIdIndex,
  getPackageCover,
  getProductCover,
  getProductImageGallery,
} from '../imageUtils';

describe('imageUtils', () => {
  it('returneaza cover corect pentru produs cu doar imageUrls', () => {
    const product = {
      id: 'prod_1',
      imageUrls: ['https://cdn.example.com/a.jpg', 'https://cdn.example.com/b.jpg'],
    };

    expect(getProductCover(product)).toBe('https://cdn.example.com/a.jpg');
  });

  it('returneaza cover corect pentru produs cu doar imageUrl', () => {
    const product = {
      id: 'prod_2',
      imageUrl: 'https://cdn.example.com/single.jpg',
    };

    expect(getProductCover(product)).toBe('https://cdn.example.com/single.jpg');
  });

  it('dedupeaza corect cand produsul are imageUrls si imageUrl duplicat', () => {
    const product = {
      id: 'prod_3',
      imageUrls: [
        'https://cdn.example.com/a.jpg',
        ' https://cdn.example.com/b.jpg ',
        'https://cdn.example.com/a.jpg',
      ],
      imageUrl: 'https://cdn.example.com/b.jpg',
    };

    expect(getProductImageGallery(product)).toEqual([
      'https://cdn.example.com/a.jpg',
      'https://cdn.example.com/b.jpg',
    ]);
    expect(getProductCover(product)).toBe('https://cdn.example.com/a.jpg');
  });

  it('deriva cover de pachet din items in ordinea corecta', () => {
    const productMatches = [
      { product: { id: 'prod_1', imageUrls: ['https://cdn.example.com/p1.jpg'] } },
      { product: { id: 'prod_2', imageUrl: 'https://cdn.example.com/p2.jpg' } },
    ];
    const productById = buildProductByIdIndex(productMatches);
    const pkg = {
      id: 'pkg_1',
      items: [{ productId: 'prod_2' }, { productId: 'prod_1' }],
    };

    expect(getPackageCover(pkg, productById)).toBe('https://cdn.example.com/p2.jpg');
  });

  it('returneaza null pentru pachet fara imagini disponibile', () => {
    const productMatches = [
      { product: { id: 'prod_1', imageUrls: [] } },
      { product: { id: 'prod_2', imageUrl: null } },
    ];
    const productById = buildProductByIdIndex(productMatches);
    const pkg = {
      id: 'pkg_2',
      items: [{ productId: 'prod_2' }, { productId: 'prod_1' }],
    };

    expect(getPackageCover(pkg, productById)).toBeNull();
  });

  it('indexeaza robust si rezolva productId chiar daca are spatii', () => {
    const products = [
      { id: '  prod_space  ', imageUrl: 'https://cdn.example.com/space.jpg' },
    ];
    const productById = buildProductByIdIndex(products);
    const pkg = {
      id: 'pkg_space',
      items: [{ productId: 'prod_space' }],
    };

    expect(getPackageCover(pkg, productById)).toBe(
      'https://cdn.example.com/space.jpg',
    );
  });
});

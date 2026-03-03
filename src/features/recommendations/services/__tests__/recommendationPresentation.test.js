/** @format */

import {
  getAttributeBadges,
  getPackageItemsPreview,
} from '../recommendationPresentation';

describe('recommendationPresentation', () => {
  it('construieste badge-uri de atribute pentru match', () => {
    const badges = getAttributeBadges({
      product: {
        attributes: {
          speed: 91.3,
          spin: 87,
          control: 0,
        },
      },
    });

    expect(badges).toEqual([
      { key: 'speed', label: 'Viteză', value: 91 },
      { key: 'spin', label: 'Spin', value: 87 },
    ]);
  });

  it('construieste preview componente pachet din productById', () => {
    const match = {
      package: {
        currency: 'RON',
        items: [
          { role: 'blade', productId: 'p1' },
          { role: 'rubber_fh', productId: 'p2' },
        ],
      },
    };

    const productById = new Map([
      [
        'p1',
        {
          id: 'p1',
          name: 'Blade One',
          price: 399,
          currency: 'RON',
          imageUrl: 'https://cdn.example.com/p1.jpg',
          productUrl: 'https://store.example.com/p1',
        },
      ],
      [
        'p2',
        {
          id: 'p2',
          name: 'Rubber Two',
          price: 199,
          currency: 'RON',
        },
      ],
    ]);

    const preview = getPackageItemsPreview(match, productById);

    expect(preview[0].name).toBe('Blade One');
    expect(preview[0].roleLabel).toBe('Lemn');
    expect(preview[0].imageUrl).toBe('https://cdn.example.com/p1.jpg');
    expect(preview[1].name).toBe('Rubber Two');
    expect(preview[1].roleLabel).toBe('Forehand');
    expect(preview[1].price).toBe(199);
  });
});

/** @format */

import { extractPackageProductIds } from '../packageProductResolver';

describe('packageProductResolver', () => {
  it('extrage productId unice din packageMatches', () => {
    const ids = extractPackageProductIds([
      {
        package: {
          items: [{ productId: 'p1' }, { productId: ' p2 ' }],
        },
      },
      {
        package: {
          items: [{ productId: 'p2' }, { productId: 'p3' }],
        },
      },
    ]);

    expect(ids).toEqual(['p1', 'p2', 'p3']);
  });
});

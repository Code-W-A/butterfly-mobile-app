/** @format */

import {
  getMatchPackageIds,
  getMatchProductIds,
} from '../recommendationMapper';

describe('recommendationMapper', () => {
  it('extrage matchProductIds din response callable', () => {
    const ids = getMatchProductIds({
      productMatches: [
        { product: { id: 'prod_1' } },
        { product: { id: 'prod_2' } },
        { product: {} },
      ],
    });

    expect(ids).toEqual(['prod_1', 'prod_2']);
  });

  it('extrage matchPackageIds din response callable', () => {
    const ids = getMatchPackageIds({
      packageMatches: [
        { package: { id: 'pkg_1' } },
        { package: { id: 'pkg_2' } },
      ],
    });

    expect(ids).toEqual(['pkg_1', 'pkg_2']);
  });
});

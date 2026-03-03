/** @format */

import {
  sortRecommendationMatches,
  SORT_CRITERIA,
  SORT_DIRECTION,
} from '../sortRecommendations';

describe('sortRecommendationMatches', () => {
  const matches = [
    {
      fitScore: 70,
      product: { price: 450, attributes: { speed: 60, spin: 50, control: 90 } },
    },
    {
      fitScore: 95,
      product: { price: 650, attributes: { speed: 90, spin: 80, control: 70 } },
    },
    {
      fitScore: 85,
      package: {
        totalPrice: 350,
        attributes: { speed: 55, spin: 60, control: 88 },
      },
    },
  ];

  it('sortează după fit desc implicit', () => {
    const result = sortRecommendationMatches(matches);
    expect(result[0].fitScore).toBe(95);
  });

  it('sortează după preț asc', () => {
    const result = sortRecommendationMatches(
      matches,
      SORT_CRITERIA.PRICE,
      SORT_DIRECTION.ASC,
    );

    expect(result[0].package.totalPrice).toBe(350);
  });

  it('sortează după control desc', () => {
    const result = sortRecommendationMatches(
      matches,
      SORT_CRITERIA.CONTROL,
      SORT_DIRECTION.DESC,
    );

    expect(result[0].product.attributes.control).toBe(90);
  });
});

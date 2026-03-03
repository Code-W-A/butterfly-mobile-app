/** @format */

import { getMatchAttributes, getMatchPrice } from './recommendationMapper';

export const SORT_CRITERIA = {
  FIT: 'fit',
  PRICE: 'price',
  SPEED: 'speed',
  SPIN: 'spin',
  CONTROL: 'control',
};

export const SORT_DIRECTION = {
  ASC: 'asc',
  DESC: 'desc',
};

const getNumericValue = (match, criterion) => {
  switch (criterion) {
    case SORT_CRITERIA.PRICE:
      return Number(getMatchPrice(match) || 0);
    case SORT_CRITERIA.SPEED:
      return Number(getMatchAttributes(match)?.speed || 0);
    case SORT_CRITERIA.SPIN:
      return Number(getMatchAttributes(match)?.spin || 0);
    case SORT_CRITERIA.CONTROL:
      return Number(getMatchAttributes(match)?.control || 0);
    case SORT_CRITERIA.FIT:
    default:
      return Number(match?.fitScore || match?.matchPercent || 0);
  }
};

export const sortRecommendationMatches = (
  matches,
  criterion = SORT_CRITERIA.FIT,
  direction = SORT_DIRECTION.DESC,
) => {
  const factor = direction === SORT_DIRECTION.ASC ? 1 : -1;

  return [...matches].sort((first, second) => {
    const firstValue = getNumericValue(first, criterion);
    const secondValue = getNumericValue(second, criterion);

    if (firstValue === secondValue) {
      return 0;
    }

    return firstValue > secondValue ? factor : -factor;
  });
};

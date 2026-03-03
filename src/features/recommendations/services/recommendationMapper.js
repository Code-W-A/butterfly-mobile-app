/** @format */

import {
  buildProductByIdIndex,
  getPackageCover,
  getProductCover,
} from './imageUtils';

export { buildProductByIdIndex };

export const getProductMatchId = match => {
  return match?.product?.id || null;
};

export const getPackageMatchId = match => {
  return match?.package?.id || null;
};

export const getMatchProductIds = response => {
  if (!Array.isArray(response?.productMatches)) {
    return [];
  }

  return response.productMatches
    .map(match => getProductMatchId(match))
    .filter(Boolean);
};

export const getMatchPackageIds = response => {
  if (!Array.isArray(response?.packageMatches)) {
    return [];
  }

  return response.packageMatches
    .map(match => getPackageMatchId(match))
    .filter(Boolean);
};

export const getResultMode = response => {
  return response?.resultMode === 'packages' ? 'packages' : 'products';
};

export const getMatchesByMode = response => {
  const resultMode = getResultMode(response);

  if (resultMode === 'packages') {
    return Array.isArray(response?.packageMatches)
      ? response.packageMatches
      : [];
  }

  return Array.isArray(response?.productMatches) ? response.productMatches : [];
};

export const getPrimaryImage = (match, options = {}) => {
  if (match?.product) {
    return getProductCover(match.product);
  }

  if (match?.package) {
    const fallbackIndex = buildProductByIdIndex(options?.productMatches);
    const productById =
      options?.productById instanceof Map ? options.productById : fallbackIndex;

    return getPackageCover(match.package, productById);
  }

  return null;
};

export const getMatchTitle = match => {
  if (match?.product?.name) {
    return match.product.name;
  }

  if (match?.package?.title) {
    return match.package.title;
  }

  return 'Recomandare';
};

export const getMatchPrice = match => {
  if (typeof match?.product?.price === 'number') {
    return match.product.price;
  }

  if (typeof match?.package?.totalPrice === 'number') {
    return match.package.totalPrice;
  }

  return 0;
};

export const getMatchCurrency = match => {
  return match?.product?.currency || match?.package?.currency || 'RON';
};

export const getMatchAttributes = match => {
  return match?.product?.attributes || match?.package?.attributes || {};
};

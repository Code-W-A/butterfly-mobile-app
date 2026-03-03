/** @format */

import {
  buildProductByIdIndex,
  getMatchAttributes,
  getMatchCurrency,
  getMatchPrice,
  getMatchTitle,
  getPrimaryImage,
  getResultMode,
  getMatchesByMode,
} from './recommendationMapper';
import { getProductCover } from './imageUtils';

const normalizeText = value => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/\s+/g, ' ').trim();
};

const clampPercent = value => {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const toNumberOrNull = value => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const humanizePreference = value => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();

  if (!normalized) {
    return '';
  }

  const knownLabels = {
    control: 'control',
    spin: 'spin',
    speed: 'viteză',
    offensive: 'stil ofensiv',
    defensive: 'stil defensiv',
    allround: 'stil allround',
  };

  if (knownLabels[normalized]) {
    return knownLabels[normalized];
  }

  return normalized.replace(/[_-]/g, ' ');
};

const joinWithRomanianAnd = values => {
  if (values.length <= 1) {
    return values[0] || '';
  }

  if (values.length === 2) {
    return `${values[0]} și ${values[1]}`;
  }

  return `${values.slice(0, -1).join(', ')} și ${values[values.length - 1]}`;
};

const UNAVAILABLE_PACKAGE_ITEM_LABEL = 'Produs indisponibil';

const normalizePackageRole = value => {
  const normalized = normalizeText(value).toLowerCase().replace(/\s+/g, '_');

  if (!normalized) {
    return '';
  }

  if (
    normalized === 'blade' ||
    normalized === 'lemn' ||
    normalized === 'wood'
  ) {
    return 'blade';
  }

  if (
    normalized === 'forehand' ||
    normalized === 'rubber_fh' ||
    normalized === 'fh'
  ) {
    return 'forehand';
  }

  if (
    normalized === 'backhand' ||
    normalized === 'rever' ||
    normalized === 'rubber_bh' ||
    normalized === 'bh'
  ) {
    return 'backhand';
  }

  return normalized;
};

export const getPackageRoleLabel = value => {
  const canonicalRole = normalizePackageRole(value);
  if (canonicalRole === 'blade') {
    return 'Lemn';
  }
  if (canonicalRole === 'forehand') {
    return 'Forehand';
  }
  if (canonicalRole === 'backhand') {
    return 'Rever';
  }

  const raw = normalizeText(value);
  return raw || '';
};

export const getMatchPercent = match => {
  const matchPercent = toNumberOrNull(match?.matchPercent);

  if (matchPercent !== null) {
    return clampPercent(matchPercent);
  }

  const fitScore = toNumberOrNull(match?.fitScore);

  if (fitScore === null) {
    return 0;
  }

  if (fitScore > 0 && fitScore <= 1) {
    return clampPercent(fitScore * 100);
  }

  return clampPercent(fitScore);
};

export const getReasonLine = (match, fallbackText = '') => {
  const explanation = normalizeText(match?.scenario?.explanationTemplate);

  if (explanation) {
    return explanation;
  }

  const preferenceLabels = Array.isArray(match?.matchedPreferences)
    ? match.matchedPreferences
        .map(humanizePreference)
        .filter(Boolean)
        .slice(0, 3)
    : [];

  if (preferenceLabels.length > 0) {
    return `Potrivit pentru ${joinWithRomanianAnd(preferenceLabels)}.`;
  }

  return normalizeText(fallbackText);
};

export const getReasonLineParts = (
  match,
  fallbackText = 'Potrivire bună pentru răspunsurile tale.',
) => {
  const explanation = normalizeText(match?.scenario?.explanationTemplate);
  const firstReason = explanation || normalizeText(fallbackText);

  const preferenceLabels = Array.isArray(match?.matchedPreferences)
    ? match.matchedPreferences
        .map(humanizePreference)
        .filter(Boolean)
        .slice(0, 2)
    : [];

  const secondReason =
    preferenceLabels.length > 0
      ? `Susține ${joinWithRomanianAnd(preferenceLabels)}.`
      : normalizeText(fallbackText);

  return [firstReason, secondReason];
};

export const getAttributeBadges = match => {
  const attributes = getMatchAttributes(match) || {};
  const definitions = [
    { key: 'speed', label: 'Viteză' },
    { key: 'spin', label: 'Spin' },
    { key: 'control', label: 'Control' },
  ];

  return definitions
    .map(definition => {
      const value = Number(attributes?.[definition.key]);
      if (!Number.isFinite(value) || value <= 0) {
        return null;
      }
      return {
        key: definition.key,
        label: definition.label,
        value: Math.round(value),
      };
    })
    .filter(Boolean);
};

export const getRecommendedTags = match => {
  const tags = [];
  const productTags = match?.product?.tags;

  if (Array.isArray(productTags?.level) && productTags.level[0]) {
    tags.push({ key: 'level', label: productTags.level[0] });
  }
  if (Array.isArray(productTags?.style) && productTags.style[0]) {
    tags.push({ key: 'style', label: productTags.style[0] });
  }
  if (Array.isArray(productTags?.distance) && productTags.distance[0]) {
    tags.push({ key: 'distance', label: productTags.distance[0] });
  }

  return tags;
};

export const getPackageItemsPreview = (match, productById) => {
  const items = Array.isArray(match?.package?.items) ? match.package.items : [];
  const productLookup = productById instanceof Map ? productById : null;
  return items.map((item, index) => {
    const productId =
      typeof item?.productId === 'string' || typeof item?.productId === 'number'
        ? String(item.productId).trim()
        : '';
    const product = productId && productLookup ? productLookup.get(productId) : null;
    const fallbackName =
      typeof item?.name === 'string' && item.name.trim() ? item.name.trim() : '';
    const resolvedName =
      product?.name ||
      fallbackName ||
      (productId ? `Produs (${productId})` : UNAVAILABLE_PACKAGE_ITEM_LABEL);
    const canonicalRole = normalizePackageRole(item?.role);
    return {
      id: `${productId || 'item'}-${index}`,
      productId,
      role: canonicalRole,
      roleLabel: getPackageRoleLabel(item?.role),
      name: resolvedName,
      price: Number(product?.price || item?.price || 0),
      currency: product?.currency || item?.currency || match?.package?.currency || 'RON',
      imageUrl: getProductCover(product),
      productUrl: product?.productUrl || null,
    };
  });
};

export const isWithinBudget = (match, responseInput) => {
  const price = toNumberOrNull(getMatchPrice(match));

  if (price === null || price <= 0) {
    return false;
  }

  const min = toNumberOrNull(responseInput?.budgetMin);
  const max = toNumberOrNull(responseInput?.budgetMax);
  const hasMin = min !== null && min > 0;
  const hasMax = max !== null && max > 0;

  if (!hasMin && !hasMax) {
    return false;
  }

  if (hasMin && price < min) {
    return false;
  }

  if (hasMax && price > max) {
    return false;
  }

  return true;
};

const normalizeAnswerValue = value => {
  if (Array.isArray(value)) {
    return value.map(item => String(item)).join(', ');
  }

  if (value && typeof value === 'object') {
    const values = Object.values(value);
    return values.map(item => String(item)).join(', ');
  }

  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return String(value);
};

export const buildAnswersSummary = (answers, maxItems = 8) => {
  if (!answers || typeof answers !== 'object') {
    return [];
  }

  return Object.entries(answers)
    .slice(0, maxItems)
    .map(([key, value]) => ({
      key,
      value: normalizeAnswerValue(value),
    }));
};

export const buildWowItem = (
  match,
  {
    index = 0,
    responseInput = {},
    resultMode = 'products',
    fallbackReason = 'Potrivire bună pentru răspunsurile tale.',
    productById = new Map(),
  } = {},
) => {
  const reasons = getReasonLineParts(match, fallbackReason);
  const id = match?.product?.id || match?.package?.id || `wow_${index}`;

  return {
    id,
    productId: match?.product?.id || '',
    name: getMatchTitle(match),
    imageUrl: getPrimaryImage(match, { productById }),
    price: getMatchPrice(match),
    currency: getMatchCurrency(match),
    matchPercent: getMatchPercent(match),
    reasonShort1: reasons[0],
    reasonShort2: reasons[1],
    reasonLine: getReasonLine(match, fallbackReason),
    explanation: normalizeText(match?.scenario?.explanationTemplate),
    productUrl: match?.product?.productUrl || null,
    packageMode: match?.package?.mode || null,
    attributeBadges: getAttributeBadges(match),
    recommendedTags: getRecommendedTags(match),
    packageItems: getPackageItemsPreview(match, productById),
    isInBudget: isWithinBudget(match, responseInput),
    resultMode,
    match,
  };
};

export const buildWowItems = (
  recommendationResponse,
  fallbackReason = 'Potrivire bună pentru răspunsurile tale.',
  options = {},
) => {
  const resultMode = getResultMode(recommendationResponse);
  const matches = getMatchesByMode(recommendationResponse);
  const responseInput = recommendationResponse?.input || {};
  const fallbackProductById = buildProductByIdIndex(
    recommendationResponse?.productMatches,
  );
  const productById =
    options?.productById instanceof Map ? options.productById : fallbackProductById;

  return matches.map((match, index) =>
    buildWowItem(match, {
      index,
      responseInput,
      resultMode,
      fallbackReason,
      productById,
    }),
  );
};

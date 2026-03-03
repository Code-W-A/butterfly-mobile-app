/** @format */

/**
 * @typedef {{ id?: string, imageUrl?: string|null, imageUrls?: string[]|null }} ProductLike
 * @typedef {{ productId?: string }} PackageItemLike
 * @typedef {{ id?: string, items?: PackageItemLike[]|null }} PackageLike
 * @typedef {{ product?: ProductLike|null }} ProductMatchLike
 */

const loggedDebugKeys = new Set();
const loggedHttpWarnings = new Set();

const normalizeEntityId = value => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  return String(value).trim();
};

const logDevOnce = (key, label, payload) => {
  if (!__DEV__) {
    return;
  }

  if (loggedDebugKeys.has(key)) {
    return;
  }
  loggedDebugKeys.add(key);
  console.log(label, payload);
};

const warnHttpUrlOnce = url => {
  if (!__DEV__ || typeof url !== 'string') {
    return;
  }

  if (!url.startsWith('http://') || loggedHttpWarnings.has(url)) {
    return;
  }

  loggedHttpWarnings.add(url);
  console.warn(
    '[recommendations:image] http image URL detected (may be blocked on iOS/Android)',
    { url },
  );
};

/**
 * Normalizează URL de imagine.
 * Acceptă doar http/https după trim.
 *
 * @param {string|null|undefined} url
 * @returns {string|null}
 */
export const normalizeImageUrl = url => {
  if (typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return null;
  }

  warnHttpUrlOnce(trimmed);
  return trimmed;
};

/**
 * Construieste galeria pentru produs din imageUrls + imageUrl, cu dedupe.
 *
 * @param {ProductLike|null|undefined} product
 * @returns {string[]}
 */
export const getProductImageGallery = product => {
  const imageUrls = Array.isArray(product?.imageUrls) ? product.imageUrls : [];
  const merged = [...imageUrls];

  if (typeof product?.imageUrl === 'string') {
    merged.push(product.imageUrl);
  }

  const unique = [];
  const seen = new Set();

  for (let index = 0; index < merged.length; index += 1) {
    const normalized = normalizeImageUrl(merged[index]);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    unique.push(normalized);
  }

  return unique;
};

/**
 * Alege imaginea cover pentru produs.
 *
 * @param {ProductLike|null|undefined} product
 * @returns {string|null}
 */
export const getProductCover = product => {
  const gallery = getProductImageGallery(product);
  const selectedCover = gallery[0] || null;
  const productId = product?.id || '(no-id)';

  logDevOnce(
    `product:${String(productId)}`,
    '[recommendations:image:product]',
    {
      productId,
      imageUrl: typeof product?.imageUrl === 'string' ? product.imageUrl : null,
      imageUrlsCount: Array.isArray(product?.imageUrls) ? product.imageUrls.length : 0,
      selectedCover,
    },
  );

  return selectedCover;
};

/**
 * Indexează rapid produsele disponibile după id.
 *
 * @param {ProductMatchLike[]|null|undefined} productMatches
 * @returns {Map<string, ProductLike>}
 */
export const buildProductByIdIndex = productMatches => {
  const index = new Map();
  const matches = Array.isArray(productMatches) ? productMatches : [];

  for (let i = 0; i < matches.length; i += 1) {
    const candidate = matches[i];
    const product = candidate?.product || candidate;
    const productId = normalizeEntityId(product?.id);
    if (!product || !productId) {
      continue;
    }
    if (!index.has(productId)) {
      index.set(productId, product);
    }
  }

  return index;
};

/**
 * Derivează cover pentru pachet din produsele referite în items.
 *
 * @param {PackageLike|null|undefined} pkg
 * @param {Map<string, ProductLike>} productById
 * @returns {string|null}
 */
export const getPackageCover = (pkg, productById) => {
  const items = Array.isArray(pkg?.items) ? pkg.items : [];
  let selectedCover = null;
  const unresolvedProductIds = [];

  for (let i = 0; i < items.length; i += 1) {
    const productId = normalizeEntityId(items[i]?.productId);
    if (!productId) {
      continue;
    }
    const product =
      productById instanceof Map
        ? productById.get(productId)
        : null;
    if (!product) {
      unresolvedProductIds.push(productId);
      continue;
    }
    const productCover = getProductCover(product);
    if (productCover) {
      selectedCover = productCover;
      break;
    }
  }

  const packageId = pkg?.id || '(no-id)';
  logDevOnce(
    `package:${String(packageId)}`,
    '[recommendations:image:package]',
    {
      packageId,
      itemsCount: items.length,
      productByIdSize: productById instanceof Map ? productById.size : 0,
      unresolvedProductIds: unresolvedProductIds.slice(0, 5),
      selectedCover,
    },
  );

  return selectedCover;
};

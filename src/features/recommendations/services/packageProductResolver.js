/** @format */

import { collection, documentId, getDocs, query, where } from 'firebase/firestore';

import { initializeFirebase } from '@services/Firebase';

import { buildProductByIdIndex } from './imageUtils';

const FIRESTORE_IN_LIMIT = 10;

const normalizeId = value => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  return String(value).trim();
};

const chunkArray = (list, chunkSize) => {
  const chunks = [];
  for (let index = 0; index < list.length; index += chunkSize) {
    chunks.push(list.slice(index, index + chunkSize));
  }
  return chunks;
};

export const extractPackageProductIds = packageMatches => {
  const matches = Array.isArray(packageMatches) ? packageMatches : [];
  const ids = [];
  const seen = new Set();

  matches.forEach(match => {
    const items = Array.isArray(match?.package?.items) ? match.package.items : [];
    items.forEach(item => {
      const productId = normalizeId(item?.productId);
      if (!productId || seen.has(productId)) {
        return;
      }
      seen.add(productId);
      ids.push(productId);
    });
  });

  return ids;
};

export const fetchProductsByIds = async productIds => {
  const normalizedIds = Array.isArray(productIds)
    ? productIds.map(normalizeId).filter(Boolean)
    : [];
  const uniqueIds = Array.from(new Set(normalizedIds));

  if (!uniqueIds.length) {
    if (__DEV__) {
      console.log('[recommendations:image:resolver] no missing product ids');
    }
    return new Map();
  }

  const firebaseSetup = initializeFirebase();
  if (!firebaseSetup?.db) {
    if (__DEV__) {
      console.warn(
        '[recommendations:image:resolver] Firestore is not available for product fallback',
      );
    }
    return new Map();
  }

  const productMap = new Map();
  const idChunks = chunkArray(uniqueIds, FIRESTORE_IN_LIMIT);

  for (let chunkIndex = 0; chunkIndex < idChunks.length; chunkIndex += 1) {
    const chunk = idChunks[chunkIndex];
    if (!chunk.length) {
      continue;
    }

    const productsRef = collection(firebaseSetup.db, 'products');
    const productsQuery = query(productsRef, where(documentId(), 'in', chunk));
    const snapshot = await getDocs(productsQuery);

    snapshot.docs.forEach(docSnapshot => {
      productMap.set(docSnapshot.id, {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      });
    });
  }

  if (__DEV__) {
    const firstProduct = productMap.values().next().value;
    console.log('[recommendations:image:resolver] fetched products for packages', {
      requestedIdsCount: uniqueIds.length,
      fetchedProductsCount: productMap.size,
      firstFetchedProductId: firstProduct?.id || null,
      firstFetchedImageUrl:
        typeof firstProduct?.imageUrl === 'string' ? firstProduct.imageUrl : null,
      firstFetchedImageUrlsCount: Array.isArray(firstProduct?.imageUrls)
        ? firstProduct.imageUrls.length
        : 0,
    });
  }

  return productMap;
};

export const resolvePackageProductContext = async ({
  packageMatches,
  productMatches,
}) => {
  const baseMatches = Array.isArray(productMatches) ? productMatches : [];
  const baseProductById = buildProductByIdIndex(baseMatches);
  const requiredProductIds = extractPackageProductIds(packageMatches);
  const missingIds = requiredProductIds.filter(id => !baseProductById.has(id));
  if (__DEV__) {
    console.log('[recommendations:image:resolver] resolve package context', {
      packageMatchesCount: Array.isArray(packageMatches) ? packageMatches.length : 0,
      baseProductMatchesCount: baseMatches.length,
      baseProductByIdSize: baseProductById.size,
      requiredProductIdsCount: requiredProductIds.length,
      missingIdsCount: missingIds.length,
    });
  }
  const fetchedProductById = await fetchProductsByIds(missingIds);

  const mergedProductById = new Map(baseProductById);
  fetchedProductById.forEach((product, productId) => {
    if (!mergedProductById.has(productId)) {
      mergedProductById.set(productId, product);
    }
  });

  const resolvedProductMatches = [...baseMatches];
  fetchedProductById.forEach((product, productId) => {
    if (!baseProductById.has(productId)) {
      resolvedProductMatches.push({ product });
    }
  });

  return {
    productById: mergedProductById,
    resolvedProductMatches,
  };
};

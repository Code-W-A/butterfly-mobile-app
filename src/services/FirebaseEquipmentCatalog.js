/** @format */

import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

import { initializeFirebase } from './Firebase';

const cleanString = value => (typeof value === 'string' ? value.trim() : '');

const normalizeCatalogItem = ({ rawItem, fallbackId }) => {
  if (!rawItem || typeof rawItem !== 'object') {
    return null;
  }

  const id = cleanString(rawItem.id || fallbackId);
  const name = cleanString(rawItem.name || rawItem.label || rawItem.title);
  const brand = cleanString(rawItem.brand);
  const active = rawItem.active !== false;

  if (!id || !name || !active) {
    return null;
  }

  return {
    id,
    name,
    brand,
    active,
    updatedAt: rawItem.updatedAt || null,
  };
};

const dedupeCatalog = items => {
  const byId = new Map();
  items.forEach(item => {
    if (!item?.id || byId.has(item.id)) {
      return;
    }
    byId.set(item.id, item);
  });

  return Array.from(byId.values()).sort((first, second) =>
    first.name.localeCompare(second.name, 'ro', { sensitivity: 'base' }),
  );
};

const extractItemsFromArray = rawItems => {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((rawItem, index) =>
      normalizeCatalogItem({
        rawItem,
        fallbackId: `catalog_item_${index}`,
      }),
    )
    .filter(Boolean);
};

const extractCatalogFromDoc = data => {
  const source = data && typeof data === 'object' ? data : {};
  const blades = extractItemsFromArray(source.blades);
  const rubbers = extractItemsFromArray(source.rubbers);

  return {
    blades,
    rubbers,
  };
};

const extractCatalogFromCollectionDocs = snapshot => {
  const blades = [];
  const rubbers = [];

  snapshot.docs.forEach(docSnapshot => {
    const data = docSnapshot.data() || {};
    const type = cleanString(data.type || docSnapshot.id).toLowerCase();

    if (Array.isArray(data.items)) {
      const items = extractItemsFromArray(data.items);
      if (type.includes('blade')) {
        blades.push(...items);
      } else if (type.includes('rubber')) {
        rubbers.push(...items);
      }
      return;
    }

    if (data.blades || data.rubbers) {
      const extracted = extractCatalogFromDoc(data);
      blades.push(...extracted.blades);
      rubbers.push(...extracted.rubbers);
      return;
    }

    const normalizedItem = normalizeCatalogItem({
      rawItem: {
        ...data,
        id: cleanString(data.id || docSnapshot.id),
      },
      fallbackId: docSnapshot.id,
    });
    if (!normalizedItem) {
      return;
    }

    if (type.includes('blade')) {
      blades.push(normalizedItem);
    } else if (type.includes('rubber') || type.includes('forehand') || type.includes('backhand')) {
      rubbers.push(normalizedItem);
    }
  });

  return {
    blades,
    rubbers,
  };
};

export const getEquipmentCatalog = async () => {
  const firebaseSetup = initializeFirebase();
  if (!firebaseSetup?.db) {
    return { blades: [], rubbers: [] };
  }

  // Preferred shape: settings/equipmentCatalog { blades: [], rubbers: [] }
  const settingsDocRef = doc(firebaseSetup.db, 'settings', 'equipmentCatalog');
  const settingsDocSnapshot = await getDoc(settingsDocRef);
  if (settingsDocSnapshot.exists()) {
    const extracted = extractCatalogFromDoc(settingsDocSnapshot.data());
    return {
      blades: dedupeCatalog(extracted.blades),
      rubbers: dedupeCatalog(extracted.rubbers),
    };
  }

  // Legacy/fallback shape: equipmentCatalog/*
  const catalogRef = collection(firebaseSetup.db, 'equipmentCatalog');
  const snapshot = await getDocs(catalogRef);
  const extracted = extractCatalogFromCollectionDocs(snapshot);

  return {
    blades: dedupeCatalog(extracted.blades),
    rubbers: dedupeCatalog(extracted.rubbers),
  };
};

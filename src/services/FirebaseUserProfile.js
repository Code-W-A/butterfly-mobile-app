/** @format */

import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { initializeFirebase } from './Firebase';

const cleanString = value => (typeof value === 'string' ? value.trim() : '');

const normalizeEquipmentEntry = entry => {
  if (typeof entry === 'string') {
    const label = cleanString(entry);
    return label
      ? {
          source: 'custom',
          catalogId: '',
          label,
        }
      : null;
  }

  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const source = cleanString(entry.source) === 'catalog' ? 'catalog' : 'custom';
  const catalogId = cleanString(entry.catalogId);
  const label = cleanString(entry.label || entry.name || entry.customLabel);

  if (!catalogId && !label) {
    return null;
  }

  return {
    source,
    catalogId,
    label,
  };
};

const normalizeEquipment = equipment => {
  const source = equipment && typeof equipment === 'object' ? equipment : {};
  const blade = normalizeEquipmentEntry(source.blade);
  const forehand = normalizeEquipmentEntry(source.forehand);
  const backhand = normalizeEquipmentEntry(source.backhand);

  return {
    blade,
    forehand,
    backhand,
  };
};

const splitDisplayName = displayName => {
  const normalizedName = cleanString(displayName);
  if (!normalizedName) {
    return { firstName: '', lastName: '' };
  }

  const parts = normalizedName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
};

const buildDisplayName = ({ firstName, lastName, fallbackEmail }) => {
  const fullName = `${cleanString(firstName)} ${cleanString(lastName)}`.trim();
  if (fullName) {
    return fullName;
  }

  return cleanString(fallbackEmail);
};

export const getFirebaseUserProfile = async firebaseUser => {
  const firebaseSetup = initializeFirebase();
  if (!firebaseSetup?.db || !firebaseUser?.uid) {
    return null;
  }

  const profileRef = doc(firebaseSetup.db, 'users', firebaseUser.uid);
  const snapshot = await getDoc(profileRef);

  return snapshot.exists() ? snapshot.data() : null;
};

export const ensureFirebaseUserProfile = async ({
  firebaseUser,
  profilePatch = {},
}) => {
  const firebaseSetup = initializeFirebase();
  if (!firebaseSetup?.db || !firebaseUser?.uid) {
    return null;
  }

  const currentProfile = (await getFirebaseUserProfile(firebaseUser)) || {};
  const nameFromAuth = splitDisplayName(firebaseUser.displayName);

  const firstName =
    cleanString(profilePatch.firstName) ||
    cleanString(currentProfile.firstName) ||
    cleanString(nameFromAuth.firstName);
  const lastName =
    cleanString(profilePatch.lastName) ||
    cleanString(currentProfile.lastName) ||
    cleanString(nameFromAuth.lastName);
  const email =
    cleanString(profilePatch.email) ||
    cleanString(currentProfile.email) ||
    cleanString(firebaseUser.email);
  const phone =
    cleanString(profilePatch.phone) ||
    cleanString(currentProfile.phone) ||
    cleanString(firebaseUser.phoneNumber);
  const avatarUrl =
    cleanString(profilePatch.avatarUrl) ||
    cleanString(currentProfile.avatarUrl) ||
    cleanString(firebaseUser.photoURL);
  const language =
    cleanString(profilePatch.language) || cleanString(currentProfile.language);
  const currentEquipment = normalizeEquipment(currentProfile.equipment);
  const patchEquipment = normalizeEquipment(profilePatch.equipment);
  const equipment = {
    blade: patchEquipment.blade || currentEquipment.blade || null,
    forehand: patchEquipment.forehand || currentEquipment.forehand || null,
    backhand: patchEquipment.backhand || currentEquipment.backhand || null,
  };
  const displayName = buildDisplayName({
    firstName,
    lastName,
    fallbackEmail: email,
  });
  const now = Date.now();

  const payload = {
    firstName,
    lastName,
    email,
    phone,
    avatarUrl,
    language,
    equipment,
    displayName,
    createdAt: Number(currentProfile.createdAt || now),
    updatedAt: now,
  };

  const profileRef = doc(firebaseSetup.db, 'users', firebaseUser.uid);
  await setDoc(profileRef, payload, { merge: true });

  if (firebaseSetup?.auth?.currentUser?.uid === firebaseUser.uid) {
    await updateProfile(firebaseSetup.auth.currentUser, {
      displayName: displayName || null,
      photoURL: avatarUrl || null,
    }).catch(() => null);
  }

  return payload;
};

export const mapFirebaseUserToAppUser = ({ firebaseUser, profile }) => {
  const mergedProfile = profile || {};
  const nameFromAuth = splitDisplayName(firebaseUser?.displayName);
  const firstName =
    cleanString(mergedProfile.firstName) || cleanString(nameFromAuth.firstName);
  const lastName =
    cleanString(mergedProfile.lastName) || cleanString(nameFromAuth.lastName);
  const email =
    cleanString(mergedProfile.email) || cleanString(firebaseUser?.email);
  const phone =
    cleanString(mergedProfile.phone) || cleanString(firebaseUser?.phoneNumber);
  const equipment = normalizeEquipment(mergedProfile.equipment);
  const name =
    cleanString(mergedProfile.displayName) ||
    buildDisplayName({ firstName, lastName, fallbackEmail: email }) ||
    'Guest';

  return {
    id: firebaseUser?.uid || '',
    uid: firebaseUser?.uid || '',
    first_name: firstName,
    last_name: lastName,
    name,
    email,
    phone,
    avatar_url:
      cleanString(mergedProfile.avatarUrl) || cleanString(firebaseUser?.photoURL),
    language: cleanString(mergedProfile.language),
    equipment,
  };
};

/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteUser, signOut } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';

import { initializeFirebase } from './Firebase';
import { clearRecommendationLocalState } from '../features/recommendations/storage/recommendationLocalState';

const USER_SUBCOLLECTIONS_TO_DELETE = [
  'favorites',
  'favoritePackages',
  'recommendationHistory',
];

const deleteCollectionDocs = async (db, pathSegments) => {
  const collectionRef = collection(db, ...pathSegments);
  const snapshot = await getDocs(collectionRef);
  await Promise.all(
    snapshot.docs.map(docSnapshot => deleteDoc(docSnapshot.ref)),
  );
};

export const deleteCurrentFirebaseAccount = async () => {
  const firebaseSetup = initializeFirebase();

  if (!firebaseSetup?.auth) {
    throw new Error('Firebase auth not initialized');
  }

  const currentUser = firebaseSetup.auth.currentUser;
  const userId = currentUser?.uid;

  if (!userId || !currentUser) {
    throw new Error('No authenticated user found');
  }

  if (firebaseSetup?.db) {
    await Promise.all(
      USER_SUBCOLLECTIONS_TO_DELETE.map(subcollection =>
        deleteCollectionDocs(firebaseSetup.db, [
          'users',
          userId,
          subcollection,
        ]),
      ),
    );
    await deleteDoc(doc(firebaseSetup.db, 'users', userId));
  }

  await deleteUser(currentUser);

  // Full local cleanup requested for account deletion flow.
  await AsyncStorage.clear();
  await clearRecommendationLocalState().catch(() => null);

  try {
    await signOut(firebaseSetup.auth);
  } catch (_error) {
    // Deleting the user usually signs out automatically.
  }
};

/** @format */

import { signInAnonymously } from 'firebase/auth';

export const ensureRecommendationAuth = async firebaseAuth => {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth nu este inițializat.');
  }

  if (firebaseAuth.currentUser) {
    return firebaseAuth.currentUser;
  }

  const credential = await signInAnonymously(firebaseAuth);
  return credential.user;
};

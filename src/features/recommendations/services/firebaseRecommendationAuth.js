/** @format */

import { onAuthStateChanged } from 'firebase/auth';

const AUTH_RESTORE_TIMEOUT_MS = 5000;
export const RECOMMENDATION_LOGIN_REQUIRED_CODE = 'auth/login-required';

let authRestorePromise = null;

const waitForRestoredAuthUser = firebaseAuth => {
  return new Promise(resolve => {
    let isSettled = false;
    let unsubscribe = () => {};

    const settle = user => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      clearTimeout(timeoutId);
      unsubscribe();
      resolve(user || null);
    };

    const timeoutId = setTimeout(() => {
      settle(firebaseAuth.currentUser || null);
    }, AUTH_RESTORE_TIMEOUT_MS);

    unsubscribe = onAuthStateChanged(
      firebaseAuth,
      user => {
        settle(user);
      },
      () => {
        settle(null);
      },
    );
  });
};

const resolveExistingAuthUser = async firebaseAuth => {
  if (firebaseAuth.currentUser) {
    return firebaseAuth.currentUser;
  }

  if (!authRestorePromise) {
    authRestorePromise = waitForRestoredAuthUser(firebaseAuth).finally(() => {
      authRestorePromise = null;
    });
  }

  const restoredUser = await authRestorePromise;
  return restoredUser || firebaseAuth.currentUser || null;
};

const createLoginRequiredError = () => {
  const error = new Error('Trebuie să fii autentificat pentru a continua.');
  error.code = RECOMMENDATION_LOGIN_REQUIRED_CODE;
  return error;
};

export const isRecommendationLoginRequiredError = error => {
  return String(error?.code || '') === RECOMMENDATION_LOGIN_REQUIRED_CODE;
};

export const requireRecommendationUser = async firebaseAuth => {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth nu este inițializat.');
  }

  const existingUser = await resolveExistingAuthUser(firebaseAuth);
  if (existingUser && !existingUser.isAnonymous) {
    return existingUser;
  }

  throw createLoginRequiredError();
};

/** @format */

import { getFirebaseUserErrorMessage } from './FirebaseUserErrorMessages';

export const getFirebaseAuthErrorMessage = (
  error,
  fallbackMessage = 'A aparut o eroare. Incearca din nou.',
) => {
  return getFirebaseUserErrorMessage(error, fallbackMessage);
};

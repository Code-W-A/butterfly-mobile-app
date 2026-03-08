/** @format */

import { getFunctions, httpsCallable } from 'firebase/functions';

import { initializeFirebase } from '@services/Firebase';

import texts from '../constants/texts.ro';
import {
  validateRecommendationCallableRequest,
  validateRecommendationCallableResponse,
} from '../types/contracts';
import { mapCallableErrorToMessage } from './callableErrors';
import { requireRecommendationUser } from './firebaseRecommendationAuth';

const CALLABLE_REGION = 'europe-west1';
const CALLABLE_NAME = 'computeRecommendations';

export const computeRecommendations = async payload => {
  if (!validateRecommendationCallableRequest(payload)) {
    throw new Error(texts.callableInvalidArgument);
  }

  const firebaseSetup = initializeFirebase();

  if (
    !firebaseSetup.isConfigured ||
    !firebaseSetup.app ||
    !firebaseSetup.auth
  ) {
    throw new Error(texts.authMissingFirebase);
  }

  await requireRecommendationUser(firebaseSetup.auth);

  try {
    const functions = getFunctions(firebaseSetup.app, CALLABLE_REGION);
    const callable = httpsCallable(functions, CALLABLE_NAME);

    const response = await callable(payload);
    const data = response?.data;

    if (!validateRecommendationCallableResponse(data)) {
      if (__DEV__) {
        console.warn('[recommendations] Invalid callable response shape', {
          questionnaireId: payload?.questionnaireId || null,
          resultMode: data?.resultMode,
          hasProductMatches: Array.isArray(data?.productMatches),
          hasPackageMatches: Array.isArray(data?.packageMatches),
          hasAskedQuestionIds: Array.isArray(data?.askedQuestionIds),
          hasAskedKeys: Array.isArray(data?.askedKeys),
          hasInput: Boolean(data?.input && typeof data.input === 'object'),
        });
      }
      throw new Error(texts.callableGeneric);
    }

    return data;
  } catch (error) {
    if (__DEV__) {
      console.warn('[recommendations] computeRecommendations failed', {
        questionnaireId: payload?.questionnaireId || null,
        answersCount:
          payload?.answers && typeof payload.answers === 'object'
            ? Object.keys(payload.answers).length
            : 0,
        code: error?.code || null,
        message: error?.message || null,
      });
    }
    const mappedMessage = mapCallableErrorToMessage(error?.code);
    const wrappedError = new Error(mappedMessage);

    wrappedError.code = error?.code || 'functions/unknown';
    wrappedError.original = error;

    throw wrappedError;
  }
};

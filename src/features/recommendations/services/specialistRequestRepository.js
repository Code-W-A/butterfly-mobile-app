/** @format */

import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { initializeFirebase } from '@services/Firebase';

import { requireRecommendationUser } from './firebaseRecommendationAuth';
import { getMatchPackageIds, getMatchProductIds } from './recommendationMapper';

export const createSpecialistRequest = async ({
  questionnaireId,
  answers,
  note,
  contact,
  recommendationResponse,
  userId,
}) => {
  const firebaseSetup = initializeFirebase();

  if (!firebaseSetup.db || !firebaseSetup.auth) {
    throw new Error('Firestore nu este inițializat.');
  }

  const user = await requireRecommendationUser(firebaseSetup.auth);
  const resolvedUserId = userId || user?.uid;

  if (!resolvedUserId) {
    throw new Error('Nu există utilizator pentru trimiterea cererii.');
  }

  const requestsRef = collection(
    firebaseSetup.db,
    'users',
    resolvedUserId,
    'specialistRequests',
  );
  const requestRef = doc(requestsRef);

  const payload = {
    requestId: requestRef.id,
    createdAt: serverTimestamp(),
    status: 'new',
    questionnaireId,
    answers,
    note: note || '',
    contact: {
      name: contact?.name || '',
      phone: contact?.phone || '',
      email: contact?.email || '',
    },
    matchProductIds: getMatchProductIds(recommendationResponse),
    matchPackageIds: getMatchPackageIds(recommendationResponse),
    askedQuestionIds: Array.isArray(recommendationResponse?.askedQuestionIds)
      ? recommendationResponse.askedQuestionIds
      : [],
    skippedQuestions: Array.isArray(recommendationResponse?.skippedQuestions)
      ? recommendationResponse.skippedQuestions
      : [],
    source: 'recommendation_test',
  };

  await setDoc(requestRef, payload);

  return {
    requestId: requestRef.id,
    payload,
  };
};

/** @format */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { initializeFirebase } from '@services/Firebase';

const getTimestampMs = value => {
  if (!value) {
    return 0;
  }

  if (typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  if (typeof value.seconds === 'number') {
    return value.seconds * 1000;
  }

  return 0;
};

const sortByOrderAsc = (a, b) => {
  const aOrder =
    typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
  const bOrder =
    typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
  return aOrder - bOrder;
};

const isQuestionnaireRecommended = questionnaire => {
  if (!questionnaire || typeof questionnaire !== 'object') {
    return false;
  }

  return questionnaire.isRecommend === true;
};

export const getActiveQuestionnaires = async () => {
  const firebaseSetup = initializeFirebase();

  if (!firebaseSetup.db) {
    throw new Error('Firestore nu este inițializat.');
  }

  const questionnairesRef = collection(firebaseSetup.db, 'questionnaires');
  const questionnairesQuery = query(
    questionnairesRef,
    where('active', '==', true),
  );
  const snapshot = await getDocs(questionnairesQuery);

  const questionnaires = snapshot.docs.map(docSnapshot => ({
    id: docSnapshot.id,
    ...docSnapshot.data(),
  }));

  questionnaires.sort((first, second) => {
    const firstRecommended = isQuestionnaireRecommended(first);
    const secondRecommended = isQuestionnaireRecommended(second);

    if (firstRecommended !== secondRecommended) {
      return firstRecommended ? -1 : 1;
    }

    const updatedDiff =
      getTimestampMs(second.updatedAt) - getTimestampMs(first.updatedAt);

    if (updatedDiff !== 0) {
      return updatedDiff;
    }

    return getTimestampMs(second.createdAt) - getTimestampMs(first.createdAt);
  });

  return questionnaires;
};

export const getQuestionsForQuestionnaire = async questionnaireId => {
  const firebaseSetup = initializeFirebase();

  if (!firebaseSetup.db) {
    throw new Error('Firestore nu este inițializat.');
  }

  const questionsRef = collection(
    firebaseSetup.db,
    'questionnaires',
    questionnaireId,
    'questions',
  );

  const questionsQuery = query(questionsRef, where('active', '==', true));
  const snapshot = await getDocs(questionsQuery);

  const questions = snapshot.docs
    .map(docSnapshot => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }))
    .map(question => ({
      ...question,
      options: Array.isArray(question.options)
        ? [...question.options].sort(sortByOrderAsc)
        : [],
    }))
    .sort(sortByOrderAsc);

  return questions;
};

export const getQuestionnaireById = async questionnaireId => {
  const firebaseSetup = initializeFirebase();

  if (!firebaseSetup.db) {
    throw new Error('Firestore nu este inițializat.');
  }

  if (!questionnaireId) {
    return null;
  }

  const questionnaireRef = doc(firebaseSetup.db, 'questionnaires', questionnaireId);
  const snapshot = await getDoc(questionnaireRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

export const getQuestionnaireWithQuestionsById = async questionnaireId => {
  if (!questionnaireId) {
    return getActiveQuestionnaireWithQuestions();
  }

  const questionnaire = await getQuestionnaireById(questionnaireId);

  if (!questionnaire) {
    return getActiveQuestionnaireWithQuestions();
  }

  const questions = await getQuestionsForQuestionnaire(questionnaire.id);

  return {
    questionnaire,
    questions,
  };
};

export const getActiveQuestionnaireWithQuestions = async () => {
  const questionnaires = await getActiveQuestionnaires();
  const questionnaire = questionnaires[0] || null;

  if (!questionnaire) {
    return {
      questionnaire: null,
      questions: [],
    };
  }

  const questions = await getQuestionsForQuestionnaire(questionnaire.id);

  return {
    questionnaire,
    questions,
  };
};

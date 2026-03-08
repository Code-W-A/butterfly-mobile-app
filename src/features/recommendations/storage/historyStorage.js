/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const HISTORY_KEY = '@recommendations:history:v1';
const MAX_HISTORY_ITEMS = 50;
const REMOTE_SYNC_TTL_MS = 60 * 1000;

let lastRemoteHistorySyncAt = 0;

const parseHistory = value => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (_error) {
    return [];
  }
};

const getTimestampMs = value => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (value && typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  if (value && typeof value.seconds === 'number') {
    return value.seconds * 1000;
  }

  return 0;
};

const normalizeHistorySession = session => {
  const sessionId =
    typeof session?.sessionId === 'string' ? session.sessionId : '';

  if (!sessionId) {
    return null;
  }

  return {
    sessionId,
    questionnaireId:
      typeof session?.questionnaireId === 'string'
        ? session.questionnaireId
        : '',
    answers:
      session?.answers &&
      typeof session.answers === 'object' &&
      !Array.isArray(session.answers)
        ? session.answers
        : {},
    createdAt: getTimestampMs(session?.createdAt) || Date.now(),
    resultMode: session?.resultMode === 'packages' ? 'packages' : 'products',
    resultIds: {
      productIds: Array.isArray(session?.resultIds?.productIds)
        ? session.resultIds.productIds.filter(item => typeof item === 'string')
        : [],
      packageIds: Array.isArray(session?.resultIds?.packageIds)
        ? session.resultIds.packageIds.filter(item => typeof item === 'string')
        : [],
    },
    askedQuestionIds: Array.isArray(session?.askedQuestionIds)
      ? session.askedQuestionIds.filter(item => typeof item === 'string')
      : [],
    skippedQuestions: Array.isArray(session?.skippedQuestions)
      ? session.skippedQuestions
      : [],
    responseSnapshot:
      session?.responseSnapshot &&
      typeof session.responseSnapshot === 'object' &&
      !Array.isArray(session.responseSnapshot)
        ? session.responseSnapshot
        : null,
  };
};

const normalizeHistorySessions = sessions => {
  return [...sessions]
    .map(normalizeHistorySession)
    .filter(Boolean)
    .sort((first, second) => second.createdAt - first.createdAt)
    .slice(0, MAX_HISTORY_ITEMS);
};

const mergeHistorySessions = (localSessions, remoteSessions) => {
  const sessionsById = new Map();

  [...localSessions, ...remoteSessions].forEach(session => {
    const normalizedSession = normalizeHistorySession(session);

    if (!normalizedSession) {
      return;
    }

    const existingSession = sessionsById.get(normalizedSession.sessionId);

    if (
      !existingSession ||
      normalizedSession.createdAt >= Number(existingSession.createdAt || 0)
    ) {
      sessionsById.set(normalizedSession.sessionId, normalizedSession);
    }
  });

  return normalizeHistorySessions(Array.from(sessionsById.values()));
};

const getLocalHistorySessions = async () => {
  const storedValue = await AsyncStorage.getItem(HISTORY_KEY);
  return normalizeHistorySessions(parseHistory(storedValue));
};

const getRemoteContext = async () => {
  try {
    const { initializeFirebase } = require('@services/Firebase');
    const {
      requireRecommendationUser,
    } = require('../services/firebaseRecommendationAuth');
    const firestore = require('firebase/firestore');
    const firebaseSetup = initializeFirebase();

    if (!firebaseSetup?.db || !firebaseSetup?.auth) {
      return null;
    }

    const user = await requireRecommendationUser(firebaseSetup.auth);

    if (!user?.uid) {
      return null;
    }

    return {
      db: firebaseSetup.db,
      userId: user.uid,
      firestore,
    };
  } catch (_error) {
    return null;
  }
};

const readRemoteHistorySessions = async () => {
  const context = await getRemoteContext();

  if (!context) {
    return null;
  }

  const { collection, getDocs, limit, query } = context.firestore;
  const historyRef = collection(
    context.db,
    'users',
    context.userId,
    'recommendationHistory',
  );
  const historyQuery = query(historyRef, limit(MAX_HISTORY_ITEMS));
  const snapshot = await getDocs(historyQuery);

  return normalizeHistorySessions(
    snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data() || {};

      return {
        sessionId: data.sessionId || docSnapshot.id,
        questionnaireId: data.questionnaireId || '',
        answers: data.answers || {},
        createdAt:
          getTimestampMs(data.createdAt) || getTimestampMs(data.updatedAt),
        resultMode: data.resultMode,
        resultIds: data.resultIds || {},
        askedQuestionIds: data.askedQuestionIds || [],
        skippedQuestions: data.skippedQuestions || [],
        responseSnapshot:
          data.responseSnapshot &&
          typeof data.responseSnapshot === 'object' &&
          !Array.isArray(data.responseSnapshot)
            ? data.responseSnapshot
            : null,
      };
    }),
  );
};

const saveRemoteHistorySession = async session => {
  const context = await getRemoteContext();

  if (!context || !session?.sessionId) {
    return false;
  }

  const { doc, setDoc } = context.firestore;
  const sessionRef = doc(
    context.db,
    'users',
    context.userId,
    'recommendationHistory',
    session.sessionId,
  );

  await setDoc(
    sessionRef,
    {
      ...session,
      createdAt: Number(session.createdAt || Date.now()),
      updatedAt: Date.now(),
    },
    { merge: true },
  );

  return true;
};

const shouldSyncFromRemote = forceRemote => {
  if (forceRemote) {
    return true;
  }

  return Date.now() - lastRemoteHistorySyncAt > REMOTE_SYNC_TTL_MS;
};

export const getHistorySessions = async (options = {}) => {
  const { forceRemote = false } = options;
  const localSessions = await getLocalHistorySessions();

  if (!shouldSyncFromRemote(forceRemote)) {
    return localSessions;
  }

  try {
    const remoteSessions = await readRemoteHistorySessions();

    if (!Array.isArray(remoteSessions)) {
      return localSessions;
    }

    const mergedSessions = mergeHistorySessions(localSessions, remoteSessions);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(mergedSessions));
    lastRemoteHistorySyncAt = Date.now();

    return mergedSessions;
  } catch (_error) {
    return localSessions;
  }
};

export const saveHistorySessions = async sessions => {
  const normalized = normalizeHistorySessions(sessions);

  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(normalized));

  return normalized;
};

export const resetHistoryStorageState = () => {
  lastRemoteHistorySyncAt = 0;
};

export const appendHistorySession = async session => {
  const normalizedSession = normalizeHistorySession(session);

  if (!normalizedSession) {
    return getLocalHistorySessions();
  }

  const sessions = await getLocalHistorySessions();
  const nextSessions = await saveHistorySessions([
    normalizedSession,
    ...sessions,
  ]);
  saveRemoteHistorySession(normalizedSession).catch(() => null);
  return nextSessions;
};

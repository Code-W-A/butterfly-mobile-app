/** @format */

import {
  getMatchPackageIds,
  getMatchProductIds,
  getResultMode,
} from './recommendationMapper';
import {
  appendHistorySession,
  getHistorySessions,
  saveHistorySessions,
} from '../storage/historyStorage';

const createSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const buildHistorySession = ({ questionnaireId, answers, response }) => {
  const responseSnapshot =
    response && typeof response === 'object' ? response : null;

  return {
    sessionId: createSessionId(),
    questionnaireId,
    answers,
    createdAt: Date.now(),
    resultMode: getResultMode(response),
    resultIds: {
      productIds: getMatchProductIds(response),
      packageIds: getMatchPackageIds(response),
    },
    askedQuestionIds: Array.isArray(response?.askedQuestionIds)
      ? response.askedQuestionIds
      : [],
    skippedQuestions: Array.isArray(response?.skippedQuestions)
      ? response.skippedQuestions
      : [],
    responseSnapshot,
  };
};

export const storeHistorySession = async payload => {
  const session = buildHistorySession(payload);
  await appendHistorySession(session);
  return session;
};

export const loadHistorySessions = async () => {
  return getHistorySessions();
};

export const replaceHistorySessions = async sessions => {
  return saveHistorySessions(sessions);
};

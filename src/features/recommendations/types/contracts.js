/** @format */

/**
 * @typedef {Object} VisibilityRule
 * @property {string} questionId
 * @property {string[]} optionValues
 */

/**
 * @typedef {Object} QuestionDoc
 * @property {string} id
 * @property {boolean} active
 * @property {number} order
 * @property {string} type
 * @property {string} key
 * @property {string} label
 * @property {string=} helpText
 * @property {{ value: string, label: string, order?: number, active?: boolean }[]=} options
 * @property {VisibilityRule[]=} visibilityRules
 * @property {{ required?: boolean }=} validation
 */

/**
 * @typedef {Object} QuestionnaireDoc
 * @property {string} id
 * @property {boolean} active
 * @property {string} title
 * @property {string=} linkedRuleSetId
 * @property {any=} createdAt
 * @property {any=} updatedAt
 */

/**
 * @typedef {Object} RecommendationCallableRequest
 * @property {string} questionnaireId
 * @property {Record<string, unknown>} answers
 * @property {boolean=} debug
 */

/**
 * @typedef {Object} RecommendationCallableResponse
 * @property {string=} questionnaireId
 * @property {Record<string, unknown>} input
 * @property {string[]} askedQuestionIds
 * @property {string[]} askedKeys
 * @property {{ questionId: string, reason: string }[]} skippedQuestions
 * @property {number} minMatchPercent
 * @property {number} orderedQuestionCount
 * @property {number} totalQuestionCount
 * @property {'packages'|'products'} resultMode
 * @property {Array<{ product: any, scenario?: any, fitScore?: number, matchPercent?: number, matchedPreferences?: string[] }>} productMatches
 * @property {Array<{ package: any, scenario?: any, fitScore?: number, matchPercent?: number, matchedPreferences?: string[] }>} packageMatches
 */

/**
 * @typedef {Object} SpecialistRequestDoc
 * @property {string} requestId
 * @property {any} createdAt
 * @property {'new'|'in_progress'|'sent'} status
 * @property {string} questionnaireId
 * @property {Record<string, unknown>} answers
 * @property {string=} note
 * @property {{name: string, phone?: string, email: string}} contact
 * @property {string[]} matchProductIds
 * @property {string[]} matchPackageIds
 * @property {string[]} askedQuestionIds
 * @property {{questionId: string, reason: string}[]} skippedQuestions
 * @property {'recommendation_test'} source
 */

/**
 * @typedef {Object} RecommendationHistorySession
 * @property {string} sessionId
 * @property {string} questionnaireId
 * @property {Record<string, unknown>} answers
 * @property {number} createdAt
 * @property {'packages'|'products'} resultMode
 * @property {{ productIds: string[], packageIds: string[] }} resultIds
 * @property {string[]} askedQuestionIds
 * @property {{questionId: string, reason: string}[]} skippedQuestions
 * @property {RecommendationCallableResponse|null=} responseSnapshot
 */

/**
 * @typedef {Object} FavoriteProductItem
 * @property {string} productId
 * @property {number} createdAt
 * @property {Record<string, unknown>} productSnapshot
 */

export const normalizeVisibilityRules = rules => {
  if (!Array.isArray(rules)) {
    return [];
  }

  return rules
    .filter(rule => rule && typeof rule.questionId === 'string')
    .map(rule => ({
      questionId: rule.questionId,
      optionValues: Array.isArray(rule.optionValues)
        ? rule.optionValues.filter(value => typeof value === 'string')
        : [],
    }));
};

export const validateRecommendationCallableRequest = payload => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  if (!payload.questionnaireId || typeof payload.questionnaireId !== 'string') {
    return false;
  }

  if (
    !payload.answers ||
    typeof payload.answers !== 'object' ||
    Array.isArray(payload.answers)
  ) {
    return false;
  }

  if (
    typeof payload.debug !== 'undefined' &&
    typeof payload.debug !== 'boolean'
  ) {
    return false;
  }

  return true;
};

export const validateRecommendationCallableResponse = response => {
  if (!response || typeof response !== 'object') {
    return false;
  }

  if (
    response.resultMode !== 'packages' &&
    response.resultMode !== 'products'
  ) {
    return false;
  }

  if (!Array.isArray(response.productMatches)) {
    return false;
  }

  if (!Array.isArray(response.packageMatches)) {
    return false;
  }

  if (!Array.isArray(response.askedQuestionIds)) {
    return false;
  }

  if (!Array.isArray(response.skippedQuestions)) {
    return false;
  }

  if (!Array.isArray(response.askedKeys)) {
    return false;
  }

  if (typeof response.orderedQuestionCount !== 'number') {
    return false;
  }

  if (typeof response.totalQuestionCount !== 'number') {
    return false;
  }

  if (typeof response.minMatchPercent !== 'number') {
    return false;
  }

  if (!response.input || typeof response.input !== 'object') {
    return false;
  }

  return true;
};

export const isQuestionRequired = question => {
  return Boolean(question?.validation?.required);
};

export const normalizeQuestionType = type => {
  if (typeof type !== 'string') {
    return 'text';
  }

  const normalized = type.trim().toLowerCase();

  if (normalized === 'range') {
    return 'number';
  }

  if (
    normalized === 'single_select' ||
    normalized === 'multi_select' ||
    normalized === 'text' ||
    normalized === 'number'
  ) {
    return normalized;
  }

  return 'text';
};

export const getQuestionValueAsArray = value => {
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string');
  }

  if (typeof value === 'string' && value.length > 0) {
    return [value];
  }

  return [];
};

/** @format */

import {
  getQuestionValueAsArray,
  normalizeQuestionType,
  normalizeVisibilityRules,
} from '../types/contracts';

export const doesRuleMatchAnswer = (rule, answersByQuestionId, questionMap) => {
  const referenceQuestion = questionMap[rule.questionId];
  const referenceType = normalizeQuestionType(referenceQuestion?.type);
  const answerValue = answersByQuestionId[rule.questionId];
  const allowedValues = rule.optionValues || [];

  if (allowedValues.length === 0) {
    return true;
  }

  if (referenceType === 'multi_select') {
    const selectedValues = getQuestionValueAsArray(answerValue);
    return selectedValues.some(value => allowedValues.includes(value));
  }

  if (referenceType === 'single_select') {
    return (
      typeof answerValue === 'string' && allowedValues.includes(answerValue)
    );
  }

  const selectedValues = getQuestionValueAsArray(answerValue);
  return selectedValues.some(value => allowedValues.includes(value));
};

export const isQuestionVisible = (
  question,
  answersByQuestionId,
  questionMap,
) => {
  const rules = normalizeVisibilityRules(question?.visibilityRules);

  if (rules.length === 0) {
    return true;
  }

  return rules.every(rule =>
    doesRuleMatchAnswer(rule, answersByQuestionId, questionMap),
  );
};

export const getVisibleQuestions = (questions, answersByQuestionId) => {
  const questionMap = questions.reduce((acc, question) => {
    acc[question.id] = question;
    return acc;
  }, {});

  return questions.filter(question =>
    isQuestionVisible(question, answersByQuestionId, questionMap),
  );
};

export const pruneHiddenAnswers = (answersByQuestionId, visibleQuestions) => {
  const visibleIds = new Set(visibleQuestions.map(question => question.id));

  return Object.keys(answersByQuestionId).reduce((acc, key) => {
    if (visibleIds.has(key)) {
      acc[key] = answersByQuestionId[key];
    }
    return acc;
  }, {});
};

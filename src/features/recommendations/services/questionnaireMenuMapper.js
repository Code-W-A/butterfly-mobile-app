/** @format */

const normalizeText = value => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const mapIconName = value => {
  const normalizedValue = normalizeText(value).toLowerCase();

  if (
    normalizedValue.includes('aptitud') ||
    normalizedValue.includes('nivel') ||
    normalizedValue.includes('beginner')
  ) {
    return 'school-outline';
  }

  if (
    normalizedValue.includes('logic') ||
    normalizedValue.includes('reason') ||
    normalizedValue.includes('strategie')
  ) {
    return 'lightbulb-on-outline';
  }

  if (
    normalizedValue.includes('vitez') ||
    normalizedValue.includes('speed') ||
    normalizedValue.includes('offensive')
  ) {
    return 'speedometer';
  }

  if (
    normalizedValue.includes('control') ||
    normalizedValue.includes('allround')
  ) {
    return 'target';
  }

  return 'clipboard-text-outline';
};

export const canStartQuestionnaire = questionnaireId => {
  return normalizeText(questionnaireId).length > 0;
};

export const mapQuestionnaireToMenuItem = (
  questionnaire,
  texts = {},
  index = 0,
) => {
  if (!questionnaire || typeof questionnaire !== 'object') {
    return null;
  }

  const title =
    normalizeText(questionnaire.title) ||
    normalizeText(questionnaire.name) ||
    `${normalizeText(texts.authQuestionnaireTitleFallback) || 'Chestionar'} ${
      index + 1
    }`;
  const subtitle =
    normalizeText(questionnaire.helpText) ||
    normalizeText(questionnaire.description) ||
    normalizeText(texts.authQuestionnaireDescription) ||
    '';
  const iconName = mapIconName(
    questionnaire.key || questionnaire.title || questionnaire.name || '',
  );

  return {
    id:
      normalizeText(questionnaire.id) ||
      normalizeText(questionnaire.key) ||
      `questionnaire_${index + 1}`,
    title,
    subtitle,
    iconName,
  };
};

export const mapQuestionnaireMenuItems = (questionnaires, texts = {}) => {
  if (!Array.isArray(questionnaires)) {
    return [];
  }

  return questionnaires
    .map((questionnaire, index) =>
      mapQuestionnaireToMenuItem(questionnaire, texts, index),
    )
    .filter(Boolean);
};

export const selectQuestionnairePreview = (
  questionnaireMenuItems,
  maxItems = 2,
) => {
  if (!Array.isArray(questionnaireMenuItems)) {
    return [];
  }

  return questionnaireMenuItems.slice(0, Math.max(0, maxItems));
};

export const selectHistoryPreview = (sessions, maxItems = 3) => {
  if (!Array.isArray(sessions)) {
    return [];
  }

  return [...sessions]
    .sort((first, second) => {
      const firstCreatedAt =
        typeof first?.createdAt === 'number' ? first.createdAt : 0;
      const secondCreatedAt =
        typeof second?.createdAt === 'number' ? second.createdAt : 0;

      return secondCreatedAt - firstCreatedAt;
    })
    .slice(0, Math.max(0, maxItems));
};

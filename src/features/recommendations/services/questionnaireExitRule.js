/** @format */

const OPTION_LABEL_WORD_MATCHER = /[a-zA-Zăâîșşțţ]+/g;

export const tokenizeQuestionnaireOptionLabel = label => {
  if (typeof label !== 'string') {
    return [];
  }

  const normalizedLabel = label.trim().toLowerCase();
  if (!normalizedLabel) {
    return [];
  }

  return normalizedLabel.match(OPTION_LABEL_WORD_MATCHER) || [];
};

export const isQuestionnaireExitOptionLabel = label => {
  return tokenizeQuestionnaireOptionLabel(label).includes('nu');
};

export const handleQuestionnaireSelectOption = ({
  allowExit = false,
  option,
  nextValue,
  onExit,
  onContinue,
}) => {
  if (allowExit && isQuestionnaireExitOptionLabel(option?.label)) {
    onExit?.();
    return { didExit: true };
  }

  onContinue?.(nextValue);
  return {
    didExit: false,
    nextValue,
  };
};

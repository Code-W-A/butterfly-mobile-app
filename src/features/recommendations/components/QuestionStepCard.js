/** @format */

import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { TextInput } from '@components';
import { Color } from '@common';

import texts from '../constants/texts.ro';
import recommendationUiTokens from './recommendationUiTokens';
import SelectableOptionCard from './SelectableOptionCard';
import { normalizeQuestionType } from '../types/contracts';

const SUPPORTED_QUESTION_TYPES = new Set([
  'single_select',
  'multi_select',
  'text',
  'number',
  'range',
]);
const STEP_LABEL_COLOR =
  Platform.OS === 'android'
    ? recommendationUiTokens.questionnaire.mutedTextAndroid
    : recommendationUiTokens.questionnaire.mutedText;
const HELPER_TEXT_COLOR =
  Platform.OS === 'android'
    ? recommendationUiTokens.questionnaire.secondaryTextAndroid
    : Color.blackTextSecondary;

const QuestionStepCard = ({
  question,
  value,
  onChangeValue,
  onSelectOption,
  stepLabel,
  requiredError,
}) => {
  const rawQuestionType =
    typeof question?.type === 'string'
      ? question.type.trim().toLowerCase()
      : 'text';
  const questionType = normalizeQuestionType(question?.type);

  React.useEffect(() => {
    if (!question) {
      return;
    }

    if (__DEV__ && !SUPPORTED_QUESTION_TYPES.has(rawQuestionType)) {
      console.warn(
        `[recommendations] Tip întrebare necunoscut "${question.type}" pentru ${question.id}. Se folosește fallback text.`,
      );
    }
  }, [question, rawQuestionType]);

  const questionKeyOrLabel = `${question?.key || ''} ${question?.label || ''}`
    .trim()
    .toLowerCase();
  const isBudgetQuestion =
    questionKeyOrLabel.includes('buget') || questionKeyOrLabel.includes('budget');

  const budgetValue =
    value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const budgetMinValue =
    typeof budgetValue.min === 'number'
      ? String(budgetValue.min)
      : budgetValue.min || (typeof value === 'number' ? String(value) : '');
  const budgetMaxValue =
    typeof budgetValue.max === 'number' ? String(budgetValue.max) : budgetValue.max || '';

  const parseNumericInput = nextValue => {
    if (!nextValue) {
      return '';
    }
    const parsedValue = Number(nextValue);
    return Number.isNaN(parsedValue) ? nextValue : parsedValue;
  };

  if (!question) {
    return null;
  }

  const emitSelectOption = option => {
    if (!option) {
      return;
    }

    const optionValue = option.value;

    if (questionType === 'multi_select') {
      const currentValues = Array.isArray(value) ? value : [];
      const exists = currentValues.includes(optionValue);
      const nextValue = exists
        ? currentValues.filter(item => item !== optionValue)
        : [...currentValues, optionValue];

      if (typeof onSelectOption === 'function') {
        onSelectOption({
          question,
          option,
          nextValue,
        });
        return;
      }

      onChangeValue(nextValue);
      return;
    }

    if (typeof onSelectOption === 'function') {
      onSelectOption({
        question,
        option,
        nextValue: optionValue,
      });
      return;
    }

    onChangeValue(optionValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepLabel}>{stepLabel}</Text>
      <Text style={styles.questionLabel}>
        {question.label || texts.commonQuestion}
      </Text>

      {question.helpText ? (
        <Text style={styles.helpText}>{question.helpText}</Text>
      ) : null}

      {questionType === 'single_select' && (
        <View style={styles.optionsWrap}>
          {(question.options || []).map(option => (
            <SelectableOptionCard
              key={option.value}
              label={option.label}
              selected={value === option.value}
              onPress={() => emitSelectOption(option)}
            />
          ))}
        </View>
      )}

      {questionType === 'multi_select' && (
        <View style={styles.optionsWrap}>
          {(question.options || []).map(option => (
            <SelectableOptionCard
              key={option.value}
              label={option.label}
              selected={Array.isArray(value) && value.includes(option.value)}
              onPress={() => emitSelectOption(option)}
            />
          ))}
        </View>
      )}

      {!isBudgetQuestion && questionType === 'text' && (
        <TextInput
          value={typeof value === 'string' ? value : ''}
          onChangeText={onChangeValue}
          inputStyle={styles.textInput}
          placeholder={question.helpText || ''}
        />
      )}

      {!isBudgetQuestion && questionType === 'number' && (
        <TextInput
          value={typeof value === 'number' ? String(value) : value || ''}
          onChangeText={nextValue => {
            onChangeValue(parseNumericInput(nextValue));
          }}
          keyboardType="numeric"
          inputStyle={styles.textInput}
          placeholder={question.helpText || ''}
        />
      )}

      {isBudgetQuestion && (
        <View style={styles.budgetRow}>
          <View style={styles.budgetColumn}>
            <Text style={styles.budgetLabel}>{texts.questionnaireBudgetMinLabel}</Text>
            <TextInput
              value={budgetMinValue}
              onChangeText={nextValue =>
                onChangeValue({
                  min: parseNumericInput(nextValue),
                  max: parseNumericInput(budgetMaxValue),
                })
              }
              keyboardType="numeric"
              inputStyle={styles.textInput}
              placeholder={texts.questionnaireBudgetMinPlaceholder}
            />
          </View>
          <View style={styles.budgetColumn}>
            <Text style={styles.budgetLabel}>{texts.questionnaireBudgetMaxLabel}</Text>
            <TextInput
              value={budgetMaxValue}
              onChangeText={nextValue =>
                onChangeValue({
                  min: parseNumericInput(budgetMinValue),
                  max: parseNumericInput(nextValue),
                })
              }
              keyboardType="numeric"
              inputStyle={styles.textInput}
              placeholder={texts.questionnaireBudgetMaxPlaceholder}
            />
          </View>
        </View>
      )}

      {requiredError ? (
        <Text style={styles.errorText}>{requiredError}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    marginTop: recommendationUiTokens.questionnaire.contentTopGap,
    marginBottom: recommendationUiTokens.questionnaire.contentBottomGap,
  },
  stepLabel: {
    color: STEP_LABEL_COLOR,
    fontSize: recommendationUiTokens.typography.meta.fontSize,
    lineHeight: recommendationUiTokens.typography.meta.lineHeight,
    fontWeight: '700',
    marginBottom: 10,
  },
  questionLabel: {
    color: Color.blackTextPrimary,
    fontSize: recommendationUiTokens.typography.questionHeadline.fontSize,
    lineHeight: recommendationUiTokens.typography.questionHeadline.lineHeight,
    fontWeight: recommendationUiTokens.typography.questionHeadline.fontWeight,
    marginBottom: 12,
  },
  helpText: {
    color: HELPER_TEXT_COLOR,
    fontSize: recommendationUiTokens.typography.helper.fontSize,
    lineHeight: recommendationUiTokens.typography.helper.lineHeight,
    fontWeight: recommendationUiTokens.typography.helper.fontWeight,
    marginBottom: 18,
  },
  optionsWrap: {
    marginTop: 2,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  budgetColumn: {
    flex: 1,
  },
  budgetLabel: {
    color: Color.blackTextPrimary,
    fontSize: recommendationUiTokens.typography.meta.fontSize,
    lineHeight: recommendationUiTokens.typography.meta.lineHeight,
    fontWeight: '700',
    marginBottom: 8,
  },
  textInput: {
    minHeight: recommendationUiTokens.questionnaire.actionHeight,
    borderRadius: recommendationUiTokens.questionnaire.optionRadius,
    paddingLeft: recommendationUiTokens.questionnaire.optionPaddingHorizontal,
    paddingRight: recommendationUiTokens.questionnaire.optionPaddingHorizontal,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e9ef',
  },
  errorText: {
    marginTop: 10,
    color: Color.error,
    fontSize: recommendationUiTokens.typography.meta.fontSize,
    lineHeight: recommendationUiTokens.typography.meta.lineHeight,
  },
});

export default QuestionStepCard;

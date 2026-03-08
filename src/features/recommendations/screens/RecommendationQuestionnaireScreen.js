/** @format */

import React from 'react';
import {
  Alert,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { ButtonIndex, SafeAreaView } from '@components';
import { Color, withTheme } from '@common';
import { Icon, toast } from '@app/Omni';
import { getFirebaseUserErrorMessage } from '@services/FirebaseUserErrorMessages';

import texts from '../constants/texts.ro';
import EmptyState from '../components/EmptyState';
import PremiumContactField from '../components/PremiumContactField';
import QuestionStepCard from '../components/QuestionStepCard';
import QuestionnaireSkeleton from '../components/QuestionnaireSkeleton';
import recommendationUiTokens from '../components/recommendationUiTokens';
import { RECOMMENDATION_ROUTES } from '../navigation/routes';
import { getQuestionnaireWithQuestionsById } from '../services/questionnaireRepository';
import {
  getVisibleQuestions,
  pruneHiddenAnswers,
} from '../services/questionVisibility';
import { handleQuestionnaireSelectOption } from '../services/questionnaireExitRule';
import { isQuestionRequired } from '../types/contracts';

const isValueMissing = value => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (value && typeof value === 'object') {
    const min = value.min;
    const max = value.max;
    const hasMin = !(min === undefined || min === null || min === '');
    const hasMax = !(max === undefined || max === null || max === '');
    return !hasMin && !hasMax;
  }

  return value === undefined || value === null || value === '';
};

const isBudgetQuestion = question => {
  const keyOrLabel = `${question?.key || ''} ${question?.label || ''}`
    .trim()
    .toLowerCase();

  return keyOrLabel.includes('buget') || keyOrLabel.includes('budget');
};

const hasInvalidBudgetRange = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const hasMin = !(
    value.min === undefined ||
    value.min === null ||
    value.min === ''
  );
  const hasMax = !(
    value.max === undefined ||
    value.max === null ||
    value.max === ''
  );

  if (!hasMin || !hasMax) {
    return false;
  }

  const min = Number(value.min);
  const max = Number(value.max);

  if (Number.isNaN(min) || Number.isNaN(max)) {
    return false;
  }

  return min > max;
};
const PROGRESS_TEXT_COLOR =
  Platform.OS === 'android'
    ? recommendationUiTokens.questionnaire.secondaryTextAndroid
    : recommendationUiTokens.questionnaire.secondaryText;

const RecommendationQuestionnaireScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const userProfile = useSelector(state => state.user.user);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [questionnaire, setQuestionnaire] = React.useState(null);
  const [questions, setQuestions] = React.useState([]);
  const [answers, setAnswers] = React.useState({});
  const [stepIndex, setStepIndex] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [requiredError, setRequiredError] = React.useState('');

  const [contactName, setContactName] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [contactNote, setContactNote] = React.useState('');
  const [contactErrors, setContactErrors] = React.useState({});
  const [focusedContactField, setFocusedContactField] = React.useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);
  const requestedQuestionnaireId = route?.params?.questionnaireId || '';

  React.useEffect(() => {
    const nextName =
      `${userProfile?.first_name || ''} ${
        userProfile?.last_name || ''
      }`.trim() ||
      userProfile?.name ||
      '';
    const nextEmail = userProfile?.email || '';
    const nextPhone = userProfile?.phone || '';

    if (!contactName.trim() && nextName) {
      setContactName(nextName);
    }
    if (!contactEmail.trim() && nextEmail) {
      setContactEmail(nextEmail);
    }
    if (!contactPhone.trim() && nextPhone) {
      setContactPhone(nextPhone);
    }
  }, [contactEmail, contactName, contactPhone, userProfile]);

  const visibleQuestions = React.useMemo(() => {
    return getVisibleQuestions(questions, answers);
  }, [questions, answers]);

  React.useEffect(() => {
    const prunedAnswers = pruneHiddenAnswers(answers, visibleQuestions);

    if (Object.keys(prunedAnswers).length !== Object.keys(answers).length) {
      setAnswers(prunedAnswers);
    }

    if (stepIndex > visibleQuestions.length) {
      setStepIndex(visibleQuestions.length);
    }
  }, [answers, stepIndex, visibleQuestions]);

  const loadQuestionnaire = React.useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const data = await getQuestionnaireWithQuestionsById(
        requestedQuestionnaireId,
      );
      setQuestionnaire(data.questionnaire);
      setQuestions(data.questions);
      setAnswers({});
      setStepIndex(0);
    } catch (error) {
      const message = getFirebaseUserErrorMessage(error, texts.callableGeneric);
      setErrorMessage(message);
      toast(message);
    } finally {
      setLoading(false);
    }
  }, [requestedQuestionnaireId]);

  React.useEffect(() => {
    loadQuestionnaire();
  }, [loadQuestionnaire]);

  React.useEffect(() => {
    const keyboardDidShowSubscription = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      },
    );
    const keyboardDidHideSubscription = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowSubscription.remove();
      keyboardDidHideSubscription.remove();
    };
  }, []);

  const totalSteps = visibleQuestions.length + 1;
  const isContactStep = stepIndex === visibleQuestions.length;
  const shouldHideFooter = isContactStep && isKeyboardVisible;
  const currentQuestion = !isContactStep ? visibleQuestions[stepIndex] : null;
  const progressPercent = Math.max(
    0,
    Math.min(1, (stepIndex + 1) / Math.max(totalSteps, 1)),
  );
  const progressWidth = `${Math.round(progressPercent * 100)}%`;
  const subtitleTemplate = texts.questionnaireStepOf || '';
  const progressSubtitle = subtitleTemplate
    .replace('{{current}}', String(stepIndex + 1))
    .replace('{{total}}', String(totalSteps));

  const onBackToMenu = React.useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: RECOMMENDATION_ROUTES.AUTH }],
    });
  }, [navigation]);

  const updateQuestionAnswer = React.useCallback((questionId, nextValue) => {
    if (!questionId) {
      return;
    }

    setRequiredError('');
    setAnswers(prev => ({
      ...prev,
      [questionId]: nextValue,
    }));
  }, []);

  const onChangeQuestionValue = nextValue => {
    if (!currentQuestion) {
      return;
    }

    updateQuestionAnswer(currentQuestion.id, nextValue);
  };

  const onSelectQuestionOption = React.useCallback(
    ({ question, option, nextValue }) => {
      if (!question?.id) {
        return;
      }

      handleQuestionnaireSelectOption({
        allowExit: stepIndex === 0,
        option,
        nextValue,
        onExit: () => {
          setRequiredError('');
          Alert.alert(
            texts.questionnaireExitConfirmTitle,
            texts.questionnaireExitConfirmMessage,
            [
              {
                text: texts.questionnaireExitConfirmCancel,
                style: 'cancel',
              },
              {
                text: texts.questionnaireExitConfirmContinue,
                style: 'destructive',
                onPress: onBackToMenu,
              },
            ],
            { cancelable: true },
          );
        },
        onContinue: value => {
          updateQuestionAnswer(question.id, value);
        },
      });
    },
    [onBackToMenu, stepIndex, updateQuestionAnswer],
  );

  const validateCurrentQuestion = () => {
    if (!currentQuestion) {
      return true;
    }

    if (!isQuestionRequired(currentQuestion)) {
      return true;
    }

    const value = answers[currentQuestion.id];

    if (isBudgetQuestion(currentQuestion) && hasInvalidBudgetRange(value)) {
      setRequiredError(texts.questionnaireBudgetInvalidRange);
      return false;
    }

    const valid = !isValueMissing(value);

    if (!valid) {
      setRequiredError(texts.questionnaireRequired);
    }

    return valid;
  };

  const validateContact = () => {
    const nextErrors = {};

    if (!contactName.trim()) {
      nextErrors.name = texts.questionnaireRequired;
    }

    if (!contactEmail.trim()) {
      nextErrors.email = texts.questionnaireRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      nextErrors.email = texts.questionnaireInvalidEmail;
    }

    setContactErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const validateAllRequiredVisibleQuestions = () => {
    for (let index = 0; index < visibleQuestions.length; index += 1) {
      const question = visibleQuestions[index];

      if (!isQuestionRequired(question)) {
        continue;
      }

      const value = answers[question.id];

      if (isBudgetQuestion(question) && hasInvalidBudgetRange(value)) {
        setStepIndex(index);
        setRequiredError(texts.questionnaireBudgetInvalidRange);
        return false;
      }

      if (isValueMissing(value)) {
        setStepIndex(index);
        setRequiredError(texts.questionnaireRequired);
        return false;
      }
    }

    return true;
  };

  const onNext = () => {
    if (!validateCurrentQuestion()) {
      return;
    }

    setRequiredError('');
    setStepIndex(prev => Math.min(prev + 1, visibleQuestions.length));
  };

  const onBack = () => {
    setRequiredError('');
    setStepIndex(prev => Math.max(prev - 1, 0));
  };

  const onFinalize = async () => {
    const hasAllRequiredQuestions = validateAllRequiredVisibleQuestions();
    const isContactValid = validateContact();

    if (!hasAllRequiredQuestions || !isContactValid) {
      return;
    }

    if (!questionnaire?.id) {
      toast(texts.questionnaireNoActive);
      return;
    }

    setSubmitting(true);
    navigation.navigate(RECOMMENDATION_ROUTES.MICRO_LOADING, {
      questionnaireId: questionnaire.id,
      answers,
      contact: {
        name: contactName.trim(),
        email: contactEmail.trim(),
        phone: contactPhone.trim(),
      },
      note: contactNote.trim(),
      debug: __DEV__,
    });
    setSubmitting(false);
  };

  const footerShellStyle = React.useMemo(() => {
    return [
      styles.footerShell,
      {
        paddingBottom: Math.max(insets.bottom, 12),
      },
    ];
  }, [insets.bottom]);

  if (loading) {
    return (
      <SafeAreaView topInsetEnabled>
        <View style={styles.screen}>
          <View style={styles.container}>
            <QuestionnaireSkeleton label={texts.questionnaireLoading} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!questionnaire || questions.length === 0) {
    return (
      <SafeAreaView topInsetEnabled>
        <View style={styles.screen}>
          <View style={styles.container}>
            <EmptyState title={texts.questionnaireNoActive} />
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            <ButtonIndex
              text={texts.commonRetry}
              onPress={loadQuestionnaire}
              containerStyle={styles.emptyRetryButton}
              textStyle={styles.emptyRetryButtonText}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView topInsetEnabled>
      <View style={styles.screen}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{texts.questionnaireFinalTitle}</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.menuButton}
                onPress={onBackToMenu}
              >
                <Icon
                  name="menu"
                  size={16}
                  color={
                    recommendationUiTokens.questionnaire
                      .contactOptionalLabelColor
                  }
                />
                <Text style={styles.menuButtonText}>
                  {texts.questionnaireBackToMenu}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.progress}>{progressSubtitle}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
          </View>

          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentScrollContainer}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {isContactStep ? (
              <View style={styles.contactSection}>
                <Text style={styles.contactTitle}>
                  {texts.questionnaireContactTitle}
                </Text>
                <Text style={styles.contactSubtitle}>
                  {texts.questionnaireContactSubtitle}
                </Text>

                <PremiumContactField
                  label={texts.questionnaireContactName}
                  value={contactName}
                  onChangeText={value => {
                    setContactName(value);
                    if (contactErrors.name) {
                      setContactErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  error={contactErrors.name}
                  placeholder={texts.questionnaireContactNamePlaceholder}
                  onFocus={() => setFocusedContactField('name')}
                  onBlur={() => setFocusedContactField('')}
                  isFocused={focusedContactField === 'name'}
                />

                <PremiumContactField
                  label={texts.questionnaireContactEmail}
                  value={contactEmail}
                  onChangeText={value => {
                    setContactEmail(value);
                    if (contactErrors.email) {
                      setContactErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  error={contactErrors.email}
                  keyboardType="email-address"
                  placeholder={texts.questionnaireContactEmailPlaceholder}
                  onFocus={() => setFocusedContactField('email')}
                  onBlur={() => setFocusedContactField('')}
                  isFocused={focusedContactField === 'email'}
                />

                <PremiumContactField
                  label={texts.questionnaireContactPhone}
                  value={contactPhone}
                  onChangeText={setContactPhone}
                  keyboardType="phone-pad"
                  placeholder={texts.questionnaireContactPhonePlaceholder}
                  onFocus={() => setFocusedContactField('phone')}
                  onBlur={() => setFocusedContactField('')}
                  isFocused={focusedContactField === 'phone'}
                />

                <Text style={styles.optionalSectionLabel}>
                  {texts.questionnaireContactOptionalSection}
                </Text>
                <PremiumContactField
                  label={texts.questionnaireContactNote}
                  value={contactNote}
                  onChangeText={setContactNote}
                  placeholder={texts.questionnaireContactNotePlaceholder}
                  multiline
                  numberOfLines={4}
                  onFocus={() => setFocusedContactField('note')}
                  onBlur={() => setFocusedContactField('')}
                  isFocused={focusedContactField === 'note'}
                />
              </View>
            ) : (
              <QuestionStepCard
                question={currentQuestion}
                value={answers[currentQuestion?.id]}
                onChangeValue={onChangeQuestionValue}
                onSelectOption={onSelectQuestionOption}
                requiredError={requiredError}
                stepLabel={`Întrebare ${stepIndex + 1}`}
              />
            )}
          </ScrollView>

          {shouldHideFooter ? null : (
            <View style={footerShellStyle}>
              <View style={styles.footerActions}>
                <ButtonIndex
                  text={texts.questionnaireBack}
                  onPress={onBack}
                  containerStyle={[
                    styles.ghostButton,
                    stepIndex === 0 && styles.disabledButton,
                  ]}
                  textStyle={styles.ghostButtonText}
                  disabled={stepIndex === 0 || submitting}
                />

                {isContactStep ? (
                  <ButtonIndex
                    text={texts.questionnaireFinish}
                    onPress={onFinalize}
                    loading={submitting}
                    disabled={submitting}
                    containerStyle={styles.primaryButton}
                    textStyle={styles.primaryButtonText}
                  />
                ) : (
                  <ButtonIndex
                    text={texts.questionnaireNext}
                    onPress={onNext}
                    containerStyle={styles.primaryButton}
                    textStyle={styles.primaryButtonText}
                  />
                )}
              </View>
              {isContactStep ? (
                <Text style={styles.privacyText}>
                  {texts.questionnaireContactPrivacy}
                </Text>
              ) : null}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: recommendationUiTokens.questionnaire.background,
  },
  container: {
    flex: 1,
    paddingTop: recommendationUiTokens.spacing.questionnaireHeaderTop,
  },
  header: {
    marginHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    marginBottom: 14,
  },
  titleRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  menuButton: {
    minHeight: 40,
    borderRadius: recommendationUiTokens.radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: recommendationUiTokens.questionnaire.footerBorderColor,
  },
  menuButtonText: {
    marginLeft: 8,
    color: recommendationUiTokens.questionnaire.contactOptionalLabelColor,
    fontSize: recommendationUiTokens.typography.meta.fontSize,
    lineHeight: recommendationUiTokens.typography.meta.lineHeight,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    paddingRight: 10,
    fontSize: recommendationUiTokens.typography.questionnaireTitle.fontSize,
    lineHeight: recommendationUiTokens.typography.questionnaireTitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.questionnaireTitle.fontWeight,
    color: Color.blackTextPrimary,
  },
  progress: {
    marginTop: 4,
    marginBottom: 10,
    color: PROGRESS_TEXT_COLOR,
    fontSize: recommendationUiTokens.typography.questionnaireSubtitle.fontSize,
    lineHeight:
      recommendationUiTokens.typography.questionnaireSubtitle.lineHeight,
    fontWeight:
      recommendationUiTokens.typography.questionnaireSubtitle.fontWeight,
  },
  progressTrack: {
    width: '100%',
    height: recommendationUiTokens.questionnaire.progressHeight,
    borderRadius: 999,
    backgroundColor: recommendationUiTokens.questionnaire.progressTrackColor,
    overflow: 'hidden',
  },
  progressFill: {
    height: recommendationUiTokens.questionnaire.progressHeight,
    borderRadius: 999,
    backgroundColor: recommendationUiTokens.questionnaire.progressFillColor,
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollContainer: {
    paddingBottom: recommendationUiTokens.questionnaire.contentBottomGap,
    paddingTop: 2,
  },
  contactSection: {
    marginHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    marginTop: recommendationUiTokens.questionnaire.contentTopGap,
    marginBottom: recommendationUiTokens.questionnaire.contentBottomGap,
  },
  contactTitle: {
    fontSize: recommendationUiTokens.typography.questionHeadline.fontSize,
    lineHeight: recommendationUiTokens.typography.questionHeadline.lineHeight,
    fontWeight: recommendationUiTokens.typography.questionHeadline.fontWeight,
    color: Color.blackTextPrimary,
    marginBottom: 8,
  },
  contactSubtitle: {
    marginBottom: 18,
    color: recommendationUiTokens.questionnaire.contactSubtitleColor,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardSubtitle.fontWeight,
  },
  optionalSectionLabel: {
    marginTop: 2,
    marginBottom: 10,
    color: recommendationUiTokens.questionnaire.contactOptionalLabelColor,
    fontSize: recommendationUiTokens.typography.meta.fontSize,
    lineHeight: recommendationUiTokens.typography.meta.lineHeight,
    fontWeight: '700',
  },
  footerActions: {
    flexDirection: 'row',
    paddingHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    paddingTop: 12,
  },
  footerShell: {
    marginTop: 0,
    marginBottom: 0,
    borderTopWidth: 1,
    borderColor: recommendationUiTokens.questionnaire.footerBorderColor,
    backgroundColor: recommendationUiTokens.questionnaire.background,
  },
  ghostButton: {
    flex: 1,
    marginRight: 8,
    minHeight: recommendationUiTokens.questionnaire.actionHeight,
    borderRadius: recommendationUiTokens.radius.pill,
    borderWidth: 1,
    borderColor: recommendationUiTokens.questionnaire.ghostBorderColor,
    backgroundColor: '#fff',
  },
  ghostButtonText: {
    color: '#556170',
    fontSize: recommendationUiTokens.typography.buttonLabel.fontSize,
    lineHeight: recommendationUiTokens.typography.buttonLabel.lineHeight,
    fontWeight: recommendationUiTokens.typography.buttonLabel.fontWeight,
  },
  primaryButton: {
    flex: 1,
    minHeight: recommendationUiTokens.questionnaire.actionHeight,
    borderRadius: recommendationUiTokens.radius.pill,
    backgroundColor: Color.primary,
    marginBottom: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: recommendationUiTokens.typography.buttonLabel.fontSize,
    lineHeight: recommendationUiTokens.typography.buttonLabel.lineHeight,
    fontWeight: recommendationUiTokens.typography.buttonLabel.fontWeight,
  },
  disabledButton: {
    opacity: 0.45,
  },
  privacyText: {
    marginTop: 2,
    marginBottom: 6,
    paddingHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    textAlign: 'center',
    color: recommendationUiTokens.questionnaire.privacyTextColor,
    fontSize: recommendationUiTokens.typography.meta.fontSize,
    lineHeight: recommendationUiTokens.typography.meta.lineHeight,
  },
  errorText: {
    marginHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    marginTop: 10,
    color: Color.error,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
  },
  emptyRetryButton: {
    marginTop: 14,
    marginHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    minHeight: recommendationUiTokens.questionnaire.actionHeight,
    borderRadius: recommendationUiTokens.radius.pill,
    backgroundColor: Color.primary,
  },
  emptyRetryButtonText: {
    color: '#fff',
    fontSize: recommendationUiTokens.typography.buttonLabel.fontSize,
    lineHeight: recommendationUiTokens.typography.buttonLabel.lineHeight,
    fontWeight: recommendationUiTokens.typography.buttonLabel.fontWeight,
  },
});

export default withTheme(RecommendationQuestionnaireScreen);

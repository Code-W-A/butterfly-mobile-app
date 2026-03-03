/** @format */

import React from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

import { ButtonIndex, SafeAreaView } from '@components';
import { Color, withTheme } from '@common';
import { Icon } from '@app/Omni';
import { initializeFirebase } from '@services/Firebase';
import { getFirebaseUserProfile } from '@services/FirebaseUserProfile';
import { getFirebaseUserErrorMessage } from '@services/FirebaseUserErrorMessages';

import texts from '../constants/texts.ro';
import recommendationUiTokens from '../components/recommendationUiTokens';
import { RECOMMENDATION_ROUTES } from '../navigation/routes';
import { computeRecommendations } from '../services/recommendationCallable';
import { buildWowItems } from '../services/recommendationPresentation';
import { storeHistorySession } from '../services/sessionStore';

const MIN_LOADING_MS = 900;
const MAX_LOADING_MS = 4000;
const STEP_TICK_MS = 620;
const FINALE_DURATION_MS = 1500;
const FINALE_FADE_IN_MS = 380;
const FINALE_SCALE_UP_MS = 760;
const FINALE_SETTLE_MS = FINALE_DURATION_MS - FINALE_SCALE_UP_MS;
const IS_ANDROID = Platform.OS === 'android';
const EMPTY_CONTACT = Object.freeze({ name: '', email: '', phone: '' });
const FINALE_NAME_FALLBACK = 'prenume';

const resolveFirstName = (currentUser, profile) => {
  const profileFirstName =
    typeof profile?.firstName === 'string' ? profile.firstName.trim() : '';
  if (profileFirstName) {
    return profileFirstName;
  }

  const authDisplayName =
    typeof currentUser?.displayName === 'string' ? currentUser.displayName.trim() : '';
  if (!authDisplayName) {
    return '';
  }

  const [firstChunk] = authDisplayName.split(/\s+/);
  return firstChunk || '';
};

const LoadingStep = ({ label, state }) => {
  const iconName =
    state === 'done'
      ? 'check-circle'
      : state === 'active'
      ? 'progress-clock'
      : 'checkbox-blank-circle-outline';
  const iconColor =
    state === 'done' || state === 'active' ? Color.primary : '#94a0ae';

  return (
    <View style={styles.stepRow}>
      <Icon name={iconName} size={18} color={iconColor} />
      <Text
        style={[styles.stepLabel, state === 'active' && styles.stepLabelActive]}
      >
        {label}
      </Text>
    </View>
  );
};

const RecommendationMicroLoadingScreen = ({ route, navigation, theme }) => {
  const questionnaireId = route?.params?.questionnaireId;
  const rawAnswers = route?.params?.answers;
  const rawContact = route?.params?.contact;
  const note = route?.params?.note || '';
  const debug = Boolean(route?.params?.debug);
  const answers = React.useMemo(() => {
    return rawAnswers && typeof rawAnswers === 'object' ? rawAnswers : {};
  }, [rawAnswers]);
  const contact = React.useMemo(() => {
    return rawContact && typeof rawContact === 'object'
      ? rawContact
      : EMPTY_CONTACT;
  }, [rawContact]);

  const [phase, setPhase] = React.useState('loading');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [activeStep, setActiveStep] = React.useState(0);
  const [finaleName, setFinaleName] = React.useState(FINALE_NAME_FALLBACK);
  const attemptIdRef = React.useRef(0);
  const mountedRef = React.useRef(true);
  const finaleOpacity = React.useRef(new Animated.Value(0)).current;
  const finaleScale = React.useRef(new Animated.Value(0.92)).current;
  const finaleGlowOpacity = React.useRef(new Animated.Value(0)).current;

  const loadingSteps = React.useMemo(
    () => [
      texts.microLoadingStepOne,
      texts.microLoadingStepTwo,
      texts.microLoadingStepThree,
    ],
    [],
  );

  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (phase !== 'loading') {
      return undefined;
    }

    const interval = setInterval(() => {
      setActiveStep(previous =>
        previous < loadingSteps.length - 1 ? previous + 1 : previous,
      );
    }, STEP_TICK_MS);

    return () => clearInterval(interval);
  }, [loadingSteps.length, phase]);

  const runAttempt = React.useCallback(async () => {
    const currentAttemptId = attemptIdRef.current + 1;
    attemptIdRef.current = currentAttemptId;
    setPhase('loading');
    setErrorMessage('');
    setActiveStep(0);
    setFinaleName(FINALE_NAME_FALLBACK);
    finaleOpacity.setValue(0);
    finaleScale.setValue(0.92);
    finaleGlowOpacity.setValue(0);

    if (!questionnaireId) {
      setPhase('error');
      setErrorMessage(texts.questionnaireNoActive);
      return;
    }

    const startedAt = Date.now();
    let timeoutId = null;

    try {
      const computePromise = computeRecommendations({
        questionnaireId,
        answers,
        debug,
      });
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(texts.microLoadingTimeout));
        }, MAX_LOADING_MS);
      });

      const response = await Promise.race([computePromise, timeoutPromise]);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const elapsed = Date.now() - startedAt;

      if (elapsed < MIN_LOADING_MS) {
        await new Promise(resolve =>
          setTimeout(resolve, MIN_LOADING_MS - elapsed),
        );
      }

      if (!mountedRef.current || currentAttemptId !== attemptIdRef.current) {
        return;
      }

      const wowItems = buildWowItems(response, texts.resultsReasonFallback);
      const heroItem = wowItems[0] || null;

      await storeHistorySession({
        questionnaireId,
        answers,
        response,
      });

      if (!mountedRef.current || currentAttemptId !== attemptIdRef.current) {
        return;
      }

      const firebaseSetup = initializeFirebase();
      const currentUser = firebaseSetup?.auth?.currentUser || null;
      let nextFinaleName = FINALE_NAME_FALLBACK;
      if (currentUser) {
        await currentUser.reload?.().catch(() => null);
        const profile = await getFirebaseUserProfile(currentUser).catch(() => null);
        nextFinaleName =
          resolveFirstName(currentUser, profile) || FINALE_NAME_FALLBACK;
      }

      if (!mountedRef.current || currentAttemptId !== attemptIdRef.current) {
        return;
      }

      setFinaleName(nextFinaleName);
      setPhase('finale');
      setActiveStep(loadingSteps.length - 1);

      await new Promise(resolve => {
        Animated.sequence([
          Animated.parallel([
            Animated.timing(finaleOpacity, {
              toValue: 1,
              duration: FINALE_FADE_IN_MS,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(finaleGlowOpacity, {
              toValue: 1,
              duration: FINALE_SCALE_UP_MS,
              easing: Easing.bezier(0.22, 1, 0.36, 1),
              useNativeDriver: true,
            }),
            Animated.timing(finaleScale, {
              toValue: 1.08,
              duration: FINALE_SCALE_UP_MS,
              easing: Easing.bezier(0.22, 1, 0.36, 1),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(finaleScale, {
              toValue: 1,
              duration: FINALE_SETTLE_MS,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(finaleGlowOpacity, {
              toValue: 0.68,
              duration: FINALE_SETTLE_MS,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => resolve(null));
      });

      if (!mountedRef.current || currentAttemptId !== attemptIdRef.current) {
        return;
      }

      navigation.replace(RECOMMENDATION_ROUTES.RESULTS_WOW, {
        questionnaireId,
        answers,
        contact,
        note,
        recommendationResponse: response,
        wowItems,
        heroItem,
      });
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (!mountedRef.current || currentAttemptId !== attemptIdRef.current) {
        return;
      }

      if (__DEV__) {
        console.warn('[recommendations] Recommendation calculation error', {
          questionnaireId: questionnaireId || null,
          code: error?.code || null,
          message: error?.message || null,
          originalCode: error?.original?.code || null,
          originalMessage: error?.original?.message || null,
        });
      }

      setPhase('error');
      setErrorMessage(getFirebaseUserErrorMessage(error, texts.callableGeneric));
    }
  }, [
    answers,
    contact,
    debug,
    finaleGlowOpacity,
    finaleOpacity,
    finaleScale,
    loadingSteps.length,
    navigation,
    note,
    questionnaireId,
  ]);

  React.useEffect(() => {
    runAttempt();
  }, [runAttempt]);

  const backgroundColor = theme?.colors?.background || '#f6f8f9';

  return (
    <SafeAreaView>
      <View style={[styles.container, { backgroundColor }]}>
        {phase === 'finale' ? (
          <View style={styles.finaleOnlyWrap}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.finaleGlow,
                {
                  opacity: finaleGlowOpacity,
                  transform: [{ scale: finaleScale }],
                },
              ]}
            />
            <Animated.Text
              style={[
                styles.finaleText,
                {
                  opacity: finaleOpacity,
                  transform: [{ scale: finaleScale }],
                },
              ]}
            >
                <Text style={styles.finaleTextBrand}>Open the World</Text>
                <Text>{', '}</Text>
                <Text style={styles.finaleTextName}>{finaleName}</Text>
                <Text>{'!'}</Text>
            </Animated.Text>
          </View>
        ) : (
          <View style={styles.card}>
            {phase === 'loading' ? (
              <>
                <Text style={styles.title}>{texts.microLoadingTitle}</Text>
                <Text style={styles.subtitle}>{texts.microLoadingSubtitle}</Text>
                <View style={styles.stepsWrap}>
                  {loadingSteps.map((stepLabel, index) => {
                    const state =
                      index < activeStep
                        ? 'done'
                        : index === activeStep
                        ? 'active'
                        : 'pending';

                    return (
                      <LoadingStep
                        key={`${stepLabel}-${index}`}
                        label={stepLabel}
                        state={state}
                      />
                    );
                  })}
                </View>
              </>
            ) : (
              <View style={styles.stepsWrap}>
                <Text style={styles.title}>{texts.microLoadingTitle}</Text>
                <Text style={styles.subtitle}>{texts.microLoadingSubtitle}</Text>
                <View style={styles.errorWrap}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                  <ButtonIndex
                    text={texts.commonRetry}
                    onPress={runAttempt}
                    containerStyle={styles.retryButton}
                  />
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5ebf2',
    backgroundColor: '#fff',
    padding: 16,
    ...recommendationUiTokens.shadow.card,
  },
  title: {
    color: Color.blackTextPrimary,
    fontSize: 24,
    lineHeight: IS_ANDROID ? 30 : 31,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  subtitle: {
    marginTop: 8,
    color: Color.blackTextSecondary,
    fontSize: 14,
    lineHeight: IS_ANDROID ? 19 : 20,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  stepsWrap: {
    marginTop: 18,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepLabel: {
    marginLeft: 10,
    color: '#6d7785',
    fontSize: 14,
    lineHeight: IS_ANDROID ? 18 : 19,
    fontWeight: '500',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  stepLabelActive: {
    color: Color.blackTextPrimary,
    fontWeight: '700',
  },
  errorWrap: {
    marginTop: 14,
  },
  finaleOnlyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finaleGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(233, 65, 144, 0.16)',
  },
  finaleText: {
    color: Color.blackTextPrimary,
    fontSize: 28,
    lineHeight: IS_ANDROID ? 34 : 35,
    fontWeight: '700',
    textAlign: 'center',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  finaleTextBrand: {
    color: Color.blackTextPrimary,
  },
  finaleTextName: {
    color: Color.primary,
  },
  errorText: {
    color: Color.error,
    fontSize: 13,
    lineHeight: IS_ANDROID ? 17 : 18,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  retryButton: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: Color.primary,
  },
});

export default withTheme(RecommendationMicroLoadingScreen);

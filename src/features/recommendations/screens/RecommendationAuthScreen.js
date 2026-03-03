/** @format */

import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ButtonIndex, SafeAreaView } from '@components';
import { Icon, toast } from '@app/Omni';
import { Color, Images, withTheme } from '@common';
import { ROUTER } from '@navigation/constants';
import { initializeFirebase } from '@services/Firebase';
import { getFirebaseUserProfile } from '@services/FirebaseUserProfile';
import { getFirebaseUserErrorMessage } from '@services/FirebaseUserErrorMessages';

import RecommendationHeroCard from '../components/RecommendationHeroCard';
import RecommendationQuestionnaireCard from '../components/RecommendationQuestionnaireCard';
import RecommendationSectionHeader from '../components/RecommendationSectionHeader';
import recommendationUiTokens from '../components/recommendationUiTokens';
import {
  AuthLoadingOverlay,
  HeaderProfileSkeleton,
  HeroActionsSkeleton,
  HistoryListSkeleton,
  QuestionnaireListSkeleton,
} from '../components/RecommendationAuthSkeletons';
import texts from '../constants/texts.ro';
import { RECOMMENDATION_ROUTES } from '../navigation/routes';
import { ensureRecommendationAuth } from '../services/firebaseRecommendationAuth';
import {
  mapQuestionnaireMenuItems,
  selectHistoryPreview,
  selectQuestionnairePreview,
} from '../services/questionnaireMenuMapper';
import { computeRecommendations } from '../services/recommendationCallable';
import { getActiveQuestionnaires } from '../services/questionnaireRepository';
import { storeHistorySession } from '../services/sessionStore';
import { getHistorySessions } from '../storage/historyStorage';

const HISTORY_PREVIEW_LIMIT = 3;
const QUESTIONNAIRE_PREVIEW_LIMIT = 2;
const BACKGROUND_COLORS = ['#F5F7F8', '#FBFDFC'];
const BUTTERFLY_LOGO = require('@images/logo-main.png');

const formatSessionDate = value => {
  try {
    return new Date(value).toLocaleDateString('ro-RO');
  } catch (_error) {
    return '-';
  }
};

const RecommendationAuthScreen = ({ navigation }) => {
  const [checking, setChecking] = React.useState(false);
  const [questionnairesLoading, setQuestionnairesLoading] =
    React.useState(false);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [historyError, setHistoryError] = React.useState('');
  const [questionnaires, setQuestionnaires] = React.useState([]);
  const [historyPreview, setHistoryPreview] = React.useState([]);
  const [displayName, setDisplayName] = React.useState(
    texts.authGreetingDefault,
  );
  const [avatarUrl, setAvatarUrl] = React.useState('');

  const resolveFirstName = React.useCallback((currentUser, profile) => {
    const profileFirstName =
      typeof profile?.firstName === 'string' ? profile.firstName.trim() : '';
    if (profileFirstName) {
      return profileFirstName;
    }

    const authDisplayName =
      typeof currentUser?.displayName === 'string'
        ? currentUser.displayName.trim()
        : '';
    if (!authDisplayName) {
      return '';
    }

    const [firstChunk] = authDisplayName.split(/\s+/);
    return firstChunk || '';
  }, []);

  const questionnaireMenuItems = React.useMemo(() => {
    return mapQuestionnaireMenuItems(questionnaires, texts);
  }, [questionnaires]);

  const questionnairePreview = React.useMemo(() => {
    return selectQuestionnairePreview(
      questionnaireMenuItems,
      QUESTIONNAIRE_PREVIEW_LIMIT,
    );
  }, [questionnaireMenuItems]);
  const questionnaireTitleById = React.useMemo(() => {
    return questionnaireMenuItems.reduce((accumulator, item) => {
      if (item?.id) {
        accumulator[item.id] = item.title || '-';
      }
      return accumulator;
    }, {});
  }, [questionnaireMenuItems]);

  const canOpenQuestionnaireLibrary =
    questionnaireMenuItems.length > QUESTIONNAIRE_PREVIEW_LIMIT;

  const loadQuestionnaires = React.useCallback(async () => {
    setQuestionnairesLoading(true);

    try {
      const items = await getActiveQuestionnaires();
      setQuestionnaires(items);
    } finally {
      setQuestionnairesLoading(false);
    }
  }, []);

  const loadHistoryPreview = React.useCallback(async () => {
    setHistoryLoading(true);

    try {
      const sessions = await getHistorySessions({ forceRemote: false });
      setHistoryPreview(selectHistoryPreview(sessions, HISTORY_PREVIEW_LIMIT));
      setHistoryError('');
    } catch (error) {
      setHistoryError(getFirebaseUserErrorMessage(error, texts.callableGeneric));
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadUserProfilePreview = React.useCallback(async () => {
    const firebaseSetup = initializeFirebase();
    const currentUser = firebaseSetup?.auth?.currentUser;

    if (!currentUser) {
      setDisplayName(texts.authGreetingDefault);
      setAvatarUrl('');
      return;
    }

    // Reload auth profile so photoURL/displayName stay in sync after profile edits.
    await currentUser.reload?.().catch(() => null);

    const profile = await getFirebaseUserProfile(currentUser);
    const nextDisplayName =
      resolveFirstName(currentUser, profile) || texts.authGreetingDefault;
    const nextAvatarUrl =
      (typeof profile?.avatarUrl === 'string' ? profile.avatarUrl.trim() : '') ||
      (typeof currentUser?.photoURL === 'string' ? currentUser.photoURL.trim() : '');

    setDisplayName(nextDisplayName);
    setAvatarUrl(nextAvatarUrl);
  }, [resolveFirstName]);

  const runFirebaseCheck = React.useCallback(async () => {
    setChecking(true);
    const firebaseSetup = initializeFirebase();

    if (
      !firebaseSetup.isConfigured ||
      !firebaseSetup.app ||
      !firebaseSetup.auth
    ) {
      setErrorMessage(texts.authMissingFirebase);
      setQuestionnaires([]);
      setHistoryPreview([]);
      setChecking(false);
      return;
    }

    if (firebaseSetup.error) {
      setErrorMessage(
        getFirebaseUserErrorMessage(firebaseSetup.error, texts.callableGeneric),
      );
      setQuestionnaires([]);
      setHistoryPreview([]);
      setChecking(false);
      return;
    }

    try {
      await ensureRecommendationAuth(firebaseSetup.auth);
      await loadUserProfilePreview();
      setErrorMessage('');
      await Promise.all([loadQuestionnaires(), loadHistoryPreview()]);
    } catch (error) {
      setQuestionnaires([]);
      setHistoryPreview([]);
      setErrorMessage(getFirebaseUserErrorMessage(error, texts.callableGeneric));
    } finally {
      setChecking(false);
    }
  }, [loadHistoryPreview, loadQuestionnaires, loadUserProfilePreview]);

  React.useEffect(() => {
    runFirebaseCheck();
  }, [runFirebaseCheck]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserProfilePreview().catch(() => null);
      loadHistoryPreview();
    });

    return unsubscribe;
  }, [loadHistoryPreview, loadUserProfilePreview, navigation]);

  const onOpenQuestionnaire = questionnaireId => {
    if (!questionnaireId) {
      toast(texts.authQuestionnaireMissing);
      return;
    }

    navigation.replace(RECOMMENDATION_ROUTES.QUESTIONNAIRE, {
      questionnaireId,
    });
  };

  const onStartPrimaryTest = () => {
    const firstQuestionnaireId = questionnairePreview[0]?.id;

    if (firstQuestionnaireId) {
      onOpenQuestionnaire(firstQuestionnaireId);
      return;
    }

    navigation.navigate(RECOMMENDATION_ROUTES.QUESTIONNAIRE_LIBRARY);
  };

  const onOpenQuestionnaireLibrary = () => {
    navigation.navigate(RECOMMENDATION_ROUTES.QUESTIONNAIRE_LIBRARY);
  };

  const onOpenHistoryLibrary = () => {
    navigation.navigate(RECOMMENDATION_ROUTES.HISTORY_LIBRARY);
  };
  const onOpenHistorySession = async session => {
    if (!session) {
      return;
    }

    try {
      let response =
        session?.responseSnapshot &&
        typeof session.responseSnapshot === 'object'
          ? session.responseSnapshot
          : null;

      if (!response) {
        response = await computeRecommendations({
          questionnaireId: session.questionnaireId,
          answers: session.answers,
          debug: __DEV__,
        });

        await storeHistorySession({
          questionnaireId: session.questionnaireId,
          answers: session.answers,
          response,
        });
      }

      navigation.navigate(RECOMMENDATION_ROUTES.RESULTS_WOW, {
        recommendationResponse: response,
        questionnaireId: session.questionnaireId,
        answers:
          session?.answers && typeof session.answers === 'object'
            ? session.answers
            : {},
        fromHistory: true,
      });
    } catch (error) {
      toast(getFirebaseUserErrorMessage(error, texts.callableGeneric));
    }
  };

  const onOpenMStoreProfile = () => {
    const profileInRootParams = {
      screen: ROUTER.APP,
      params: {
        screen: ROUTER.USER_PROFILE_STACK,
      },
    };

    try {
      const parentNavigator = navigation.getParent?.();
      const parentState = parentNavigator?.getState?.();

      if (parentState?.routeNames?.includes(ROUTER.USER_PROFILE_STACK)) {
        parentNavigator.navigate(ROUTER.USER_PROFILE_STACK);
        return;
      }

      const currentState = navigation.getState?.();

      if (currentState?.routeNames?.includes(ROUTER.USER_PROFILE_STACK)) {
        navigation.navigate(ROUTER.USER_PROFILE_STACK);
        return;
      }

      navigation.navigate(ROUTER.ROOT, profileInRootParams);
    } catch (_error) {
      navigation.navigate(ROUTER.ROOT, profileInRootParams);
    }
  };

  const showQuestionnaireEmpty =
    !checking && !questionnairesLoading && questionnaireMenuItems.length === 0;

  return (
    <SafeAreaView>
      <LinearGradient
        colors={BACKGROUND_COLORS}
        style={styles.gradientContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.container}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {checking ? (
              <>
                <HeaderProfileSkeleton />
                <HeroActionsSkeleton />
              </>
            ) : (
              <>
                <View style={styles.headerRow}>
                  <View style={styles.headerLeft}>
                    <View style={styles.logoWrap}>
                      <Image
                        source={BUTTERFLY_LOGO}
                        resizeMode="contain"
                        style={styles.logo}
                      />
                    </View>
                    <Text style={styles.headerGreeting}>
                      <Text style={styles.headerGreetingBrand}>Open the World</Text>
                      {', '}
                      <Text style={styles.headerGreetingName}>{displayName}</Text>
                      <Text style={styles.headerGreetingExclamation}>{' !'}</Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.avatarWrap}
                    onPress={onOpenMStoreProfile}
                  >
                    <Image
                      source={avatarUrl ? { uri: avatarUrl } : Images.defaultAvatar}
                      resizeMode="cover"
                      style={styles.avatarImage}
                    />
                  </TouchableOpacity>
                </View>

                <RecommendationHeroCard
                  title={texts.authHeroTitle}
                  subtitle={texts.authHeroValueProposition}
                  primaryLabel={texts.authHeroPrimaryAction}
                  onPrimaryPress={onStartPrimaryTest}
                  secondaryLabel={texts.authHeroSecondaryAction}
                  onSecondaryPress={onOpenQuestionnaireLibrary}
                  disabledPrimary={questionnairesLoading}
                />
              </>
            )}

            <View style={styles.section}>
              <RecommendationSectionHeader
                title={texts.authQuestionnairesSectionTitle}
                actionLabel={
                  canOpenQuestionnaireLibrary ? texts.commonViewAll : undefined
                }
                onActionPress={onOpenQuestionnaireLibrary}
              />

              {questionnairesLoading && !checking ? (
                <QuestionnaireListSkeleton count={QUESTIONNAIRE_PREVIEW_LIMIT} />
              ) : null}

              {errorMessage ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                  <ButtonIndex
                    text={texts.authRetry}
                    onPress={runFirebaseCheck}
                    containerStyle={styles.retryButton}
                  />
                </View>
              ) : null}

              {showQuestionnaireEmpty ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>
                    {texts.authQuestionnaireFallback}
                  </Text>
                </View>
              ) : null}

              {questionnairePreview.map(item => (
                <RecommendationQuestionnaireCard
                  key={item.id}
                  title={item.title}
                  subtitle={item.subtitle}
                  iconName={item.iconName}
                  onPress={() => onOpenQuestionnaire(item.id)}
                />
              ))}
            </View>

            <View style={styles.section}>
              <RecommendationSectionHeader
                title={texts.authHistoryTitle}
                actionLabel={texts.commonViewAll}
                onActionPress={onOpenHistoryLibrary}
              />

              {historyLoading && !checking ? <HistoryListSkeleton count={3} /> : null}

              {historyError ? (
                <Text style={styles.historyErrorText}>{historyError}</Text>
              ) : null}

              {!historyLoading && historyPreview.length === 0 ? (
                <View style={styles.historyEmptyCard}>
                  <Text style={styles.historyEmptyTitle}>
                    {texts.authHistoryEmpty}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.historyEmptyAction}
                    onPress={onStartPrimaryTest}
                  >
                    <Text style={styles.historyEmptyActionText}>
                      {texts.authHistoryEmptyAction}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {historyPreview.map(session => (
                <TouchableOpacity
                  key={session.sessionId}
                  style={styles.historyCard}
                  activeOpacity={0.88}
                  onPress={() => onOpenHistorySession(session)}
                >
                  <View style={styles.historyIconWrap}>
                    <Icon name="history" color={Color.primary} size={17} />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyPrimaryLine}>
                      {formatSessionDate(session.createdAt)}
                    </Text>
                    <Text style={styles.historySecondaryLine}>
                      {texts.authHistoryQuestionnaireLabel}:{' '}
                      {questionnaireTitleById[session.questionnaireId] || '-'}
                    </Text>
                    <Text style={styles.historySecondaryLine}>
                      {texts.authHistoryResultLabel}: {session.resultMode}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        {checking ? <AuthLoadingOverlay logoSource={BUTTERFLY_LOGO} /> : null}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: recommendationUiTokens.spacing.screenHorizontal,
  },
  scroll: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: recommendationUiTokens.spacing.cardPadding,
    paddingBottom: recommendationUiTokens.spacing.contentBottom + 8,
  },
  headerRow: {
    marginBottom: recommendationUiTokens.spacing.cardPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
    paddingTop: 12,
  },
  logoWrap: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 4,
  },
  logo: {
    width: 130,
    height: 28,
    marginLeft: -40,
  },
  headerSubtitle: {
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    marginBottom: 4,
  },
  headerGreeting: {
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.cardTitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardTitle.lineHeight,
    marginBottom: 4,
  },
  headerGreetingBrand: {
    color: Color.blackTextPrimary,
    fontSize: recommendationUiTokens.typography.cardTitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardTitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.displayName.fontWeight,
  },
  headerGreetingName: {
    color: Color.primary,
    fontSize: recommendationUiTokens.typography.cardTitle.fontSize + 2,
    lineHeight: recommendationUiTokens.typography.cardTitle.lineHeight + 2,
    fontWeight: recommendationUiTokens.typography.displayName.fontWeight,
  },
  headerGreetingExclamation: {
    color: Color.blackTextPrimary,
    fontSize: recommendationUiTokens.typography.cardTitle.fontSize + 2,
    lineHeight: recommendationUiTokens.typography.cardTitle.lineHeight + 2,
    fontWeight: recommendationUiTokens.typography.displayName.fontWeight,
  },
  headerTitle: {
    color: Color.blackTextPrimary,
    fontSize: recommendationUiTokens.typography.displayName.fontSize,
    lineHeight: recommendationUiTokens.typography.displayName.lineHeight,
    fontWeight: recommendationUiTokens.typography.displayName.fontWeight,
  },
  avatarWrap: {
    width: recommendationUiTokens.radius.avatar,
    height: recommendationUiTokens.radius.avatar,
    borderRadius: recommendationUiTokens.radius.avatar / 2,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7edf2',
    overflow: 'hidden',
    ...recommendationUiTokens.shadow.card,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  section: {
    marginTop: recommendationUiTokens.spacing.sectionGap,
  },
  loadingCard: {
    borderRadius: recommendationUiTokens.radius.smallCard,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7edf2',
    padding: recommendationUiTokens.spacing.cardPadding,
    alignItems: 'center',
    ...recommendationUiTokens.shadow.card,
  },
  loadingText: {
    marginTop: 10,
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardSubtitle.fontWeight,
  },
  errorCard: {
    borderRadius: recommendationUiTokens.radius.smallCard,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ffd6d6',
    padding: recommendationUiTokens.spacing.cardPadding,
    ...recommendationUiTokens.shadow.card,
  },
  errorText: {
    color: Color.error,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    marginBottom: 12,
  },
  retryButton: {
    minHeight: 44,
    borderRadius: recommendationUiTokens.radius.pill,
    backgroundColor: '#f06d6d',
  },
  emptyCard: {
    borderRadius: recommendationUiTokens.radius.smallCard,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7edf2',
    padding: recommendationUiTokens.spacing.cardPadding,
    ...recommendationUiTokens.shadow.card,
  },
  emptyText: {
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardSubtitle.fontWeight,
  },
  historyLoadingWrap: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyErrorText: {
    marginBottom: 10,
    color: Color.error,
    fontSize: recommendationUiTokens.typography.meta.fontSize,
    lineHeight: recommendationUiTokens.typography.meta.lineHeight,
  },
  historyEmptyCard: {
    borderRadius: recommendationUiTokens.radius.smallCard,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7edf2',
    padding: recommendationUiTokens.spacing.cardPadding,
    ...recommendationUiTokens.shadow.card,
  },
  historyEmptyTitle: {
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardSubtitle.fontWeight,
    marginBottom: 12,
  },
  historyEmptyAction: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: recommendationUiTokens.radius.pill,
    backgroundColor: '#111318',
    justifyContent: 'center',
  },
  historyEmptyActionText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: recommendationUiTokens.typography.cardTitle.fontWeight,
  },
  historyCard: {
    borderRadius: recommendationUiTokens.radius.smallCard,
    borderWidth: 1,
    borderColor: '#e7edf2',
    backgroundColor: '#fff',
    paddingHorizontal: recommendationUiTokens.spacing.cardPadding,
    paddingVertical: recommendationUiTokens.spacing.cardPadding - 1,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...recommendationUiTokens.shadow.card,
  },
  historyIconWrap: {
    width: 34,
    height: 34,
    borderRadius: recommendationUiTokens.radius.pill,
    backgroundColor: '#f4f7fb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    marginLeft: 12,
    flex: 1,
  },
  historyPrimaryLine: {
    color: Color.blackTextPrimary,
    fontSize: recommendationUiTokens.typography.cardTitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardTitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardTitle.fontWeight,
    marginBottom: 4,
  },
  historySecondaryLine: {
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.meta.fontSize,
    lineHeight: recommendationUiTokens.typography.meta.lineHeight,
    fontWeight: recommendationUiTokens.typography.meta.fontWeight,
    marginBottom: 2,
  },
});

export default withTheme(RecommendationAuthScreen);

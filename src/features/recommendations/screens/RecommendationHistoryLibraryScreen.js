/** @format */

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from '@components';
import { Color, withTheme } from '@common';
import { Icon, toast } from '@app/Omni';
import { getFirebaseUserErrorMessage } from '@services/FirebaseUserErrorMessages';

import texts from '../constants/texts.ro';
import EmptyState from '../components/EmptyState';
import recommendationUiTokens from '../components/recommendationUiTokens';
import { RECOMMENDATION_ROUTES } from '../navigation/routes';
import { computeRecommendations } from '../services/recommendationCallable';
import { getQuestionnaireById } from '../services/questionnaireRepository';
import { storeHistorySession } from '../services/sessionStore';
import { getHistorySessions } from '../storage/historyStorage';
import SummaryCard from '../components/history/SummaryCard';
import SegmentControl from '../components/history/SegmentControl';
import HeroSessionCard from '../components/history/HeroSessionCard';
import SessionRowCard from '../components/history/SessionRowCard';
import {
  formatSessionDateLong,
  formatSessionDateShort,
  getModeResultCount,
  getQuestionnaireLabel,
  getSessionChips,
  getSessionModeLabel,
  sortAndFilterSessions,
} from '../services/historyPresentation';

const RecommendationHistoryLibraryScreen = ({ navigation, theme }) => {
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [sessions, setSessions] = React.useState([]);
  const [questionnaireTitleById, setQuestionnaireTitleById] = React.useState({});
  const [modeFilter, setModeFilter] = React.useState('all');
  const [sortMode, setSortMode] = React.useState('recent');

  const loadHistorySessions = React.useCallback(
    async ({ isRefresh = false } = {}) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const historySessions = await getHistorySessions({
          forceRemote: false,
        });
        setSessions(historySessions);
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(getFirebaseUserErrorMessage(error, texts.callableGeneric));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  React.useEffect(() => {
    loadHistorySessions();
  }, [loadHistorySessions]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistorySessions();
    });

    return unsubscribe;
  }, [loadHistorySessions, navigation]);

  React.useEffect(() => {
    let cancelled = false;

    const loadQuestionnaireTitles = async () => {
      const uniqueIds = Array.from(
        new Set(
          (Array.isArray(sessions) ? sessions : [])
            .map(session => session?.questionnaireId)
            .filter(Boolean),
        ),
      );

      if (!uniqueIds.length) {
        if (!cancelled) {
          setQuestionnaireTitleById({});
        }
        return;
      }

      const entries = await Promise.all(
        uniqueIds.map(async questionnaireId => {
          try {
            const questionnaire = await getQuestionnaireById(questionnaireId);
            return [questionnaireId, questionnaire?.title || ''];
          } catch (_error) {
            return [questionnaireId, ''];
          }
        }),
      );

      if (!cancelled) {
        setQuestionnaireTitleById(Object.fromEntries(entries));
      }
    };

    loadQuestionnaireTitles();

    return () => {
      cancelled = true;
    };
  }, [sessions]);

  const visibleSessions = React.useMemo(() => {
    return sortAndFilterSessions(sessions, {
      mode: modeFilter,
      sort: sortMode,
    });
  }, [modeFilter, sessions, sortMode]);
  const heroSession = visibleSessions[0] || null;
  const rowSessions = heroSession ? visibleSessions.slice(1) : [];
  const latestSession = sessions[0] || null;

  const openSessionResult = async session => {
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
        await loadHistorySessions({ isRefresh: true });
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

  const backgroundColor = theme?.colors?.background || '#fff';

  return (
    <SafeAreaView topInsetEnabled>
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={18} color={Color.blackTextPrimary} />
          </Pressable>
          <Text style={styles.title}>Istoric</Text>
          <View style={styles.backButton} />
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Color.primary} />
            <Text style={styles.loadingText}>{texts.commonLoading}</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadHistorySessions({ isRefresh: true })}
                tintColor={Color.primary}
              />
            }
          >
            {sessions.length === 0 ? (
              <EmptyState title={texts.historyEmpty} />
            ) : null}

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <SummaryCard
              sessionsCount={sessions.length}
              lastDateLabel={latestSession ? formatSessionDateLong(latestSession.createdAt) : '-'}
              onPressPrimary={() => loadHistorySessions({ isRefresh: true })}
            />

            <SegmentControl
              mode={modeFilter}
              sort={sortMode}
              onChangeMode={setModeFilter}
              onToggleSort={() =>
                setSortMode(prev => (prev === 'recent' ? 'oldest' : 'recent'))
              }
            />

            {heroSession ? (
              <HeroSessionCard
                dateLabel={formatSessionDateShort(heroSession.createdAt)}
                questionnaireLabel={getQuestionnaireLabel(
                  heroSession.questionnaireId,
                  questionnaireTitleById[heroSession.questionnaireId],
                )}
                chips={getSessionChips(heroSession, 3)}
                modeLabel={getSessionModeLabel(heroSession.resultMode)}
                count={getModeResultCount(heroSession)}
                onPressPrimary={() => {
                  openSessionResult(heroSession);
                }}
                onPressSecondary={null}
              />
            ) : null}

            {rowSessions.map(session => (
              <SessionRowCard
                key={session.sessionId}
                dateLabel={formatSessionDateShort(session.createdAt)}
                questionnaireLabel={getQuestionnaireLabel(
                  session.questionnaireId,
                  questionnaireTitleById[session.questionnaireId],
                )}
                chips={getSessionChips(session, 2)}
                modeLabel={getSessionModeLabel(session.resultMode)}
                count={getModeResultCount(session)}
                onPress={() => {
                  openSessionResult(session);
                }}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    marginTop: 12,
    marginHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f6f9',
  },
  title: {
    fontSize: recommendationUiTokens.typography.sectionTitle.fontSize,
    lineHeight: recommendationUiTokens.typography.sectionTitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.sectionTitle.fontWeight,
    color: Color.blackTextPrimary,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: recommendationUiTokens.spacing.screenHorizontal,
  },
  loadingText: {
    marginTop: 10,
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardSubtitle.fontWeight,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    paddingBottom: recommendationUiTokens.spacing.contentBottom,
  },
  errorText: {
    marginHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    marginTop: 10,
    color: Color.error,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
  },
});

export default withTheme(RecommendationHistoryLibraryScreen);

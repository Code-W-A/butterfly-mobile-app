/** @format */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Color, Styles, withTheme } from '@common';

import texts from '../constants/texts.ro';
import EmptyState from '../components/EmptyState';
import { useRecommendationFlow } from './RecommendationFlowContext';
import SummaryCard from '../components/history/SummaryCard';
import SegmentControl from '../components/history/SegmentControl';
import HeroSessionCard from '../components/history/HeroSessionCard';
import SessionRowCard from '../components/history/SessionRowCard';
import { getQuestionnaireById } from '../services/questionnaireRepository';
import {
  formatSessionDateLong,
  formatSessionDateShort,
  getModeResultCount,
  getQuestionnaireLabel,
  getSessionChips,
  getSessionModeLabel,
  sortAndFilterSessions,
} from '../services/historyPresentation';

const RecommendationHistoryScreen = ({ theme }) => {
  const { historySessions, openHistorySession, recomputeSession, recomputingSessionId } =
    useRecommendationFlow();
  const [modeFilter, setModeFilter] = React.useState('all');
  const [sortMode, setSortMode] = React.useState('recent');
  const [questionnaireTitleById, setQuestionnaireTitleById] = React.useState({});

  React.useEffect(() => {
    let cancelled = false;

    const loadQuestionnaireTitles = async () => {
      const uniqueIds = Array.from(
        new Set(
          (Array.isArray(historySessions) ? historySessions : [])
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
  }, [historySessions]);
  const visibleSessions = React.useMemo(() => {
    return sortAndFilterSessions(historySessions, {
      mode: modeFilter,
      sort: sortMode,
    });
  }, [historySessions, modeFilter, sortMode]);
  const heroSession = visibleSessions[0] || null;
  const rowSessions = heroSession ? visibleSessions.slice(1) : [];
  const latestSession = historySessions[0] || null;

  const backgroundColor = theme?.colors?.background || '#fff';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.title}>Istoric</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {historySessions.length === 0 ? (
          <EmptyState title={texts.historyEmpty} />
        ) : null}

        <SummaryCard
          sessionsCount={historySessions.length}
          lastDateLabel={latestSession ? formatSessionDateLong(latestSession.createdAt) : '-'}
          onPressPrimary={() =>
            latestSession ? recomputeSession(latestSession) : null
          }
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
            onPressPrimary={() => openHistorySession(heroSession)}
            onPressSecondary={() => recomputeSession(heroSession)}
            secondaryDisabled={Boolean(recomputingSessionId)}
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
            onPress={() => openHistorySession(session)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginTop: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    color: Color.blackTextPrimary,
    fontWeight: '700',
    fontSize: Styles.FontSize.large,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});

export default withTheme(RecommendationHistoryScreen);

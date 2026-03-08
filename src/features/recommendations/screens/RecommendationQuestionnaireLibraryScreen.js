/** @format */

import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ButtonIndex, SafeAreaView } from '@components';
import { Icon } from '@app/Omni';
import { Color, withTheme } from '@common';
import { getFirebaseUserErrorMessage } from '@services/FirebaseUserErrorMessages';

import texts from '../constants/texts.ro';
import EmptyState from '../components/EmptyState';
import recommendationUiTokens from '../components/recommendationUiTokens';
import { RECOMMENDATION_ROUTES } from '../navigation/routes';
import { getActiveQuestionnaires } from '../services/questionnaireRepository';
import { mapQuestionnaireMenuItems } from '../services/questionnaireMenuMapper';

const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderTitle}>{title}</Text>
  </View>
);

const HeroTestCard = ({ item, onPress }) => {
  if (!item) {
    return null;
  }

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroAccentStrip} />

      <View style={styles.heroCardContent}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>RECOMANDAT</Text>
        </View>

        <Text style={styles.heroTitle}>{item.title}</Text>
        <Text style={styles.heroDuration}>~3 min</Text>
        <Text style={styles.heroDescription} numberOfLines={3}>
          {item.subtitle}
        </Text>

        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.heroAction}
          onPress={onPress}
        >
          <Text style={styles.heroActionText}>Start test</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CompactTestCard = ({ item, onPress }) => {
  if (!item) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.compactCard}
      onPress={onPress}
    >
      <View style={styles.compactIcon}>
        <Icon name={item.iconName} color={Color.primary} size={18} />
      </View>

      <View style={styles.compactContent}>
        <Text style={styles.compactTitle}>{item.title}</Text>
        <Text style={styles.compactSubtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>

      <Icon name="arrow-right" color="#98a2b3" size={18} />
    </TouchableOpacity>
  );
};

const RecommendationQuestionnaireLibraryScreen = ({ navigation, theme }) => {
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [questionnaireMenuItems, setQuestionnaireMenuItems] = React.useState(
    [],
  );

  const loadQuestionnaires = React.useCallback(async () => {
    setLoading(true);

    try {
      const questionnaires = await getActiveQuestionnaires();
      setQuestionnaireMenuItems(
        mapQuestionnaireMenuItems(questionnaires, texts),
      );
      setErrorMessage('');
    } catch (error) {
      setQuestionnaireMenuItems([]);
      setErrorMessage(getFirebaseUserErrorMessage(error, texts.callableGeneric));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadQuestionnaires();
  }, [loadQuestionnaires]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadQuestionnaires();
    });

    return unsubscribe;
  }, [loadQuestionnaires, navigation]);

  const onOpenQuestionnaire = questionnaireId => {
    if (!questionnaireId) {
      return;
    }

    navigation.replace(RECOMMENDATION_ROUTES.QUESTIONNAIRE, {
      questionnaireId,
    });
  };

  const featuredQuestionnaire = questionnaireMenuItems[0];
  const alternativeQuestionnaires = questionnaireMenuItems.slice(1);
  const backgroundColor = theme?.colors?.background || '#f8fafd';

  return (
    <SafeAreaView topInsetEnabled>
      <View style={[styles.container, { backgroundColor }]}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Color.primary} />
            <Text style={styles.loadingText}>
              {texts.questionnaireLibraryLoading}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.screenHeader}>
              <Text style={styles.screenTitle}>Alege testul potrivit</Text>
              <Text style={styles.screenSubtitle}>
                Descoperă echipamentul ideal în câteva minute.
              </Text>
            </View>

            {errorMessage ? (
              <View style={styles.errorWrap}>
                <Text style={styles.errorText}>{errorMessage}</Text>
                <ButtonIndex
                  text={texts.commonRetry}
                  onPress={loadQuestionnaires}
                  containerStyle={styles.retryButton}
                />
              </View>
            ) : null}

            {questionnaireMenuItems.length === 0 ? (
              <EmptyState title={texts.questionnaireLibraryEmpty} />
            ) : null}

            {featuredQuestionnaire ? (
              <HeroTestCard
                item={featuredQuestionnaire}
                onPress={() => onOpenQuestionnaire(featuredQuestionnaire.id)}
              />
            ) : null}

            {alternativeQuestionnaires.length > 0 ? (
              <View style={styles.alternativesWrap}>
                <SectionHeader title="Teste alternative" />

                {alternativeQuestionnaires.map(item => (
                  <CompactTestCard
                    key={item.id}
                    item={item}
                    onPress={() => onOpenQuestionnaire(item.id)}
                  />
                ))}
              </View>
            ) : null}
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
    paddingTop: 12,
    paddingHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    paddingBottom: recommendationUiTokens.spacing.contentBottom,
  },
  screenHeader: {
    marginBottom: 12,
  },
  screenTitle: {
    color: Color.blackTextPrimary,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
  },
  screenSubtitle: {
    marginTop: 4,
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardSubtitle.fontWeight,
  },
  errorWrap: {
    marginBottom: 12,
    borderRadius: recommendationUiTokens.radius.smallCard,
    borderWidth: 1,
    borderColor: '#ffd6d6',
    backgroundColor: '#fff5f5',
    padding: recommendationUiTokens.spacing.cardPadding,
    ...recommendationUiTokens.shadow.card,
  },
  errorText: {
    marginBottom: 10,
    color: Color.error,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
  },
  retryButton: {
    borderRadius: recommendationUiTokens.radius.pill,
    minHeight: 44,
    backgroundColor: '#0f1115',
  },
  heroCard: {
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  heroAccentStrip: {
    height: 6,
    backgroundColor: Color.primary,
  },
  heroCardContent: {
    padding: 20,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    borderRadius: recommendationUiTokens.radius.pill,
    backgroundColor: 'rgba(240, 68, 128, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: Color.primary,
    fontSize: recommendationUiTokens.typography.meta.fontSize,
    lineHeight: recommendationUiTokens.typography.meta.lineHeight,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroTitle: {
    color: Color.blackTextPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  heroDuration: {
    marginTop: 6,
    color: '#6f7b8c',
    fontSize: recommendationUiTokens.typography.meta.fontSize,
    lineHeight: recommendationUiTokens.typography.meta.lineHeight,
    fontWeight: '600',
  },
  heroDescription: {
    marginTop: 8,
    marginBottom: 16,
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardSubtitle.fontWeight,
  },
  heroAction: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: Color.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  heroActionText: {
    color: '#fff',
    fontSize: recommendationUiTokens.typography.buttonLabel.fontSize,
    lineHeight: recommendationUiTokens.typography.buttonLabel.lineHeight,
    fontWeight: recommendationUiTokens.typography.buttonLabel.fontWeight,
  },
  alternativesWrap: {
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    color: Color.blackTextPrimary,
    fontSize: recommendationUiTokens.typography.sectionTitle.fontSize,
    lineHeight: recommendationUiTokens.typography.sectionTitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.sectionTitle.fontWeight,
  },
  compactCard: {
    minHeight: 68,
    borderRadius: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: recommendationUiTokens.radius.pill,
    backgroundColor: '#f4f7fb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  compactTitle: {
    fontSize: recommendationUiTokens.typography.cardTitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardTitle.lineHeight,
    color: Color.blackTextPrimary,
    fontWeight: recommendationUiTokens.typography.cardTitle.fontWeight,
  },
  compactSubtitle: {
    marginTop: 3,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    color: Color.blackTextSecondary,
    fontWeight: recommendationUiTokens.typography.cardSubtitle.fontWeight,
  },
});

export default withTheme(RecommendationQuestionnaireLibraryScreen);

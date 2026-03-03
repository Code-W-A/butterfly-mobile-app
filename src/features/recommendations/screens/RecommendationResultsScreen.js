/** @format */

import React from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Color, Styles, withTheme } from '@common';
import { toast } from '@app/Omni';
import { getFirebaseUserErrorMessage } from '@services/FirebaseUserErrorMessages';

import texts from '../constants/texts.ro';
import EmptyState from '../components/EmptyState';
import RecommendationCard from '../components/RecommendationCard';
import recommendationUiTokens from '../components/recommendationUiTokens';
import ResultsSortBar from '../components/ResultsSortBar';
import { RECOMMENDATION_ROUTES } from '../navigation/routes';
import {
  getMatchesByMode,
  getResultMode,
} from '../services/recommendationMapper';
import {
  SORT_CRITERIA,
  SORT_DIRECTION,
  sortRecommendationMatches,
} from '../services/sortRecommendations';
import { computeRecommendations } from '../services/recommendationCallable';
import { buildProductByIdIndex } from '../services/imageUtils';
import { resolvePackageProductContext } from '../services/packageProductResolver';
import {
  getFavoriteProducts,
  getFavoritePackages,
  isPackageFavorite,
  isProductFavorite,
  toggleFavoritePackage,
  toggleFavoriteProduct,
} from '../storage/favoritesStorage';
import {
  loadHistorySessions,
  storeHistorySession,
} from '../services/sessionStore';
import RecommendationFavoritesScreen from './RecommendationFavoritesScreen';
import RecommendationHistoryScreen from './RecommendationHistoryScreen';
import {
  RecommendationFlowProvider,
  useRecommendationFlow,
} from './RecommendationFlowContext';
import {
  getPackageItemsPreview,
  getReasonLine,
  isWithinBudget,
} from '../services/recommendationPresentation';

const Tab = createBottomTabNavigator();
const IS_ANDROID = Platform.OS === 'android';

const ResultListTab = ({ navigation }) => {
  const {
    recommendationResponse,
    questionnaireId,
    answers,
    contact,
    note,
    isFavoriteProductById,
    isFavoritePackageById,
    toggleFavoriteByProduct,
    toggleFavoriteByPackage,
  } = useRecommendationFlow();

  const [sortCriterion, setSortCriterion] = React.useState(SORT_CRITERIA.PRICE);
  const [sortDirection, setSortDirection] = React.useState(SORT_DIRECTION.ASC);
  const [showDebug, setShowDebug] = React.useState(false);
  const [resolvedProductById, setResolvedProductById] = React.useState(() => new Map());
  const [resolvedProductMatches, setResolvedProductMatches] = React.useState(() => {
    return Array.isArray(recommendationResponse?.productMatches)
      ? recommendationResponse.productMatches
      : [];
  });

  const matches = React.useMemo(() => {
    return getMatchesByMode(recommendationResponse);
  }, [recommendationResponse]);

  const sortedMatches = React.useMemo(() => {
    return sortRecommendationMatches(matches, sortCriterion, sortDirection);
  }, [matches, sortCriterion, sortDirection]);

  const resultMode = getResultMode(recommendationResponse);
  const responseInput = recommendationResponse?.input || {};
  const packageModeEmpty =
    resultMode === 'packages' && sortedMatches.length === 0;
  const fallbackProductMatches = React.useMemo(() => {
    return sortRecommendationMatches(
      Array.isArray(recommendationResponse?.productMatches)
        ? recommendationResponse.productMatches
        : [],
      sortCriterion,
      sortDirection,
    );
  }, [recommendationResponse?.productMatches, sortCriterion, sortDirection]);
  const renderedMatches = packageModeEmpty ? fallbackProductMatches : sortedMatches;
  const productById = React.useMemo(() => {
    const fallbackIndex = buildProductByIdIndex(recommendationResponse?.productMatches);
    if (!(resolvedProductById instanceof Map) || resolvedProductById.size === 0) {
      return fallbackIndex;
    }

    const merged = new Map(fallbackIndex);
    resolvedProductById.forEach((product, productId) => {
      if (!merged.has(productId)) {
        merged.set(productId, product);
      }
    });
    return merged;
  }, [recommendationResponse?.productMatches, resolvedProductById]);

  React.useEffect(() => {
    let cancelled = false;

    const resolvePackageProducts = async () => {
      const packageMatches = Array.isArray(recommendationResponse?.packageMatches)
        ? recommendationResponse.packageMatches
        : [];
      const productMatches = Array.isArray(recommendationResponse?.productMatches)
        ? recommendationResponse.productMatches
        : [];

      if (!packageMatches.length) {
        if (!cancelled) {
          setResolvedProductById(new Map());
          setResolvedProductMatches(productMatches);
        }
        return;
      }

      try {
        const resolved = await resolvePackageProductContext({
          packageMatches,
          productMatches,
        });

        if (!cancelled) {
          setResolvedProductById(resolved.productById);
          setResolvedProductMatches(resolved.resolvedProductMatches);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn(
            '[recommendations:image:resolver] ResultListTab failed to resolve package products',
            {
              message: error?.message || null,
              code: error?.code || null,
            },
          );
        }
        if (!cancelled) {
          setResolvedProductById(new Map());
          setResolvedProductMatches(productMatches);
        }
      }
    };

    resolvePackageProducts();

    return () => {
      cancelled = true;
    };
  }, [recommendationResponse?.packageMatches, recommendationResponse?.productMatches]);
  const onToggleSortDirection = React.useCallback(() => {
    setSortDirection(previous =>
      previous === SORT_DIRECTION.ASC
        ? SORT_DIRECTION.DESC
        : SORT_DIRECTION.ASC,
    );
  }, []);

  return (
    <View style={styles.tabContainer}>
      <Text style={styles.title}>{texts.resultsTitle}</Text>
      <Text style={styles.subtitle}>
        {resultMode === 'packages'
          ? texts.resultsModePackages
          : texts.resultsModeProducts}
      </Text>
      <TouchableOpacity
        style={styles.restartFlowButton}
        activeOpacity={0.88}
        onPress={() => navigation.navigate(RECOMMENDATION_ROUTES.QUESTIONNAIRE, { questionnaireId })}
      >
        <Text style={styles.restartFlowText}>Reia chestionarul</Text>
      </TouchableOpacity>

      <ResultsSortBar
        criterion={sortCriterion}
        direction={sortDirection}
        onChangeCriterion={setSortCriterion}
        onToggleDirection={onToggleSortDirection}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resultsContentContainer}
      >
        {renderedMatches.length === 0 ? (
          <EmptyState
            title={
              packageModeEmpty
                ? 'Nu exista pachete eligibile. Incearca produsele recomandate.'
                : texts.resultsEmpty
            }
          />
        ) : null}

        {renderedMatches.map((match, index) => {
          const productId = match?.product?.id;
          const reasonLine = getReasonLine(match, texts.resultsReasonFallback);
          const itemMode = match?.package ? 'packages' : 'products';
          const imageGallery =
            itemMode === 'products'
              ? match?.product
                ? [match.product.imageUrl, ...(match.product.imageUrls || [])].filter(Boolean)
                : []
              : getPackageItemsPreview(match, productById)
                  .map(item => item.imageUrl)
                  .filter(Boolean);

          return (
            <RecommendationCard
              key={`${productId || match?.package?.id || 'match'}-${index}`}
              match={match}
              rank={index + 1}
              reasonLine={reasonLine}
              isInBudget={isWithinBudget(match, responseInput)}
              showFavorite
              isFavorite={
                itemMode === 'products'
                  ? isFavoriteProductById(productId)
                  : isFavoritePackageById(match?.package?.id)
              }
              productById={productById}
              onToggleFavorite={() =>
                itemMode === 'products' && match?.product
                  ? toggleFavoriteByProduct(match.product)
                  : itemMode === 'packages' && match?.package
                  ? toggleFavoriteByPackage(match)
                  : null
              }
              onPress={() =>
                navigation.navigate(RECOMMENDATION_ROUTES.DETAIL, {
                  match,
                  resultMode: itemMode,
                  productMatches: resolvedProductMatches,
                  responseInput,
                })
              }
              onImagePress={() =>
                navigation.navigate(RECOMMENDATION_ROUTES.IMAGE_VIEWER, {
                  images: imageGallery,
                  productUrl: match?.product?.productUrl || null,
                })
              }
              onOpenExternal={() =>
                match?.product?.productUrl
                  ? Linking.openURL(match.product.productUrl)
                  : null
              }
            />
          );
        })}

        <View style={styles.specialistBanner}>
          <Text style={styles.specialistBannerTitle}>
            {texts.resultsSpecialistBannerTitle}
          </Text>
          <Text style={styles.specialistBannerSubtitle}>
            {texts.resultsSpecialistBannerSubtitle}
          </Text>
          <TouchableOpacity
            style={styles.specialistBannerCta}
            activeOpacity={0.88}
            onPress={() =>
              navigation.navigate(RECOMMENDATION_ROUTES.SPECIALIST_CONTACT, {
                questionnaireId,
                answers,
                contact,
                note,
                recommendationResponse,
              })
            }
          >
            <Text style={styles.specialistBannerCtaText}>
              {texts.resultsAskSpecialist}
            </Text>
          </TouchableOpacity>
        </View>

        {__DEV__ ? (
          <View style={styles.debugCard}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowDebug(prev => !prev)}
            >
              <Text style={styles.debugTitle}>{texts.resultsDebug}</Text>
            </TouchableOpacity>

            {showDebug ? (
              <Text style={styles.debugText}>
                {JSON.stringify(
                  {
                    input: recommendationResponse?.input,
                    askedQuestionIds: recommendationResponse?.askedQuestionIds,
                    skippedQuestions: recommendationResponse?.skippedQuestions,
                    orderedQuestionCount:
                      recommendationResponse?.orderedQuestionCount,
                    totalQuestionCount:
                      recommendationResponse?.totalQuestionCount,
                    minMatchPercent: recommendationResponse?.minMatchPercent,
                  },
                  null,
                  2,
                )}
              </Text>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const RecommendationResultsScreen = ({ route }) => {
  const initialResponse = route?.params?.initialResponse;
  const initialQuestionnaireId = route?.params?.questionnaireId;
  const initialAnswers = route?.params?.answers || {};
  const initialContact = route?.params?.contact || {
    name: '',
    email: '',
    phone: '',
  };
  const initialNote = route?.params?.note || '';
  const initialTab = route?.params?.initialTab;

  const [recommendationResponse, setRecommendationResponse] =
    React.useState(initialResponse);
  const [questionnaireId, setQuestionnaireId] = React.useState(
    initialQuestionnaireId,
  );
  const [answers, setAnswers] = React.useState(initialAnswers);
  const [contact, setContact] = React.useState(initialContact);
  const [note, setNote] = React.useState(initialNote);

  const [favorites, setFavorites] = React.useState([]);
  const [packageFavorites, setPackageFavorites] = React.useState([]);
  const [historySessions, setHistorySessions] = React.useState([]);
  const [recomputingSessionId, setRecomputingSessionId] = React.useState('');

  const initialSessionStored = React.useRef(false);

  const refreshHistory = React.useCallback(async () => {
    const sessions = await loadHistorySessions();
    setHistorySessions(sessions);
  }, []);

  React.useEffect(() => {
    const bootstrap = async () => {
      const storedFavorites = await getFavoriteProducts();
      setFavorites(storedFavorites);
      const storedPackageFavorites = await getFavoritePackages();
      setPackageFavorites(storedPackageFavorites);
      await refreshHistory();
    };

    bootstrap();
  }, [refreshHistory]);

  React.useEffect(() => {
    const storeInitialSession = async () => {
      if (
        initialSessionStored.current ||
        !recommendationResponse ||
        !questionnaireId
      ) {
        return;
      }

      initialSessionStored.current = true;

      await storeHistorySession({
        questionnaireId,
        answers,
        response: recommendationResponse,
      });

      await refreshHistory();
    };

    storeInitialSession();
  }, [answers, questionnaireId, recommendationResponse, refreshHistory]);

  const toggleFavoriteByProduct = React.useCallback(
    async product => {
      const nextFavorites = await toggleFavoriteProduct({
        favorites,
        product,
      });

      setFavorites(nextFavorites);
    },
    [favorites],
  );

  const isFavoriteProductById = React.useCallback(
    productId => {
      if (!productId) {
        return false;
      }

      return isProductFavorite(favorites, productId);
    },
    [favorites],
  );

  const toggleFavoriteByPackage = React.useCallback(
    async packageMatch => {
      const nextFavorites = await toggleFavoritePackage({
        favorites: packageFavorites,
        packageMatch,
      });
      setPackageFavorites(nextFavorites);
    },
    [packageFavorites],
  );

  const isFavoritePackageById = React.useCallback(
    packageId => {
      if (!packageId) {
        return false;
      }
      return isPackageFavorite(packageFavorites, packageId);
    },
    [packageFavorites],
  );

  const recomputeSession = React.useCallback(
    async session => {
      setRecomputingSessionId(session.sessionId);

      try {
        const response = await computeRecommendations({
          questionnaireId: session.questionnaireId,
          answers: session.answers,
          debug: __DEV__,
        });

        setRecommendationResponse(response);
        setQuestionnaireId(session.questionnaireId);
        setAnswers(session.answers);

        await storeHistorySession({
          questionnaireId: session.questionnaireId,
          answers: session.answers,
          response,
        });
        await refreshHistory();

        toast(texts.resultsRefreshFromHistory);
      } catch (error) {
        toast(getFirebaseUserErrorMessage(error, texts.callableGeneric));
      } finally {
        setRecomputingSessionId('');
      }
    },
    [refreshHistory],
  );
  const openHistorySession = React.useCallback(
    async session => {
      if (!session) {
        return;
      }

      const snapshot =
        session?.responseSnapshot &&
        typeof session.responseSnapshot === 'object'
          ? session.responseSnapshot
          : null;

      if (snapshot) {
        setRecommendationResponse(snapshot);
        setQuestionnaireId(session.questionnaireId || snapshot?.questionnaireId || '');
        setAnswers(
          session?.answers && typeof session.answers === 'object'
            ? session.answers
            : {},
        );
        return;
      }

      setRecomputingSessionId(session.sessionId);
      try {
        const response = await computeRecommendations({
          questionnaireId: session.questionnaireId,
          answers: session.answers,
          debug: __DEV__,
        });

        setRecommendationResponse(response);
        setQuestionnaireId(session.questionnaireId);
        setAnswers(session.answers);

        await storeHistorySession({
          questionnaireId: session.questionnaireId,
          answers: session.answers,
          response,
        });
        await refreshHistory();
      } catch (error) {
        toast(getFirebaseUserErrorMessage(error, texts.callableGeneric));
      } finally {
        setRecomputingSessionId('');
      }
    },
    [refreshHistory],
  );

  const contextValue = React.useMemo(
    () => ({
      recommendationResponse,
      questionnaireId,
      answers,
      contact,
      note,
      favorites,
      packageFavorites,
      historySessions,
      recomputingSessionId,
      setRecommendationResponse,
      setQuestionnaireId,
      setAnswers,
      setContact,
      setNote,
      setFavorites,
      setPackageFavorites,
      refreshHistory,
      toggleFavoriteByProduct,
      toggleFavoriteByPackage,
      isFavoriteProductById,
      isFavoritePackageById,
      recomputeSession,
      openHistorySession,
    }),
    [
      recommendationResponse,
      questionnaireId,
      answers,
      contact,
      note,
      favorites,
      packageFavorites,
      historySessions,
      recomputingSessionId,
      refreshHistory,
      toggleFavoriteByProduct,
      toggleFavoriteByPackage,
      isFavoriteProductById,
      isFavoritePackageById,
      recomputeSession,
      openHistorySession,
    ],
  );

  return (
    <RecommendationFlowProvider value={contextValue}>
      <Tab.Navigator
        initialRouteName={
          initialTab === texts.favoritesTab || initialTab === texts.historyTab
            ? initialTab
            : texts.resultsTab
        }
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Color.primary,
          tabBarInactiveTintColor: Color.blackTextSecondary,
        }}
      >
        <Tab.Screen name={texts.resultsTab} component={ResultListTab} />
        <Tab.Screen
          name={texts.favoritesTab}
          component={RecommendationFavoritesScreen}
        />
        <Tab.Screen
          name={texts.historyTab}
          component={RecommendationHistoryScreen}
        />
      </Tab.Navigator>
    </RecommendationFlowProvider>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    backgroundColor: '#f6f8f9',
  },
  title: {
    marginTop: 10,
    marginHorizontal: recommendationUiTokens.resultsCard.padding,
    color: Color.blackTextPrimary,
    fontSize: Styles.FontSize.medium,
    lineHeight: IS_ANDROID ? 23 : 24,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  subtitle: {
    marginTop: 2,
    marginHorizontal: recommendationUiTokens.resultsCard.padding,
    marginBottom: 2,
    color: Color.blackTextSecondary,
    fontSize: Styles.FontSize.small,
    lineHeight: IS_ANDROID ? 19 : 20,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  restartFlowButton: {
    alignSelf: 'flex-start',
    marginHorizontal: recommendationUiTokens.resultsCard.padding,
    marginBottom: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4ebf2',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  restartFlowText: {
    color: Color.blackTextPrimary,
    fontSize: Styles.FontSize.tiny,
    lineHeight: IS_ANDROID ? 16 : 17,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  resultsContentContainer: {
    paddingHorizontal: recommendationUiTokens.resultsCard.padding,
    paddingBottom: recommendationUiTokens.spacing.contentBottom,
  },
  specialistBanner: {
    marginTop: recommendationUiTokens.specialistBanner.marginTop,
    marginBottom: recommendationUiTokens.specialistBanner.marginBottom,
    padding: recommendationUiTokens.specialistBanner.padding,
    borderRadius: recommendationUiTokens.specialistBanner.borderRadius,
    borderWidth: 1,
    borderColor: recommendationUiTokens.specialistBanner.borderColor,
    backgroundColor: recommendationUiTokens.specialistBanner.backgroundColor,
  },
  specialistBannerTitle: {
    color: Color.blackTextPrimary,
    fontSize: Styles.FontSize.small,
    lineHeight: IS_ANDROID ? 21 : 22,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  specialistBannerSubtitle: {
    marginTop: 4,
    color: Color.blackTextSecondary,
    fontSize: Styles.FontSize.tiny,
    lineHeight: IS_ANDROID ? 17 : 18,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  specialistBannerCta: {
    marginTop: 9,
    alignSelf: 'flex-start',
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: recommendationUiTokens.specialistBanner.ctaBorderColor,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  specialistBannerCtaText: {
    color: recommendationUiTokens.specialistBanner.ctaTextColor,
    fontSize: Styles.FontSize.tiny,
    lineHeight: IS_ANDROID ? 16 : 17,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  debugCard: {
    marginHorizontal: 0,
    marginBottom: 0,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  debugTitle: {
    fontSize: Styles.FontSize.small,
    color: Color.blackTextPrimary,
    fontWeight: '700',
  },
  debugText: {
    marginTop: 8,
    fontSize: Styles.FontSize.tiny,
    color: Color.blackTextSecondary,
  },
});

export default withTheme(RecommendationResultsScreen);

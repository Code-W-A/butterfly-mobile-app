/** @format */

import React from 'react';
import {
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

import { ButtonIndex, SafeAreaView } from '@components';
import { Color, Styles, withTheme } from '@common';
import { Icon, toast } from '@app/Omni';
import { initializeFirebase } from '@services/Firebase';
import { getFirebaseUserProfile } from '@services/FirebaseUserProfile';

import texts from '../constants/texts.ro';
import recommendationUiTokens from '../components/recommendationUiTokens';
import { RECOMMENDATION_ROUTES } from '../navigation/routes';
import HeroRecommendationCard from '../components/HeroRecommendationCard';
import RecommendationCompactCard from '../components/RecommendationCompactCard';
import FilterChipsBar from '../components/FilterChipsBar';
import {
  SORT_CRITERIA,
  SORT_DIRECTION,
  sortRecommendationMatches,
} from '../services/sortRecommendations';
import {
  buildWowItems,
} from '../services/recommendationPresentation';
import { resolvePackageProductContext } from '../services/packageProductResolver';
import { getQuestionsForQuestionnaire } from '../services/questionnaireRepository';
import { normalizeQuestionType } from '../types/contracts';
import {
  getFavoritePackages,
  getFavoriteProducts,
  isPackageFavorite,
  isProductFavorite,
  toggleFavoritePackage,
  toggleFavoriteProduct,
} from '../storage/favoritesStorage';

const IS_ANDROID = Platform.OS === 'android';
const EMPTY_CONTACT = Object.freeze({ name: '', email: '', phone: '' });
const FILTER_OPTIONS = ['budget', 'control', 'spin', 'speed'];
const SUMMARY_MAX_ITEMS = 8;
const SORT_SHEET_OPTIONS = [
  {
    id: 'budget-asc',
    label: 'Buget crescător',
    criterion: SORT_CRITERIA.PRICE,
    direction: SORT_DIRECTION.ASC,
  },
  {
    id: 'budget-desc',
    label: 'Buget descrescător',
    criterion: SORT_CRITERIA.PRICE,
    direction: SORT_DIRECTION.DESC,
  },
  {
    id: 'speed-asc',
    label: 'Viteză crescător',
    criterion: SORT_CRITERIA.SPEED,
    direction: SORT_DIRECTION.ASC,
  },
  {
    id: 'speed-desc',
    label: 'Viteză descrescător',
    criterion: SORT_CRITERIA.SPEED,
    direction: SORT_DIRECTION.DESC,
  },
  {
    id: 'spin-asc',
    label: 'Spin crescător',
    criterion: SORT_CRITERIA.SPIN,
    direction: SORT_DIRECTION.ASC,
  },
  {
    id: 'spin-desc',
    label: 'Spin descrescător',
    criterion: SORT_CRITERIA.SPIN,
    direction: SORT_DIRECTION.DESC,
  },
  {
    id: 'control-asc',
    label: 'Control crescător',
    criterion: SORT_CRITERIA.CONTROL,
    direction: SORT_DIRECTION.ASC,
  },
  {
    id: 'control-desc',
    label: 'Control descrescător',
    criterion: SORT_CRITERIA.CONTROL,
    direction: SORT_DIRECTION.DESC,
  },
];

const looksLikeTechnicalToken = token => {
  const value = String(token || '').trim();
  if (!/^[A-Za-z0-9]{6,}$/.test(value)) {
    return false;
  }

  // IDs are usually mixed alphanumeric (e.g. b52ec0, 5fcbeJOASDAGA)
  return /[A-Za-z]/.test(value) && /\d/.test(value);
};

const stripTechnicalTokenSuffix = rawValue => {
  const value = String(rawValue || '').trim();
  if (!value) {
    return '';
  }

  // Remove technical IDs even when they appear in the middle, with/without parentheses.
  const withoutParensTokens = value.replace(
    /\(([A-Za-z0-9]{6,})\)/g,
    (match, token) => (looksLikeTechnicalToken(token) ? '' : match),
  );

  const withoutStandaloneTokens = withoutParensTokens.replace(
    /(^|[\s,;:/-])([A-Za-z0-9]{6,})(?=$|[\s,;:/-])/g,
    (match, separator, token) => (looksLikeTechnicalToken(token) ? separator : match),
  );

  return withoutStandaloneTokens.replace(/\s{2,}/g, ' ').trim();
};

const normalizeSummaryValue = value => {
  const text = String(value || '').trim();
  const withoutTechnicalSuffix = stripTechnicalTokenSuffix(text);
  const cleaned = withoutTechnicalSuffix.replace(/[_-]/g, ' ');
  if (!cleaned) {
    return '-';
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const toTitleCase = value => {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const looksLikeTechnicalQuestionId = key => {
  const normalized = String(key || '').trim();
  if (!normalized) {
    return false;
  }

  // Firestore/custom question ids are often compact alphanumeric tokens.
  return /^[A-Za-z0-9]{8,}$/.test(normalized);
};

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

const mapSummaryLabel = (key, index) => {
  const raw = String(key || '').trim();
  const normalized = raw.toLowerCase();

  if (looksLikeTechnicalQuestionId(raw)) {
    return `${texts.commonQuestion} ${index + 1}`;
  }

  if (normalized.includes('level') || normalized.includes('nivel')) {
    return 'Nivel';
  }
  if (normalized.includes('style') || normalized.includes('stil')) {
    return 'Stil';
  }
  if (normalized.includes('budget') || normalized.includes('buget')) {
    return 'Buget';
  }
  if (normalized.includes('frequency') || normalized.includes('frecventa')) {
    return 'Frecvență';
  }

  const humanized = raw
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return toTitleCase(humanized) || `${texts.commonQuestion} ${index + 1}`;
};

const buildOptionsLabelMap = question => {
  if (!Array.isArray(question?.options)) {
    return new Map();
  }

  return question.options.reduce((accumulator, option) => {
    const optionValue = String(option?.value ?? '').trim();
    const optionLabel = String(option?.label ?? '').trim();
    if (optionValue && optionLabel) {
      accumulator.set(optionValue, optionLabel);
    }
    return accumulator;
  }, new Map());
};

const toSummaryPrimitive = (value, optionsLabelMap) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  const normalizedValue = String(value).trim();
  if (!normalizedValue) {
    return '-';
  }

  if (optionsLabelMap?.has(normalizedValue)) {
    return optionsLabelMap.get(normalizedValue);
  }

  return normalizeSummaryValue(normalizedValue);
};

const mapSummaryValue = (value, question) => {
  const questionType = normalizeQuestionType(question?.type);
  const optionsLabelMap = buildOptionsLabelMap(question);

  if (Array.isArray(value)) {
    const mappedValues = value
      .map(item => toSummaryPrimitive(item, optionsLabelMap))
      .filter(item => item && item !== '-');

    return mappedValues.length > 0 ? mappedValues.join(', ') : '-';
  }

  if (
    questionType === 'number' &&
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ('min' in value || 'max' in value)
  ) {
    const minValue = toSummaryPrimitive(value.min, optionsLabelMap);
    const maxValue = toSummaryPrimitive(value.max, optionsLabelMap);
    return `${minValue} - ${maxValue}`;
  }

  if (value && typeof value === 'object') {
    const mappedValues = Object.values(value)
      .map(item => toSummaryPrimitive(item, optionsLabelMap))
      .filter(item => item && item !== '-');

    return mappedValues.length > 0 ? mappedValues.join(', ') : '-';
  }

  return toSummaryPrimitive(value, optionsLabelMap);
};

const RecommendationResultsWOWScreen = ({ route, navigation, theme }) => {
  const questionnaireId = route?.params?.questionnaireId || '';
  const rawAnswers = route?.params?.answers;
  const rawContact = route?.params?.contact;
  const note = route?.params?.note || '';
  const recommendationResponse = route?.params?.recommendationResponse || null;
  const fromHistory = Boolean(route?.params?.fromHistory);
  const answers = React.useMemo(() => {
    return rawAnswers && typeof rawAnswers === 'object' ? rawAnswers : {};
  }, [rawAnswers]);
  const contact = React.useMemo(() => {
    return rawContact && typeof rawContact === 'object'
      ? rawContact
      : EMPTY_CONTACT;
  }, [rawContact]);

  const [sortCriterion, setSortCriterion] = React.useState(SORT_CRITERIA.PRICE);
  const [sortDirection, setSortDirection] = React.useState(SORT_DIRECTION.ASC);
  const [selectedFilter, setSelectedFilter] = React.useState('');
  const [selectedSortOption, setSelectedSortOption] = React.useState('budget-asc');
  const [showAnswersSummary, setShowAnswersSummary] = React.useState(false);
  const [showSortSheet, setShowSortSheet] = React.useState(false);
  const [favoriteProducts, setFavoriteProducts] = React.useState([]);
  const [favoritePackages, setFavoritePackages] = React.useState([]);
  const [resolvedProductById, setResolvedProductById] = React.useState(
    () => new Map(),
  );
  const [questionMetadataById, setQuestionMetadataById] = React.useState(
    () => new Map(),
  );
  const [resolvedProductMatches, setResolvedProductMatches] = React.useState(
    () => {
      return Array.isArray(recommendationResponse?.productMatches)
        ? recommendationResponse.productMatches
        : [];
    },
  );
  const [displayName, setDisplayName] = React.useState(
    texts.resultsWowGreetingFallbackName,
  );

  React.useEffect(() => {
    let cancelled = false;

    const loadUserName = async () => {
      const firebaseSetup = initializeFirebase();
      const currentUser = firebaseSetup?.auth?.currentUser;
      if (!currentUser) {
        if (!cancelled) {
          setDisplayName(texts.resultsWowGreetingFallbackName);
        }
        return;
      }

      await currentUser.reload?.().catch(() => null);
      const profile = await getFirebaseUserProfile(currentUser);
      const nextDisplayName =
        resolveFirstName(currentUser, profile) || texts.resultsWowGreetingFallbackName;
      if (!cancelled) {
        setDisplayName(nextDisplayName);
      }
    };

    loadUserName().catch(() => null);

    return () => {
      cancelled = true;
    };
  }, []);

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
            '[recommendations:image:resolver] WOW failed to resolve package products',
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

  const initialWowItems = React.useMemo(() => {
    if (recommendationResponse) {
      return buildWowItems(recommendationResponse, texts.resultsReasonFallback, {
        productById: resolvedProductById,
      });
    }

    return Array.isArray(route?.params?.wowItems) ? route.params.wowItems : [];
  }, [recommendationResponse, resolvedProductById, route?.params?.wowItems]);

  const heroFromParams = route?.params?.heroItem || null;

  const answersSummary = React.useMemo(() => {
    return Object.entries(answers)
      .slice(0, SUMMARY_MAX_ITEMS)
      .map(([questionId, answerValue], index) => {
        const question = questionMetadataById.get(questionId);
        const questionLabel =
          typeof question?.label === 'string' ? question.label.trim() : '';

        return {
          key: questionLabel || mapSummaryLabel(questionId, index),
          value: mapSummaryValue(answerValue, question),
        };
      });
  }, [answers, questionMetadataById]);

  React.useEffect(() => {
    let cancelled = false;

    const loadQuestionMetadata = async () => {
      if (!questionnaireId) {
        if (!cancelled) {
          setQuestionMetadataById(new Map());
        }
        return;
      }

      try {
        const questions = await getQuestionsForQuestionnaire(questionnaireId);
        if (!cancelled) {
          const metadataById = questions.reduce((accumulator, question) => {
            if (question?.id) {
              accumulator.set(question.id, question);
            }
            return accumulator;
          }, new Map());
          setQuestionMetadataById(metadataById);
        }
      } catch (_error) {
        if (!cancelled) {
          setQuestionMetadataById(new Map());
        }
      }
    };

    loadQuestionMetadata();

    return () => {
      cancelled = true;
    };
  }, [questionnaireId]);

  React.useEffect(() => {
    if (IS_ANDROID && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const loadFavorites = async () => {
      const [products, packages] = await Promise.all([
        getFavoriteProducts(),
        getFavoritePackages(),
      ]);

      if (!cancelled) {
        setFavoriteProducts(products);
        setFavoritePackages(packages);
      }
    };

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [sortCriterion, sortDirection, selectedFilter]);

  const filteredItems = React.useMemo(() => {
    if (!FILTER_OPTIONS.includes(selectedFilter)) {
      return initialWowItems;
    }
    if (selectedFilter === 'budget') {
      return initialWowItems.filter(item => Boolean(item?.isInBudget));
    }
    return initialWowItems.filter(item => {
      const value = item?.attributeBadges?.find(
        badge => badge.key === selectedFilter,
      )?.value;
      return Number.isFinite(Number(value)) && Number(value) > 0;
    });
  }, [initialWowItems, selectedFilter]);

  const sortedItems = React.useMemo(() => {
    const matches = filteredItems.map(item => item.match);
    const sortedMatches = sortRecommendationMatches(
      matches,
      sortCriterion,
      sortDirection,
    );
    const byMatchRef = new Map(filteredItems.map(item => [item.match, item]));
    return sortedMatches
      .map(match => byMatchRef.get(match))
      .filter(Boolean);
  }, [filteredItems, sortCriterion, sortDirection]);

  const dynamicHero = sortedItems[0] || null;
  const dynamicOtherItems = sortedItems.slice(1, 5);
  const heroItem = dynamicHero || initialWowItems[0] || heroFromParams || null;
  const otherItems = dynamicOtherItems;
  const isWowItemFavorite = React.useCallback(
    item => {
      if (!item) {
        return false;
      }

      if (item.resultMode === 'packages') {
        const packageId = item?.match?.package?.id || item?.id || '';
        return packageId ? isPackageFavorite(favoritePackages, packageId) : false;
      }

      const productId = item?.productId || item?.match?.product?.id || '';
      return productId ? isProductFavorite(favoriteProducts, productId) : false;
    },
    [favoritePackages, favoriteProducts],
  );
  const onToggleWowFavorite = React.useCallback(
    async item => {
      if (!item) {
        return;
      }

      const isPackage = item.resultMode === 'packages';

      if (isPackage) {
        const packageId = item?.match?.package?.id;
        if (!packageId || !item?.match?.package) {
          return;
        }

        const alreadyFavorite = isPackageFavorite(favoritePackages, packageId);
        const nextFavorites = await toggleFavoritePackage({
          favorites: favoritePackages,
          packageMatch: item.match,
        });
        setFavoritePackages(nextFavorites);
        toast(alreadyFavorite ? texts.favoriteRemoved : texts.favoriteAdded);
        return;
      }

      const product = item?.match?.product;
      if (!product?.id) {
        return;
      }

      const alreadyFavorite = isProductFavorite(favoriteProducts, product.id);
      const nextFavorites = await toggleFavoriteProduct({
        favorites: favoriteProducts,
        product,
      });
      setFavoriteProducts(nextFavorites);
      toast(alreadyFavorite ? texts.favoriteRemoved : texts.favoriteAdded);
    },
    [favoritePackages, favoriteProducts],
  );
  const onSelectSortOption = optionId => {
    const option = SORT_SHEET_OPTIONS.find(item => item.id === optionId);
    if (!option) {
      return;
    }
    setSelectedSortOption(option.id);
    setSortCriterion(option.criterion);
    setSortDirection(option.direction);
    setShowSortSheet(false);
  };

  const backgroundColor = theme?.colors?.background || '#f6f8f9';

  return (
    <SafeAreaView>
      <View style={[styles.container, { backgroundColor }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.88}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
                return;
              }
              navigation.navigate(RECOMMENDATION_ROUTES.AUTH);
            }}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Icon name="chevron-left" size={18} color={Color.blackTextPrimary} />
          </TouchableOpacity>
          <Text style={styles.finalGreeting}>
            <Text style={styles.finalGreetingBrand}>{texts.authBrandSlogan}</Text>
            <Text>{', '}</Text>
            <Text style={styles.finalGreetingName}>{displayName}</Text>
            <Text style={styles.finalGreetingExclamation}>{' !'}</Text>
          </Text>
          <Text style={styles.title}>{texts.resultsWowTitle}</Text>
          <Text style={styles.subtitle}>{texts.resultsWowSubtitle}</Text>

          <FilterChipsBar
            value={selectedFilter}
            onChange={setSelectedFilter}
            onOpenSort={() => setShowSortSheet(true)}
          />

          {heroItem ? (
            <HeroRecommendationCard
              item={heroItem}
              isFavorite={isWowItemFavorite(heroItem)}
              onToggleFavorite={() => onToggleWowFavorite(heroItem)}
              onImagePress={() =>
                navigation.navigate(RECOMMENDATION_ROUTES.IMAGE_VIEWER, {
                  images: [
                    heroItem?.imageUrl,
                    ...(Array.isArray(heroItem?.packageItems)
                      ? heroItem.packageItems.map(item => item.imageUrl)
                      : []),
                  ].filter(Boolean),
                  productUrl: heroItem?.productUrl || null,
                })
              }
              onPressDetails={() =>
                heroItem?.match
                  ? navigation.navigate(RECOMMENDATION_ROUTES.DETAIL, {
                      match: heroItem.match,
                      resultMode: heroItem.resultMode,
                      productMatches: resolvedProductMatches,
                      responseInput: recommendationResponse?.input || {},
                    })
                  : null
              }
              onPressPersonalize={() =>
                heroItem?.match
                  ? navigation.navigate(RECOMMENDATION_ROUTES.DETAIL, {
                      match: heroItem.match,
                      resultMode: heroItem.resultMode,
                      productMatches: resolvedProductMatches,
                      responseInput: recommendationResponse?.input || {},
                    })
                  : null
              }
            />
          ) : (
            <View style={styles.emptyFilterCard}>
              <Text style={styles.emptyFilterText}>
                Nu există recomandări pentru filtrul selectat.
              </Text>
            </View>
          )}

          {otherItems.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {texts.resultsOtherRecommendations}
                </Text>
              </View>

              {otherItems.map(item => (
                <RecommendationCompactCard
                  key={item.id}
                  item={item}
                  isFavorite={isWowItemFavorite(item)}
                  onToggleFavorite={() => onToggleWowFavorite(item)}
                  onImagePress={() =>
                    navigation.navigate(RECOMMENDATION_ROUTES.IMAGE_VIEWER, {
                      images: [
                        item?.imageUrl,
                        ...(Array.isArray(item?.packageItems)
                          ? item.packageItems.map(component => component.imageUrl)
                          : []),
                      ].filter(Boolean),
                      productUrl: item?.productUrl || null,
                    })
                  }
                  onPress={() =>
                    navigation.navigate(RECOMMENDATION_ROUTES.DETAIL, {
                      match: item.match,
                      resultMode: item.resultMode,
                      productMatches: resolvedProductMatches,
                      responseInput: recommendationResponse?.input || {},
                    })
                  }
                />
              ))}
            </>
          ) : null}

          <TouchableOpacity
            style={styles.summaryToggle}
            activeOpacity={0.88}
            onPress={() => setShowAnswersSummary(prev => !prev)}
          >
            <Text style={styles.summaryToggleText}>
              Rezumat răspunsuri
            </Text>
            <Text style={styles.summaryToggleAction}>
              {showAnswersSummary
                ? texts.resultsAnswersSummaryHide
                : texts.resultsAnswersSummaryShow}
            </Text>
          </TouchableOpacity>

          {showAnswersSummary ? (
            <View style={styles.summaryCard}>
              {answersSummary.length === 0 ? (
                <Text style={styles.summaryLine}>-</Text>
              ) : (
                answersSummary.map((item, index) => (
                  <Text key={`${item.key}-${index}`} style={styles.summaryLine}>
                    {item.key}: {item.value}
                  </Text>
                ))
              )}
            </View>
          ) : null}

          {/* <ButtonIndex
            text={texts.resultsBuildConfigurator}
            onPress={() =>
              navigation.navigate(RECOMMENDATION_ROUTES.CONFIGURATOR_START, {
                selectedProductId: heroItem?.productId || heroItem?.id || '',
                answersSummary,
              })
            }
            containerStyle={styles.primaryCta}
          /> */}

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
        </ScrollView>

        <Modal
          visible={showSortSheet}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSortSheet(false)}
        >
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setShowSortSheet(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.sortSheet}
              onPress={() => null}
            >
              <Text style={styles.sortSheetTitle}>Sortează după</Text>
              {SORT_SHEET_OPTIONS.map(option => {
                const selected = selectedSortOption === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.sortOptionRow}
                    activeOpacity={0.88}
                    onPress={() => onSelectSortOption(option.id)}
                  >
                    <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
                      {selected ? <View style={styles.radioInner} /> : null}
                    </View>
                    <Text style={styles.sortOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    paddingTop: 10,
    paddingBottom: recommendationUiTokens.spacing.contentBottom,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f6f9',
    marginBottom: 8,
  },
  title: {
    marginTop: 2,
    color: Color.blackTextPrimary,
    fontSize: 27,
    lineHeight: IS_ANDROID ? 33 : 34,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  subtitle: {
    marginTop: 5,
    marginBottom: 2,
    color: Color.blackTextSecondary,
    fontSize: 14,
    lineHeight: IS_ANDROID ? 19 : 20,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  finalGreeting: {
    marginTop: 2,
    marginBottom: 4,
    color: Color.blackTextPrimary,
    fontSize: 14,
    lineHeight: IS_ANDROID ? 19 : 20,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  finalGreetingBrand: {
    color: Color.blackTextPrimary,
  },
  finalGreetingName: {
    color: Color.primary,
    fontSize: 16,
    lineHeight: IS_ANDROID ? 21 : 22,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  finalGreetingExclamation: {
    color: Color.blackTextPrimary,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: Color.blackTextPrimary,
    fontSize: Styles.FontSize.small,
    lineHeight: IS_ANDROID ? 21 : 22,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  summaryToggle: {
    marginTop: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e4ebf2',
    backgroundColor: '#fff',
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryToggleText: {
    color: Color.blackTextPrimary,
    fontSize: 13,
    lineHeight: IS_ANDROID ? 17 : 18,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  summaryToggleAction: {
    color: Color.primary,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  summaryCard: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e4ebf2',
    backgroundColor: '#fff',
    padding: 12,
  },
  emptyFilterCard: {
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4ebf2',
    backgroundColor: '#fff',
    padding: 14,
  },
  emptyFilterText: {
    color: Color.blackTextSecondary,
    fontSize: 13,
    lineHeight: IS_ANDROID ? 18 : 19,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  summaryLine: {
    color: Color.blackTextSecondary,
    fontSize: 13,
    lineHeight: IS_ANDROID ? 17 : 18,
    marginBottom: 4,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  primaryCta: {
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: Color.primary,
  },
  specialistBanner: {
    marginTop: 18,
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
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 35, 0.35)',
    justifyContent: 'flex-end',
  },
  sortSheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  sortSheetTitle: {
    color: Color.blackTextPrimary,
    fontSize: 16,
    lineHeight: IS_ANDROID ? 21 : 22,
    fontWeight: '700',
    marginBottom: 10,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  sortOptionRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#c8d2dd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioOuterActive: {
    borderColor: '#e94190',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e94190',
  },
  sortOptionText: {
    color: Color.blackTextPrimary,
    fontSize: 14,
    lineHeight: IS_ANDROID ? 18 : 19,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
});

export default withTheme(RecommendationResultsWOWScreen);

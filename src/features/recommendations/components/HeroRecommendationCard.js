/** @format */

import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Color, Tools } from '@common';
import { Icon } from '@app/Omni';

import texts from '../constants/texts.ro';
import recommendationUiTokens from './recommendationUiTokens';

const IS_ANDROID = Platform.OS === 'android';

const normalizeReason = value => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim();
};

const getReasonFingerprint = value => {
  return normalizeReason(value)
    .toLowerCase()
    .replace(/[.!?]+$/g, '')
    .trim();
};

const HeroRecommendationCard = ({
  item,
  onPressDetails,
  onImagePress,
  onPressPersonalize,
  onToggleFavorite,
  isFavorite = false,
}) => {
  if (!item) {
    return null;
  }

  const reasons = [item.reasonShort1, item.reasonShort2, item.reasonLine]
    .map(rawReason => ({
      value: normalizeReason(rawReason),
      fingerprint: getReasonFingerprint(rawReason),
    }))
    .filter(reason => Boolean(reason.value))
    .filter((reason, index, list) => {
      return (
        list.findIndex(candidate => candidate.fingerprint === reason.fingerprint) ===
        index
      );
    })
    .map(reason => reason.value)
    .slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>
            {texts.resultsTopRecommendationBadge}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={event => {
              event?.stopPropagation?.();
              onToggleFavorite && onToggleFavorite();
            }}
            style={styles.favoriteIconWrap}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Icon
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? Color.primary : '#8d99a8'}
            />
          </TouchableOpacity>
          {item.isInBudget ? (
            <View style={styles.budgetBadge}>
              <Text style={styles.budgetBadgeText}>
                {texts.resultsInBudgetBadge}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.88} onPress={onImagePress}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            {__DEV__ ? (
              <View style={styles.debugImageBadge}>
                <Text style={styles.debugImageBadgeText}>NO IMG</Text>
              </View>
            ) : null}
            <Icon name="image-outline" size={26} color="#9aa6b2" />
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.suggestionText}>{texts.resultsSuggestionLead}</Text>

      <Text style={styles.title} numberOfLines={2}>
        {item.name}
      </Text>

      <Text style={styles.price}>
        {Tools.getCurrencyFormatted(item.price, {
          code: item.currency,
          symbol: `${item.currency || 'RON'} `,
          precision: 0,
          decimal: '.',
          thousand: ',',
          format: '%s%v',
        })}
      </Text>

      <Text style={styles.whyTitle}>De ce ți se potrivește</Text>
      {reasons.length > 0 ? (
        <View style={styles.reasonsWrap}>
          {reasons.map((reason, index) => (
            <View key={`${reason}-${index}`} style={styles.reasonRow}>
              <View style={styles.reasonDot} />
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.personalizeCta}
        onPress={onPressPersonalize || onPressDetails}
      >
        <Text style={styles.personalizeCtaText}>
          Personalizează această recomandare
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.detailsCta}
        onPress={onPressDetails}
      >
        <Text style={styles.detailsCtaText}>{texts.resultsCardDetailsCta}</Text>
        <Icon name="chevron-right" size={18} color="#7f8b98" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f0d4e4',
    borderLeftWidth: 3,
    borderLeftColor: '#e94190',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 18,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  header: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteIconWrap: {
    width: 30,
    height: 30,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: recommendationUiTokens.resultsCard.topBadgeBg,
  },
  heroBadgeText: {
    color: recommendationUiTokens.resultsCard.topBadgeText,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  budgetBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: recommendationUiTokens.resultsCard.budgetBadgeBg,
  },
  budgetBadgeText: {
    color: recommendationUiTokens.resultsCard.budgetBadgeText,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  image: {
    width: '100%',
    height: 230,
    borderRadius: 14,
    backgroundColor: recommendationUiTokens.resultsCard.placeholderBg,
    marginBottom: 14,
  },
  imagePlaceholder: {
    borderWidth: 1,
    borderColor: '#e0e8ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugImageBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(233, 65, 144, 0.9)',
  },
  debugImageBadgeText: {
    color: '#fff',
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  title: {
    fontSize: 20,
    lineHeight: IS_ANDROID ? 26 : 27,
    color: Color.blackTextPrimary,
    fontWeight: '700',
    marginBottom: 6,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  price: {
    fontSize: 16,
    lineHeight: IS_ANDROID ? 21 : 22,
    color: Color.primary,
    fontWeight: '700',
    marginBottom: 8,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  suggestionText: {
    color: Color.primary,
    fontSize: 16,
    lineHeight: IS_ANDROID ? 21 : 22,
    fontWeight: '700',
    marginBottom: 8,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  whyTitle: {
    marginTop: 2,
    color: Color.blackTextPrimary,
    fontSize: 13,
    lineHeight: IS_ANDROID ? 17 : 18,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  reasonsWrap: {
    marginTop: 7,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  reasonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e94190',
    marginTop: 6,
    marginRight: 7,
  },
  reasonText: {
    flex: 1,
    color: '#617082',
    fontSize: 12,
    lineHeight: IS_ANDROID ? 17 : 18,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  personalizeCta: {
    marginTop: 10,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: Color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalizeCtaText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: IS_ANDROID ? 18 : 19,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  detailsCta: {
    minHeight: 44,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e7edf3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  detailsCtaText: {
    marginRight: 4,
    color: recommendationUiTokens.resultsCard.detailText,
    fontSize: recommendationUiTokens.resultsCard.detailTextSize,
    lineHeight: IS_ANDROID
      ? recommendationUiTokens.resultsCard.detailTextLineHeightAndroid
      : recommendationUiTokens.resultsCard.detailTextLineHeightIos,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
});

export default HeroRecommendationCard;

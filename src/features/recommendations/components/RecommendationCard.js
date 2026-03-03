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
import {
  getPackageItemsPreview,
} from '../services/recommendationPresentation';
import {
  getMatchCurrency,
  getMatchPrice,
  getMatchTitle,
  getPrimaryImage,
} from '../services/recommendationMapper';

const IS_ANDROID = Platform.OS === 'android';

const Badge = ({ label, style, textStyle }) => {
  if (!label) {
    return null;
  }

  return (
    <View style={[styles.badge, style]}>
      <Text style={[styles.badgeText, textStyle]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const RecommendationCard = ({
  match,
  productById,
  onPress,
  onImagePress,
  onOpenExternal,
  onToggleFavorite,
  isFavorite,
  showFavorite = true,
  rank,
  isInBudget = false,
  reasonLine = '',
  typeBadgeLabel = '',
  emphasizeTypeBadge = false,
}) => {
  const safeProductById = productById instanceof Map ? productById : new Map();
  const title = getMatchTitle(match);
  const price = getMatchPrice(match);
  const currency = getMatchCurrency(match);
  const imageUri = getPrimaryImage(match, { productById: safeProductById });
  const hasProduct = Boolean(match?.product?.id);
  const defaultTypeBadgeText = hasProduct
    ? texts.resultsCardBadgeProduct
    : texts.resultsCardBadgePackage;
  const typeBadgeText = typeBadgeLabel || defaultTypeBadgeText;
  const normalizedReason =
    typeof reasonLine === 'string' ? reasonLine.trim() : '';
  const packageItems = getPackageItemsPreview(match, safeProductById).slice(0, 2);
  const hasPackage = Boolean(match?.package?.id);
  const externalProductUrl = match?.product?.productUrl || null;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.92}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <View style={styles.badgesRow}>
          <Badge
            label={typeBadgeText}
            style={[
              styles.typeBadge,
              emphasizeTypeBadge ? styles.typeBadgeFavorite : null,
            ]}
            textStyle={[
              styles.typeBadgeText,
              emphasizeTypeBadge ? styles.typeBadgeFavoriteText : null,
            ]}
          />
          {rank === 1 ? (
            <Badge
              label={texts.resultsTopRecommendationBadge}
              style={styles.topBadge}
              textStyle={styles.topBadgeText}
            />
          ) : null}
          {isInBudget ? (
            <Badge
              label={texts.resultsInBudgetBadge}
              style={styles.budgetBadge}
              textStyle={styles.budgetBadgeText}
            />
          ) : null}
        </View>

        {showFavorite && (hasProduct || hasPackage) ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onToggleFavorite && onToggleFavorite()}
            style={styles.favoriteIconWrap}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Icon
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? Color.primary : '#8d99a8'}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.favoritePlaceholder} />
        )}
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.imageTapWrap}
          activeOpacity={0.88}
          onPress={() => onImagePress && onImagePress()}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              {__DEV__ ? (
                <View style={styles.debugImageBadge}>
                  <Text style={styles.debugImageBadgeText}>NO IMG</Text>
                </View>
              ) : null}
              <Icon name="image-outline" size={22} color="#9aa6b2" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          <Text style={styles.price}>
            {Tools.getCurrencyFormatted(price, {
              code: currency,
              symbol: `${currency} `,
              precision: 0,
              decimal: '.',
              thousand: ',',
              format: '%s%v',
            })}
          </Text>

          {normalizedReason ? (
            <Text style={styles.reasonText} numberOfLines={1}>
              {normalizedReason}
            </Text>
          ) : null}

          {hasPackage && packageItems.length > 0 ? (
            <View style={styles.packageItemsWrap}>
              {packageItems.map(item => (
                <Text key={item.id} style={styles.packageItemLine} numberOfLines={1}>
                  {item.role ? `${item.role}: ` : ''}
                  {item.name}
                </Text>
              ))}
            </View>
          ) : null}

          {externalProductUrl ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onOpenExternal && onOpenExternal()}
            >
              <Text style={styles.externalLinkText} numberOfLines={1}>
                Vezi produsul in magazin
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.detailText}>{texts.resultsCardDetailsCta}</Text>
        <Icon name="chevron-right" size={18} color="#8a96a5" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: recommendationUiTokens.resultsCard.background,
    borderRadius: recommendationUiTokens.resultsCard.radius,
    borderWidth: 1,
    borderColor: recommendationUiTokens.resultsCard.borderColor,
    padding: recommendationUiTokens.resultsCard.padding,
    marginBottom: 12,
    ...recommendationUiTokens.resultsCard.shadow,
  },
  headerRow: {
    minHeight: 30,
    marginBottom: recommendationUiTokens.resultsCard.gap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: recommendationUiTokens.resultsCard.badgeTextSize,
    lineHeight: 13,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  typeBadge: {
    backgroundColor: recommendationUiTokens.resultsCard.typeBadgeBg,
  },
  typeBadgeText: {
    color: recommendationUiTokens.resultsCard.typeBadgeText,
  },
  typeBadgeFavorite: {
    backgroundColor: 'rgba(233, 65, 144, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(233, 65, 144, 0.35)',
  },
  typeBadgeFavoriteText: {
    color: '#8a1f58',
  },
  topBadge: {
    backgroundColor: recommendationUiTokens.resultsCard.topBadgeBg,
  },
  topBadgeText: {
    color: recommendationUiTokens.resultsCard.topBadgeText,
  },
  budgetBadge: {
    backgroundColor: recommendationUiTokens.resultsCard.budgetBadgeBg,
  },
  budgetBadgeText: {
    color: recommendationUiTokens.resultsCard.budgetBadgeText,
  },
  favoriteIconWrap: {
    minWidth: 30,
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoritePlaceholder: {
    width: 30,
    height: 30,
  },
  row: {
    flexDirection: 'row',
    minHeight: recommendationUiTokens.resultsCard.rowMinHeight,
    alignItems: 'flex-start',
  },
  imageTapWrap: {
    borderRadius: 10,
  },
  image: {
    width: recommendationUiTokens.resultsCard.imageSize,
    height: recommendationUiTokens.resultsCard.imageSize,
    borderRadius: 10,
    backgroundColor: recommendationUiTokens.resultsCard.placeholderBg,
    borderWidth: 1,
    borderColor: recommendationUiTokens.resultsCard.borderColor,
  },
  imagePlaceholder: {
    backgroundColor: '#edf1f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugImageBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: 'rgba(233, 65, 144, 0.9)',
  },
  debugImageBadgeText: {
    color: '#fff',
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  content: {
    flex: 1,
    marginLeft: recommendationUiTokens.resultsCard.gap,
  },
  title: {
    fontSize: recommendationUiTokens.resultsCard.titleSize,
    lineHeight: IS_ANDROID
      ? recommendationUiTokens.resultsCard.titleLineHeightAndroid
      : recommendationUiTokens.resultsCard.titleLineHeightIos,
    color: Color.blackTextPrimary,
    fontWeight: '700',
    marginBottom: 6,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  price: {
    fontSize: recommendationUiTokens.resultsCard.priceSize,
    lineHeight: IS_ANDROID
      ? recommendationUiTokens.resultsCard.priceLineHeightAndroid
      : recommendationUiTokens.resultsCard.priceLineHeightIos,
    color: Color.primary,
    fontWeight: '700',
    marginBottom: 7,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  reasonText: {
    color: recommendationUiTokens.resultsCard.reasonText,
    fontSize: recommendationUiTokens.resultsCard.reasonTextSize,
    lineHeight: IS_ANDROID
      ? recommendationUiTokens.resultsCard.reasonTextLineHeightAndroid
      : recommendationUiTokens.resultsCard.reasonTextLineHeightIos,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  packageItemsWrap: {
    marginTop: 8,
  },
  packageItemLine: {
    color: '#6c7886',
    fontSize: 11,
    lineHeight: 14,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  externalLinkText: {
    marginTop: 8,
    color: Color.primary,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  footerRow: {
    marginTop: recommendationUiTokens.resultsCard.gap,
    minHeight: 44,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: recommendationUiTokens.resultsCard.borderColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  detailText: {
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

export default RecommendationCard;

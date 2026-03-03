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

import { Color } from '@common';
import { Icon } from '@app/Omni';

import texts from '../constants/texts.ro';
import recommendationUiTokens from './recommendationUiTokens';

const IS_ANDROID = Platform.OS === 'android';

const RecommendationCompactCard = ({
  item,
  onPress,
  onImagePress,
  onToggleFavorite,
  isFavorite = false,
}) => {
  if (!item) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <TouchableOpacity onPress={onImagePress} activeOpacity={0.88}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
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
            <Icon name="image-outline" size={20} color="#9aa6b2" />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.contentHeader}>
          <Text style={styles.title} numberOfLines={2}>
            {item.name}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={event => {
              event?.stopPropagation?.();
              onToggleFavorite && onToggleFavorite();
            }}
            style={styles.favoriteIconWrap}
            hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
          >
            <Icon
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? Color.primary : '#8d99a8'}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.suggestionText} numberOfLines={1}>
          {texts.resultsSuggestionLead}
        </Text>

        <Text style={styles.reason} numberOfLines={1}>
          {item.reasonShort1}
        </Text>
      </View>

      <Icon name="chevron-right" size={18} color="#8a96a5" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4ebf2',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...recommendationUiTokens.resultsCard.shadow,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: recommendationUiTokens.resultsCard.placeholderBg,
    borderWidth: 1,
    borderColor: '#e4ebf2',
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
    borderRadius: 7,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: 'rgba(233, 65, 144, 0.9)',
  },
  debugImageBadgeText: {
    color: '#fff',
    fontSize: 7,
    lineHeight: 9,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  content: {
    flex: 1,
    marginHorizontal: 10,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    color: Color.blackTextPrimary,
    fontSize: 14,
    lineHeight: IS_ANDROID ? 19 : 20,
    fontWeight: '700',
    marginBottom: 4,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  favoriteIconWrap: {
    width: 24,
    height: 24,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionText: {
    color: Color.blackTextPrimary,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    fontWeight: '700',
    marginBottom: 3,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  reason: {
    marginTop: 6,
    color: recommendationUiTokens.resultsCard.reasonText,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
});

export default RecommendationCompactCard;

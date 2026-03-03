/** @format */

import React from 'react';
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Color, Tools } from '@common';
import { Icon } from '@app/Omni';

const IS_ANDROID = Platform.OS === 'android';

const FavoriteItemCard = ({
  typeLabel,
  title,
  subtitle,
  price,
  currency,
  imageUri,
  isFavorite,
  onPress,
  onToggleFavorite,
  onOpenExternal,
  ctaVariant = 'outline',
}) => {
  const favoriteScale = React.useRef(new Animated.Value(1)).current;

  const onFavoritePressIn = React.useCallback(() => {
    Animated.spring(favoriteScale, {
      toValue: 0.88,
      friction: 8,
      tension: 220,
      useNativeDriver: true,
    }).start();
  }, [favoriteScale]);

  const onFavoritePressOut = React.useCallback(() => {
    Animated.spring(favoriteScale, {
      toValue: 1,
      friction: 8,
      tension: 220,
      useNativeDriver: true,
    }).start();
  }, [favoriteScale]);

  const formattedPrice = Tools.getCurrencyFormatted(Number(price || 0), {
    code: currency || 'RON',
    symbol: `${currency || 'RON'} `,
    precision: 0,
    decimal: '.',
    thousand: ',',
    format: '%s%v',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      style={styles.card}
      onPress={onPress}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onToggleFavorite}
        onPressIn={onFavoritePressIn}
        onPressOut={onFavoritePressOut}
        style={styles.favoriteButton}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Animated.View style={{ transform: [{ scale: favoriteScale }] }}>
          <Icon
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={17}
            color={isFavorite ? Color.primary : '#9aa6b2'}
          />
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.contentRow}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Icon name="image-outline" size={20} color="#98a4b2" />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.typePill}>
            <Text style={styles.typePillText} numberOfLines={1}>
              {typeLabel}
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {title || '-'}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          <Text style={styles.price} numberOfLines={1}>
            {formattedPrice}
          </Text>
          {typeof onOpenExternal === 'function' ? (
            <TouchableOpacity activeOpacity={0.85} onPress={onOpenExternal}>
              <Text style={styles.externalLink} numberOfLines={1}>
                Vezi în magazin
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[
              styles.ctaPill,
              ctaVariant === 'filled' ? styles.ctaPillFilled : null,
            ]}
            activeOpacity={0.88}
            onPress={onPress}
          >
            <Text
              style={[
                styles.ctaText,
                ctaVariant === 'filled' ? styles.ctaTextFilled : null,
              ]}
            >
              Vezi detalii
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    zIndex: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#f1f5f8',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5ebf1',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 22,
  },
  typePill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(233, 65, 144, 0.12)',
    marginBottom: 6,
  },
  typePillText: {
    color: '#8e225c',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  title: {
    color: Color.blackTextPrimary,
    fontSize: 15,
    lineHeight: IS_ANDROID ? 20 : 21,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  subtitle: {
    marginTop: 3,
    color: Color.blackTextSecondary,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  price: {
    marginTop: 8,
    color: Color.primary,
    fontSize: 17,
    lineHeight: IS_ANDROID ? 22 : 23,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  ctaPill: {
    marginTop: 9,
    alignSelf: 'flex-start',
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Color.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  ctaText: {
    color: Color.primary,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  ctaPillFilled: {
    backgroundColor: Color.primary,
    borderColor: Color.primary,
  },
  ctaTextFilled: {
    color: '#fff',
  },
  externalLink: {
    marginTop: 4,
    color: '#5f6d7d',
    fontSize: 11,
    lineHeight: IS_ANDROID ? 15 : 16,
    fontWeight: '600',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
});

export default FavoriteItemCard;

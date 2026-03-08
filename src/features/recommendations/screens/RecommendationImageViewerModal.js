/** @format */

import React from 'react';
import {
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from '@components';
import { Color, withTheme } from '@common';
import { Icon } from '@app/Omni';

import texts from '../constants/texts.ro';

const IS_ANDROID = Platform.OS === 'android';

const RecommendationImageViewerModal = ({ route, navigation, theme }) => {
  const images = Array.isArray(route?.params?.images) ? route.params.images : [];
  const initialIndex = Number(route?.params?.initialIndex || 0);
  const [index, setIndex] = React.useState(
    Math.max(0, Math.min(images.length - 1, initialIndex)),
  );
  const productUrl = route?.params?.productUrl;

  const currentImage = images[index] || null;
  const canGoPrev = index > 0;
  const canGoNext = index < images.length - 1;

  const onPrev = () => {
    if (!canGoPrev) {
      return;
    }
    setIndex(prev => prev - 1);
  };

  const onNext = () => {
    if (!canGoNext) {
      return;
    }
    setIndex(prev => prev + 1);
  };

  return (
    <SafeAreaView topInsetEnabled>
      <View style={[styles.container, { backgroundColor: theme?.colors?.background || '#fff' }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
            activeOpacity={0.85}
          >
            <Icon name="close" size={18} color={Color.blackTextPrimary} />
          </TouchableOpacity>
          <Text style={styles.counter}>
            {images.length > 0 ? `${index + 1}/${images.length}` : '-'}
          </Text>
          <View style={styles.closeButton} />
        </View>

        <View style={styles.imageWrap}>
          {currentImage ? (
            <Image source={{ uri: currentImage }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.placeholder}>
              <Icon name="image-outline" size={36} color="#9aa6b2" />
            </View>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={onPrev}
            disabled={!canGoPrev}
            style={[styles.navButton, !canGoPrev && styles.disabled]}
          >
            <Icon name="chevron-left" size={18} color={Color.blackTextPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onNext}
            disabled={!canGoNext}
            style={[styles.navButton, !canGoNext && styles.disabled]}
          >
            <Icon name="chevron-right" size={18} color={Color.blackTextPrimary} />
          </TouchableOpacity>
        </View>

        {productUrl ? (
          <TouchableOpacity
            style={styles.linkButton}
            activeOpacity={0.88}
            onPress={() => Linking.openURL(productUrl)}
          >
            <Text style={styles.linkText}>{texts.detailOpenProduct}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  header: {
    marginTop: 8,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e4ebf2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  counter: {
    color: Color.blackTextPrimary,
    fontSize: 13,
    lineHeight: IS_ANDROID ? 17 : 18,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  imageWrap: {
    flex: 1,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4ebf2',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edf1f5',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e4ebf2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  disabled: {
    opacity: 0.35,
  },
  linkButton: {
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.primary,
    marginBottom: 14,
  },
  linkText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: IS_ANDROID ? 17 : 18,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
});

export default withTheme(RecommendationImageViewerModal);

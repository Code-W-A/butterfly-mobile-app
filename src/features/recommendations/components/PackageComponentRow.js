/** @format */

import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Color, Tools } from '@common';
import { Icon } from '@app/Omni';

const IS_ANDROID = Platform.OS === 'android';

const PackageComponentRow = ({ item, onPressImage, onPressProduct }) => {
  if (!item) {
    return null;
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity activeOpacity={0.88} onPress={onPressImage}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Icon name="image-outline" size={18} color="#9aa6b2" />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {item.roleLabel ? `${item.roleLabel}: ` : ''}
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
      </View>

      {item.productUrl ? (
        <TouchableOpacity
          style={styles.linkCta}
          activeOpacity={0.88}
          onPress={onPressProduct}
        >
          <Text style={styles.linkText}>Vezi produsul</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8edf2',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#edf1f5',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginHorizontal: 10,
  },
  title: {
    color: Color.blackTextPrimary,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  price: {
    marginTop: 3,
    color: Color.primary,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  linkCta: {
    borderRadius: 999,
    backgroundColor: '#f2f5f8',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  linkText: {
    color: '#5f6d7a',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
});

export default PackageComponentRow;

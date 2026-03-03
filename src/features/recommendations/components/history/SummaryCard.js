/** @format */

import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Color } from '@common';

const IS_ANDROID = Platform.OS === 'android';

const SummaryCard = ({ sessionsCount, lastDateLabel, onPressPrimary }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Progresul tău</Text>
        <Text style={styles.subtitle}>{sessionsCount} sesiuni salvate</Text>
        <Text style={styles.meta}>Ultima: {lastDateLabel || '-'}</Text>
      </View>

      {/* <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        onPress={onPressPrimary}
      >
        <Text style={styles.primaryButtonText}>Analiză nouă</Text>
      </Pressable> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  content: {
    marginBottom: 10,
  },
  title: {
    color: Color.blackTextPrimary,
    fontSize: 18,
    lineHeight: IS_ANDROID ? 24 : 25,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  subtitle: {
    marginTop: 4,
    color: Color.blackTextPrimary,
    fontSize: 14,
    lineHeight: IS_ANDROID ? 19 : 20,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  meta: {
    marginTop: 3,
    color: Color.blackTextSecondary,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  primaryButton: {
    alignSelf: 'flex-start',
    minHeight: 34,
    borderRadius: 999,
    backgroundColor: Color.primary,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  pressed: {
    opacity: 0.85,
  },
});

export default SummaryCard;

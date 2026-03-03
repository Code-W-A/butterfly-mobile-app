/** @format */

import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Color } from '@common';

import Chip from './Chip';

const IS_ANDROID = Platform.OS === 'android';

const HeroSessionCard = ({
  dateLabel,
  questionnaireLabel,
  chips,
  modeLabel,
  count,
  onPressPrimary,
  onPressSecondary,
  secondaryDisabled = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>ULTIMA</Text>
      </View>

      <Text style={styles.dateLine}>{dateLabel}</Text>
      <Text style={styles.title}>{questionnaireLabel}</Text>

      {Array.isArray(chips) && chips.length > 0 ? (
        <View style={styles.chipsWrap}>
          {chips.map((chip, index) => (
            <Chip key={`${chip}-${index}`} label={chip} />
          ))}
        </View>
      ) : null}

      <Text style={styles.metaLine}>
        Mod: {modeLabel} • {count} rezultate
      </Text>

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        onPress={onPressPrimary}
      >
        <Text style={styles.primaryButtonText}>Vezi rezultatul</Text>
      </Pressable>

      {onPressSecondary ? (
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            secondaryDisabled && styles.disabled,
            pressed && styles.pressed,
          ]}
          disabled={secondaryDisabled}
          onPress={onPressSecondary}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              secondaryDisabled && styles.secondaryButtonTextDisabled,
            ]}
          >
            Refă cu aceleași răspunsuri
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 8,
    backgroundColor: 'rgba(233, 65, 144, 0.15)',
  },
  badgeText: {
    color: '#8a1f58',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  dateLine: {
    color: Color.blackTextSecondary,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    marginBottom: 4,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  title: {
    color: Color.blackTextPrimary,
    fontSize: 18,
    lineHeight: IS_ANDROID ? 24 : 25,
    fontWeight: '700',
    marginBottom: 9,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  metaLine: {
    color: Color.blackTextSecondary,
    fontSize: 12,
    lineHeight: IS_ANDROID ? 16 : 17,
    marginBottom: 10,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: Color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: IS_ANDROID ? 19 : 20,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  secondaryButton: {
    marginTop: 8,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5c2d6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: '#8a1f58',
    fontSize: 13,
    lineHeight: IS_ANDROID ? 17 : 18,
    fontWeight: '700',
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  secondaryButtonTextDisabled: {
    color: '#98a3b3',
  },
  disabled: {
    borderColor: '#e5ebf2',
  },
  pressed: {
    opacity: 0.88,
  },
});

export default HeroSessionCard;

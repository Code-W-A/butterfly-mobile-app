/** @format */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon } from '@app/Omni';
import { Color } from '@common';

import recommendationUiTokens from './recommendationUiTokens';

const RecommendationHeroCard = ({
  title,
  subtitle,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
  disabledPrimary = false,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.primaryButton, disabledPrimary && styles.disabled]}
        onPress={onPrimaryPress}
        disabled={disabledPrimary}
      >
        <Text style={styles.primaryText}>{primaryLabel}</Text>
        <Icon name="arrow-right" color="#fff" size={18} />
      </TouchableOpacity>

      {secondaryLabel ? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.secondaryButton}
          onPress={onSecondaryPress}
        >
          <Text style={styles.secondaryText}>{secondaryLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: recommendationUiTokens.radius.card,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7edf2',
    paddingHorizontal: recommendationUiTokens.spacing.cardPadding,
    paddingTop: recommendationUiTokens.spacing.cardPadding,
    paddingBottom: recommendationUiTokens.spacing.cardPadding - 1,
    ...recommendationUiTokens.shadow.card,
  },
  title: {
    color: Color.blackTextPrimary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: recommendationUiTokens.typography.cardTitle.fontWeight,
    marginBottom: 8,
  },
  subtitle: {
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardSubtitle.fontWeight,
    marginBottom: 16,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: recommendationUiTokens.radius.smallCard,
    backgroundColor: '#111318',
    paddingHorizontal: recommendationUiTokens.spacing.cardPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: recommendationUiTokens.typography.cardTitle.fontWeight,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 4,
  },
  secondaryText: {
    color: Color.primary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default RecommendationHeroCard;

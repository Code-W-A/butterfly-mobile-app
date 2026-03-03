/** @format */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon } from '@app/Omni';
import { Color } from '@common';

import recommendationUiTokens from './recommendationUiTokens';

const RecommendationQuestionnaireCard = ({
  title,
  subtitle,
  iconName,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.iconWrap}>
        <Icon name={iconName} color={Color.primary} size={18} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      <Icon name="arrow-right" color="#98a2b3" size={18} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 86,
    borderRadius: recommendationUiTokens.radius.smallCard,
    borderWidth: 1,
    borderColor: '#e6ebf1',
    backgroundColor: '#fff',
    paddingHorizontal: recommendationUiTokens.spacing.cardPadding,
    paddingVertical: recommendationUiTokens.spacing.cardPadding - 1,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...recommendationUiTokens.shadow.card,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: recommendationUiTokens.radius.pill,
    backgroundColor: '#f4f7fb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    color: Color.blackTextPrimary,
    fontSize: recommendationUiTokens.typography.cardTitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardTitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardTitle.fontWeight,
    marginBottom: 4,
  },
  subtitle: {
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardSubtitle.fontWeight,
  },
});

export default RecommendationQuestionnaireCard;

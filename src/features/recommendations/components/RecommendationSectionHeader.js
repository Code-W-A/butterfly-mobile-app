/** @format */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Color } from '@common';

import recommendationUiTokens from './recommendationUiTokens';

const RecommendationSectionHeader = ({
  title,
  actionLabel,
  onActionPress,
  actionDisabled = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onActionPress}
          disabled={actionDisabled}
          style={actionDisabled ? styles.actionDisabled : null}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: Color.blackTextPrimary,
    fontSize: recommendationUiTokens.typography.sectionTitle.fontSize,
    lineHeight: recommendationUiTokens.typography.sectionTitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.sectionTitle.fontWeight,
  },
  actionText: {
    color: '#1f8f8c',
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: '600',
  },
  actionDisabled: {
    opacity: 0.35,
  },
});

export default RecommendationSectionHeader;

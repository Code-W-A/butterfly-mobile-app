/** @format */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Color } from '@common';

import recommendationUiTokens from './recommendationUiTokens';

const EmptyState = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: recommendationUiTokens.spacing.screenHorizontal,
    marginTop: 12,
    padding: recommendationUiTokens.spacing.cardPadding,
    borderRadius: recommendationUiTokens.radius.smallCard,
    borderWidth: 1,
    borderColor: '#e7edf2',
    backgroundColor: '#fff',
    ...recommendationUiTokens.shadow.card,
  },
  text: {
    color: Color.blackTextSecondary,
    fontSize: recommendationUiTokens.typography.cardSubtitle.fontSize,
    lineHeight: recommendationUiTokens.typography.cardSubtitle.lineHeight,
    fontWeight: recommendationUiTokens.typography.cardSubtitle.fontWeight,
  },
});

export default EmptyState;

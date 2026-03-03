/** @format */

import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Color } from '@common';

import texts from '../constants/texts.ro';
import recommendationUiTokens from './recommendationUiTokens';

const IS_ANDROID = Platform.OS === 'android';

const ReasonList = ({ reasons = [] }) => {
  const filteredReasons = Array.isArray(reasons)
    ? reasons.filter(item => typeof item === 'string' && item.trim())
    : [];

  if (filteredReasons.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{texts.resultsWhyFit}</Text>
      {filteredReasons.slice(0, 2).map((reason, index) => (
        <View style={styles.row} key={`${reason}_${index}`}>
          <View style={styles.dot} />
          <Text style={styles.text} numberOfLines={2}>
            {reason}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  title: {
    color: Color.blackTextPrimary,
    fontSize: 13,
    lineHeight: IS_ANDROID ? 17 : 18,
    fontWeight: '700',
    marginBottom: 8,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  dot: {
    marginTop: 7,
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: Color.primary,
    marginRight: 8,
  },
  text: {
    flex: 1,
    color: recommendationUiTokens.resultsCard.reasonText,
    fontSize: recommendationUiTokens.resultsCard.reasonTextSize,
    lineHeight: IS_ANDROID
      ? recommendationUiTokens.resultsCard.reasonTextLineHeightAndroid
      : recommendationUiTokens.resultsCard.reasonTextLineHeightIos,
    ...(IS_ANDROID ? { includeFontPadding: false } : null),
  },
});

export default ReasonList;

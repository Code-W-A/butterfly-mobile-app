/** @format */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import recommendationUiTokens from './recommendationUiTokens';

const clampPercent = value => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const MatchBar = ({ percent, trackColor, fillColor }) => {
  const normalizedPercent = clampPercent(percent);

  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor:
            trackColor || recommendationUiTokens.matchBar.trackColor,
        },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${normalizedPercent}%`,
            backgroundColor:
              fillColor || recommendationUiTokens.matchBar.fillColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: recommendationUiTokens.matchBar.height,
    borderRadius: recommendationUiTokens.matchBar.radius,
    overflow: 'hidden',
  },
  fill: {
    height: recommendationUiTokens.matchBar.height,
    borderRadius: recommendationUiTokens.matchBar.radius,
  },
});

export default MatchBar;
